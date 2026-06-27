// src/types/strapi.types.ts

export interface Brand {
    id: number;
    name: string;
}

export interface Category {
    id: number;
    name: string;
    slug: string;
}

export interface StrapiMedia {
    id: number;
    url: string;
    formats?: {
        thumbnail?: { url: string };
        small?: { url: string };
    };
}

export interface Product {
    id: number;
    documentId: string;
    title: string;
    slug: string;
    description: string;
    price: number;
    discountPrice?: number | null;
    stock: number;
    isDeleted: boolean;
    category?: Category;
    brand?: Brand;
    images?: StrapiMedia[];
}

// Interfaz para la respuesta paginada típica de Strapi v4/v5
export interface StrapiResponse<T> {
    data: T[];
    meta: {
        pagination: {
            page: number;
            pageSize: number;
            pageCount: number;
            total: number;
        };
    };
}

// Interfaz para la relación de Favorito en Strapi v5
export interface Favourite {
    id: number;
    documentId: string;
    createdAt?: string;
    updatedAt?: string;
    publishedAt?: string;
    product?: Product;
}