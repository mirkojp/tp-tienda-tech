// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { theme } from '../../src/styles/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        // 1. Habilitamos el header nativo de forma global para todas las pestañas
        headerShown: true,

        // 2. Estilizado uniforme para la cabecera superior en toda la app
        headerStyle: {
          backgroundColor: theme.colors.card,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
          elevation: 2, // Sombra suave en Android
          shadowColor: '#0f172a', // Sombra suave en iOS
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.04,
          shadowRadius: 2,
        },
        // Estilo del texto del título superior
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '800',
          color: theme.colors.text,
          letterSpacing: 0.5,
        },
        headerTitleAlign: 'center', // Centra el título estéticamente en Android e iOS

        // Color del ícono y texto cuando la pestaña está seleccionada
        tabBarActiveTintColor: theme.colors.primary,
        // Color del ícono y texto cuando la pestaña está inactiva
        tabBarInactiveTintColor: theme.colors.textSecondary,
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
    backgroundColor: theme.colors.card,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    height: 60,
    paddingBottom: 8,
    paddingTop: 8,
    elevation: 8, // Sombra en Android
    shadowColor: '#0f172a', // Sombra en iOS
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  icon: {
    fontSize: 20,
    opacity: 0.6, // Un poco más opaco si no está seleccionado
  },
  iconActive: {
    opacity: 1, // Brillo completo al seleccionarse
  },
});