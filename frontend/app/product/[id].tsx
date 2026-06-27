import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, Image, ScrollView, ActivityIndicator, TouchableOpacity, SafeAreaView, Alert, FlatList, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { strapiApi } from '../../src/api/strapi';
import { STRAPI_URL } from '../../src/api/config';
import { Product } from '../../src/types/strapy.types';
import { useCart } from '../../src/context/CartContext';
import { useFavorites } from '../../src/context/FavouritesContext';

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
                <ActivityIndicator size="large" color="#007bff" />
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
                    {product.brand && <Text style={styles.brand}>{(product.brand as any).name || product.brand}</Text>}
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

                    <Text style={styles.stock}>Disponibles: {product.stock} unidades</Text>

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
    container: { flex: 1, backgroundColor: '#fff' },
    navBar: {
        height: 50,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderColor: '#eee'
    },
    backButton: { paddingVertical: 6 },
    backButtonText: { color: '#007bff', fontSize: 16, fontWeight: '600' },
    favoriteButton: { padding: 6, justifyContent: 'center', alignItems: 'center' },
    favoriteIcon: { fontSize: 22 },
    scrollContainer: { paddingBottom: 100 },

    // --- NUEVOS ESTILOS OPTIMIZADOS PARA AJUSTE DE IMAGEN ---
    carouselContainer: {
        position: 'relative',
        height: 330,
        backgroundColor: '#fafafa',
    },
    imageWrapper: {
        height: 300,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fafafa',
    },
    carouselImage: {
        width: '90%', // Deja un pequeño aire lateral para que luzca limpio
        height: '100%',
    },
    arrowButton: {
        position: 'absolute',
        top: '40%',
        width: 42,
        height: 42,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 21,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
        zIndex: 10,
    },
    leftArrow: {
        left: 10,
    },
    rightArrow: {
        right: 10,
    },
    arrowText: {
        fontSize: 32,
        fontWeight: '300',
        color: '#222',
        marginTop: -6,
    },
    arrowDisabled: {
        color: '#ddd',
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
        backgroundColor: '#007bff',
    },
    paginationDotInactive: {
        width: 6,
        backgroundColor: '#ccc',
    },
    // --- FIN ESTILOS CARRUSEL ---

    infoContainer: { padding: 20 },
    brand: { fontSize: 13, color: '#888', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: 4 },
    title: { fontSize: 22, fontWeight: 'bold', color: '#111', marginBottom: 10 },
    priceRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 6 },
    price: { fontSize: 24, fontWeight: 'bold', color: '#000' },
    discountPrice: { fontSize: 24, fontWeight: 'bold', color: '#e74c3c', marginRight: 10 },
    originalPrice: { fontSize: 16, color: '#999', textDecorationLine: 'line-through' },
    stock: { fontSize: 14, color: '#28a745', fontWeight: '500', marginTop: 4 },
    divider: { height: 1, backgroundColor: '#eee', marginVertical: 20 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 8 },
    description: { fontSize: 15, color: '#555', lineHeight: 22 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { fontSize: 16, color: '#e74c3c', fontWeight: '500' },
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, borderTopWidth: 1, borderColor: '#eee', backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, justifyContent: 'space-between' },
    quantitySelector: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f3f5', borderRadius: 8, padding: 4 },
    qtyButton: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
    qtyText: { fontSize: 20, fontWeight: 'bold', color: '#495057' },
    qtyNumber: { marginHorizontal: 15, fontSize: 16, fontWeight: 'bold', color: '#212529' },
    addButton: { flex: 1, backgroundColor: '#007bff', marginLeft: 20, height: 48, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    disabledButton: { backgroundColor: '#ccc' },
    addButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});