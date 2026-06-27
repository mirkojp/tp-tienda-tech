// src/components/ProductCard.tsx
import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { Product } from '../types/strapy.types';
import { STRAPI_URL } from '../api/config';
import { theme } from '../styles/theme';

interface Props {
    product: Product;
    onPress: () => void;
}

export const ProductCard: React.FC<Props> = ({ product, onPress }) => {
    // Obtener la URL de la primera imagen o usar un placeholder si no tiene
    const imageUrl = product.images && product.images.length > 0
        ? (product.images[0].url.startsWith('http')
            ? product.images[0].url
            : `${STRAPI_URL}${product.images[0].url}`)
        : 'https://via.placeholder.com/150';

    // Validación de regla de negocio: ¿Tiene descuento activo?
    const hasDiscount = product.discountPrice !== undefined &&
        product.discountPrice !== null &&
        product.discountPrice < product.price;

    const discountPercent = hasDiscount
        ? Math.round(((product.price - product.discountPrice!) / product.price) * 100)
        : 0;

    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
            {/* Imagen del Producto */}
            <View style={styles.imageContainer}>
                <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="contain" />
                {hasDiscount && (
                    <View style={styles.discountBadge}>
                        <Text style={styles.discountBadgeText}>-{discountPercent}%</Text>
                    </View>
                )}
            </View>

            {/* Información del Producto */}
            <View style={styles.infoContainer}>
                <View>
                    {product.brand && (
                        <Text style={styles.brand}>
                            {typeof product.brand === 'string' ? product.brand : (product.brand as any).name}
                        </Text>
                    )}
                    <Text style={styles.title} numberOfLines={2}>{product.title}</Text>
                </View>

                <View style={styles.footerRow}>
                    {/* Contenedor de Precios */}
                    <View style={styles.priceContainer}>
                        {hasDiscount ? (
                            <View>
                                <Text style={styles.originalPrice}>${product.price.toFixed(2)}</Text>
                                <Text style={styles.discountPrice}>${product.discountPrice?.toFixed(2)}</Text>
                            </View>
                        ) : (
                            <Text style={styles.price}>${product.price.toFixed(2)}</Text>
                        )}
                    </View>

                    {/* Stock disponible */}
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
                            {product.stock > 0 ? `${product.stock} u.` : 'Sin stock'}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: theme.colors.card,
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing.md,
        marginVertical: theme.spacing.xs,
        marginHorizontal: theme.spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
        ...theme.shadows.sm,
    },
    imageContainer: {
        position: 'relative',
        backgroundColor: '#fafafa',
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.xs,
    },
    image: {
        width: 90,
        height: 90,
        borderRadius: theme.borderRadius.sm,
    },
    discountBadge: {
        position: 'absolute',
        top: -4,
        left: -4,
        backgroundColor: theme.colors.danger,
        paddingHorizontal: theme.spacing.xs,
        paddingVertical: 2,
        borderRadius: theme.borderRadius.sm,
        ...theme.shadows.sm,
    },
    discountBadgeText: {
        color: theme.colors.white,
        fontSize: 10,
        fontWeight: '800',
    },
    infoContainer: {
        flex: 1,
        marginLeft: theme.spacing.md,
        height: 95,
        justifyContent: 'space-between',
    },
    brand: {
        fontSize: 10,
        color: theme.colors.textMuted,
        textTransform: 'uppercase',
        fontWeight: '800',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    title: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.text,
        lineHeight: 18,
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginTop: theme.spacing.xs,
    },
    priceContainer: {
        justifyContent: 'center',
    },
    price: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.text,
    },
    originalPrice: {
        fontSize: 12,
        color: theme.colors.textMuted,
        textDecorationLine: 'line-through',
        marginBottom: 1,
    },
    discountPrice: {
        fontSize: 16,
        fontWeight: '800',
        color: theme.colors.danger,
    },
    stockBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: 3,
        borderRadius: theme.borderRadius.round,
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
        marginRight: 4,
    },
    stockText: {
        fontSize: 10,
        fontWeight: '700',
    },
});