import type { RouteStep } from '../services/api';
import DirectionArrow from './DirectionArrow';

interface Props {
    steps: RouteStep[];
    currentStepIndex: number;
    distanceToNext: number; // meters
    units: 'metric' | 'imperial';
    onNext: () => void;
    onPrev: () => void;
    onExit: () => void;
}

export default function FocusNavigation({ steps, currentStepIndex, distanceToNext, units, onNext, onPrev, onExit }: Props) {
    const currentStep = steps[currentStepIndex];
    const isLastStep = currentStepIndex === steps.length - 1;

    // Format distance
    let distDisplay = '';
    if (units === 'imperial') {
        // Miles and feet
        const miles = distanceToNext / 1609.34;
        if (miles >= 0.1) {
            distDisplay = `${miles.toFixed(1)} mi`;
        } else {
            const feet = distanceToNext * 3.28084;
            distDisplay = `${Math.round(feet)} ft`;
        }
    } else {
        // Metric
        distDisplay = distanceToNext > 1000
            ? `${(distanceToNext / 1000).toFixed(1)} km`
            : `${Math.round(distanceToNext)} m`;
    }

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: '#000',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '24px',
            boxSizing: 'border-box',
            color: '#fff',
            fontFamily: 'system-ui, sans-serif'
        }}>
            {/* Header / Exit */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.2rem', color: '#888' }}>FocusNavi Mode</span>
                <button
                    onClick={onExit}
                    style={{
                        padding: '12px 24px',
                        fontSize: '1.2rem',
                        backgroundColor: '#333',
                        color: '#fff',
                        border: '1px solid #555',
                        borderRadius: '8px'
                    }}
                >
                    ❌ Exit
                </button>
            </div>

            {/* Main Instruction */}
            <div style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
                    <DirectionArrow modifier={currentStep.maneuver.modifier} size={160} />
                </div>
                <div style={{ fontSize: '5rem', fontWeight: 'bold', marginBottom: '20px', color: '#0af' }}>
                    {distDisplay}
                </div>
                <div style={{ fontSize: '3rem', lineHeight: 1.2, fontWeight: '500' }}>
                    {currentStep.instruction}
                </div>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: '16px', height: '100px' }}>
                <button
                    onClick={onPrev}
                    disabled={currentStepIndex === 0}
                    style={{
                        flex: 1,
                        fontSize: '2rem',
                        backgroundColor: '#222',
                        color: currentStepIndex === 0 ? '#555' : '#fff',
                        border: '2px solid #444',
                        borderRadius: '12px'
                    }}
                >
                    ⬅️ Prev
                </button>
                <button
                    onClick={onNext}
                    style={{
                        flex: 2, // Larger forward button
                        fontSize: '2.5rem',
                        backgroundColor: isLastStep ? '#0a0' : '#0af',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '12px',
                        fontWeight: 'bold'
                    }}
                >
                    {isLastStep ? '🎉 Arrived!' : 'Next ➡️'}
                </button>
            </div>
        </div>
    );
}
