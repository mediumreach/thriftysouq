import { useState, useEffect } from 'react';
import { supabase, Product } from '../lib/supabase';
import { ProductCard } from './ProductCard';
import { Loader2 } from 'lucide-react';

interface ProductGridProps {
  categorySlug: string | null;
  searchQuery: string;
  onProductClick: (product: Product) => void;
}

export function ProductGrid({ categorySlug, searchQuery, onProductClick }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, [categorySlug, searchQuery]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('products')
        .select('*, categories!inner(slug)')
        .eq('is_active', true);

      if (categorySlug) {
        query = query.eq('categories.slug', categorySlug);
      }

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false });

      const { data, error: queryError } = await query;

      if (queryError) throw queryError;

      setProducts(data || []);
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-gray-900" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600">{error}</p>
        <button
          onClick={loadProducts}
          className="mt-4 px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-600 text-lg">
          {searchQuery ? `No products found for "${searchQuery}"` : 'No products available'}
        </p>
      </div>
    );
  }

  const featuredProducts = products.filter(p => p.is_featured);
  const regularProducts = products.filter(p => !p.is_featured);

  return (
    <div className="space-y-12">
      {featuredProducts.length > 0 && !searchQuery && (
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Featured Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={onProductClick}
              />
            ))}
          </div>
        </div>
      )}

      {regularProducts.length > 0 && (
        <div>
          {featuredProducts.length > 0 && !searchQuery && (
            <h2 className="text-3xl font-bold text-gray-900 mb-6">All Products</h2>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {regularProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={onProductClick}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
