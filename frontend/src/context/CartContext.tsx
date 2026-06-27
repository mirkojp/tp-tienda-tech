// src/context/CartContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '../types/strapy.types';

export interface CartItem {
    product: Product;
    quantity: number;
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (product: Product, quantity?: number) => void;
    removeFromCart: (productId: number) => void;
    updateQuantity: (productId: number, quantity: number) => void;
    clearCart: () => void;
    cartCount: number;
    cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cart, setCart] = useState<CartItem[]>([]);

    // Cargar el carrito guardado al iniciar la app
    useEffect(() => {
        const loadCart = async () => {
            try {
                const savedCart = await AsyncStorage.getItem('@tech_store_cart');
                if (savedCart) setCart(JSON.parse(savedCart));
            } catch (error) {
                console.error('Error cargando el carrito:', error);
            }
        };
        loadCart();
    }, []);

    // Guardar en AsyncStorage cada vez que el carrito cambie
    useEffect(() => {
        const saveCart = async () => {
            try {
                await AsyncStorage.setItem('@tech_store_cart', JSON.stringify(cart));
            } catch (error) {
                console.error('Error guardando el carrito:', error);
            }
        };
        saveCart();
    }, [cart]);

    // Agregar producto al carrito con validación de stock básico
    const addToCart = (product: Product, quantity = 1) => {
        setCart((prevCart) => {
            const existingItem = prevCart.find((item) => item.product.id === product.id);

            if (existingItem) {
                const newQuantity = existingItem.quantity + quantity;
                // Validación de regla de negocio básica
                if (newQuantity > product.stock) {
                    alert(`Disculpas, solo quedan ${product.stock} unidades en stock.`);
                    return prevCart;
                }
                return prevCart.map((item) =>
                    item.product.id === product.id ? { ...item, quantity: newQuantity } : item
                );
            }

            if (quantity > product.stock) {
                alert(`Disculpas, no hay suficiente stock.`);
                return prevCart;
            }

            return [...prevCart, { product, quantity }];
        });
    };

    const removeFromCart = (productId: number) => {
        setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
    };

    const updateQuantity = (productId: number, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        setCart((prevCart) =>
            prevCart.map((item) => {
                if (item.product.id === productId) {
                    if (quantity > item.product.stock) {
                        alert(`Límite de stock alcanzado (${item.product.stock} u.)`);
                        return item;
                    }
                    return { ...item, quantity };
                }
                return item;
            })
        );
    };

    const clearCart = () => setCart([]);

    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

    const cartTotal = cart.reduce((total, item) => {
        const price = item.product.discountPrice ?? item.product.price;
        return total + price * item.quantity;
    }, 0);

    return (
        <CartContext.Provider
            value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart debe ser utilizado dentro de un CartProvider');
    return context;
};