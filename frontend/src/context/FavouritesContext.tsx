// src/context/FavouritesContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { strapiApi } from '../api/strapi';
import { useAuth } from './AuthContext'; // Asegúrate de que la ruta a tu AuthContext sea la correcta
import { Product, Favourite } from '../types/strapy.types';

interface FavoritesContextType {
    favRelations: Favourite[];
    loadingFavs: boolean;
    loadFavorites: () => Promise<void>;
    toggleFavorite: (product: Product) => Promise<void>;
    isFavorite: (productId: number) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth(); // Traemos el usuario autenticado desde tu AuthContext
    const [favRelations, setFavRelations] = useState<Favourite[]>([]);
    const [loadingFavs, setLoadingFavs] = useState<boolean>(false);

    // --- LEER FAVORITOS (Filtrando la colección Favourites por el ID del usuario) ---
    const loadFavorites = async () => {
        if (!user) {
            console.log('[FAVS] No hay usuario logueado todavía. Se limpia el estado de favoritos.');
            setFavRelations([]);
            return;
        }

        try {
            setLoadingFavs(true);
            console.log(`[FAVS] Trayendo favoritos consultando directamente /favourites para el usuario ID: ${user.id}`);

            // Consultamos la colección 'favourites' directamente
            const response = await strapiApi.get('/favourites', {
                params: {
                    // 1. Filtramos para traer solo los favoritos cuyo campo relacional 'user' coincida con el id del usuario actual
                    filters: {
                        user: {
                            id: {
                                $eq: user.id,
                            },
                        },
                    },
                    // 2. Traemos la relación con el producto (y sus componentes/imágenes si lo requieres usando '*')
                    populate: {
                        product: {
                            populate: '*'
                        },
                    },
                },
            });

            console.log('[FAVS] ¡ÉXITO! Datos recibidos de /favourites:', response.data);

            // Al ser un endpoint normal de Strapi, la respuesta viene envuelta en .data.data
            if (response.data && response.data.data) {
                setFavRelations(response.data.data);
                console.log(`[FAVS] Estado local actualizado con ${response.data.data.length} favoritos.`);
            } else {
                setFavRelations([]);
            }
        } catch (error: any) {
            console.error('[FAVS] ❌ Error crítico en el GET directo a /favourites:');
            if (error.response) {
                console.error('Status del servidor:', error.response.status);
                console.error('Cuerpo del error detallado:', JSON.stringify(error.response.data));
            } else {
                console.error('Mensaje aislado:', error.message);
            }
        } finally {
            setLoadingFavs(false);
        }
    };

    // Disparador automático cuando cambia el estado del usuario (Login / Logout / Carga inicial)
    useEffect(() => {
        loadFavorites();
    }, [user]);

    // --- ACCIÓN DE AGREGAR/ELIMINAR FAVORITO ---
    const toggleFavorite = async (product: Product) => {
        if (!user) {
            Alert.alert('Iniciar Sesión', 'Debes iniciar sesión para poder guardar tus favoritos.');
            return;
        }

        console.log('[FAVS] Clickeado toggle para producto ID:', product.id);
        const existingFav = favRelations.find(fav => fav.product?.id === product.id);

        try {
            if (existingFav) {
                console.log(`[FAVS] Eliminando de favoritos. documentId: ${existingFav.documentId}`);
                await strapiApi.delete(`/favourites/${existingFav.documentId}`);
                
                // Actualizar el estado local quitando la relación
                setFavRelations(prev => prev.filter(fav => fav.documentId !== existingFav.documentId));
                console.log('[FAVS] Eliminado correctamente de favoritos.');
            } else {
                console.log(`[FAVS] Agregando a favoritos. product.documentId: ${product.documentId}`);
                
                const payload = {
                    data: {
                        user: user.id,
                        product: product.documentId,
                        publishedAt: new Date().toISOString()
                    }
                };

                const response = await strapiApi.post('/favourites', payload);
                console.log('[FAVS] Respuesta de Strapi al crear favorito:', response.data);

                if (response.data && response.data.data) {
                    // La API devuelve el objeto sin la relación del producto completa.
                    // Para que isFavorite y el listado de favoritos muestren la info correctamente,
                    // inyectamos el producto completo al objeto creado.
                    const newFav: Favourite = {
                        ...response.data.data,
                        product: product
                    };
                    setFavRelations(prev => [...prev, newFav]);
                    console.log('[FAVS] Agregado correctamente a favoritos.');
                }
            }
        } catch (error: any) {
            console.error('[FAVS] ❌ Error en toggleFavorite:', error);
            if (error.response) {
                console.error('Status del servidor:', error.response.status);
                console.error('Cuerpo del error:', JSON.stringify(error.response.data));
            }
            Alert.alert('Error', 'No se pudo actualizar la lista de favoritos.');
        }
    };


    // --- VERIFICAR SI UN PRODUCTO ES FAVORITO ---
    const isFavorite = (productId: number): boolean => {
        if (!favRelations || favRelations.length === 0) return false;

        // Comparamos el ID del producto dentro de cada relación de favoritos en el estado local
        return favRelations.some(fav => fav.product?.id === productId);
    };

    return (
        <FavoritesContext.Provider value={{ favRelations, loadingFavs, loadFavorites, toggleFavorite, isFavorite }}>
            {children}
        </FavoritesContext.Provider>
    );
};

export const useFavorites = () => {
    const context = useContext(FavoritesContext);
    if (!context) throw new Error('useFavorites debe usarse dentro de FavoritesProvider');
    return context;
};