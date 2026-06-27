// src/components/ProductCard.tsx
import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { Product } from '../types/strapy.types';
import { STRAPI_URL } from '../api/config';

interface Props {
    product: Product;
    onPress: () => void;
}

export const ProductCard: React.FC<Props> = ({ product, onPress }) => {
    // Obtener la URL de la primera imagen o usar un placeholder si no tiene
    const imageUrl = product.images && product.images.length > 0
        ? `${STRAPI_URL}${product.images[0].url}`
        : 'https://via.placeholder.com/150';

    // Validación de regla de negocio: ¿Tiene descuento activo?
    const hasDiscount = product.discountPrice !== undefined &&
        product.discountPrice !== null &&
        product.discountPrice < product.price;

    return (
        <TouchableOpacity style= { styles.card } onPress = { onPress } activeOpacity = { 0.8} >
            {/* Imagen del Producto */ }
            < Image source = {{ uri: imageUrl }
} style = { styles.image } resizeMode = "contain" />

    {/* Información del Producto */ }
    < View style = { styles.infoContainer } >
        { product.brand && <Text style={ styles.brand }> { product.brand.name } </Text>}

<Text style={ styles.title } numberOfLines = { 2} > { product.title } </Text>

{/* Contenedor de Precios */ }
<View style={ styles.priceContainer }>
{
    hasDiscount?(
            <>
    <Text style={ styles.originalPrice }> ${ product.price.toFixed(2) } </Text>
        < Text style = { styles.discountPrice } > ${ product.discountPrice?.toFixed(2) } </Text>
            </>
          ) : (
    <Text style= { styles.price } > ${ product.price.toFixed(2) } </Text>
          )}
</View>

{/* Stock disponible */ }
<Text style={ styles.stock }> Stock: { product.stock } u.</Text>
    </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        marginVertical: 8,
        marginHorizontal: 16,
        flexDirection: 'row',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 8,
    },
    infoContainer: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'space-between',
    },
    brand: {
        fontSize: 12,
        color: '#888',
        textTransform: 'uppercase',
        fontWeight: 'bold',
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    price: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    originalPrice: {
        fontSize: 14,
        color: '#999',
        textDecorationLine: 'line-through',
        marginRight: 8,
    },
    discountPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#e74c3c',
    },
    stock: {
        fontSize: 11,
        color: '#666',
        alignSelf: 'flex-start',
    },
});