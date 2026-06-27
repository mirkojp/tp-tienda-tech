// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import React from 'react';
import { Text, StyleSheet } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        // 1. Habilitamos el header nativo de forma global para todas las pestañas
        headerShown: true,

        // 2. Estilizado uniforme para la cabecera superior en toda la app
        headerStyle: {
          backgroundColor: '#ffffff',
          borderBottomWidth: 1,
          borderBottomColor: '#e9ecef',
          elevation: 2, // Sombra suave en Android
          shadowColor: '#000', // Sombra suave en iOS
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
        },
        // Estilo del texto del título superior
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '800',
          color: '#1a1a1a',
          letterSpacing: 0.5,
        },
        headerTitleAlign: 'center', // Centra el título estéticamente en Android e iOS

        // Color del ícono y texto cuando la pestaña está seleccionada
        tabBarActiveTintColor: '#007bff',
        // Color del ícono y texto cuando la pestaña está inactiva
        tabBarInactiveTintColor: '#6c757d',
        // Estilos para la barra de pestañas en general
        tabBarStyle: styles.tabBar,
        // Estilos para las etiquetas de texto abajo del ícono
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      {/* 1. Pestaña Principal: Catálogo de Productos */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tienda Tech', // Título que se leerá arriba en el header de la Home
          tabBarLabel: 'Tienda', // Texto que se lee abajo en la pestaña
          tabBarIcon: ({ focused }) => (
            <Text style={[styles.icon, focused && styles.iconActive]}>📱</Text>
          ),
        }}
      />

      {/* 2. Pestaña del Carrito de Compras */}
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Mi Carrito', // Título arriba en el header del Carrito
          tabBarLabel: 'Carrito',
          tabBarIcon: ({ focused }) => (
            <Text style={[styles.icon, focused && styles.iconActive]}>🛒</Text>
          ),
        }}
      />

      {/* 3. Pestaña del Perfil de Usuario */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Mi Perfil', // Título arriba en el header del Perfil
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ focused }) => (
            <Text style={[styles.icon, focused && styles.iconActive]}>👤</Text>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    height: 60,
    paddingBottom: 8,
    paddingTop: 8,
    elevation: 8, // Sombra en Android
    shadowColor: '#000', // Sombra en iOS
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  icon: {
    fontSize: 20,
    opacity: 0.6, // Un poco más opaco si no está seleccionado
  },
  iconActive: {
    opacity: 1, // Brillo completo al seleccionarse
  },
});