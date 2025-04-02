import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
  Image,
  Modal,
  Pressable,
} from "react-native";
import {
  User,
  ChevronRight,
  Shield,
  Eye,
  Settings2,
  Clock,
  UserCircle,
  Plus,
  X,
} from "lucide-react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

interface ProfileSectionProps {
  icon: React.ReactNode;
  title: string;
  onPress?: () => void;
}

export default function Perfil() {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState<{
    title: string;
    content: string;
  }>({
    title: "",
    content: "",
  });

  const openModal = (type: "privacy" | "terms") => {
    if (type === "privacy") {
      setModalContent({
        title: "Política de Privacidad",
        content:
          "La privacidad de nuestros usuarios es primordial. En DracAI, nos comprometemos a proteger su información personal y datos de ubicación. Toda la información recopilada se utiliza exclusivamente para proporcionar servicios de seguridad y no se comparte con terceros sin su consentimiento explícito. Las alertas generadas por el sistema se transmiten de forma segura y se almacenan de manera anónima para fines estadísticos. Usted puede solicitar la eliminación de sus datos en cualquier momento a través de la aplicación. Continuamente mejoramos nuestras medidas de seguridad para garantizar la protección de sus datos.",
      });
    } else {
      setModalContent({
        title: "Términos de Uso",
        content:
          "Al utilizar DracAI, acepta que la aplicación está diseñada para aumentar la seguridad y no sustituye a los servicios oficiales de emergencia. El botón de pánico debe usarse solo en situaciones genuinas de emergencia. El uso indebido puede resultar en la suspensión del servicio. Las alertas generadas por el sistema son indicativas y deben interpretarse con precaución. No garantizamos la precisión absoluta del reconocimiento de amenazas. Al utilizar la aplicación, entiende que compartirá datos de ubicación necesarios para el funcionamiento del servicio. DracAI se reserva el derecho de modificar estas condiciones con notificación previa a los usuarios.",
      });
    }
    setModalVisible(true);
  };

  const ProfileSection: React.FC<ProfileSectionProps> = ({
    icon,
    title,
    onPress,
  }) => (
    <TouchableOpacity
      style={styles.profileSection}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.profileSectionContent}>
        <View style={styles.profileSectionIcon}>{icon}</View>
        <Text style={styles.profileSectionTitle}>{title}</Text>
      </View>
      <ChevronRight size={20} color="#64748b" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{modalContent.title}</Text>
              <Pressable
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <X size={24} color="#64748b" />
              </Pressable>
            </View>
            <ScrollView style={styles.modalContent}>
              <Text style={styles.modalText}>{modalContent.content}</Text>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.titleContainer}>
            <View style={styles.iconContainer}>
              <UserCircle size={24} color="#000000" />
            </View>
            <Text style={styles.title}>Mi Perfil</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Perfil Header */}
        <View style={styles.profileHeader}>
          <Image
            source={require('@/assets/images/logosfinales-02.png')}
            style={styles.profileImage}
          />
          <Text style={styles.profileName}>Usuario DracAI ✨</Text>
        </View>

        {/* Estadísticas del Usuario */}
        {/* <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Resumen de Actividad</Text>
          <Text style={styles.statsAmount}>23 <Text style={styles.statsUnit}>alertas recibidas</Text></Text>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '70%', backgroundColor: '#1A3D9E' }]} />
              <View style={[styles.progressFill, { width: '20%', backgroundColor: '#f97316' }]} />
              <View style={[styles.progressFill, { width: '10%', backgroundColor: '#93c5fd' }]} />
            </View>
          </View>
          
          <View style={styles.statsBreakdown}>
            <View style={styles.statItem}>
              <View style={[styles.statDot, { backgroundColor: '#1A3D9E' }]} />
              <Text style={styles.statLabel}>Seguridad</Text>
              <Text style={styles.statValue}>16</Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statDot, { backgroundColor: '#f97316' }]} />
              <Text style={styles.statLabel}>Alertas Altas</Text>
              <Text style={styles.statValue}>5</Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statDot, { backgroundColor: '#93c5fd' }]} />
              <Text style={styles.statLabel}>Otros</Text>
              <Text style={styles.statValue}>2</Text>
            </View>
          </View>
        </View> */}

        {/* Invitar Amigos */}
        <TouchableOpacity activeOpacity={0.8}>
          <LinearGradient
            colors={['#1A3D9E', '#3B99C7']}
            start={[0, 0]}
            end={[1, 1]}
            style={styles.inviteCard}
          >
            <View style={styles.inviteContent}>
              <Text style={styles.inviteTitle}>Invitar Amigos</Text>
              <Text style={styles.inviteDescription}>
                Invita a tus amigos a unirse para mejorar la seguridad de tu comunidad
              </Text>
            </View>
            <View style={styles.inviteIconContainer}>
              <Plus size={24} color="#fff" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Opciones de Perfil */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cuenta</Text>
          <ProfileSection
            icon={<User size={20} color="#3b82f6" />}
            title="Mi Cuenta"
          />
          <ProfileSection
            icon={<Clock size={20} color="#3b82f6" />}
            title="Historial de Alertas"
          />
          <ProfileSection
            icon={<Shield size={20} color="#3b82f6" />}
            title="Seguridad"
          />
          <ProfileSection
            icon={<Settings2 size={20} color="#3b82f6" />}
            title="Configuración General"
          />
        </View>

        {/* Legal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <ProfileSection
            icon={<Eye size={20} color="#3b82f6" />}
            title="Política de Privacidad"
            onPress={() => openModal("privacy")}
          />
          <ProfileSection
            icon={<Shield size={20} color="#3b82f6" />}
            title="Términos de Uso"
            onPress={() => openModal("terms")}
          />
        </View>
      </ScrollView>

      <BlurView intensity={80} tint="light" style={styles.versionPanel}>
        <View style={styles.versionContent}>
          <Text style={styles.versionText}>Versión 1.0.0</Text>
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    paddingTop: Platform.OS === "web" ? 24 : 60,
    paddingHorizontal: 22,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconContainer: {
    paddingTop: 6,
  },
  title: {
    paddingTop: 6,
    fontFamily: "Inter-Bold",
    fontSize: 24,
    color: "#1e293b",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
    resizeMode: 'contain',
    borderWidth: 3,
    borderColor: "#fff",
    ...Platform.select({
      web: {
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      },
      default: {
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
    }),
  },
  profileName: {
    fontSize: 24,
    fontWeight: "600",
    color: "#0f172a",
    fontFamily: "Inter-Bold",
  },
  statsCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    ...Platform.select({
      web: {
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
      },
      default: {
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
    }),
  },
  statsTitle: {
    fontSize: 16,
    color: "#64748b",
    marginBottom: 6,
    fontFamily: "Inter-SemiBold",
  },
  statsAmount: {
    fontSize: 32,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 12,
    fontFamily: "Inter-Bold",
  },
  statsUnit: {
    fontSize: 16,
    color: "#64748b",
    fontWeight: "400",
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#e2e8f0",
    borderRadius: 4,
    flexDirection: "row",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
  },
  statsBreakdown: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statLabel: {
    fontSize: 14,
    color: "#64748b",
    marginRight: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
  },
  inviteCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...Platform.select({
      web: {
        boxShadow: "0 4px 12px rgba(59, 153, 199, 0.2)",
      },
      default: {
        elevation: 4,
        shadowColor: "#1A3D9E",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
    }),
  },
  inviteContent: {
    flex: 1,
  },
  inviteTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
    fontFamily: "Inter-Bold",
  },
  inviteDescription: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    fontFamily: "Inter-Regular",
  },
  inviteIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 12,
    marginLeft: 4,
    fontWeight: "600",
    fontFamily: "Inter-SemiBold",
  },
  profileSection: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...Platform.select({
      web: {
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      },
      default: {
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
    }),
  },
  profileSectionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileSectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  profileSectionTitle: {
    fontSize: 16,
    color: "#1e293b",
    fontWeight: "600",
    fontFamily: "Inter-SemiBold",
  },
  versionPanel: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    borderRadius: 16,
    overflow: "hidden",
    ...Platform.select({
      web: {
        backdropFilter: "blur(8px)",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
      },
    }),
  },
  versionContent: {
    padding: 16,
    alignItems: "center",
  },
  versionText: {
    fontSize: 14,
    color: "#64748b",
    fontFamily: "Inter-Regular",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    fontFamily: "Inter-Bold",
  },
  closeButton: {
    padding: 5,
  },
  modalContent: {
    maxHeight: "90%",
  },
  modalText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#475569",
    fontFamily: "Inter-Regular",
  },
});