import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import useWebSocket, { Alerta } from '../../services/WebSocketService';

const AlertasScreen = () => {
  const alerts: Alerta[] = useWebSocket(); // Asegurar el tipo correcto

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Alertas Recientes</Text>
      <FlatList
        data={alerts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.alert, { backgroundColor: getPriorityColor(item.confianza) }]}>
            <Text style={styles.alertTitle}>{item.tipo}</Text>
            <Text style={styles.alertDescription}>{item.descripcion}</Text>
            <Text style={styles.alertTime}>{item.fecha} {item.hora}</Text>
          </View>
        )}
      />
    </View>
  );
};

const getPriorityColor = (confianza: number) => {
  if (confianza >= 0.7) return '#ef4444'; // 🔴 Rojo
  if (confianza >= 0.5) return '#f97316'; // 🟠 Naranja
  if (confianza >= 0.4) return '#eab308'; // 🟡 Amarillo
  return '#16a34a'; // 🟢 Verde (No se muestra)
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  alert: { padding: 15, marginVertical: 5, borderRadius: 10 },
  alertTitle: { fontSize: 16, fontWeight: 'bold' },
  alertDescription: { fontSize: 14 },
  alertTime: { fontSize: 12, color: '#555' },
});

export default AlertasScreen;
