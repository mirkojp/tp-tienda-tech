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

const API_URL = 'http://localhost:1337/api';

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

  // Cálculos de rango para el texto explicativo (Ej: de 1 a 10)
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
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <Text style={styles.filterTitle}>Categorías</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
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
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
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
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
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
          <Text style={[styles.pageBtnText, page === 1 && styles.pageBtnTextDisabled]}>◀ Anterior</Text>
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
          <Text style={[styles.pageBtnText, page === totalPages && styles.pageBtnTextDisabled]}>Siguiente ▶</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  filterContainer: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
  },
  searchSection: {
    paddingHorizontal: 15,
    marginBottom: 8,
  },
  searchInput: {
    height: 40,
    backgroundColor: '#f1f3f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#212529',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  filterTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6c757d',
    marginLeft: 15,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  filterTitleInline: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6c757d',
    textTransform: 'uppercase',
  },
  chipRow: {
    paddingLeft: 15,
    marginVertical: 4,
  },
  chip: {
    backgroundColor: '#f1f3f5',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  chipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  chipText: {
    color: '#495057',
    fontSize: 13,
  },
  chipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginTop: 4,
  },
  orderButtons: {
    flexDirection: 'row',
  },
  orderBtn: {
    backgroundColor: '#f1f3f5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 6,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  orderBtnActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  orderBtnText: {
    fontSize: 12,
    color: '#495057',
  },
  orderBtnTextActive: {
    color: '#2196F3',
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 10,
  },
  cardWrapper: {
    marginBottom: 12,
    width: '100%',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6c757d',
    marginTop: 40,
    fontSize: 15,
  },
  /* ESTILOS DE LA NUEVA BOTONERA */
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  pageBtn: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  pageBtnDisabled: {
    backgroundColor: '#e9ecef',
  },
  pageBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  pageBtnTextDisabled: {
    color: '#adb5bd',
  },
  pageInfoContainer: {
    alignItems: 'center',
  },
  pageInfoText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#212529',
  },
  pageSubInfoText: {
    fontSize: 11,
    color: '#6c757d',
    marginTop: 2,
  },
});