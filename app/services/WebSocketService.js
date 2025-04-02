import { useEffect, useState, useRef } from 'react';

const WEBSOCKET_URL = 'ws://192.168.0.220:8080';

/**
 * @typedef {Object} Ubicacion
 * @property {string} [direccion] - Dirección textual
 * @property {string} [direccion] - Dirección textual
 * @property {number} latitude - Latitud (obligatoria)
 * @property {number} longitude - Longitud (obligatoria)
 */

/**
 * @typedef {Object} Alerta
 * @property {string} id
 * @property {string} tipo
 * @property {string} [descripcion]
 * @property {number} confianza
 * @property {string} fecha
 * @property {string} hora
 * @property {string|Ubicacion} ubicacion - Puede ser string o objeto Ubicacion
 */

/** 
 * @returns {Alerta[]} 
 */
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
    
            // En la función onmessage del WebSocket:
            wsRef.current.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.tipo === 'nueva_alerta' && data.alerta) {
                        // Asegurarnos que la ubicación es un objeto con las propiedades correctas
                        if (data.alerta.ubicacion) {
                            // Si la ubicación viene como string (ej: "Dirección (lat, long)")
                            if (typeof data.alerta.ubicacion === 'string') {
                                // Extraer latitud y longitud del string si es posible
                                const coordMatch = data.alerta.ubicacion.match(/\(([^)]+)\)/);
                                if (coordMatch) {
                                    const [latitude, longitude] = coordMatch[1].split(',').map(Number);
                                    data.alerta.ubicacion = {
                                        direccion: data.alerta.ubicacion.split('(')[0].trim(),
                                        latitude,
                                        longitude
                                    };
                                } else {
                                    // Si no encuentra coordenadas, usar las por defecto
                                    data.alerta.ubicacion = {
                                        direccion: data.alerta.ubicacion,
                                        latitude: 20.906683,
                                        longitude: -100.707357
                                    };
                                }
                            }
                            // Si ya es objeto, asegurarse que tiene lat/long
                            else if (typeof data.alerta.ubicacion === 'object') {
                                if (!data.alerta.ubicacion.latitude || !data.alerta.ubicacion.longitude) {
                                    data.alerta.ubicacion = {
                                        ...data.alerta.ubicacion,
                                        latitude: 20.906683,
                                        longitude: -100.707357
                                    };
                                }
                            }
                        }
                        setAlerts((prevAlerts) => [data.alerta, ...prevAlerts]);
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