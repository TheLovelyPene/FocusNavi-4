export interface Location {
    lat: number;
    lon: number;
    display_name: string;
}

export interface RouteStep {
    instruction: string;
    distance: number; // meters
    maneuver: {
        location: [number, number];
    };
}

export interface RouteData {
    coordinates: [number, number][]; // Array of [lat, lon]
    steps: RouteStep[];
    duration: number; // seconds
    distance: number; // meters
}

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org/search';
const OSRM_BASE = 'https://router.project-osrm.org/route/v1/driving';

export const api = {
    // 🔍 Search for an address
    async searchAddress(query: string): Promise<Location[]> {
        try {
            const url = `${NOMINATIM_BASE}?q=${encodeURIComponent(query)}&format=json&limit=5`;
            const response = await fetch(url);
            const data = await response.json();

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return data.map((item: any) => ({
                lat: parseFloat(item.lat),
                lon: parseFloat(item.lon),
                display_name: item.display_name,
            }));
        } catch (error) {
            console.error("Geocoding error:", error);
            return [];
        }
    },

    // 🚗 Get route between two points
    async getRoute(start: [number, number], end: [number, number]): Promise<RouteData | null> {
        try {
            // OSRM expects "lon,lat"
            const startStr = `${start[1]},${start[0]}`;
            const endStr = `${end[1]},${end[0]}`;
            const url = `${OSRM_BASE}/${startStr};${endStr}?overview=full&geometries=geojson&steps=true`;

            const response = await fetch(url);
            const data = await response.json();

            if (!data.routes || data.routes.length === 0) return null;

            const route = data.routes[0];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const coordinates = route.geometry.coordinates.map((coord: any) => [coord[1], coord[0]]) as [number, number][];

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const steps = route.legs[0].steps.map((step: any) => ({
                instruction: step.maneuver.type + ' ' + (step.maneuver.modifier || ''),
                distance: step.distance,
                maneuver: step.maneuver
            }));

            return {
                coordinates,
                steps,
                duration: route.duration,
                distance: route.distance
            };
        } catch (error) {
            console.error("Routing error:", error);
            return null;
        }
    }
};
