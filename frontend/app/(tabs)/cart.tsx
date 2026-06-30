// app/(tabs)/cart.tsx
import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, Platform, Image } from 'react-native';
import { useCart } from '../../src/context/CartContext';
import { strapiApi } from '../../src/api/strapi';
import { useAuth } from '../../src/context/AuthContext'; // <-- 1. Importamos el contexto de autenticación
import { useRouter } from 'expo-router'; // <-- 2. Importamos el router para redirigir
import { STRAPI_URL } from '../../src/api/config';
import { theme } from '../../src/styles/theme';
import { styles } from '../../src/styles/cartStyles';

export default function CartScreen() {
    const { cart, updateQuantity, removeFromCart, clearCart, cartTotal } = useCart();
    const { user } = useAuth(); // <-- 3. Obtenemos el usuario actual
    const router = useRouter(); // <-- 4. Inicializamos el router
    const [sending, setSending] = useState(false);

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        console.log("Se ejecutó el botón");
        console.log(!user);
        
        if (!user) {
            console.log("Usuario no logueado. Lanzando advertencia...");

            //  SI ESTÁS EN EL NAVEGADOR WEB (Chrome, Edge, etc.)
            if (Platform.OS === 'web') {
                alert("Inicio de sesión requerido\n\nPara poder procesar tu orden de compra y registrar el pedido a tu nombre, necesitas estar logueado.");
                router.push('/profile'); // Lo mandamos directo
            }
            //  SI ESTÁS EN EL CELULAR (App de Expo Go en Android o iOS)
            else {
                Alert.alert(
                    'Inicio de sesión requerido',
                    'Para poder procesar tu orden de compra y registrar el pedido a tu nombre, necesitas estar logueado.',
                    [
                        { text: 'Seguir mirando', style: 'cancel' },
                        {
                            text: 'Ir a Loguearme 👤',
                            onPress: () => router.push('/profile')
                        }
                    ]
                );
            }

            return; // Frenamos la ejecución del checkout
        }

        try {
            setSending(true);

            // Estructuramos el body según lo que espera Strapi v5
            const orderData = {
                data: {
                    total: cartTotal,
                    state: 'completed',
                    publishedAt: new Date().toISOString(),
                    items: cart.map(item => ({
                        id: item.product.id,
                        documentId: item.product.documentId,
                        title: item.product.title,
                        price: item.product.discountPrice ?? item.product.price,
                        quantity: item.quantity
                    }))
                }
            };

            // Enviamos el POST a la colección orders
            // Como axios tiene el Bearer token global configurado, Strapi lo va a asociar
            await strapiApi.post('/orders', orderData);

            Alert.alert('¡Compra realizada con éxito!', 'Tu pedido ha sido registrado correctamente.');
            clearCart();

        } catch (error: any) {
            console.error('Error procesando el checkout en Strapi:', error);
            const errorMsg = error.response?.data?.error?.message || 'Hubo un problema al procesar tu orden. Intenta nuevamente.';
            Alert.alert('Error', errorMsg);
        } finally {
            setSending(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Mi Carrito</Text>
                {cart.length > 0 && !sending && (
                    <TouchableOpacity onPress={clearCart}>
                        <Text style={styles.clearText}>Vaciar todo</Text>
                    </TouchableOpacity>
                )}
            </View>

            <FlatList
                data={cart}
                keyExtractor={(item) => item.product.id.toString()}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => {
                    const finalPrice = item.product.discountPrice ?? item.product.price;
                    const imageUrl = item.product.images && item.product.images.length > 0
                        ? (item.product.images[0].url.startsWith('http')
                            ? item.product.images[0].url
                            : `${STRAPI_URL}${item.product.images[0].url}`)
                        : 'https://via.placeholder.com/150';

                    return (
                        <View style={styles.cartItem}>
                            <View style={styles.itemImageContainer}>
                                <Image source={{ uri: imageUrl }} style={styles.itemImage} resizeMode="contain" />
                            </View>

                            <View style={styles.itemInfo}>
                                <Text style={styles.itemTitle} numberOfLines={1}>{item.product.title}</Text>
                                <Text style={styles.itemPrice}>${finalPrice.toFixed(2)} c/u</Text>
                            </View>

                            <View style={styles.quantityContainer}>
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => updateQuantity(item.product.id, item.quantity - 1)}
                                    disabled={sending}
                                >
                                    <Text style={styles.actionText}>-</Text>
                                </TouchableOpacity>

                                <Text style={styles.quantityText}>{item.quantity}</Text>

                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
                                    disabled={sending}
                                >
                                    <Text style={styles.actionText}>+</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => removeFromCart(item.product.id)}
                                    disabled={sending}
                                >
                                    <Text style={styles.deleteText}>🗑️</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    );
                }}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>🛒</Text>
                        <Text style={styles.emptyText}>Tu carrito está vacío.</Text>
                        <Text style={styles.emptySubtext}>Agrega productos desde la pestaña de tienda.</Text>
                    </View>
                }
            />

            {cart.length > 0 && (
                <View style={styles.footer}>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total a pagar:</Text>
                        <Text style={styles.totalAmount}>${cartTotal.toFixed(2)}</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.checkoutButton, sending && styles.disabledButton]}
                        onPress={handleCheckout}
                        disabled={sending}
                    >
                        {sending ? (
                            <ActivityIndicator color={theme.colors.white} />
                        ) : (
                            <Text style={styles.checkoutButtonText}>Finalizar Compra</Text>
                        )}
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}
