// src/components/ProductCard.tsx
import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { Product } from '../types/strapy.types';
import { STRAPI_URL } from '../api/config';
import { theme } from '../styles/theme';
import { styles } from '../styles/productCardStyles';

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
