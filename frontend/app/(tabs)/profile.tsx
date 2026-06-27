// app/(tabs)/profile.tsx
import React, { useState } from 'react';
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
import { theme } from '../../src/styles/theme';

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
                <ActivityIndicator size="large" color={theme.colors.primary} />
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
                            <ActivityIndicator size="small" color={theme.colors.primary} style={styles.orderLoader} />
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
                            <ActivityIndicator size="small" color={theme.colors.primary} style={styles.favLoader} />
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
                                        <View style={styles.favImageContainer}>
                                            <Image source={{ uri: imageUrl }} style={styles.favImage} resizeMode="contain" />
                                        </View>

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
            <ScrollView contentContainerStyle={styles.centerContainerScroll}>
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
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Nombre de Usuario</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ej: juan_perez"
                                placeholderTextColor={theme.colors.textMuted}
                                value={username}
                                onChangeText={setUsername}
                                autoCapitalize="none"
                            />
                        </View>
                    )}

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Correo Electrónico</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="ejemplo@correo.com"
                            placeholderTextColor={theme.colors.textMuted}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Contraseña</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="••••••••"
                            placeholderTextColor={theme.colors.textMuted}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            autoCapitalize="none"
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.loginBtn, isSubmitting && styles.loginBtnDisabled]}
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color={theme.colors.white} />
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
            </ScrollView>
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
            return { label: 'Completado', bg: theme.colors.successLight, color: theme.colors.successDark };
        case 'pending':
            return { label: 'Pendiente', bg: theme.colors.warningLight, color: theme.colors.warningDark };
        case 'cancelled':
            return { label: 'Cancelado', bg: theme.colors.dangerLight, color: theme.colors.dangerDark };
        default:
            return { label: state, bg: theme.colors.background, color: theme.colors.textSecondary };
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
    },
    centerContainerScroll: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingVertical: theme.spacing.xl,
    },
    loginForm: {
        padding: theme.spacing.xl,
        backgroundColor: theme.colors.card,
        marginHorizontal: theme.spacing.lg,
        borderRadius: theme.borderRadius.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        ...theme.shadows.md,
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
        color: theme.colors.text,
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.xl,
        lineHeight: 20,
    },
    inputGroup: {
        marginBottom: theme.spacing.md,
    },
    label: {
        fontSize: 11,
        fontWeight: '800',
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.xs,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    input: {
        height: 46,
        backgroundColor: theme.colors.background,
        borderRadius: theme.borderRadius.md,
        paddingHorizontal: theme.spacing.md,
        fontSize: 15,
        color: theme.colors.text,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    loginBtn: {
        backgroundColor: theme.colors.primary,
        height: 48,
        borderRadius: theme.borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: theme.spacing.sm,
        ...theme.shadows.sm,
    },
    loginBtnDisabled: {
        backgroundColor: theme.colors.primaryLight,
    },
    loginBtnText: {
        color: theme.colors.white,
        fontSize: 16,
        fontWeight: '700',
    },
    switchModeContainer: {
        marginTop: theme.spacing.lg,
        alignItems: 'center',
    },
    switchModeText: {
        color: theme.colors.primary,
        fontSize: 14,
        fontWeight: '600',
    },
    /* ESTILOS PERFIL ACTIVO */
    profileBox: {
        backgroundColor: theme.colors.card,
        margin: theme.spacing.lg,
        padding: theme.spacing.xl,
        borderRadius: theme.borderRadius.lg,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
        ...theme.shadows.md,
    },
    avatar: {
        fontSize: 50,
        marginBottom: theme.spacing.sm,
    },
    welcomeText: {
        fontSize: 13,
        color: theme.colors.textSecondary,
        fontWeight: '500',
    },
    usernameText: {
        fontSize: 22,
        fontWeight: '800',
        color: theme.colors.text,
        marginTop: 4,
    },
    emailText: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.border,
        width: '100%',
        marginVertical: theme.spacing.lg,
    },
    logoutBtn: {
        borderColor: theme.colors.danger,
        borderWidth: 1.5,
        width: '100%',
        height: 46,
        borderRadius: theme.borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoutBtnText: {
        color: theme.colors.danger,
        fontSize: 15,
        fontWeight: '700',
    },
    scrollContent: {
        paddingBottom: theme.spacing.xxl,
    },
    favoritesSection: {
        marginHorizontal: theme.spacing.lg,
        marginBottom: theme.spacing.lg,
    },
    sectionHeader: {
        fontSize: 16,
        fontWeight: '800',
        color: theme.colors.text,
        marginBottom: theme.spacing.md,
        letterSpacing: 0.2,
    },
    favLoader: {
        marginVertical: theme.spacing.lg,
    },
    emptyFavsBox: {
        backgroundColor: theme.colors.card,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.xl,
        alignItems: 'center',
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    emptyFavsText: {
        fontSize: 14,
        fontWeight: '700',
        color: theme.colors.textSecondary,
    },
    emptyFavsSubtext: {
        fontSize: 12,
        color: theme.colors.textMuted,
        textAlign: 'center',
        marginTop: 4,
    },
    favCard: {
        backgroundColor: theme.colors.card,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.sm,
        borderWidth: 1,
        borderColor: theme.colors.border,
        ...theme.shadows.sm,
    },
    favImageContainer: {
        backgroundColor: '#fafafa',
        padding: theme.spacing.xs,
        borderRadius: theme.borderRadius.md,
    },
    favImage: {
        width: 50,
        height: 50,
        borderRadius: theme.borderRadius.sm,
    },
    favInfo: {
        flex: 1,
        marginLeft: theme.spacing.md,
        justifyContent: 'center',
    },
    favBrand: {
        fontSize: 9,
        color: theme.colors.textMuted,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    favTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.text,
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
        color: theme.colors.text,
    },
    favDiscountPrice: {
        fontSize: 13,
        fontWeight: '700',
        color: theme.colors.danger,
        marginRight: 6,
    },
    favOriginalPrice: {
        fontSize: 11,
        color: theme.colors.textMuted,
        textDecorationLine: 'line-through',
    },
    deleteFavBtn: {
        padding: theme.spacing.sm,
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteFavText: {
        fontSize: 18,
    },
    /* ESTILOS PARA ÓRDENES */
    ordersSection: {
        marginHorizontal: theme.spacing.lg,
        marginBottom: theme.spacing.lg,
    },
    orderLoader: {
        marginVertical: theme.spacing.lg,
    },
    emptyOrdersBox: {
        backgroundColor: theme.colors.card,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.xl,
        alignItems: 'center',
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    emptyOrdersText: {
        fontSize: 14,
        fontWeight: '700',
        color: theme.colors.textSecondary,
    },
    emptyOrdersSubtext: {
        fontSize: 12,
        color: theme.colors.textMuted,
        textAlign: 'center',
        marginTop: 4,
    },
    orderCard: {
        backgroundColor: theme.colors.card,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.sm,
        borderWidth: 1,
        borderColor: theme.colors.border,
        ...theme.shadows.sm,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottomWidth: 1,
        borderColor: theme.colors.border,
        paddingBottom: theme.spacing.sm,
        marginBottom: theme.spacing.sm,
    },
    orderIdText: {
        fontSize: 13,
        fontWeight: '700',
        color: theme.colors.text,
    },
    orderDateText: {
        fontSize: 11,
        color: theme.colors.textMuted,
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: 3,
        borderRadius: theme.borderRadius.sm,
    },
    statusBadgeText: {
        fontSize: 9,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    orderItemsList: {
        marginBottom: theme.spacing.md,
    },
    orderItemText: {
        fontSize: 13,
        color: theme.colors.textSecondary,
        lineHeight: 18,
    },
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderColor: theme.colors.border,
        paddingTop: theme.spacing.sm,
    },
    orderTotalLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.textSecondary,
    },
    orderTotalValue: {
        fontSize: 15,
        fontWeight: '800',
        color: theme.colors.primary,
    },
});