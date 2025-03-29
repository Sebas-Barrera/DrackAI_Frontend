import { useState, useEffect, useRef } from 'react';
import { Platform, AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// URL del servidor WebSocket - Ajusta estas direcciones según tu configuración
const WS_URL = Platform.select({
    ios: 'ws://localhost:8080',     // Para simulador iOS
    android: 'ws://192.168.0.224:8080',  // Para emulador Android
    default: 'ws://192.168.0.224:8080' // Para dispositivo físico (usa la misma IP que en main.py)
});

// Configuración
const CONFIG = {
    RECONEXION_INTERVALO: 5000,    // Intentar reconectar cada 5 segundos
    MAX_INTENTOS: 10,              // Máximo número de intentos de reconexión
    TIMEOUT_CONEXION: 10000,       // Timeout para conexión inicial (10 segundos)
    MAX_ALERTAS_LOCAL: 50,         // Máximo de alertas a guardar localmente
    CLAVE_ALERTAS_LOCAL: 'dracai_alertas_local',
    ENVIAR_LATIDOS: true,          // Enviar mensajes de "latido" para mantener la conexión
    INTERVALO_LATIDOS: 20000       // Enviar latido cada 20 segundos
};

// Clase para manejar la conexión WebSocket
class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = [];
    this.isConnected = false;
    this.reconnectInterval = null;
    this.reconnectAttempts = 0;
    this.timeoutId = null;
    this.clientId = null;
    this.heartbeatInterval = null;
    
    // Bindear métodos para garantizar contexto correcto
    this.connect = this.connect.bind(this);
    this.disconnect = this.disconnect.bind(this);
    this.send = this.send.bind(this);
    this.addListener = this.addListener.bind(this);
    this.removeListener = this.removeListener.bind(this);
    this.notifyListeners = this.notifyListeners.bind(this);
    this.startHeartbeat = this.startHeartbeat.bind(this);
    this.stopHeartbeat = this.stopHeartbeat.bind(this);
    this.handleAppStateChange = this.handleAppStateChange.bind(this);
    
    // Escuchar cambios de estado de la app
    AppState.addEventListener('change', this.handleAppStateChange);
  }

  // Manejar cambios de estado de la aplicación
  handleAppStateChange(nextAppState) {
    console.log(`App pasó a estado: ${nextAppState}`);
    
    if (nextAppState === 'active') {
      // App volvió a primer plano, intentar reconectar si es necesario
      if (!this.isConnected) {
        console.log('App en primer plano, intentando reconectar');
        this.reconnectAttempts = 0;
        this.connect();
      }
    } else if (nextAppState === 'background') {
      // App fue a segundo plano, mantener conexión pero detener heartbeat
      this.stopHeartbeat();
    }
  }

  // Conectar al WebSocket
  connect() {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      console.log('Ya hay una conexión WebSocket existente');
      return;
    }
    
    // Limpiar intentos de reconexión previos
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
      this.reconnectInterval = null;
    }
    
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    
    console.log('Conectando al WebSocket en:', WS_URL);
    
    try {
      this.socket = new WebSocket(WS_URL);
      
      // Establecer timeout para la conexión inicial
      this.timeoutId = setTimeout(() => {
        if (this.socket && this.socket.readyState !== WebSocket.OPEN) {
          console.log('Timeout de conexión alcanzado');
          this.socket.close();
          this.isConnected = false;
          this.notifyListeners({ type: 'connection', status: 'disconnected', error: 'timeout' });
          this.scheduleReconnect();
        }
      }, CONFIG.TIMEOUT_CONEXION);
      
      this.socket.onopen = () => {
        console.log('Conexión WebSocket establecida');
        
        // Limpiar timeout
        if (this.timeoutId) {
          clearTimeout(this.timeoutId);
          this.timeoutId = null;
        }
        
        this.isConnected = true;
        this.reconnectAttempts = 0;
        
        // Identificarse como una app cliente
        this.send({
          tipo: 'identificacion',
          cliente: 'app',
          plataforma: Platform.OS,
          version: '1.0.0'
        });
        
        // Iniciar envío de latidos
        if (CONFIG.ENVIAR_LATIDOS) {
          this.startHeartbeat();
        }
        
        // Notificar a los listeners que la conexión está establecida
        this.notifyListeners({ type: 'connection', status: 'connected' });
        
        // Limpiar el intervalo de reconexión si existe
        if (this.reconnectInterval) {
          clearInterval(this.reconnectInterval);
          this.reconnectInterval = null;
        }
      };
      
      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Mensaje recibido:', data.tipo || 'sin tipo');
          
          // Manejar mensaje de identificación
          if (data.tipo === 'conexion' && data.id) {
            this.clientId = data.id;
            console.log(`ID asignado por el servidor: ${this.clientId}`);
          }
          
          // Notificar a los listeners del nuevo mensaje
          this.notifyListeners({ type: 'message', data });
        } catch (error) {
          console.error('Error al procesar mensaje:', error);
        }
      };
      
      this.socket.onerror = (error) => {
        console.error('Error en la conexión WebSocket:', error);
        this.notifyListeners({ type: 'error', error });
      };
      
      this.socket.onclose = (event) => {
        const wasConnected = this.isConnected;
        this.isConnected = false;
        this.stopHeartbeat();
        
        console.log(`Conexión WebSocket cerrada. Código: ${event.code}, Razón: ${event.reason || 'Sin razón'}`);
        
        if (wasConnected) {
          this.notifyListeners({ 
            type: 'connection', 
            status: 'disconnected',
            code: event.code,
            reason: event.reason
          });
        }
        
        // Configurar reconexión automática
        this.scheduleReconnect();
      };
    } catch (error) {
      console.error('Error al crear WebSocket:', error);
      this.isConnected = false;
      this.scheduleReconnect();
    }
  }
  
  // Programar intento de reconexión
  scheduleReconnect() {
    if (this.reconnectInterval) return;
    
    this.reconnectAttempts++;
    
    if (this.reconnectAttempts > CONFIG.MAX_INTENTOS) {
      console.log(`Máximo de intentos de reconexión (${CONFIG.MAX_INTENTOS}) alcanzado. No se intentará más.`);
      this.notifyListeners({ type: 'connection', status: 'failed', message: 'Máximo de intentos alcanzado' });
      return;
    }
    
    console.log(`Programando reconexión. Intento ${this.reconnectAttempts}/${CONFIG.MAX_INTENTOS} en ${CONFIG.RECONEXION_INTERVALO/1000}s`);
    
    this.reconnectInterval = setInterval(() => {
      if (!this.isConnected) {
        console.log(`Intentando reconexión (${this.reconnectAttempts}/${CONFIG.MAX_INTENTOS})...`);
        this.connect();
      } else {
        clearInterval(this.reconnectInterval);
        this.reconnectInterval = null;
      }
    }, CONFIG.RECONEXION_INTERVALO);
  }
  
  // Iniciar envío de latidos para mantener la conexión
  startHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        this.send({ tipo: 'latido', timestamp: Date.now() });
      }
    }, CONFIG.INTERVALO_LATIDOS);
  }
  
  // Detener envío de latidos
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Cerrar la conexión
  disconnect() {
    this.stopHeartbeat();
    
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
      this.reconnectInterval = null;
    }
    
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    
    if (this.socket) {
      try {
        this.socket.close(1000, "Cierre solicitado por el cliente");
      } catch (e) {
        console.error('Error al cerrar WebSocket:', e);
      }
      this.socket = null;
    }
    
    this.isConnected = false;
  }

  // Enviar un mensaje al servidor
  send(data) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      try {
        this.socket.send(JSON.stringify(data));
        return true;
      } catch (e) {
        console.error('Error al enviar mensaje:', e);
        return false;
      }
    }
    console.warn('No se puede enviar el mensaje: WebSocket no está conectado');
    return false;
  }

  // Registrar un listener para recibir notificaciones
  addListener(callback) {
    if (typeof callback !== 'function') {
      console.error('El listener debe ser una función');
      return () => {};
    }
    
    this.listeners.push(callback);
    return () => this.removeListener(callback);
  }

  // Eliminar un listener
  removeListener(callback) {
    const index = this.listeners.indexOf(callback);
    if (index !== -1) {
      this.listeners.splice(index, 1);
    }
  }

  // Notificar a todos los listeners
  notifyListeners(data) {
    this.listeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error('Error en listener de WebSocket:', error);
      }
    });
  }
  
  // Limpiar recursos al destruir la instancia
  cleanup() {
    this.disconnect();
    AppState.removeEventListener('change', this.handleAppStateChange);
  }
}

// Crear una instancia única del servicio
const webSocketService = new WebSocketService();

// Hook personalizado para usar el WebSocket en componentes React
export function useWebSocket() {
  const [estado, setEstado] = useState({
    conectado: webSocketService.isConnected,
    alertas: [],
    ultimaAlerta: null,
    cargando: true,
    error: null
  });
  
  const alertasRef = useRef(estado.alertas);
  alertasRef.current = estado.alertas;
  
  // Cargar alertas almacenadas localmente
  const cargarAlertasLocales = async () => {
    try {
      const alertasGuardadas = await AsyncStorage.getItem(CONFIG.CLAVE_ALERTAS_LOCAL);
      if (alertasGuardadas) {
        const alertas = JSON.parse(alertasGuardadas);
        setEstado(prev => ({ ...prev, alertas, cargando: false }));
      } else {
        setEstado(prev => ({ ...prev, cargando: false }));
      }
    } catch (error) {
      console.error('Error al cargar alertas locales:', error);
      setEstado(prev => ({ ...prev, cargando: false, error: 'Error al cargar datos locales' }));
    }
  };
  
  // Guardar alertas localmente
  const guardarAlertasLocales = async (alertas) => {
    try {
      // Limitar cantidad de alertas guardadas
      const alertasLimitadas = alertas.slice(-CONFIG.MAX_ALERTAS_LOCAL);
      await AsyncStorage.setItem(CONFIG.CLAVE_ALERTAS_LOCAL, JSON.stringify(alertasLimitadas));
    } catch (error) {
      console.error('Error al guardar alertas locales:', error);
    }
  };
  
  useEffect(() => {
    // Cargar alertas guardadas al inicio
    cargarAlertasLocales();
    
    // Establecer la conexión cuando se monte el componente
    webSocketService.connect();

    // Configurar el listener para recibir actualizaciones
    const unsubscribe = webSocketService.addListener((evento) => {
      if (evento.type === 'connection') {
        setEstado(prev => ({ ...prev, conectado: evento.status === 'connected' }));
      } 
      else if (evento.type === 'message') {
        if (evento.data.tipo === 'historial') {
          // Recibimos historial completo
          const nuevasAlertas = procesarAlertasRecibidas(evento.data.alertas);
          
          setEstado(prev => {
            const combinadas = combinarAlertas(prev.alertas, nuevasAlertas);
            // Guardar localmente
            guardarAlertasLocales(combinadas);
            
            return { 
              ...prev, 
              alertas: combinadas,
              ultimaAlerta: combinadas.length > 0 ? combinadas[combinadas.length - 1] : null
            };
          });
        } 
        else if (evento.data.tipo === 'nueva_alerta') {
          // Recibimos una nueva alerta
          const nuevaAlerta = formatearAlerta(evento.data.alerta);
          
          setEstado(prev => {
            // Verificar si la alerta ya existe para evitar duplicados
            if (alertaExiste(prev.alertas, nuevaAlerta)) {
              return prev;
            }
            
            const nuevasAlertas = [...prev.alertas, nuevaAlerta];
            
            // Ordenar por fecha/hora
            nuevasAlertas.sort((a, b) => {
              const fechaA = new Date(`${a.fecha}T${a.hora}`);
              const fechaB = new Date(`${b.fecha}T${b.hora}`);
              return fechaB - fechaA; // Ordenar descendente (más reciente primero)
            });
            
            // Guardar localmente
            guardarAlertasLocales(nuevasAlertas);
            
            return {
              ...prev,
              alertas: nuevasAlertas,
              ultimaAlerta: nuevaAlerta
            };
          });
        }
      }
    });

    // Limpiar cuando se desmonte el componente
    return () => {
      unsubscribe();
      // No cerramos la conexión para mantenerla activa en toda la app
      // webSocketService.disconnect();
    };
  }, []);
  
  // Función para verificar si una alerta ya existe
  const alertaExiste = (alertas, nuevaAlerta) => {
    return alertas.some(alerta => 
      alerta.id === nuevaAlerta.id || 
      (alerta.fecha === nuevaAlerta.fecha && 
       alerta.hora === nuevaAlerta.hora && 
       alerta.tipo === nuevaAlerta.tipo &&
       Math.abs(alerta.confianza - nuevaAlerta.confianza) < 0.05)
    );
  };
  
  // Procesar múltiples alertas
  const procesarAlertasRecibidas = (alertas) => {
    if (!alertas || !Array.isArray(alertas)) return [];
    return alertas.map(formatearAlerta);
  };
  
  // Combinar alertas sin duplicados
  const combinarAlertas = (alertasActuales, nuevasAlertas) => {
    const combinadas = [...alertasActuales];
    
    nuevasAlertas.forEach(nuevaAlerta => {
      if (!alertaExiste(combinadas, nuevaAlerta)) {
        combinadas.push(nuevaAlerta);
      }
    });
    
    // Ordenar por fecha/hora
    combinadas.sort((a, b) => {
      const fechaA = new Date(`${a.fecha}T${a.hora}`);
      const fechaB = new Date(`${b.fecha}T${b.hora}`);
      return fechaB - fechaA; // Ordenar descendente (más reciente primero)
    });
    
    return combinadas;
  };
  
  // Formatear alertas al formato estándar
  const formatearAlerta = (alerta) => {
    // Si ya tiene el formato esperado, devolverla
    if (alerta.id && alerta.titulo && alerta.descripcion) {
      return alerta;
    }
    
    // Crear ID si no existe
    const id = alerta.id || `alerta-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Formatear la alerta según los datos disponibles
    return {
      id,
      fecha: alerta.fecha || new Date().toISOString().split('T')[0],
      hora: alerta.hora || new Date().toISOString().split('T')[1].substring(0, 8),
      titulo: alerta.tipo ? `Alerta: ${alerta.tipo}` : "Alerta de Seguridad",
      descripcion: generarDescripcion(alerta),
      tipo: alerta.tipo || "seguridad",
      confianza: alerta.confianza || 0.5,
      ubicacion: alerta.ubicacion || "Sin ubicación definida",
      conteo: alerta.conteo || 1,
      prioridad: calcularPrioridad(alerta.confianza || 0.5)
    };
  };
  
  // Generar descripción según datos de la alerta
  const generarDescripcion = (alerta) => {
    let base = `Alerta detectada con nivel de confianza: ${(alerta.confianza * 100).toFixed(0)}%`;
    
    if (alerta.conteo && alerta.conteo > 1) {
      base += `. Confirmada ${alerta.conteo} veces`;
    }
    
    return base;
  };
  
  // Calcular prioridad basada en confianza
  const calcularPrioridad = (confianza) => {
    if (confianza >= 0.7) return 'high';
    if (confianza >= 0.5) return 'medium';
    return 'low';
  };
  
  // Acciones adicionales que podemos ofrecer a los componentes
  const acciones = {
    recargar: () => {
      // Solicitar historial al servidor
      if (webSocketService.isConnected) {
        webSocketService.send({ tipo: 'solicitar_historial' });
      } else {
        // Si no hay conexión, intentar reconectar
        webSocketService.connect();
      }
    },
    
    limpiarAlertas: async () => {
      setEstado(prev => ({ ...prev, alertas: [], ultimaAlerta: null }));
      try {
        await AsyncStorage.removeItem(CONFIG.CLAVE_ALERTAS_LOCAL);
      } catch (e) {
        console.error('Error al limpiar almacenamiento:', e);
      }
    },
    
    reconectar: () => {
      webSocketService.reconnectAttempts = 0;
      webSocketService.connect();
    },
    
    enviar: webSocketService.send
  };

  return {
    ...estado,
    ...acciones
  };
}

export default webSocketService;