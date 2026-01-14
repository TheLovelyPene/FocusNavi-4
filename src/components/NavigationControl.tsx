import { useState } from 'react';
import { api } from '../services/api';
import type { Location } from '../services/api';

interface Props {
    onSelectLocation: (loc: Location) => void;
    label?: string;
    placeholder?: string;
}

export default function NavigationControl({ onSelectLocation, label = '📍 Where to?', placeholder = 'Enter address...' }: Props) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Location[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = async () => {
        if (!query.trim()) return;
        setIsLoading(true);
        const locations = await api.searchAddress(query);
        setResults(locations);
        setIsLoading(false);
    };

    return (
        <div style={{
            backgroundColor: '#222',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '16px',
            border: '2px solid #555'
        }}>
            <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', fontSize: '1.1rem' }}>{label}</p>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder={placeholder}
                    style={{
                        flex: 1,
                        padding: '12px',
                        fontSize: '16px',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: '#fff',
                        color: '#000'
                    }}
                />
                <button
                    onClick={handleSearch}
                    disabled={isLoading}
                    style={{
                        backgroundColor: '#0af',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: 'bold',
                        padding: '0 16px'
                    }}
                >
                    {isLoading ? '...' : 'Go'}
                </button>
            </div>

            {results.length > 0 && (
                <ul style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    backgroundColor: '#333',
                    borderRadius: '6px',
                    maxHeight: '200px',
                    overflowY: 'auto'
                }}>
                    {results.map((loc, i) => (
                        <li
                            key={i}
                            onClick={() => {
                                onSelectLocation(loc);
                                setResults([]); // Clear results after selection
                                setQuery('');
                            }}
                            style={{
                                padding: '12px',
                                borderBottom: '1px solid #444',
                                cursor: 'pointer',
                                fontSize: '0.9rem'
                            }}
                        >
                            {loc.display_name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
