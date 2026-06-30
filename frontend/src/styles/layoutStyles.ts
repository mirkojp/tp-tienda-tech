import { StyleSheet } from 'react-native';
import { theme } from './theme';

export const styles = StyleSheet.create({
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