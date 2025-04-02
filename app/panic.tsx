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
  Dimensions,
  StatusBar,
  Vibration,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AlertTriangle, AlertOctagon, ShieldAlert } from "lucide-react-native";
import * as Location from "expo-location";
import { format } from "date-fns";
import { Stack } from "expo-router";
import * as Haptics from "expo-haptics";

// URL del WebSocket
const WEBSOCKET_URL = "ws://192.168.0.220:8080";
const { width } = Dimensions.get("window");

const PanicoScreen = () => {
  const [isPressed, setIsPressed] = useState(false);
  const [progress, setProgress] = useState(0);
  // Definir el tipo correcto para location
  const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const pressTimer = useRef<NodeJS.Timeout | null>(null);
  const vibrationTimer = useRef<NodeJS.Timeout | null>(null);
  const progressAnimation = useRef(new Animated.Value(0)).current;

  // Animación para el pulso del botón cuando no está presionado
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Iniciar animación de pulso
  useEffect(() => {
    if (!isPressed) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Detener la animación de pulso cuando se presiona
      pulseAnim.setValue(1);
    }

    return () => {
      pulseAnim.stopAnimation();
    };
  }, [isPressed]);

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
      if (pressTimer.current) {
        clearInterval(pressTimer.current);
      }
      if (vibrationTimer.current) {
        clearInterval(vibrationTimer.current);
        Vibration.cancel(); // Asegurarse de cancelar cualquier vibración pendiente
      }
    };
  }, []);

  // Vibración progresiva
  const startProgressiveVibration = () => {
    if (Platform.OS === 'web') return; // No hay vibración en web

    // Iniciar con vibración suave
    let intensity = 0;
    const maxIntensity = 10;

    // Cancelar cualquier vibración previa
    if (vibrationTimer.current) {
      clearInterval(vibrationTimer.current);
    }
    Vibration.cancel();

    // Iniciar patrón de vibración progresivo
    vibrationTimer.current = setInterval(() => {
      if (intensity < maxIntensity) {
        intensity++;

        // Duración más corta con más intensidad (se siente más fuerte)
        const duration = 100 - (intensity * 5); // De 95ms a 50ms
        const pause = 200 - (intensity * 15); // De 185ms a 50ms

        // Crear un patrón que alterne vibración y pausa
        Vibration.vibrate([0, duration, pause]);

        // Si estamos cerca del final, hacer vibración continua
        if (intensity >= 8) {
          if (Platform.OS !== 'web') {
            try {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            } catch (error) {
              // Si no está disponible, continuamos sin el feedback
            }
          }
        }
      }
    }, 500); // Incrementar intensidad cada 500ms
  };

  // Cuando se presiona el botón
  const handlePressIn = () => {
    setIsPressed(true);

    // Proporcionar feedback háptico si está disponible
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      } catch (error) {
        // Si no está disponible, continuamos sin el feedback
      }
    }

    // Iniciar vibración progresiva
    startProgressiveVibration();

    // Mostrar alerta sobre compartir ubicación
    Alert.alert(
      "Alerta de Emergencia",
      "NO SUELTES EL BOTON.",
      [{ text: "Listo" }],
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

    // Detener vibración
    if (vibrationTimer.current) {
      clearInterval(vibrationTimer.current);
    }
    Vibration.cancel();

    progressAnimation.stopAnimation();
    progressAnimation.setValue(0);
  };

  // Enviar alerta de pánico al servidor
  const enviarAlertaPanico = async () => {
    // Detener vibración
    if (vibrationTimer.current) {
      clearInterval(vibrationTimer.current);
    }
    Vibration.cancel();

    // Vibración final de confirmación - patrón SOS
    const sosPattern = [0, 300, 100, 300, 100, 300, 100, 500, 100, 500, 100, 500, 100, 300, 100, 300, 100, 300];
    Vibration.vibrate(sosPattern);

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

      // Proporcionar feedback háptico de éxito
      if (Platform.OS !== 'web') {
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (error) {
          // Si no está disponible, continuamos sin el feedback
        }
      }

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
          headerStyle: { backgroundColor: '#1A3D9E' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
          headerBackTitle: 'Atrás', // Esto cambia el texto del botón de retroceso en iOS
          headerBackButtonMenuEnabled: true,
          // En Android podemos personalizar aún más con headerLeft si fuera necesario
        }}
      />

      <StatusBar barStyle="light-content" backgroundColor="#1A3D9E" />

      {/* Fondo con gradiente */}
      <LinearGradient
        colors={['#1A3D9E', '#2A6AB0', '#3B99C7'] as const}
        start={[0, 0]}
        end={[1, 1]}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <ShieldAlert size={32} color="#fff" />
          <Text style={styles.headerTitle}>Botón de Emergencia</Text>
        </View>
      </LinearGradient>

      {/* Contenido principal */}
      <View style={styles.content}>
        <View style={styles.instructionCard}>
          <AlertTriangle size={24} color="#f97316" />
          <Text style={styles.instructions}>
            Mantén presionado el botón durante <Text style={styles.highlightText}>5 segundos</Text> para enviar una alerta
            de emergencia a las autoridades.
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          {/* Animación de halo para el botón */}
          {!isPressed && (
            <Animated.View
              style={[
                styles.buttonHalo,
                { transform: [{ scale: pulseAnim }] }
              ]}
            />
          )}

          {/* Botón de pánico */}
          <TouchableOpacity
            style={[styles.panicButton, isPressed && styles.panicButtonPressed]}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={isPressed ? ["#cc0000", "#ff0000"] as const : ["#ff0000", "#cc0000"] as const}
              start={[0, 0]}
              end={[1, 1]}
              style={styles.buttonGradient}
            >
              <AlertOctagon color="white" size={isPressed ? 36 : 48} />
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

        <View style={styles.disclaimerCard}>
          <Text style={styles.disclaimerTitle}>IMPORTANTE</Text>
          <Text style={styles.disclaimer}>
            Este botón debe ser usado <Text style={styles.boldText}>SOLO</Text> en casos de emergencia real.
            Al presionarlo, se enviará tu ubicación actual a los servicios de emergencia.
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  headerGradient: {
    padding: 20,
    paddingTop: Platform.OS === "web" ? 20 : Platform.OS === "ios" ? 0 : 10,
    paddingBottom: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
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
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginTop: Platform.OS === "ios" ? 50 : 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    fontFamily: 'Inter-Bold',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between",
  },
  instructionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
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
  instructions: {
    flex: 1,
    fontSize: 16,
    color: '#334155',
    lineHeight: 22,
  },
  highlightText: {
    fontWeight: 'bold',
    color: '#f97316',
  },
  buttonContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 30,
  },
  buttonHalo: {
    position: 'absolute',
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    zIndex: -1,
  },
  panicButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: "hidden",
    ...Platform.select({
      web: {
        boxShadow: '0 8px 20px rgba(255, 0, 0, 0.3)',
      },
      default: {
        elevation: 8,
        shadowColor: '#ff0000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
    }),
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
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 12,
    fontFamily: 'Inter-Bold',
  },
  progressContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "white",
  },
  disclaimerCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#f97316',
    marginBottom: 30,
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
  disclaimerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f97316',
    marginBottom: 8,
    fontFamily: 'Inter-Bold',
  },
  disclaimer: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  boldText: {
    fontWeight: 'bold',
  },
});

export default PanicoScreen;