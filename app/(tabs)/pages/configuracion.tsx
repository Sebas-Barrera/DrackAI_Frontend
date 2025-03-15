import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Platform,
  ScrollView,
} from "react-native";
import {
  Settings,
  Bell,
  Globe,
  Moon,
  Shield,
  ChevronRight,
  Languages,
  CircleAlert as AlertCircle,
  Eye,
  Settings2,
} from "lucide-react-native";
import { BlurView } from "expo-blur";

interface SettingSectionProps {
  icon: React.ReactNode; // El ícono es un elemento de React
  title: string; // El título es un string
  description: string; // La descripción es un string
  children: React.ReactNode; // Los hijos son elementos de React
}

export default function configuracion() {
  const [notifications, setNotifications] = useState(true);
  const [priorityOnly, setPriorityOnly] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedLanguage] = useState({ id: "es", name: "Español" });

  const SettingSection: React.FC<SettingSectionProps> = ({
    icon,
    title,
    description,
    children,
  }) => (
    <View style={styles.settingSection}>
      <View style={styles.settingHeader}>
        <View style={styles.settingIcon}>{icon}</View>
        <View style={styles.settingTexts}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingDescription}>{description}</Text>
        </View>
      </View>
      <View style={styles.settingControl}>{children}</View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.titleContainer}>
            <View style={styles.iconContainer}>
              <Settings size={24} color="#1e293b" />
            </View>
            <Text style={styles.title}>Configuración</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notificaciones</Text>
          <SettingSection
            icon={<Bell size={20} color="#3b82f6" />}
            title="Notificaciones"
            description="Recibe alertas importantes"
          >
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: "#cbd5e1", true: "#93c5fd" }}
              thumbColor={notifications ? "#3b82f6" : "#f1f5f9"}
            />
          </SettingSection>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Apariencia</Text>
          <SettingSection
            icon={<Moon size={20} color="#3b82f6" />}
            title="Modo Oscuro"
            description="Cambiar apariencia de la app"
          >
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: "#cbd5e1", true: "#93c5fd" }}
              thumbColor={darkMode ? "#3b82f6" : "#f1f5f9"}
            />
          </SettingSection>

          <SettingSection
            icon={<Languages size={20} color="#3b82f6" />}
            title="Idioma"
            description={selectedLanguage.name}
          >
            <TouchableOpacity style={styles.languageSelector}>
              <Globe size={16} color="#64748b" />
              <ChevronRight size={16} color="#64748b" />
            </TouchableOpacity>
          </SettingSection>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacidad y Seguridad</Text>
          <TouchableOpacity style={{ flex: 1 }}>
            <SettingSection
              icon={<Eye size={20} color="#3b82f6" />}
              title="Política de Privacidad"
              description="Consulta nuestras políticas"
            >
              <ChevronRight size={20} color="#64748b" />
            </SettingSection>
          </TouchableOpacity>

          <TouchableOpacity style={{ flex: 1 }}>
            <SettingSection
              icon={<Shield size={20} color="#3b82f6" />}
              title="Términos de Uso"
              description="Consulta nuestros términos"
            >
              <ChevronRight size={20} color="#64748b" />
            </SettingSection>
          </TouchableOpacity>
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
    marginBottom: 16,
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
    paddingBottom: 130, // Espacio adicional en la parte inferior
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
  },
  settingSection: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
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
  settingHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  settingTexts: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: "#1e293b",
    marginBottom: 2,
    fontWeight: "600",
  },
  settingDescription: {
    fontSize: 14,
    color: "#64748b",
  },
  settingControl: {
    marginTop: 8,
    alignItems: "flex-end",
  },
  languageSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
  },
});
