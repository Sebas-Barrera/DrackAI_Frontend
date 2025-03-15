import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  TextInput,
} from 'react-native';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { SplashScreen } from 'expo-router';
import { Shield, Bell, Calendar, Search, ChevronRight, Filter } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Mock data for alerts
type Alert = {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  priority: 'high' | 'medium' | 'low';
  type: string;
  location: string;
};

const MOCK_ALERTS: Alert[] = [
  {
    id: '1',
    title: 'Alerta de Seguridad',
    description: 'Se ha reportado actividad sospechosa en la zona norte del campus.',
    timestamp: '2024-02-20T10:30:00Z',
    priority: 'high',
    type: 'security',
    location: 'Zona Norte',
  },
  {
    id: '2',
    title: 'Precaución',
    description: 'Obras de mantenimiento en proceso. Se recomienda tomar rutas alternativas.',
    timestamp: '2024-02-20T09:15:00Z',
    priority: 'medium',
    type: 'maintenance',
    location: 'Zona Central',
  },
  {
    id: '3',
    title: 'Información',
    description: 'Nueva ruta segura disponible para estudiantes nocturnos.',
    timestamp: '2024-02-20T08:45:00Z',
    priority: 'low',
    type: 'info',
    location: 'Campus General',
  },
];

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

export default function alertas() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showFilters, setShowFilters] = useState(false);

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

  if (!fontsLoaded) {
    return null;
  }

  const renderAlert = ({ item }: { item: Alert }) => (
    <TouchableOpacity style={styles.alertCard}>
      <View style={styles.alertHeader}>
        <LinearGradient
          colors={getPriorityColor(item.priority)}
          style={styles.priorityIndicator}
        >
          {getPriorityIcon(item.priority)}
        </LinearGradient>
        <View style={styles.alertHeaderText}>
          <Text style={styles.alertTitle}>{item.title}</Text>
          <Text style={styles.alertLocation}>{item.location}</Text>
        </View>
        <ChevronRight size={20} color="#64748b" />
      </View>
      
      <Text style={styles.alertDescription}>{item.description}</Text>
      
      <View style={styles.alertFooter}>
        <Text style={styles.alertTimestamp}>
          {new Date(item.timestamp).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    </TouchableOpacity>
  );

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
      </View>

      <FlatList
        data={MOCK_ALERTS}
        renderItem={renderAlert}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.alertsList}
        showsVerticalScrollIndicator={false}
      />
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
    paddingBottom: 16,
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
    justifyContent: 'flex-end',
  },
  alertTimestamp: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#64748b',
  },
  statsPanel: {
    position: 'absolute',
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
});