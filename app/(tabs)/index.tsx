import { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { SplashScreen } from 'expo-router';
import {
  Bell,
  Map,
  Shield,
  TriangleAlert as AlertTriangle,
  AlertOctagon,
  Bookmark,
  MapPin
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';

SplashScreen.preventAutoHideAsync();

const { width } = Dimensions.get('window');
const cardWidth = width - 48;

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
  const [activeSection, setActiveSection] = useState('notifications');

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

  const renderNotificationIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle size={16} color="#f97316" />;
      case 'info':
        return <Bell size={16} color="#3B99C7" />;
      default:
        return <Bell size={16} color="#3B99C7" />;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Header with gradient background */}
      <LinearGradient
        colors={['#1A3D9E', '#2A6AB0', '#3B99C7']}
        start={[0, 0]}
        end={[1, 1]}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <View style={styles.logoAndTitle}>
            {/* Placeholder for logo */}
            <View style={styles.logoContainer}>
              <Image
                source={{ uri: 'https://via.placeholder.com/50' }}
                style={styles.logo}
              />
            </View>

            <View>
              <Text style={styles.greeting}>DracIA</Text>
              <Text style={styles.welcomeText}>Bienvenido/a de vuelta</Text>
            </View>
          </View>

          {/* User Avatar (placeholder) */}
          <TouchableOpacity style={styles.avatarContainer}>
            <Image
              source={{ uri: 'https://via.placeholder.com/40' }}
              style={styles.avatar}
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollContainer}
        onLayout={onLayoutRootView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Emergency Actions */}
        <View style={styles.emergencyActions}>
          <TouchableOpacity
            style={styles.panicButton}
            onPress={navigateToPanico}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#ff6b6b', '#f03e3e']}
              start={[0, 0]}
              end={[1, 1]}
              style={styles.panicGradient}
            >
              <AlertOctagon color="#fff" size={24} />
              <Text style={styles.panicText}>BOTÓN DE PÁNICO</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionContainer}>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={navigateToMap}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#2A6AB0', '#3B99C7']}
                start={[0, 0]}
                end={[1, 1]}
                style={styles.actionGradient}
              >
                <MapPin color="#fff" size={24} />
                <Text style={styles.actionText}>Mapa</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={navigateToAlertas}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#f97316', '#f59e0b']}
                start={[0, 0]}
                end={[1, 1]}
                style={styles.actionGradient}
              >
                <Bell color="#fff" size={24} />
                <Text style={styles.actionText}>Alertas</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#36b37e', '#57d9a3']}
                start={[0, 0]}
                end={[1, 1]}
                style={styles.actionGradient}
              >
                <Bookmark color="#fff" size={24} />
                <Text style={styles.actionText}>Guardados</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section Tabs */}
        <View style={styles.sectionTabs}>
          <TouchableOpacity
            style={[
              styles.sectionTab,
              activeSection === 'notifications' && styles.activeTab
            ]}
            onPress={() => setActiveSection('notifications')}
          >
            <Bell
              size={18}
              color={activeSection === 'notifications' ? "#1A3D9E" : "#94a3b8"}
            />
            <Text
              style={[
                styles.sectionTabText,
                activeSection === 'notifications' && styles.activeTabText
              ]}
            >
              Notificaciones
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.sectionTab,
              activeSection === 'tips' && styles.activeTab
            ]}
            onPress={() => setActiveSection('tips')}
          >
            <Shield
              size={18}
              color={activeSection === 'tips' ? "#1A3D9E" : "#94a3b8"}
            />
            <Text
              style={[
                styles.sectionTabText,
                activeSection === 'tips' && styles.activeTabText
              ]}
            >
              Consejos
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content section */}
        <View style={styles.contentSection}>
          {activeSection === 'notifications' && (
            <>
              {MOCK_NOTIFICATIONS.map((notification) => (
                <TouchableOpacity
                  key={notification.id}
                  style={styles.notificationCard}
                  activeOpacity={0.9}
                >
                  <View style={styles.notificationHeader}>
                    {renderNotificationIcon(notification.type)}
                    <Text style={styles.notificationTitle}>{notification.title}</Text>
                    {notification.type === 'warning' && (
                      <View style={styles.priorityBadge}>
                        <Text style={styles.priorityText}>Alta</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.notificationDesc}>{notification.description}</Text>
                  <Text style={styles.notificationTime}>{notification.time}</Text>
                </TouchableOpacity>
              ))}
            </>
          )}

          {activeSection === 'tips' && (
            <>
              {SAFETY_TIPS.map((tip, index) => (
                <View key={index} style={styles.tipCard}>
                  <View style={styles.tipNumber}>
                    <Text style={styles.tipNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fc',
  },
  headerGradient: {
    paddingTop: Platform.OS === 'web' ? 24 : 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 20px rgba(59, 153, 199, 0.15)',
      },
      default: {
        elevation: 5,
        shadowColor: 'rgba(26, 61, 158, 0.3)',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
      },
    }),
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoAndTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  greeting: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#ffffff',
  },
  welcomeText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  avatar: {
    width: 40,
    height: 40,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  emergencyActions: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  panicButton: {
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
      },
      default: {
        elevation: 4,
        shadowColor: 'rgba(239, 68, 68, 0.6)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
    }),
  },
  panicGradient: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  panicText: {
    fontFamily: 'Inter-Bold',
    color: '#fff',
    fontSize: 16,
    letterSpacing: 1,
  },
  quickActionContainer: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#1e293b',
    marginBottom: 12,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      },
      default: {
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
  },
  actionGradient: {
    padding: 16,
    alignItems: 'center',
    gap: 8,
    height: 100,
    justifyContent: 'center',
  },
  actionText: {
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    fontSize: 14,
  },
  sectionTabs: {
    flexDirection: 'row',
    marginTop: 24,
    paddingHorizontal: 20,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  sectionTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
    marginRight: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#2A6AB0',
  },
  sectionTabText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#94a3b8',
  },
  activeTabText: {
    color: '#1A3D9E',
  },
  contentSection: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  notificationCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#e2e8f0',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
      },
      default: {
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
    }),
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  notificationTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#1e293b',
  },
  notificationDesc: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
    lineHeight: 20,
  },
  priorityBadge: {
    backgroundColor: '#ffebeb',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 'auto',
  },
  priorityText: {
    color: '#f03e3e',
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
  },
  notificationTime: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#94a3b8',
    alignSelf: 'flex-end',
  },
  tipCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
      },
      default: {
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
    }),
  },
  tipNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3B99C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipNumberText: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#ffffff',
  },
  tipText: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#1e293b',
    lineHeight: 20,
  },
});