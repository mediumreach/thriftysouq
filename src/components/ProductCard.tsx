import { Star } from 'lucide-react';
import { Product } from '../lib/supabase';
import { useCurrency } from '../contexts/CurrencyContext';

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  const { formatPrice } = useCurrency();
  const hasDiscount = product.compare_at_price > 0;
  const discountPercent = hasDiscount
    ? Math.round(((product.compare_at_price - product.base_price) / product.compare_at_price) * 100)
    : 0;

  return (
    <div
      onClick={() => onClick(product)}
      className="group cursor-pointer bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-emerald-200 shadow-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
    >
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        <img
          src={product.images[0] || 'https://via.placeholder.com/400'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        {hasDiscount && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg">
            -{discountPercent}%
          </div>
        )}
        {product.stock_quantity <= product.low_stock_threshold && product.stock_quantity > 0 && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg">
            Low Stock
          </div>
        )}
        {product.stock_quantity === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center">
            <span className="text-white text-lg font-semibold">Out of Stock</span>
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-emerald-600 transition-colors text-lg">
          {product.name}
        </h3>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
          {product.short_description}
        </p>

        {product.review_count > 0 && (
          <div className="flex items-center gap-1 mb-3">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(product.average_rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600 font-medium">
              {product.average_rating.toFixed(1)} <span className="text-gray-400">({product.review_count})</span>
            </span>
          </div>
        )}

        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            {formatPrice(product.base_price)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(product.compare_at_price)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
