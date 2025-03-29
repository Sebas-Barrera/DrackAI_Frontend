import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { SplashScreen } from 'expo-router';
import { Shield, Bell, Calendar, Search, ChevronRight, Filter, Wifi, WifiOff } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

// Importar nuestro servicio WebSocket
import { useWebSocket } from '../../services/WebSocketService';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Tipo para las alertas
type Alert = {
  id?: string;
  titulo?: string;
  title?: string; 
  description?: string;
  descripcion?: string;
  timestamp?: string;
  priority?: 'high' | 'medium' | 'low';
  type?: string;
  tipo?: string;
  location?: string;
  ubicacion?: string;
  fecha?: string;
  hora?: string;
  confianza?: number;
};

// Función para convertir el nivel de confianza a prioridad
const confianzaAPrioridad = (confianza: number): 'high' | 'medium' | 'low' => {
  if (confianza >= 0.7) return 'high';
  if (confianza >= 0.5) return 'medium';
  return 'low';
};

const getPriorityColor = (priority: string): [string, string] => {
  switch (priority) {
    case 'high':
      return ['#ef4444', '#dc2626'];
    case 'medium':
      return ['#f97316', '#ea580c'];
    case 'low':
      return ['#22c55e', '#16a34a'];
    default:
      return ['#3b82f6', '#2563eb'];
  }
};

const getPriorityIcon = (priority: string) => {
  switch (priority) {
    case 'high':
      return <Bell size={20} color="#fff" />;
    case 'medium':
      return <Bell size={20} color="#fff" />;
    case 'low':
      return <Bell size={20} color="#fff" />;
    default:
      return <Bell size={20} color="#fff" />;
  }
};

// Función para convertir las alertas del WebSocket al formato que espera la UI
const formatearAlerta = (alerta: any, index: number): Alert => {
  // Si la alerta ya tiene el formato correcto, devolverla tal cual
  if (alerta.title && alerta.description) {
    return alerta;
  }

  // Crear un ID único si no existe
  const id = alerta.id || `alerta-${index}-${Date.now()}`;
  
  // Formatear los datos según lo que venga del servidor
  return {
    id,
    titulo: alerta.tipo ? `Alerta: ${alerta.tipo}` : "Alerta de Seguridad",
    descripcion: `Alerta detectada con nivel de confianza: ${(alerta.confianza * 100).toFixed(0)}%`,
    priority: confianzaAPrioridad(alerta.confianza || 0),
    location: alerta.ubicacion || "Ubicación desconocida",
    fecha: alerta.fecha,
    hora: alerta.hora,
    confianza: alerta.confianza,
    tipo: alerta.tipo
  };
};

export default function alertas() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Usar nuestro hook WebSocket
  const { alertas, conectado, ultimaAlerta } = useWebSocket();
  
  // Estado local para las alertas formateadas
  const [alertasFormateadas, setAlertasFormateadas] = useState<Alert[]>([]);

  // Formatear las alertas cuando se reciban del WebSocket
  useEffect(() => {
    if (alertas && alertas.length > 0) {
      const formateadas = alertas.map((alerta, index) => formatearAlerta(alerta, index));
      setAlertasFormateadas(formateadas);
    }
  }, [alertas]);

  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simular tiempo de carga
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  // Filtrar alertas según el texto de búsqueda
  const alertasFiltradas = alertasFormateadas.filter(alerta => {
    const terminoBusqueda = searchQuery.toLowerCase();
    return (
      (alerta.titulo?.toLowerCase().includes(terminoBusqueda) || false) ||
      (alerta.descripcion?.toLowerCase().includes(terminoBusqueda) || false) ||
      (alerta.location?.toLowerCase().includes(terminoBusqueda) || false) ||
      (alerta.tipo?.toLowerCase().includes(terminoBusqueda) || false)
    );
  });

  const renderAlert = ({ item }: { item: Alert }) => {
    // Determinar prioridad
    const priority = item.priority || confianzaAPrioridad(item.confianza || 0);
    
    return (
      <TouchableOpacity style={styles.alertCard}>
        <View style={styles.alertHeader}>
          <LinearGradient
            colors={getPriorityColor(priority)}
            style={styles.priorityIndicator}
          >
            {getPriorityIcon(priority)}
          </LinearGradient>
          <View style={styles.alertHeaderText}>
            <Text style={styles.alertTitle}>{item.titulo || item.title}</Text>
            <Text style={styles.alertLocation}>{item.location || item.ubicacion || "Ubicación sin definir"}</Text>
          </View>
          <ChevronRight size={20} color="#64748b" />
        </View>
        
        <Text style={styles.alertDescription}>{item.descripcion || item.description}</Text>
        
        <View style={styles.alertFooter}>
          <Text style={styles.alertTimestamp}>
            {item.fecha && item.hora ? `${item.fecha} ${item.hora}` : 
             item.timestamp ? new Date(item.timestamp).toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit',
            }) : new Date().toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
          {item.confianza !== undefined && (
            <Text style={styles.confianzaText}>
              Confianza: {(item.confianza * 100).toFixed(0)}%
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.titleContainer}>
            <Shield size={24} color="#1e293b" />
            <Text style={styles.title}>Alertas de Seguridad</Text>
          </View>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Filter size={20} color="#64748b" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={20} color="#64748b" />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar alertas..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#64748b"
            />
          </View>
          <TouchableOpacity style={styles.dateButton}>
            <Calendar size={20} color="#3b82f6" />
          </TouchableOpacity>
        </View>
        
        {/* Indicador de estado de conexión */}
        <View style={styles.connectionStatus}>
          {conectado ? (
            <View style={styles.connectedContainer}>
              <Wifi size={16} color="#16a34a" />
              <Text style={styles.connectedText}>Conectado al servidor</Text>
            </View>
          ) : (
            <View style={styles.disconnectedContainer}>
              <WifiOff size={16} color="#dc2626" />
              <Text style={styles.disconnectedText}>Desconectado</Text>
            </View>
          )}
        </View>
      </View>

      {alertasFiltradas.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Bell size={60} color="#d1d5db" />
          <Text style={styles.emptyText}>
            {conectado 
              ? "No hay alertas disponibles" 
              : "Esperando conexión con el servidor..."}
          </Text>
          {!conectado && <ActivityIndicator size="large" color="#3b82f6" style={styles.loader} />}
        </View>
      ) : (
        <FlatList
          data={alertasFiltradas}
          renderItem={renderAlert}
          keyExtractor={(item, index) => item.id || `alert-${index}`}
          contentContainerStyle={styles.alertsList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

     
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: Platform.OS === 'web' ? 24 : 60,
    paddingHorizontal: 22,
    
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#1e293b',
  },
  filterButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: '#1e293b',
    fontFamily: 'Inter-Regular',
  },
  dateButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertsList: {
    padding: 16,
    paddingBottom: 200,
  },
  alertCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      web: {
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      },
      default: {
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
    }),
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  priorityIndicator: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertHeaderText: {
    flex: 1,
  },
  alertTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#1e293b',
    marginBottom: 2,
  },
  alertLocation: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#64748b',
  },
  alertDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#334155',
    marginBottom: 12,
    lineHeight: 20,
  },
  alertFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertTimestamp: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#64748b',
  },
  confianzaText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#64748b',
  },
  statsPanel: {
    position: 'absolute',
    paddingBottom: 300,
    bottom: 32,
    left: 16,
    right: 16,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(8px)',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
      },
    }),
  },
  statsPanelContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 16,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#1e293b',
  },
  statLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e2e8f0',
  },
  connectionStatus: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  connectedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  connectedText: {
    color: '#16a34a',
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  disconnectedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  disconnectedText: {
    color: '#dc2626',
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 16,
  },
  loader: {
    marginTop: 20,
  },
});