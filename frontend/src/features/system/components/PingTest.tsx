import { useState, useEffect } from 'react';
import api from '../../../services/api';
import './PingTest.css';

interface PingResponse {
    message: string;
}

const PingTest = () => {
    const [status, setStatus] = useState<string>('Pinging backend...');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const pingBackend = async () => {
            try {
                setError(null);
                // L'URL complète sera "http://localhost:8080/api/ping" grâce à la config d'Axios
                const response = await api.get<PingResponse>('/ping');
                setStatus(response.data.message);
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('An unknown error occurred.');
                }
                setStatus('Failed to ping backend.');
            }
        };

        pingBackend();
    }, []);

    return (
        <div className="ping-container">
            <h2>Backend Connectivity Test</h2>
            <div className={`status-box ${error ? 'error' : 'success'}`}>
                <p><strong>Status:</strong> {status}</p>
                {error && <p className="error-message"><strong>Details:</strong> {error}</p>}
            </div>
        </div>
    );
};

export default PingTest;