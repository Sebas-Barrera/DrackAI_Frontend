import { useEffect, useState, useRef } from 'react';

const WEBSOCKET_URL = 'ws://192.168.1.109:8080'; // Ajusta con la IP real del servidor

/**
 * @typedef {Object} Alerta
 * @property {string} id
 * @property {string} tipo
 * @property {string} descripcion
 * @property {number} confianza
 * @property {string} fecha
 * @property {string} hora
 */

/** @returns {Alerta[]} */
export default function useWebSocketService() {
    const [alerts, setAlerts] = useState([]);
    const wsRef = useRef(null);

    useEffect(() => {
        const connectWebSocket = () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
    
            wsRef.current = new WebSocket(WEBSOCKET_URL);
    
            wsRef.current.onopen = () => {
                console.log('Conectado al WebSocket');
                wsRef.current.send(JSON.stringify({ tipo: 'identificacion', cliente: 'app' }));
            };
    
            wsRef.current.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.tipo === 'nueva_alerta' && data.alerta) {
                        setAlerts((prevAlerts) => [data.alerta, ...prevAlerts]);
                    }
                    if (data.tipo === 'ping') {
                        // Responder al ping
                        wsRef.current.pong();
                    }
                } catch (error) {
                    console.error('Error al procesar mensaje WebSocket:', error);
                }
            };
    
            wsRef.current.onerror = (error) => {
                console.error('Error en WebSocket:', error);
            };
    
            wsRef.current.onclose = () => {
                console.log('Conexión WebSocket cerrada, intentando reconectar en 5s...');
                setTimeout(() => {
                    connectWebSocket();
                }, 5000);
            };
        };
    
        connectWebSocket();
    
        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, []);    

    return alerts;
}
