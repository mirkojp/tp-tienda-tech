import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, Image, ScrollView, ActivityIndicator, TouchableOpacity, SafeAreaView, Alert, FlatList, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { strapiApi } from '../../src/api/strapi';
import { STRAPI_URL } from '../../src/api/config';
import { Product } from '../../src/types/strapy.types';
import { useCart } from '../../src/context/CartContext';
import { useFavorites } from '../../src/context/FavouritesContext';
import { theme } from '../../src/styles/theme';

export default function ProductDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { addToCart } = useCart();
    const { toggleFavorite, isFavorite } = useFavorites();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [submittingFav, setSubmittingFav] = useState(false);

    // Estados para control dinámico del tamaño de pantalla
    const [activeIndex, setActiveIndex] = useState(0);
    const [carouselWidth, setCarouselWidth] = useState(Dimensions.get('window').width);
    const flatListRef = useRef<FlatList<string>>(null);

    useEffect(() => {
        const loadProductDetails = async () => {
            try {
                setLoading(true);
                if (!id) return;

                const response = await strapiApi.get(`/products/${id}`, {
                    params: { populate: '*' }
                });

                if (response.data && response.data.data) {
                    setProduct(response.data.data);
                } else if (response.data) {
                    setProduct(response.data as any);
                }
            } catch (error) {
                console.error('Error cargando detalle del producto:', error);
            } finally {
                setLoading(false);
            }
        };

        loadProductDetails();
    }, [id]);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    if (!product) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorText}>El producto no existe o fue eliminado.</Text>
            </View>
        );
    }

    const handleFavoritePress = async () => {
        if (!product || submittingFav) return;
        try {
            setSubmittingFav(true);
            await toggleFavorite(product);
        } finally {
            setSubmittingFav(false);
        }
    };

    const getImageUrls = (): string[] => {
        if (!product.images || product.images.length === 0) {
            return ['https://via.placeholder.com/300'];
        }

        return product.images.map((img: any) => {
            if (typeof img === 'string') return img;
            if (img && img.url) {
                if (img.url.startsWith('http')) return img.url;
                return `${STRAPI_URL}${img.url}`;
            }
            return 'https://via.placeholder.com/300';
        });
    };

    const imagesArray = getImageUrls();

    const hasDiscount = product.discountPrice !== undefined &&
        product.discountPrice !== null &&
        product.discountPrice < product.price;
    const currentPrice = hasDiscount ? product.discountPrice! : product.price;

    const handleAddToCart = () => {
        addToCart(product, quantity);
        Alert.alert('¡Éxito!', 'Producto añadido al carrito.');
        router.back();
    };

    // Detecta el scroll midiendo basándose en el ancho dinámico del contenedor
    const handleScroll = (event: any) => {
        const scrollPosition = event.nativeEvent.contentOffset.x;
        const index = Math.round(scrollPosition / carouselWidth);
        setActiveIndex(index);
    };

    const scrollToNext = () => {
        if (activeIndex < imagesArray.length - 1) {
            const nextIndex = activeIndex + 1;
            setActiveIndex(nextIndex);
            flatListRef.current?.scrollToIndex({
                index: nextIndex,
                animated: true
            });
        }
    };

    const scrollToPrev = () => {
        if (activeIndex > 0) {
            const prevIndex = activeIndex - 1;
            setActiveIndex(prevIndex);
            flatListRef.current?.scrollToIndex({
                index: prevIndex,
                animated: true
            });
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Barra de navegación superior */}
            <View style={styles.navBar}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>← Volver</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleFavoritePress}
                    style={styles.favoriteButton}
                    disabled={submittingFav}
                >
                    <Text style={styles.favoriteIcon}>
                        {isFavorite(product.id) ? '❤️' : '🤍'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Evento onLayout para capturar el tamaño exacto del viewport del dispositivo */}
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                onLayout={(e) => setCarouselWidth(e.nativeEvent.layout.width)}
            >

                {/* --- SECCIÓN: CARRUSEL DE IMÁGENES RESPONSIVO --- */}
                <View style={[styles.carouselContainer, { width: carouselWidth }]}>
                    <FlatList
                        ref={flatListRef}
                        data={imagesArray}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                        keyExtractor={(_, index) => index.toString()}
                        getItemLayout={(_, index) => ({
                            length: carouselWidth,
                            offset: carouselWidth * index,
                            index,
                        })}
                        renderItem={({ item }) => (
                            <View style={[styles.imageWrapper, { width: carouselWidth }]}>
                                <Image source={{ uri: item }} style={styles.carouselImage} resizeMode="contain" />
                            </View>
                        )}
                    />

                    {/* Flechas de navegación */}
                    {imagesArray.length > 1 && (
                        <>
                            <TouchableOpacity
                                style={[styles.arrowButton, styles.leftArrow]}
                                onPress={scrollToPrev}
                                disabled={activeIndex === 0}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.arrowText, activeIndex === 0 && styles.arrowDisabled]}>‹</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.arrowButton, styles.rightArrow]}
                                onPress={scrollToNext}
                                disabled={activeIndex === imagesArray.length - 1}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.arrowText, activeIndex === imagesArray.length - 1 && styles.arrowDisabled]}>›</Text>
                            </TouchableOpacity>
                        </>
                    )}

                    {/* Indicadores de puntos (Bullets) */}
                    {imagesArray.length > 1 && (
                        <View style={styles.paginationContainer}>
                            {imagesArray.map((_, index) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.paginationDot,
                                        activeIndex === index ? styles.paginationDotActive : styles.paginationDotInactive
                                    ]}
                                />
                            ))}
                        </View>
                    )}
                </View>
                {/* --- FIN CARRUSEL --- */}

                <View style={styles.infoContainer}>
                    {product.brand && (
                        <Text style={styles.brand}>
                            {typeof product.brand === 'string' ? product.brand : (product.brand as any).name}
                        </Text>
                    )}
                    <Text style={styles.title}>{product.title}</Text>

                    <View style={styles.priceRow}>
                        {hasDiscount ? (
                            <>
                                <Text style={styles.discountPrice}>${product.discountPrice?.toFixed(2)}</Text>
                                <Text style={styles.originalPrice}>${product.price.toFixed(2)}</Text>
                            </>
                        ) : (
                            <Text style={styles.price}>${product.price.toFixed(2)}</Text>
                        )}
                    </View>

                    {/* Stock disponible con badge */}
                    <View style={[
                        styles.stockBadge,
                        product.stock > 0 ? styles.stockIn : styles.stockOut
                    ]}>
                        <View style={[
                            styles.stockDot,
                            { backgroundColor: product.stock > 0 ? theme.colors.success : theme.colors.danger }
                        ]} />
                        <Text style={[
                            styles.stockText,
                            { color: product.stock > 0 ? theme.colors.successDark : theme.colors.dangerDark }
                        ]}>
                            {product.stock > 0 ? `Disponible: ${product.stock} unidades` : 'Sin Stock'}
                        </Text>
                    </View>

                    <View style={styles.divider} />

                    <Text style={styles.sectionTitle}>Descripción</Text>
                    <Text style={styles.description}>
                        {typeof product.description === 'string'
                            ? product.description
                            : (product.description as any)?.[0]?.children?.[0]?.text || 'Sin descripción disponible.'}
                    </Text>
                </View>
            </ScrollView>

            {/* Footer Fijo */}
            <View style={styles.footer}>
                <View style={styles.quantitySelector}>
                    <TouchableOpacity
                        style={styles.qtyButton}
                        onPress={() => setQuantity(prev => Math.max(1, prev - 1))}
                    >
                        <Text style={styles.qtyText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.qtyNumber}>{quantity}</Text>
                    <TouchableOpacity
                        style={styles.qtyButton}
                        onPress={() => setQuantity(prev => Math.min(product.stock, prev + 1))}
                    >
                        <Text style={styles.qtyText}>+</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[styles.addButton, product.stock === 0 && styles.disabledButton]}
                    onPress={handleAddToCart}
                    disabled={product.stock === 0}
                >
                    <Text style={styles.addButtonText}>
                        {product.stock === 0 ? 'Sin Stock' : `Agregar • $${(currentPrice * quantity).toFixed(2)}`}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    navBar: {
        height: 50,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.lg,
        borderBottomWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.card,
    },
    backButton: {
        paddingVertical: 6,
    },
    backButtonText: {
        color: theme.colors.primary,
        fontSize: 16,
        fontWeight: '700',
    },
    favoriteButton: {
        padding: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    favoriteIcon: {
        fontSize: 22,
    },
    scrollContainer: {
        paddingBottom: 100,
    },
    carouselContainer: {
        position: 'relative',
        height: 330,
        backgroundColor: theme.colors.card,
        borderBottomWidth: 1,
        borderColor: theme.colors.border,
    },
    imageWrapper: {
        height: 300,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.card,
    },
    carouselImage: {
        width: '90%',
        height: '100%',
    },
    arrowButton: {
        position: 'absolute',
        top: '40%',
        width: 40,
        height: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
        ...theme.shadows.sm,
        zIndex: 10,
    },
    leftArrow: {
        left: theme.spacing.md,
    },
    rightArrow: {
        right: theme.spacing.md,
    },
    arrowText: {
        fontSize: 28,
        fontWeight: '300',
        color: theme.colors.text,
        marginTop: -3,
    },
    arrowDisabled: {
        color: theme.colors.textMuted,
        opacity: 0.4,
    },
    paginationContainer: {
        position: 'absolute',
        bottom: 10,
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        height: 20,
    },
    paginationDot: {
        height: 6,
        borderRadius: 3,
        marginHorizontal: 4,
    },
    paginationDotActive: {
        width: 16,
        backgroundColor: theme.colors.primary,
    },
    paginationDotInactive: {
        width: 6,
        backgroundColor: theme.colors.border,
    },
    infoContainer: {
        padding: theme.spacing.lg,
        backgroundColor: theme.colors.card,
        margin: theme.spacing.lg,
        borderRadius: theme.borderRadius.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        ...theme.shadows.sm,
    },
    brand: {
        fontSize: 10,
        color: theme.colors.textMuted,
        textTransform: 'uppercase',
        fontWeight: '800',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
        color: theme.colors.text,
        marginBottom: theme.spacing.sm,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: theme.spacing.sm,
    },
    price: {
        fontSize: 24,
        fontWeight: '800',
        color: theme.colors.text,
    },
    discountPrice: {
        fontSize: 24,
        fontWeight: '800',
        color: theme.colors.danger,
        marginRight: 10,
    },
    originalPrice: {
        fontSize: 16,
        color: theme.colors.textMuted,
        textDecorationLine: 'line-through',
    },
    stockBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.md,
        paddingVertical: 4,
        borderRadius: theme.borderRadius.round,
        alignSelf: 'flex-start',
        marginTop: theme.spacing.xs,
    },
    stockIn: {
        backgroundColor: theme.colors.successLight,
    },
    stockOut: {
        backgroundColor: theme.colors.dangerLight,
    },
    stockDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 6,
    },
    stockText: {
        fontSize: 11,
        fontWeight: '700',
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.border,
        marginVertical: theme.spacing.lg,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: theme.colors.text,
        marginBottom: theme.spacing.sm,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    description: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        lineHeight: 22,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
    },
    errorText: {
        fontSize: 16,
        color: theme.colors.danger,
        fontWeight: '600',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
        borderTopWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.card,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.lg,
        justifyContent: 'space-between',
        ...theme.shadows.lg,
    },
    quantitySelector: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
        borderRadius: theme.borderRadius.md,
        padding: 4,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    qtyButton: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    qtyText: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.text,
    },
    qtyNumber: {
        marginHorizontal: theme.spacing.md,
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.text,
    },
    addButton: {
        flex: 1,
        backgroundColor: theme.colors.primary,
        marginLeft: theme.spacing.lg,
        height: 48,
        borderRadius: theme.borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        ...theme.shadows.sm,
    },
    disabledButton: {
        backgroundColor: theme.colors.border,
    },
    addButtonText: {
        color: theme.colors.white,
        fontSize: 16,
        fontWeight: '700',
    },
});