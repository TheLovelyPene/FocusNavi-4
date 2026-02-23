// DirectionArrow component using SVGs for visual navigation cues.

interface Props {
    modifier?: string;
    size?: number;
    color?: string;
}

export default function DirectionArrow({ modifier, size = 120, color = '#facc15' }: Props) {
    let rotation = 0;
    let isUTurn = false;

    switch (modifier) {
        case 'left':
            rotation = -90;
            break;
        case 'right':
            rotation = 90;
            break;
        case 'slight left':
            rotation = -45;
            break;
        case 'slight right':
            rotation = 45;
            break;
        case 'sharp left':
            rotation = -135;
            break;
        case 'sharp right':
            rotation = 135;
            break;
        case 'uturn':
            isUTurn = true;
            break;
        case 'straight':
        default:
            break;
    }

    if (isUTurn) {
        return (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 14L4 9L9 4" />
                <path d="M20 20V13C20 10.7909 18.2091 9 16 9H4" />
            </svg>
        );
    }

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ transform: `rotate(${rotation}deg)`, transition: 'transform 0.3s ease-in-out' }}
        >
            <path d="M12 19V5" />
            <path d="M5 12l7-7 7 7" />
        </svg>
    );
}
