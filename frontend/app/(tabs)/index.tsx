import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  TextInput,
  SafeAreaView
} from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { ProductCard } from '../../src/components/ProductCard'; 
import { theme } from '../../src/styles/theme';
import { STRAPI_URL } from '../../src/api/config';
import { styles } from '../../src/styles/indexStyles';
const API_URL = `${STRAPI_URL}/api`;

export default function HomeScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null); // Referencia para scrollear arriba al cambiar de página

  const [products, setProducts] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  // Estados de Filtros, Orden y Búsqueda
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortByPrice, setSortByPrice] = useState<'asc' | 'desc' | null>(null);

  // Estados de Paginación Tradicional
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const PAGE_SIZE = 10; // Tamaño fijo requerido

  // 1. Cargar filtros una sola vez
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [brandsRes, categoriesRes] = await Promise.all([
          axios.get(`${API_URL}/brands`),
          axios.get(`${API_URL}/categories`)
        ]);
        setBrands(brandsRes.data.data);
        setCategories(categoriesRes.data.data);
      } catch (error) {
        console.error('Error cargando filtros:', error);
      }
    };
    fetchFilters();
  }, []);

  // 2. Petición principal (Pisa los productos en lugar de acumularlos)
  const fetchProducts = useCallback(async (pageNumber: number) => {
    setLoading(true);
    try {
      const params: any = {
        'pagination[page]': pageNumber,
        'pagination[pageSize]': PAGE_SIZE,
        populate: '*',
      };

      if (searchQuery.trim() !== '') params['filters[title][$containsi]'] = searchQuery.trim();
      if (selectedBrand) params['filters[brand][documentId][$eq]'] = selectedBrand;
      if (selectedCategory) params['filters[category][documentId][$eq]'] = selectedCategory;
      if (sortByPrice) params['sort'] = `price:${sortByPrice}`;

      const response = await axios.get(`${API_URL}/products`, { params });

      setProducts(response.data.data);

      // Mapeo de la metadata de paginación de Strapi v5
      const meta = response.data.meta.pagination;
      setTotalPages(meta.pageCount);
      setTotalItems(meta.total);

      // Clavar el scroll arriba de todo para que no quede abajo al cambiar de página
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    } catch (error) {
      console.error('Error cargando productos:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedBrand, selectedCategory, sortByPrice, searchQuery]);

  // 3. Efecto disparador ante cambios de filtros (Reinicia a la página 1)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setPage(1);
      fetchProducts(1);
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [selectedBrand, selectedCategory, sortByPrice, searchQuery]);

  // 4. Cambiar de página manualmente con los botones
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      fetchProducts(newPage);
    }
  };

  // Cálculos de rango para el texto explicativo 
  const fromItem = totalItems === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const toItem = Math.min(page * PAGE_SIZE, totalItems);

  return (
    <SafeAreaView style={styles.container}>
      {/* CONTENEDOR DE FILTROS */}
      <View style={styles.filterContainer}>
        <View style={styles.searchSection}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar productos..."
            placeholderTextColor={theme.colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <Text style={styles.filterTitle}>Categorías</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow} contentContainerStyle={styles.chipRowContainer}>
          <TouchableOpacity
            style={[styles.chip, !selectedCategory && styles.chipActive]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text style={[styles.chipText, !selectedCategory && styles.chipTextActive]}>Todas</Text>
          </TouchableOpacity>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.chip, selectedCategory === cat.documentId && styles.chipActive]}
              onPress={() => setSelectedCategory(cat.documentId)}
            >
              <Text style={[styles.chipText, selectedCategory === cat.documentId && styles.chipTextActive]}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.filterTitle}>Marcas</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow} contentContainerStyle={styles.chipRowContainer}>
          <TouchableOpacity
            style={[styles.chip, !selectedBrand && styles.chipActive]}
            onPress={() => setSelectedBrand(null)}
          >
            <Text style={[styles.chipText, !selectedBrand && styles.chipTextActive]}>Todas</Text>
          </TouchableOpacity>
          {brands.map((b) => (
            <TouchableOpacity
              key={b.id}
              style={[styles.chip, selectedBrand === b.documentId && styles.chipActive]}
              onPress={() => setSelectedBrand(b.documentId)}
            >
              <Text style={[styles.chipText, selectedBrand === b.documentId && styles.chipTextActive]}>{b.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.orderRow}>
          <Text style={styles.filterTitleInline}>Ordenar por precio:</Text>
          <View style={styles.orderButtons}>
            <TouchableOpacity
              style={[styles.orderBtn, sortByPrice === 'asc' && styles.orderBtnActive]}
              onPress={() => setSortByPrice(sortByPrice === 'asc' ? null : 'asc')}
            >
              <Text style={[styles.orderBtnText, sortByPrice === 'asc' && styles.orderBtnTextActive]}>Menor</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.orderBtn, sortByPrice === 'desc' && styles.orderBtnActive]}
              onPress={() => setSortByPrice(sortByPrice === 'desc' ? null : 'desc')}
            >
              <Text style={[styles.orderBtnText, sortByPrice === 'desc' && styles.orderBtnTextActive]}>Mayor</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* BASE DEL LISTADO */}
      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          ref={flatListRef}
          data={products}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <ProductCard
                product={item}
                onPress={() => {
                  router.push({
                    pathname: '/product/[id]',
                    params: { id: item.documentId }
                  });
                }}
              />
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No se encontraron productos.</Text>
          }
        />
      )}

      {/* BOTONERA DE PAGINACIÓN TRADICIONAL */}
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          style={[styles.pageBtn, page === 1 && styles.pageBtnDisabled]}
          onPress={() => handlePageChange(page - 1)}
          disabled={page === 1}
        >
          <Text style={[styles.pageBtnText, page === 1 && styles.pageBtnTextDisabled]}>◀ Ant.</Text>
        </TouchableOpacity>

        <View style={styles.pageInfoContainer}>
          <Text style={styles.pageInfoText}>Página {page} de {totalPages}</Text>
          <Text style={styles.pageSubInfoText}>Mostrando {fromItem}-{toItem} de {totalItems}</Text>
        </View>

        <TouchableOpacity
          style={[styles.pageBtn, page === totalPages && styles.pageBtnDisabled]}
          onPress={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
        >
          <Text style={[styles.pageBtnText, page === totalPages && styles.pageBtnTextDisabled]}>Sig. ▶</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
