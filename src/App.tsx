import { useEffect, useRef, useState } from 'react';
import * as L from 'leaflet';
import NavigationControl from './components/NavigationControl';
import FocusNavigation from './components/FocusNavigation';
import { api } from './services/api';
import type { Location, RouteData } from './services/api';

// Define SpeechRecognition types
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface IWindow extends Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
}

// Fix Leaflet marker icons
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Map layers
const LAYERS = {
    osm: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OSM contributors',
        maxZoom: 19,
    }),
    usgs: L.tileLayer('https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'USGS',
        maxZoom: 16,
    }),
    positron: L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
        attribution: '&copy; OSM & CARTO',
        maxZoom: 18,
    }),
};

export default function App() {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<L.Map | null>(null);
    const routeLayerRef = useRef<L.Polyline | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognitionRef = useRef<any | null>(null);

    const [status, setStatus] = useState('Tap mic or search to navigate.');
    const [isListening, setIsListening] = useState(false);
    const [activeLayer, setActiveLayer] = useState<'osm' | 'usgs' | 'positron'>('osm');
    const [units, setUnits] = useState<'metric' | 'imperial'>('imperial');

    // Navigation State
    const [currentPos, setCurrentPos] = useState<[number, number] | null>(null);
    const [destination, setDestination] = useState<Location | null>(null);
    const [route, setRoute] = useState<RouteData | null>(null);

    // Focus Mode State
    const [isFocusMode, setIsFocusMode] = useState(false);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);

    // Initial Map Setup
    useEffect(() => {
        // Inject CSS
        if (!document.querySelector('#leaflet-css')) {
            const link = document.createElement('link');
            link.id = 'leaflet-css';
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(link);
        }

        if (mapRef.current && !mapInstance.current) {
            mapInstance.current = L.map(mapRef.current).setView([40.7128, -74.0060], 10); // Default NY
            LAYERS.osm.addTo(mapInstance.current);

            // Locate user with continuous watching
            if (navigator.geolocation) {
                mapInstance.current.locate({ setView: true, maxZoom: 16, watch: true, enableHighAccuracy: true });
            }

            mapInstance.current.on('locationfound', (e) => {
                const latlng = e.latlng;
                setCurrentPos([latlng.lat, latlng.lng]);
            });

            mapInstance.current.on('locationerror', () => {
                setStatus('⚠️ Could not find your location.');
            });
        }

        // Load saved route if exists
        const savedRoute = localStorage.getItem('focusnavi-route');
        if (savedRoute) {
            try {
                const parsed = JSON.parse(savedRoute);
                setRoute(parsed);
                setStatus('📂 Loaded saved route.');
            } catch (e) {
                console.error("Failed to load saved route", e);
            }
        }

        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, []);

    // Auto-advance Effect
    useEffect(() => {
        if (!isFocusMode || !route || !currentPos) return;

        const nextStep = route.steps[currentStepIndex + 1];
        if (!nextStep) return;

        // OSRM is [lon, lat], Leaflet/currentPos is [lat, lon]
        // Distance check
        const dist = L.latLng(currentPos).distanceTo(L.latLng(nextStep.maneuver.location[1], nextStep.maneuver.location[0]));

        // If distance < 30 meters, advance
        if (dist < 30) {
            setCurrentStepIndex(prev => Math.min(prev + 1, route.steps.length - 1));
            const instruction = route.steps[currentStepIndex + 1]?.instruction;
            if (instruction) speak(instruction);
        }

    }, [currentPos, route, currentStepIndex, isFocusMode]);

    // Handle Route Calculation when destination changes
    useEffect(() => {
        if (currentPos && destination) {
            calculateRoute(currentPos, [destination.lat, destination.lon]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [destination, units]);

    const formatDistance = (meters: number) => {
        if (units === 'imperial') {
            const miles = meters / 1609.34;
            if (miles >= 0.1) return `${miles.toFixed(1)} mi`;
            return `${Math.round(meters * 3.28084)} ft`;
        }
        return meters > 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.round(meters)} m`;
    };

    const calculateRoute = async (start: [number, number], end: [number, number]) => {
        setStatus('🚗 Calculating route...');
        const data = await api.getRoute(start, end);

        if (data && mapInstance.current) {
            setRoute(data);
            setCurrentStepIndex(0);
            setStatus(`✅ Route found! ${formatDistance(data.distance)} • ${Math.round(data.duration / 60)} mins`);

            // Draw line
            if (routeLayerRef.current) routeLayerRef.current.remove();
            routeLayerRef.current = L.polyline(data.coordinates, { color: 'blue', weight: 5 }).addTo(mapInstance.current);
            // Don't fit bounds if we want to keep user tracking centered? 
            // Actually, initial fit is fine.
            mapInstance.current.fitBounds(routeLayerRef.current.getBounds(), { padding: [50, 50] });

            // Add destination marker
            L.marker(end).addTo(mapInstance.current).bindPopup(`Destination: ${destination?.display_name}`).openPopup();

            // Auto-save route for offline use
            localStorage.setItem('focusnavi-route', JSON.stringify(data));
        } else {
            setStatus('❌ Could not find a route.');
        }
    };

    const switchLayer = (key: 'osm' | 'usgs' | 'positron') => {
        if (!mapInstance.current) return;
        Object.values(LAYERS).forEach(layer => mapInstance.current?.removeLayer(layer));
        LAYERS[key].addTo(mapInstance.current);
        setActiveLayer(key);
    };

    const speak = (text: string) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            speechSynthesis.speak(utterance);
        }
        setStatus(text);
    };

    const handleCommand = (command: string) => {
        const lower = command.toLowerCase();
        if (lower.includes('where am i')) {
            speak(currentPos ? `Lat ${currentPos[0]}, Lon ${currentPos[1]}` : 'Location unknown');
        } else if (lower.includes('stop nav')) {
            setRoute(null);
            setIsFocusMode(false);
            if (routeLayerRef.current) routeLayerRef.current.remove();
            speak('Navigation stopped.');
        } else if (lower.includes('start focus') || lower.includes('start nav')) {
            if (route) setIsFocusMode(true);
            else speak('No route active.');
        } else if (lower.includes('next step')) {
            if (route && currentStepIndex < route.steps.length - 1) {
                setCurrentStepIndex(p => p + 1);
                speak(route.steps[currentStepIndex + 1].instruction);
            }
        }
        else speak('Command not recognized.');
    };

    const toggleListening = () => {
        if (!recognitionRef.current) {
            const customWindow = window as unknown as IWindow;
            const SpeechRecognition = customWindow.SpeechRecognition || customWindow.webkitSpeechRecognition;
            if (SpeechRecognition) {
                recognitionRef.current = new SpeechRecognition();
                recognitionRef.current.lang = 'en-US';
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                recognitionRef.current.onresult = (e: any) => handleCommand(e.results[0][0].transcript);
            }
        }
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            recognitionRef.current?.start();
            setIsListening(true);
            setStatus('🎙️ Listening...');
        }
    };

    return (
        <div style={{ fontFamily: 'sans-serif', padding: '16px', backgroundColor: '#000', color: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

            {/* Header */}
            <h1 style={{ marginBottom: '16px', color: '#facc15' }}>FocusNavi 4</h1>

            {/* Main Content Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* Search Bar */}
                {!isFocusMode && (
                    <NavigationControl onSelectLocation={setDestination} />
                )}

                {/* Status / Controls */}
                <div style={{ backgroundColor: '#222', padding: '16px', borderRadius: '12px', border: '1px solid #333' }}>
                    <div style={{ fontSize: '1.25rem', marginBottom: '12px', fontWeight: '500' }}>{status}</div>

                    {/* Route Actions */}
                    {route && !isFocusMode && (
                        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <button
                                onClick={() => setIsFocusMode(true)}
                                style={{
                                    width: '100%',
                                    padding: '20px',
                                    fontSize: '1.5rem',
                                    backgroundColor: '#22c55e',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
                                }}
                            >
                                🚀 START FOCUS MODE
                            </button>
                            <p style={{ textAlign: 'center', opacity: 0.7, fontSize: '0.9rem' }}>
                                Route saved offline.
                            </p>
                        </div>
                    )}
                </div>

                {/* Settings (Layers & Units) - Only show if NOT in Focus Mode to reduce clutter? User said "Invisible map", so maybe layers dont matter anymore. */}
                {!isFocusMode && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <button
                            onClick={() => setUnits(u => u === 'metric' ? 'imperial' : 'metric')}
                            style={{
                                backgroundColor: '#4b5563',
                                color: '#fff',
                                border: 'none',
                                padding: '10px 20px',
                                borderRadius: '8px',
                                fontWeight: 'bold'
                            }}
                        >
                            {units === 'metric' ? 'Metric (km)' : 'Imperial (mi)'}
                        </button>
                    </div>
                )}

                {/* Voice Toggle */}
                <button
                    onClick={toggleListening}
                    style={{
                        width: '100%',
                        padding: '16px',
                        fontSize: '1.2rem',
                        backgroundColor: isListening ? '#ef4444' : '#3b82f6',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '12px',
                        transition: 'background-color 0.2s'
                    }}
                >
                    🎙️ {isListening ? 'Stop Listening' : 'Voice Command'}
                </button>

            </div>

            {/* Hidden Leaflet Map (Must have size for internal calculations) */}
            <div ref={mapRef} style={{ height: '200px', width: '200px', position: 'absolute', left: '-9999px', top: '-9999px', opacity: 0, pointerEvents: 'none' }} />

            {/* Focus Mode Overlay (Full Screen) */}
            {isFocusMode && route && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}>
                    <FocusNavigation
                        steps={route.steps}
                        currentStepIndex={currentStepIndex}
                        distanceToNext={route.steps[currentStepIndex].distance} // Approximate
                        units={units}
                        onNext={() => {
                            setCurrentStepIndex(p => Math.min(p + 1, route.steps.length - 1));
                            speak(route.steps[currentStepIndex + 1]?.instruction || "Next step");
                        }}
                        onPrev={() => setCurrentStepIndex(p => Math.max(0, p - 1))}
                        onExit={() => setIsFocusMode(false)}
                    />
                </div>
            )}
        </div>
    );
}
