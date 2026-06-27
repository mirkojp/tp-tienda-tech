// app/_layout.tsx
import { Stack } from 'expo-router';
import { CartProvider } from '../src/context/CartContext';
import { FavoritesProvider } from '../src/context/FavouritesContext'; // <-- 1. Asegurate de importarlo correctamente
import { AuthProvider } from '../src/context/AuthContext'; // (O como se llame tu proveedor de autenticación)

export default function RootLayout() {
  return (
    <AuthProvider>
      <FavoritesProvider> {/* <-- 2. Envolvé todo el flujo con el de Favoritos */}
        <CartProvider> {/* <-- El del carrito queda adentro */}

          <Stack>
            {/* Navegación por pestañas (Home, Carrito, Perfil) */}
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

            {/* 3. Agregamos la pantalla de Detalle para que maneje bien el Header al navegar */}
            <Stack.Screen
              name="product/[id]"
              options={{
                headerShown: true,
                title: 'Detalle de Producto',
                headerTitleAlign: 'center',
                headerBackTitle: 'Volver', // Texto para el botón de atrás en iOS
                headerStyle: { backgroundColor: '#ffffff' },
                headerTitleStyle: { fontWeight: '800', fontSize: 16 }
              }}
            />
          </Stack>

        </CartProvider>
      </FavoritesProvider>
    </AuthProvider>
  );
}