// app/(tabs)/profile.tsx
import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    Image,
    RefreshControl
} from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { useFavorites } from '../../src/context/FavouritesContext';
import { STRAPI_URL } from '../../src/api/config';
import { useRouter, useFocusEffect } from 'expo-router';
import { strapiApi } from '../../src/api/strapi';

export default function ProfileScreen() {
    const { user, login, register, logout, loading } = useAuth();
    const { favRelations, toggleFavorite, loadingFavs } = useFavorites();
    const router = useRouter();

    // Modo: 'login' o 'register'
    const [mode, setMode] = useState<'login' | 'register'>('login');

    // Estados para las órdenes
    const [orders, setOrders] = useState<any[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const fetchOrders = async () => {
        if (!user) return;
        setLoadingOrders(true);
        try {
            const response = await strapiApi.get('/orders?sort=createdAt:desc');
            setOrders(response.data.data || []);
        } catch (error) {
            console.error('[Profile] Error al obtener órdenes:', error);
        } finally {
            setLoadingOrders(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            if (user) {
                await fetchOrders();
            }
        } catch (error) {
            console.error('[Profile] Error al refrescar perfil:', error);
        } finally {
            setRefreshing(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            if (user) {
                fetchOrders();
            } else {
                setOrders([]);
            }
        }, [user])
    );

    // Estados locales para los campos
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        // Validaciones básicas antes de enviar
        if (mode === 'register' && !username.trim()) {
            Alert.alert('Campo incompleto', 'Por favor ingresá un nombre de usuario.');
            return;
        }
        if (!email.trim() || !password.trim()) {
            Alert.alert('Campos incompletos', 'Por favor ingresá tu email y contraseña.');
            return;
        }

        setIsSubmitting(true);
        try {
            if (mode === 'login') {
                await login(email.trim(), password);
            } else {
                await register(username.trim(), email.trim(), password);
                Alert.alert('¡Cuenta creada!', 'Tu usuario se ha registrado correctamente.');
            }
            // Limpiar campos tras el éxito
            setUsername('');
            setEmail('');
            setPassword('');
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Ocurrió un problema.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    // --- VISTA 1: USUARIO AUTENTICADO ---
    if (user) {
        return (
            <SafeAreaView style={styles.container}>
                <ScrollView 
                    contentContainerStyle={styles.scrollContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                >
                    <View style={styles.profileBox}>
                        <Text style={styles.avatar}>👤</Text>
                        <Text style={styles.welcomeText}>¡Hola, bienvenido de nuevo!</Text>
                        <Text style={styles.usernameText}>{user.username}</Text>
                        <Text style={styles.emailText}>{user.email}</Text>

                        <View style={styles.divider} />

                        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
                            <Text style={styles.logoutBtnText}>Cerrar Sesión</Text>
                        </TouchableOpacity>
                    </View>

                    {/* SECCIÓN DE ÓRDENES */}
                    <View style={styles.ordersSection}>
                        <Text style={styles.sectionHeader}>📦 Mis Órdenes</Text>

                        {loadingOrders && !refreshing ? (
                            <ActivityIndicator size="small" color="#007AFF" style={styles.orderLoader} />
                        ) : !orders || orders.length === 0 ? (
                            <View style={styles.emptyOrdersBox}>
                                <Text style={styles.emptyOrdersText}>Aún no tienes órdenes de compra.</Text>
                                <Text style={styles.emptyOrdersSubtext}>Realiza tu primera compra desde el carrito.</Text>
                            </View>
                        ) : (
                            orders.map((order) => {
                                const status = getStatusBadge(order.state);
                                const dateFormatted = formatDate(order.createdAt);
                                const itemsList = Array.isArray(order.items) ? order.items : [];

                                return (
                                    <View key={order.id} style={styles.orderCard}>
                                        <View style={styles.orderHeader}>
                                            <View>
                                                <Text style={styles.orderIdText}>
                                                    Orden #{order.documentId ? order.documentId.slice(-6).toUpperCase() : order.id}
                                                </Text>
                                                <Text style={styles.orderDateText}>{dateFormatted}</Text>
                                            </View>
                                            <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                                                <Text style={[styles.statusBadgeText, { color: status.color }]}>
                                                    {status.label}
                                                </Text>
                                            </View>
                                        </View>

                                        <View style={styles.orderItemsList}>
                                            {itemsList.map((item: any, idx: number) => (
                                                <Text key={idx} style={styles.orderItemText} numberOfLines={1}>
                                                    • {item.quantity}x {item.title} (${((item.price ?? 0) * item.quantity).toFixed(2)})
                                                </Text>
                                            ))}
                                        </View>

                                        <View style={styles.orderFooter}>
                                            <Text style={styles.orderTotalLabel}>Total:</Text>
                                            <Text style={styles.orderTotalValue}>
                                                ${(order.total ?? 0).toFixed(2)}
                                            </Text>
                                        </View>
                                    </View>
                                );
                            })
                        )}
                    </View>

                    {/* SECCIÓN DE FAVORITOS */}
                    <View style={styles.favoritesSection}>
                        <Text style={styles.sectionHeader}>❤️ Mis Favoritos</Text>

                        {loadingFavs ? (
                            <ActivityIndicator size="small" color="#007AFF" style={styles.favLoader} />
                        ) : !favRelations || favRelations.length === 0 ? (
                            <View style={styles.emptyFavsBox}>
                                <Text style={styles.emptyFavsText}>Aún no tienes productos favoritos.</Text>
                                <Text style={styles.emptyFavsSubtext}>Explora la tienda y marca con un corazón los que te gusten.</Text>
                            </View>
                        ) : (
                            favRelations.map((fav) => {
                                const product = fav.product;
                                if (!product) return null;

                                // Obtener URL de imagen o usar placeholder
                                const imageUrl = product.images && product.images.length > 0
                                    ? product.images[0].url.startsWith('http')
                                        ? product.images[0].url
                                        : `${STRAPI_URL}${product.images[0].url}`
                                    : 'https://via.placeholder.com/150';

                                const hasDiscount = product.discountPrice !== undefined &&
                                    product.discountPrice !== null &&
                                    product.discountPrice < product.price;

                                return (
                                    <TouchableOpacity
                                        key={fav.id}
                                        style={styles.favCard}
                                        activeOpacity={0.8}
                                        onPress={() => {
                                            router.push({
                                                pathname: '/product/[id]',
                                                params: { id: product.documentId }
                                            });
                                        }}
                                    >
                                        <Image source={{ uri: imageUrl }} style={styles.favImage} resizeMode="contain" />

                                        <View style={styles.favInfo}>
                                            {product.brand && (
                                                <Text style={styles.favBrand}>
                                                    {typeof product.brand === 'string' ? product.brand : (product.brand as any).name}
                                                </Text>
                                            )}
                                            <Text style={styles.favTitle} numberOfLines={1}>
                                                {product.title}
                                            </Text>

                                            <View style={styles.favPriceRow}>
                                                {hasDiscount ? (
                                                    <>
                                                        <Text style={styles.favDiscountPrice}>${product.discountPrice?.toFixed(2)}</Text>
                                                        <Text style={styles.favOriginalPrice}>${product.price.toFixed(2)}</Text>
                                                    </>
                                                ) : (
                                                    <Text style={styles.favPrice}>${product.price.toFixed(2)}</Text>
                                                )}
                                            </View>
                                        </View>

                                        <TouchableOpacity
                                            style={styles.deleteFavBtn}
                                            onPress={() => toggleFavorite(product)}
                                        >
                                            <Text style={styles.deleteFavText}>❤️</Text>
                                        </TouchableOpacity>
                                    </TouchableOpacity>
                                );
                            })
                        )}
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }

    // --- VISTA 2: FORMULARIO DINÁMICO (LOGIN / REGISTRO) ---
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.loginForm}>
                <Text style={styles.title}>
                    {mode === 'login' ? 'Ingresar a tu Cuenta' : 'Crear una Cuenta'}
                </Text>
                <Text style={styles.subtitle}>
                    {mode === 'login'
                        ? 'Iniciá sesión para gestionar tus compras y favoritos.'
                        : 'Completá tus datos para empezar a comprar.'}
                </Text>

                {/* Campo exclusivo para Registro */}
                {mode === 'register' && (
                    <>
                        <Text style={styles.label}>Nombre de Usuario</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ej: juan_perez"
                            placeholderTextColor="#999"
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                        />
                    </>
                )}

                <Text style={styles.label}>Correo Electrónico</Text>
                <TextInput
                    style={styles.input}
                    placeholder="ejemplo@correo.com"
                    placeholderTextColor="#999"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                <Text style={styles.label}>Contraseña</Text>
                <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor="#999"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoCapitalize="none"
                />

                <TouchableOpacity
                    style={[styles.loginBtn, isSubmitting && styles.loginBtnDisabled]}
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.loginBtnText}>
                            {mode === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
                        </Text>
                    )}
                </TouchableOpacity>

                {/* Enlace para conmutar entre pantallas */}
                <TouchableOpacity
                    style={styles.switchModeContainer}
                    onPress={() => setMode(mode === 'login' ? 'register' : 'login')}
                >
                    <Text style={styles.switchModeText}>
                        {mode === 'login'
                            ? '¿No tenés cuenta? Creá una acá'
                            : '¿Ya tenés una cuenta? Iniciá sesión'}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const formatDate = (dateString: string) => {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-AR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        return dateString;
    }
};

const getStatusBadge = (state: string) => {
    switch (state) {
        case 'completed':
            return { label: 'Completado', bg: '#e8f5e9', color: '#2e7d32' };
        case 'pending':
            return { label: 'Pendiente', bg: '#fff8e1', color: '#f57f17' };
        case 'cancelled':
            return { label: 'Cancelado', bg: '#ffebee', color: '#c62828' };
        default:
            return { label: state, bg: '#f1f3f5', color: '#495057' };
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
    },
    loginForm: {
        padding: 25,
        backgroundColor: '#ffffff',
        margin: 20,
        borderRadius: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
        color: '#212529',
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 14,
        color: '#6c757d',
        marginBottom: 25,
        lineHeight: 20,
    },
    label: {
        fontSize: 13,
        fontWeight: '700',
        color: '#495057',
        marginBottom: 6,
        textTransform: 'uppercase',
    },
    input: {
        height: 46,
        backgroundColor: '#f1f3f5',
        borderRadius: 8,
        paddingHorizontal: 12,
        fontSize: 15,
        color: '#212529',
        borderWidth: 1,
        borderColor: '#e9ecef',
        marginBottom: 18,
    },
    loginBtn: {
        backgroundColor: '#007AFF',
        height: 48,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    loginBtnDisabled: {
        backgroundColor: '#b3d7ff',
    },
    loginBtnText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '700',
    },
    switchModeContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
    switchModeText: {
        color: '#007AFF',
        fontSize: 14,
        fontWeight: '600',
    },
    /* ESTILOS PERFIL ACTIVO */
    profileBox: {
        backgroundColor: '#ffffff',
        margin: 20,
        padding: 30,
        borderRadius: 12,
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
    },
    avatar: {
        fontSize: 60,
        marginBottom: 15,
    },
    welcomeText: {
        fontSize: 14,
        color: '#6c757d',
        fontWeight: '500',
    },
    usernameText: {
        fontSize: 24,
        fontWeight: '800',
        color: '#212529',
        marginTop: 4,
    },
    emailText: {
        fontSize: 14,
        color: '#495057',
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: '#e9ecef',
        width: '100%',
        marginVertical: 25,
    },
    logoutBtn: {
        borderColor: '#dc3545',
        borderWidth: 1.5,
        width: '100%',
        height: 46,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoutBtnText: {
        color: '#dc3545',
        fontSize: 15,
        fontWeight: '700',
    },
    scrollContent: {
        paddingBottom: 30,
    },
    favoritesSection: {
        marginHorizontal: 20,
        marginBottom: 20,
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: '800',
        color: '#212529',
        marginBottom: 12,
    },
    favLoader: {
        marginVertical: 20,
    },
    emptyFavsBox: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: '#dee2e6',
    },
    emptyFavsText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6c757d',
    },
    emptyFavsSubtext: {
        fontSize: 12,
        color: '#adb5bd',
        textAlign: 'center',
        marginTop: 4,
    },
    favCard: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 2,
    },
    favImage: {
        width: 60,
        height: 60,
        borderRadius: 6,
    },
    favInfo: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
    },
    favBrand: {
        fontSize: 10,
        color: '#888',
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    favTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginTop: 2,
    },
    favPriceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginTop: 4,
    },
    favPrice: {
        fontSize: 13,
        fontWeight: '700',
        color: '#212529',
    },
    favDiscountPrice: {
        fontSize: 13,
        fontWeight: '700',
        color: '#e74c3c',
        marginRight: 6,
    },
    favOriginalPrice: {
        fontSize: 11,
        color: '#999',
        textDecorationLine: 'line-through',
    },
    deleteFavBtn: {
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteFavText: {
        fontSize: 20,
    },
    /* ESTILOS PARA ÓRDENES */
    ordersSection: {
        marginHorizontal: 20,
        marginBottom: 20,
    },
    orderLoader: {
        marginVertical: 20,
    },
    emptyOrdersBox: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: '#dee2e6',
    },
    emptyOrdersText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6c757d',
    },
    emptyOrdersSubtext: {
        fontSize: 12,
        color: '#adb5bd',
        textAlign: 'center',
        marginTop: 4,
    },
    orderCard: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 2,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottomWidth: 1,
        borderColor: '#f1f3f5',
        paddingBottom: 8,
        marginBottom: 8,
    },
    orderIdText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#212529',
    },
    orderDateText: {
        fontSize: 11,
        color: '#868e96',
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    orderItemsList: {
        marginBottom: 10,
    },
    orderItemText: {
        fontSize: 13,
        color: '#495057',
        lineHeight: 18,
    },
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderColor: '#f1f3f5',
        paddingTop: 8,
    },
    orderTotalLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6c757d',
    },
    orderTotalValue: {
        fontSize: 16,
        fontWeight: '800',
        color: '#007AFF',
    },
});