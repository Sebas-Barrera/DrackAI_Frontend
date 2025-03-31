import React from 'react';
import { View, Text, StyleSheet, FlatList, Platform, Pressable } from 'react-native';
import useWebSocket, { Alerta } from '../../services/WebSocketService';
import { 
  OctagonAlert as AlertOctagon,
  TriangleAlert as AlertTriangle,
  CircleAlert as AlertCircle,
  Info,
  Bell
} from "lucide-react-native";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

const PriorityConfig = {
  high: {
    color: "#ef4444",
    icon: AlertOctagon,
    threshold: 0.7,
  },
  "medium-high": {
    color: "#f97316",
    icon: AlertTriangle,
    threshold: 0.5,
  },
  medium: {
    color: "#eab308",
    icon: AlertCircle,
    threshold: 0.4,
  },
  info: {
    color: "#16a34a",
    icon: Info,
    threshold: 0,
  },
};

function getPriorityFromConfidence(confidence: number) {
  if (confidence >= PriorityConfig.high.threshold) return "high";
  if (confidence >= PriorityConfig["medium-high"].threshold)
    return "medium-high";
  if (confidence >= PriorityConfig.medium.threshold) return "medium";
  return "info";
}

const AlertasScreen = () => {
  const alerts: Alerta[] = useWebSocket(); // Mantiene el uso del WebSocket

  const renderAlertCard = ({ item }: { item: Alerta }) => {
    const priority = getPriorityFromConfidence(item.confianza);
    const Icon = PriorityConfig[priority].icon;
    const color = PriorityConfig[priority].color;
    
    return (
      <View style={styles.card}>
        <Pressable
          onPress={() => console.log("Card pressed:", item.id)}
          style={({ pressed }) => [
            styles.cardInner,
            pressed && styles.cardPressed,
          ]}
        >
          <View style={[styles.priorityBar, { backgroundColor: color }]} />
          <View style={styles.cardContent}>
            <View style={styles.cardIconContainer}>
              <Icon size={24} color={color} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.title}>{item.tipo}</Text>
              <View style={styles.detailsRow}>
                <Text style={styles.confidence}>
                  Confianza: {(item.confianza * 100).toFixed(1)}%
                </Text>
                <Text style={styles.timestamp}>
                  {item.fecha && item.hora 
                    ? `${item.fecha} ${item.hora}`
                    : formatDistanceToNow(new Date(), {
                        addSuffix: true,
                        locale: es,
                      })}
                </Text>
              </View>
              {item.descripcion && (
                <Text style={styles.location}>{item.descripcion}</Text>
              )}
            </View>
          </View>
        </Pressable>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Encabezado adaptado del código de configuración */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.titleContainer}>
            <View style={styles.iconContainer}>
              <Bell size={24} color="#000000" />
            </View>
            <Text style={styles.headerTitle}>Alertas</Text>
          </View>
        </View>
      </View>

      {/* Contenido de alertas */}
      <FlatList
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        data={alerts}
        keyExtractor={(item) => item.id}
        renderItem={renderAlertCard}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Info size={48} color="#94a3b8" />
            <Text style={styles.emptyStateText}>No hay alertas</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  // Estilos del encabezado adaptados del código de configuración
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
  headerTitle: {
    paddingTop: 6,
    fontFamily: "Inter-Bold",
    fontSize: 24,
    color: "#1e293b",
  },
  // Estilos originales de las alertas
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 12,
  },
  cardRead: {
    opacity: 0.7,
  },
  cardInner: {
    flexDirection: "row",
  },
  cardPressed: {
    opacity: 0.7,
  },
  priorityBar: {
    width: 4,
    height: "100%",
  },
  cardContent: {
    flex: 1,
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  cardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  confidence: {
    fontSize: 14,
    color: "#64748b",
  },
  timestamp: {
    fontSize: 12,
    color: "#94a3b8",
  },
  location: {
    fontSize: 14,
    color: "#64748b",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 12,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#94a3b8",
    textAlign: "center",
  },
});

export default AlertasScreen;