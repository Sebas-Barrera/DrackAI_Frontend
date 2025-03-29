import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
import MapView, { Marker, MapType } from "react-native-maps";
import * as Location from "expo-location";
import {
  MaterialIcons,
  FontAwesome,
  Ionicons,
  Entypo,
} from "@expo/vector-icons";

const alertData = [
  {
    fecha: "2025-03-27",
    hora: "09:37:31",
    ubicacion: { latitude: 20.9141, longitude: -100.7456 }, // Jardín Principal
    confianza: 0.807,
    tipo: "arma",
  },
  {
    fecha: "2025-03-27",
    hora: "09:37:32",
    ubicacion: { latitude: 20.918, longitude: -100.7439 }, // Mercado de Artesanías
    confianza: 0.47,
    tipo: "arma",
  },
  {
    fecha: "2025-03-27",
    hora: "09:37:33",
    ubicacion: { latitude: 20.9075, longitude: -100.7412 }, // Parque Benito Juárez
    confianza: 0.65,
    tipo: "arma",
  },
  {
    fecha: "2025-03-27",
    hora: "09:37:34",
    ubicacion: { latitude: 20.9213, longitude: -100.7387 }, // Mirador (Callejón del Chorro)
    confianza: 0.72,
    tipo: "arma",
  },
  {
    fecha: "2025-03-27",
    hora: "09:37:35",
    ubicacion: { latitude: 20.9118, longitude: -100.7524 }, // Templo de San Francisco
    confianza: 0.55,
    tipo: "arma",
  },
];

const getColorFromConfidence = (confianza: number): string => {
  if (confianza >= 0.7) return "red";
  if (confianza >= 0.5) return "orange";
  if (confianza >= 0.4) return "yellow";
  return "green";
};

const AlertMap = () => {
  const [location, setLocation] =
    useState<Location.LocationObjectCoords | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mapType, setMapType] = useState<MapType>("standard");
  const [showTraffic, setShowTraffic] = useState(false);
  const [showsBuildings, setShowsBuildings] = useState(false);
  const [isMapMoved, setIsMapMoved] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [forceUpdateMarker, setForceUpdateMarker] = useState(0);

  const mapRef = useRef<MapView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const controlsAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permiso de ubicación denegado");
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setLocation(location.coords);
    })();
  }, []);

  const goToCurrentLocation = async () => {
    let location = await Location.getCurrentPositionAsync({});
    setLocation(location.coords);
    setForceUpdateMarker((prev) => prev + 1); // <-- Fuerza la actualización
    mapRef.current?.animateToRegion({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    });
    setIsMapMoved(false);
  };

  const toggleMapType = () => {
    const types: MapType[] = ["standard", "satellite", "hybrid"];
    const currentIndex = types.indexOf(mapType);
    const nextIndex = (currentIndex + 1) % types.length;
    setMapType(types[nextIndex]);
  };

  const toggleTraffic = () => {
    setShowTraffic(!showTraffic);
  };

  const toggleBuildings = () => {
    setShowsBuildings(!showsBuildings);
  };

  const handleMapDrag = () => {
    if (!isMapMoved) {
      setIsMapMoved(true);
      fadeIn();
    }
  };

  const fadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  };

  const fadeOut = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  };

  const toggleControls = () => {
    if (controlsVisible) {
      Animated.timing(controlsAnim, {
        toValue: 0,
        duration: 200,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start(() => setControlsVisible(false));
    } else {
      setControlsVisible(true);
      Animated.timing(controlsAnim, {
        toValue: 1,
        duration: 200,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleReturnToLocation = () => {
    goToCurrentLocation();
    fadeOut();
    setTimeout(() => setIsMapMoved(false), 300);
  };

  return (
    <View style={styles.container}>
      {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
      {location ? (
        <>
          <MapView
            ref={mapRef}
            style={styles.map}
            mapType={mapType}
            showsTraffic={showTraffic}
            showsBuildings={showsBuildings}
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}
            onPanDrag={handleMapDrag}
          >
            <Marker
              key={`user-location-${forceUpdateMarker}`} // <-- Key única que cambia
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title="Tu ubicación"
              description="Ubicación actual del dispositivo"
              pinColor="blue"
            />
            {alertData.map((alert, index) => (
              <Marker
                key={index}
                coordinate={alert.ubicacion}
                title={`Alerta: ${alert.tipo}`}
                description={`Confianza: ${alert.confianza}`}
                pinColor={getColorFromConfidence(alert.confianza)}
              />
            ))}
          </MapView>

          {/* Botón de menú principal */}
          <TouchableOpacity
            style={[styles.floatingButton, styles.menuButton]}
            onPress={toggleControls}
          >
            <Entypo
              name={controlsVisible ? "cross" : "menu"}
              size={24}
              color="white"
            />
          </TouchableOpacity>

          {/* Controles principales (derecha) */}
          {controlsVisible && (
            <Animated.View
              style={[styles.mainControls, { opacity: controlsAnim }]}
            >
              <TouchableOpacity
                style={[styles.controlButton, styles.controlButtonLarge]}
                onPress={goToCurrentLocation}
              >
                <MaterialIcons name="my-location" size={24} color="white" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.controlButton, styles.controlButtonLarge]}
                onPress={toggleMapType}
              >
                <MaterialIcons
                  name={mapType === "satellite" ? "map" : "satellite"}
                  size={24}
                  color="white"
                />
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Controles secundarios (inferior izquierda) */}
          {controlsVisible && (
            <Animated.View
              style={[styles.secondaryControls, { opacity: controlsAnim }]}
            >
              <TouchableOpacity
                style={[styles.smallButton, showTraffic && styles.activeButton]}
                onPress={toggleTraffic}
              >
                <FontAwesome
                  name="car"
                  size={18}
                  color={showTraffic ? "white" : "#007AFF"}
                />
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Botón de regreso a ubicación (solo aparece al mover) */}
          {isMapMoved && (
            <Animated.View style={[styles.returnButton, { opacity: fadeAnim }]}>
              <TouchableOpacity
                style={styles.returnButtonContent}
                onPress={handleReturnToLocation}
              >
                <Ionicons name="locate" size={20} color="white" />
              </TouchableOpacity>
            </Animated.View>
          )}
        </>
      ) : (
        <Text style={styles.loadingText}>Cargando ubicación...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  map: {
    flex: 1,
    width: "100%",
  },
  errorText: {
    color: "red",
    fontSize: 16,
    fontWeight: "bold",
    margin: 10,
  },
  loadingText: {
    fontSize: 16,
    color: "gray",
  },
  floatingButton: {
    position: "absolute",
    backgroundColor: "#007AFF",
    borderRadius: 30,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  menuButton: {
    top: 60,
    right: 20,
  },
  mainControls: {
    position: "absolute",
    top: 120,
    right: 20,
    alignItems: "center",
  },
  controlButton: {
    backgroundColor: "#007AFF",
    borderRadius: 25,
    marginBottom: 15,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  controlButtonLarge: {
    width: 50,
    height: 50,
  },
  secondaryControls: {
    position: "absolute",
    bottom: 30,
    left: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    padding: 10,
    flexDirection: "column",
    elevation: 3,
    paddingBottom: 55,
  },
  smallButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 5,
    borderWidth: 1,
    borderColor: "#007AFF",
    backgroundColor: "white",
  },
  activeButton: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  returnButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "#007AFF",
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  returnButtonContent: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default AlertMap;
