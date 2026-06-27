// src/api/productService.ts
import { strapiApi } from './strapi';
import { Product, StrapiResponse } from '../types/strapy.types';

export const productService = {
    // Obtenemos los productos activos (isDeleted != true) y populamos relaciones
    getProducts: async (page = 1, pageSize = 10): Promise<StrapiResponse<Product>> => {
        try {
            const response = await strapiApi.get<StrapiResponse<Product>>('/products', {
                params: {
                    'pagination[page]': page,
                    'pagination[pageSize]': pageSize,
                    'populate': '*', // Trae imágenes, categorías y marcas
                    'filters[isDeleted][$ne]': true, // Regla de negocio: Soft Delete
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching products from Strapi:', error);
            throw error;
        }
    },
};