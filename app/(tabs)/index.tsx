import { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { SplashScreen } from 'expo-router';
import { Bell, Map, Shield, TriangleAlert as AlertTriangle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

SplashScreen.preventAutoHideAsync();

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    title: 'Alerta de seguridad',
    description: 'Se reportó actividad sospechosa en Av. Principal',
    time: '10:30',
    type: 'warning',
  },
  {
    id: 2,
    title: 'Nueva ruta segura',
    description: 'Se ha añadido una nueva ruta segura cerca de tu ubicación',
    time: '09:15',
    type: 'info',
  },
];

const SAFETY_TIPS = [
  'Mantén tu ubicación compartida con contactos de confianza',
  'Evita caminar solo/a durante la noche',
  'Ten siempre a mano números de emergencia',
];

export default function HomeScreen() {


  const router = useRouter();

  const navigateToMap = () => {
    router.push('/(tabs)/pages/mapa');
  }

  const navigateToPanico = () => {
    router.push('/panic');
  }

  const navigateToAlertas = () => {
    router.push('/(tabs)/pages/alertas');
  }

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

  return (
    <ScrollView
      style={styles.container}
      onLayout={onLayoutRootView}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 67 }} // Espacio extra en la parte inferior
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>DracIA</Text>
        <Text style={styles.welcomeText}>Bienvenido/a de vuelta</Text>
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionButton} onPress={navigateToPanico}>
          <LinearGradient
            colors={['#ef4444', '#dc2626']}
            style={styles.actionGradient}
          >
            <AlertTriangle color="#fff" size={24} />
            <Text style={styles.actionText}>Botón de Pánico</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={navigateToAlertas}>
          <LinearGradient
            colors={['#f97316', '#ea580c']}
            style={styles.actionGradient}
          >
            <Bell color="#fff" size={24} />
            <Text style={styles.actionText}>Ver Alertas</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <AlertTriangle size={20} color="#64748b" />
          <Text style={styles.sectionTitle}>Notificaciones Recientes</Text>
        </View>
        {MOCK_NOTIFICATIONS.map((notification) => (
          <View key={notification.id} style={styles.notificationCard}>
            <Text style={styles.notificationTitle}>{notification.title}</Text>
            <Text style={styles.notificationDesc}>{notification.description}</Text>
            <Text style={styles.notificationTime}>{notification.time}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Shield size={20} color="#64748b" />
          <Text style={styles.sectionTitle}>Consejos de Seguridad</Text>
        </View>
        {SAFETY_TIPS.map((tip, index) => (
          <View key={index} style={styles.tipCard}>
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
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
  greeting: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    color: '#1e293b',
  },
  welcomeText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#64748b',
    marginTop: 4,
  },
  quickActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionGradient: {
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  actionText: {
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    fontSize: 14,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#1e293b',
  },
  notificationCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
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
  notificationTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#1e293b',
    marginBottom: 4,
  },
  notificationDesc: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  notificationTime: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#94a3b8',
  },
  tipCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
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
  tipText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#1e293b',
  },
});