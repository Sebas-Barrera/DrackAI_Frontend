import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Home, 
  Map, 
  Bell, 
  Settings 
} from 'lucide-react-native';

import { HapticTab } from '@/components/HapticTab';
import { useColorScheme } from '@/hooks/useColorScheme';

// Componente personalizado para el fondo de la tab bar
const TabBarBackground = () => {
  return Platform.OS === 'ios' ? (
    <BlurView
      intensity={80}
      tint="light"
      style={StyleSheet.absoluteFill}
    />
  ) : (
    <View style={[
      StyleSheet.absoluteFill, 
      { 
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 8
      }
    ]} />
  );
};

// Definir tipos para los parámetros del CustomTabBarButton
interface CustomTabBarButtonProps {
  focused: boolean;
  icon: React.ReactNode;
  color: readonly string[];
}

// Componente personalizado para el botón de la tab bar
const CustomTabBarButton = ({ focused, icon, color }: CustomTabBarButtonProps) => {
  return (
    <View style={styles.tabButtonContainer}>
      {focused ? (
        <LinearGradient
          colors={color as [string, string]}
          start={[0, 0]}
          end={[1, 1]}
          style={styles.tabButtonBackground}
        >
          {icon}
        </LinearGradient>
      ) : (
        <View style={[styles.tabButtonBackground, { backgroundColor: 'transparent' }]}>
          {icon}
        </View>
      )}
    </View>
  );
};

export default function TabLayout() {
  const colorScheme = useColorScheme();
  
  // Colores para cada tab cuando está activo - usamos as const para que TypeScript los trate como arrays literales readonly
  const tabColors = {
    home: ['#1A3D9E', '#3B99C7'] as readonly string[],
    map: ['#2A6AB0', '#3B99C7'] as readonly string[],
    alerts: ['#f97316', '#f59e0b'] as readonly string[],
    settings: ['#36b37e', '#57d9a3'] as readonly string[]
  };
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: 'Inter-SemiBold',
          marginBottom: 4
        },
        tabBarStyle: {
          position: 'absolute',
          height: 80,
          borderTopWidth: 0,
          backgroundColor: 'transparent',
          ...Platform.select({
            ios: {},
            android: {
              height: 70,
              paddingTop: 8
            },
            default: {
              height: 60
            }
          }),
        },
        tabBarItemStyle: {
          paddingVertical: 6,
          flexDirection: 'column',
          alignItems: 'center',
          height: Platform.OS === 'android' ? 60 : 65,
        },
        tabBarIconStyle: {
          width: 40,
          height: 40,
        },
        tabBarActiveTintColor: '#1A3D9E',
        tabBarInactiveTintColor: '#94a3b8',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ focused, color }) => (
            <CustomTabBarButton 
              focused={focused}
              icon={<Home size={22} color={focused ? "white" : "#94a3b8"} />}
              color={tabColors.home}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="pages/mapa"
        options={{
          title: 'Mapa',
          tabBarIcon: ({ focused, color }) => (
            <CustomTabBarButton 
              focused={focused}
              icon={<Map size={22} color={focused ? "white" : "#94a3b8"} />}
              color={tabColors.map}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="pages/alertas"
        options={{
          title: 'Alertas',
          tabBarIcon: ({ focused, color }) => (
            <CustomTabBarButton 
              focused={focused}
              icon={<Bell size={22} color={focused ? "white" : "#94a3b8"} />}
              color={tabColors.alerts}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="pages/configuracion"
        options={{
          title: 'Ajustes',
          tabBarIcon: ({ focused, color }) => (
            <CustomTabBarButton 
              focused={focused}
              icon={<Settings size={22} color={focused ? "white" : "#94a3b8"} />}
              color={tabColors.settings}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabButtonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -2, // Ajusta la posición del icono hacia arriba
  },
  tabButtonBackground: {
    width: 38, // Reducido de 46 a 38
    height: 38, // Reducido de 46 a 38
    borderRadius: 19, // La mitad del nuevo tamaño
    justifyContent: 'center',
    alignItems: 'center',
  }
});