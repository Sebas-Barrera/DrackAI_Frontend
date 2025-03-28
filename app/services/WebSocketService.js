// // Este archivo puedes guardarlo como: services/WebSocketService.js

// import { useEffect, useState } from 'react';
// import { Platform } from'react-native';

// // URL del servidor WebSocket
// // const WS_URL = 'ws://192.168.1.70:8080'; // Cambia la IP por la de tu servidor

// const WS_URL = Platform.select({
//     ios: 'ws://localhost:8080',     // Para simulador
//     android: 'ws://10.0.2.2:8080',  // Para emulador Android
//     default: 'ws://192.168.1.X:8080' // Para dispositivo físico
//   });

// // Clase para manejar la conexión WebSocket
// class WebSocketService {
//   constructor() {
//     this.socket = null;
//     this.listeners = [];
//     this.isConnected = false;
//     this.reconnectInterval = null;
//   }

//   // Conectar al WebSocket
//   connect() {
//     if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
//       console.log('Ya hay una conexión WebSocket existente');
//       return;
//     }

//     console.log('Conectando al WebSocket...');
//     this.socket = new WebSocket(WS_URL);

//     this.socket.onopen = () => {
//       console.log('Conexión WebSocket establecida');
//       this.isConnected = true;
//       // Notificar a los listeners que la conexión está establecida
//       this.notifyListeners({ type: 'connection', status: 'connected' });
      
//       // Limpiar el intervalo de reconexión si existe
//       if (this.reconnectInterval) {
//         clearInterval(this.reconnectInterval);
//         this.reconnectInterval = null;
//       }
//     };

//     this.socket.onmessage = (event) => {
//       try {
//         const data = JSON.parse(event.data);
//         console.log('Mensaje recibido:', data);
        
//         // Notificar a los listeners del nuevo mensaje
//         this.notifyListeners({ type: 'message', data });
//       } catch (error) {
//         console.error('Error al procesar mensaje:', error);
//       }
//     };

//     this.socket.onerror = (error) => {
//       console.error('Error en la conexión WebSocket:', error);
//       this.notifyListeners({ type: 'error', error });
//     };

//     this.socket.onclose = () => {
//       console.log('Conexión WebSocket cerrada');
//       this.isConnected = false;
//       this.notifyListeners({ type: 'connection', status: 'disconnected' });
      
//       // Configurar reconexión automática
//       if (!this.reconnectInterval) {
//         this.reconnectInterval = setInterval(() => {
//           console.log('Intentando reconectar...');
//           this.connect();
//         }, 5000); // Intentar reconectar cada 5 segundos
//       }
//     };
//   }

//   // Cerrar la conexión
//   disconnect() {
//     if (this.socket) {
//       this.socket.close();
//       this.socket = null;
//     }
    
//     if (this.reconnectInterval) {
//       clearInterval(this.reconnectInterval);
//       this.reconnectInterval = null;
//     }
//   }

//   // Enviar un mensaje al servidor
//   send(data) {
//     if (this.socket && this.socket.readyState === WebSocket.OPEN) {
//       this.socket.send(JSON.stringify(data));
//       return true;
//     }
//     console.warn('No se puede enviar el mensaje: WebSocket no está conectado');
//     return false;
//   }

//   // Registrar un listener para recibir notificaciones
//   addListener(callback) {
//     this.listeners.push(callback);
//     return () => this.removeListener(callback);
//   }

//   // Eliminar un listener
//   removeListener(callback) {
//     const index = this.listeners.indexOf(callback);
//     if (index !== -1) {
//       this.listeners.splice(index, 1);
//     }
//   }

//   // Notificar a todos los listeners
//   notifyListeners(data) {
//     this.listeners.forEach(listener => {
//       try {
//         listener(data);
//       } catch (error) {
//         console.error('Error en listener de WebSocket:', error);
//       }
//     });
//   }
// }

// // Crear una instancia única del servicio
// const webSocketService = new WebSocket();

// // Hook personalizado para usar el WebSocket en componentes React
// export function useWebSocket() {
//   const [estado, setEstado] = useState({
//     conectado: false,
//     alertas: [],
//     ultimaAlerta: null
//   });

//   useEffect(() => {
//     // Establecer la conexión cuando se monte el componente
//     webSocketService.connect();

//     // Configurar el listener para recibir actualizaciones
//     const unsubscribe = webSocketService.addListener((evento) => {
//       if (evento.type === 'connection') {
//         setEstado(prev => ({ ...prev, conectado: evento.status === 'connected' }));
//       } 
//       else if (evento.type === 'message') {
//         if (evento.data.tipo === 'historial') {
//           setEstado(prev => ({ 
//             ...prev, 
//             alertas: evento.data.alertas,
//             ultimaAlerta: evento.data.alertas.length > 0 ? evento.data.alertas[evento.data.alertas.length - 1] : null
//           }));
//         } 
//         else if (evento.data.tipo === 'nueva_alerta') {
//           const nuevaAlerta = evento.data.alerta;
//           setEstado(prev => {
//             const nuevasAlertas = [...prev.alertas, nuevaAlerta];
//             return {
//               ...prev,
//               alertas: nuevasAlertas,
//               ultimaAlerta: nuevaAlerta
//             };
//           });
//         }
//       }
//     });

//     // Limpiar cuando se desmonte el componente
//     return () => {
//       unsubscribe();
//       // No cerramos la conexión para mantenerla activa en toda la app
//       // webSocketService.disconnect();
//     };
//   }, []);

//   return {
//     ...estado,
//     conectado: webSocketService.isConnected,
//     enviar: webSocketService.send.bind(webSocketService)
//   };
// }

// export default webSocketService;