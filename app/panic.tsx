import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  Animated,
  Easing,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AlertTriangle } from "lucide-react-native";
import * as Location from "expo-location";
import { format } from "date-fns";
import { Stack } from "expo-router";

// URL del WebSocket
const WEBSOCKET_URL = "ws://192.168.0.220:8080";

const PanicoScreen = () => {
  const [isPressed, setIsPressed] = useState(false);
  const [progress, setProgress] = useState(0);
  // Definir el tipo correcto para location
  const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const pressTimer = useRef<NodeJS.Timeout | null>(null);
  const progressAnimation = useRef(new Animated.Value(0)).current;

  // Conectar WebSocket al montar el componente
  useEffect(() => {
    // Solicitar permisos de ubicación
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permiso denegado", "No podemos acceder a tu ubicación");
        return;
      }

      let locationData = await Location.getCurrentPositionAsync({});
      setLocation(locationData.coords);
    })();

    // Conectar al WebSocket
    try {
      ws.current = new WebSocket(WEBSOCKET_URL);

      if (ws.current) {
        ws.current.onopen = () => {
          console.log("Conectado al WebSocket");
          if (ws.current) {
            ws.current.send(JSON.stringify({ tipo: "identificacion", cliente: "app" }));
          }
        };

        ws.current.onerror = (error: Event) => {
          console.error("Error en WebSocket:", error);
          Alert.alert("Error de conexión", "No se pudo conectar al servidor de alertas");
        };
      }
    } catch (error) {
      console.error("Error al crear WebSocket:", error);
    }

    return () => {
      // Limpiar al desmontar
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  // Cuando se presiona el botón
  const handlePressIn = () => {
    setIsPressed(true);

    // Mostrar alerta sobre compartir ubicación
    Alert.alert(
      "Alerta de Pánico",
      "Mantén presionado durante 5 segundos para enviar una alerta. Se compartirá tu ubicación con los servicios de emergencia.",
      [{ text: "Entendido" }],
      { cancelable: false }
    );

    // Iniciar animación
    Animated.timing(progressAnimation, {
      toValue: 1,
      duration: 5000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        enviarAlertaPanico();
      }
    });

    // Iniciar temporizador
    pressTimer.current = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 0.02;
        if (newProgress >= 1) {
          if (pressTimer.current) {
            clearInterval(pressTimer.current);
          }
          return 1;
        }
        return newProgress;
      });
    }, 100);
  };

  // Cuando se suelta el botón
  const handlePressOut = () => {
    setIsPressed(false);
    setProgress(0);
    if (pressTimer.current) {
      clearInterval(pressTimer.current);
    }
    progressAnimation.stopAnimation();
    progressAnimation.setValue(0);
  };

  // Enviar alerta de pánico al servidor
  const enviarAlertaPanico = async () => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      Alert.alert("Error de conexión", "No hay conexión con el servidor");
      return;
    }

    if (!location) {
      // Intentar obtener ubicación una vez más
      try {
        let locationData = await Location.getCurrentPositionAsync({});
        setLocation(locationData.coords);
      } catch (error) {
        Alert.alert("Error de ubicación", "No se pudo obtener tu ubicación");
        return;
      }
    }

    // Formatear fecha y hora
    const now = new Date();
    const fecha = format(now, "yyyy-MM-dd");
    const hora = format(now, "HH:mm:ss");

    // Crear objeto de alerta
    const alerta = {
      tipo: "panico",
      descripcion: "Alerta de pánico enviada desde la aplicación",
      confianza: 0.95, // Alta confianza para alertas manuales
      fecha,
      hora,
      ubicacion: {
        latitude: location?.latitude || 0,
        longitude: location?.longitude || 0,
        direccion: "Ubicación enviada desde dispositivo móvil"
      }
    };

    // Enviar al servidor
    try {
      ws.current.send(JSON.stringify(alerta));
      Alert.alert(
        "Alerta enviada",
        "Tu alerta de pánico ha sido enviada. Los servicios de emergencia han sido notificados.",
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Error al enviar alerta:", error);
      Alert.alert("Error", "No se pudo enviar la alerta de pánico");
    }
  };

  // Calcular el tamaño del progreso
  const progressWidth = progressAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Botón de Emergencia',
          headerTintColor: '#FF0000',
        }}
      />
      {/* Encabezado */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.titleContainer}>
            <View style={styles.iconContainer}>
              <AlertTriangle size={24} color="#FF0000" />
            </View>
            <Text style={styles.title}>Botón de Pánico</Text>
          </View>
        </View>
      </View>

      {/* Contenido principal */}
      <View style={styles.content}>
        <Text style={styles.instructions}>
          Mantén presionado el botón durante 5 segundos para enviar una alerta
          de emergencia.
        </Text>

        <View style={styles.buttonContainer}>
          {/* Botón de pánico */}
          <TouchableOpacity
            style={[styles.panicButton, isPressed && styles.panicButtonPressed]}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={isPressed ? ["#cc0000", "#ff0000"] : ["#ff0000", "#cc0000"]}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>
                {isPressed ? "MANTENGA PRESIONADO" : "EMERGENCIA"}
              </Text>

              {/* Barra de progreso */}
              {isPressed && (
                <View style={styles.progressContainer}>
                  <Animated.View
                    style={[
                      styles.progressBar,
                      {
                        width: progressWidth,
                      },
                    ]}
                  />
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <Text style={styles.disclaimer}>
          Este botón debe ser usado SOLO en casos de emergencia real.
          Al presionarlo, se enviará tu ubicación a los servicios de emergencia.
        </Text>
      </View>
    </View>
  );
};

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
    padding: 24,
    justifyContent: "space-between",
    alignItems: "center",
  },
  instructions: {
    fontSize: 18,
    textAlign: "center",
    color: "#64748b",
    marginBottom: 30,
    marginTop: 30,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    maxHeight: 300,
  },
  panicButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    marginBottom: 40,
  },
  panicButtonPressed: {
    transform: [{ scale: 0.95 }],
  },
  buttonGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  progressContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    height: 10,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "white",
  },
  disclaimer: {
    fontSize: 14,
    textAlign: "center",
    color: "#94a3b8",
    marginBottom: 20,
    marginHorizontal: 20,
  },
});

export default PanicoScreen;