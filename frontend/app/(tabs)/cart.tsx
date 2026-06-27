// app/(tabs)/cart.tsx
import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, Platform, Image } from 'react-native';
import { useCart } from '../../src/context/CartContext';
import { strapiApi } from '../../src/api/strapi';
import { useAuth } from '../../src/context/AuthContext'; // <-- 1. Importamos el contexto de autenticación
import { useRouter } from 'expo-router'; // <-- 2. Importamos el router para redirigir
import { STRAPI_URL } from '../../src/api/config';
import { theme } from '../../src/styles/theme';

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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        borderBottomWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.card,
        ...theme.shadows.sm,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: theme.colors.text,
    },
    clearText: {
        color: theme.colors.danger,
        fontWeight: '700',
        fontSize: 14,
    },
    listContent: {
        paddingVertical: theme.spacing.md,
    },
    cartItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.card,
        padding: theme.spacing.md,
        marginVertical: theme.spacing.xs,
        marginHorizontal: theme.spacing.lg,
        borderRadius: theme.borderRadius.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        ...theme.shadows.sm,
    },
    itemImageContainer: {
        backgroundColor: '#fafafa',
        padding: theme.spacing.xs,
        borderRadius: theme.borderRadius.md,
    },
    itemImage: {
        width: 50,
        height: 50,
        borderRadius: theme.borderRadius.sm,
    },
    itemInfo: {
        flex: 1,
        marginLeft: theme.spacing.md,
        marginRight: theme.spacing.sm,
        justifyContent: 'center',
    },
    itemTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.text,
    },
    itemPrice: {
        fontSize: 13,
        color: theme.colors.textSecondary,
        marginTop: 2,
        fontWeight: '500',
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionButton: {
        backgroundColor: theme.colors.background,
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    actionText: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.text,
        lineHeight: 18,
    },
    quantityText: {
        marginHorizontal: theme.spacing.sm,
        fontSize: 14,
        fontWeight: '700',
        color: theme.colors.text,
    },
    deleteButton: {
        marginLeft: theme.spacing.md,
        padding: theme.spacing.xs,
    },
    deleteText: {
        fontSize: 16,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 80,
        paddingHorizontal: theme.spacing.xxl,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: theme.spacing.md,
        opacity: 0.5,
    },
    emptyText: {
        color: theme.colors.text,
        fontSize: 16,
        fontWeight: '700',
    },
    emptySubtext: {
        color: theme.colors.textSecondary,
        fontSize: 13,
        marginTop: theme.spacing.xs,
        textAlign: 'center',
    },
    footer: {
        backgroundColor: theme.colors.card,
        padding: theme.spacing.lg,
        borderTopWidth: 1,
        borderColor: theme.colors.border,
        ...theme.shadows.lg,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.md,
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.textSecondary,
    },
    totalAmount: {
        fontSize: 22,
        fontWeight: '800',
        color: theme.colors.primary,
    },
    checkoutButton: {
        backgroundColor: theme.colors.success,
        paddingVertical: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 48,
        ...theme.shadows.sm,
    },
    disabledButton: {
        backgroundColor: theme.colors.successLight,
    },
    checkoutButtonText: {
        color: theme.colors.white,
        fontSize: 16,
        fontWeight: '700',
    }
});