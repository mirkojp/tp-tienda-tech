import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, Image, ScrollView, ActivityIndicator, TouchableOpacity, SafeAreaView, Alert, FlatList, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { strapiApi } from '../../src/api/strapi';
import { STRAPI_URL } from '../../src/api/config';
import { Product } from '../../src/types/strapy.types';
import { useCart } from '../../src/context/CartContext';
import { useFavorites } from '../../src/context/FavouritesContext';
import { theme } from '../../src/styles/theme';
import { styles } from '../../src/styles/[id]Styles';
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

                {/* --- SECCIÓN: CARRUSEL DE IMÁGENES-- */}
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

