import { useState, useEffect } from 'react';
import { X, Star, ShoppingCart, Check } from 'lucide-react';
import { Product, ProductReview, supabase } from '../lib/supabase';
import { useCart } from '../contexts/CartContext';
import { useCurrency } from '../contexts/CurrencyContext';

interface ProductDetailProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductDetail({ product, isOpen, onClose }: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [addedToCart, setAddedToCart] = useState(false);
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();

  useEffect(() => {
    if (product) {
      setSelectedImage(0);
      setQuantity(1);
      loadReviews();
    }
  }, [product]);

  const loadReviews = async () => {
    if (!product) return;

    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', product.id)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }
  };

  if (!isOpen || !product) return null;

  const hasDiscount = product.compare_at_price > 0;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      ></div>

      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="grid md:grid-cols-2 gap-8 p-8">
              <div>
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                  <img
                    src={product.images[selectedImage] || product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {product.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`aspect-square bg-gray-100 rounded-md overflow-hidden border-2 ${
                          selectedImage === index ? 'border-gray-900' : 'border-transparent'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {product.name}
                </h1>

                {product.review_count > 0 && (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < Math.floor(product.average_rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-gray-600">
                      {product.average_rating.toFixed(1)} ({product.review_count} reviews)
                    </span>
                  </div>
                )}

                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-4xl font-bold text-gray-900">
                    {formatPrice(product.base_price)}
                  </span>
                  {hasDiscount && (
                    <>
                      <span className="text-xl text-gray-500 line-through">
                        {formatPrice(product.compare_at_price)}
                      </span>
                      <span className="text-lg text-red-600 font-semibold">
                        Save{' '}
                        {Math.round(
                          ((product.compare_at_price - product.base_price) /
                            product.compare_at_price) *
                            100
                        )}
                        %
                      </span>
                    </>
                  )}
                </div>

                <p className="text-gray-700 mb-6 leading-relaxed">
                  {product.description}
                </p>

                {Object.keys(product.specifications).length > 0 && (
                  <div className="mb-6 bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Specifications</h3>
                    <dl className="space-y-2">
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <dt className="text-gray-600 capitalize">
                            {key.replace(/_/g, ' ')}:
                          </dt>
                          <dd className="text-gray-900 font-medium">{String(value)}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}

                <div className="mb-6">
                  <div className="flex items-center gap-4 mb-4">
                    <label className="text-gray-700 font-medium">Quantity:</label>
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-4 py-2 hover:bg-gray-100 transition-colors"
                      >
                        -
                      </button>
                      <span className="px-6 py-2 border-x border-gray-300 font-semibold">
                        {quantity}
                      </span>
                      <button
                        onClick={() =>
                          setQuantity(Math.min(product.stock_quantity, quantity + 1))
                        }
                        className="px-4 py-2 hover:bg-gray-100 transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-sm text-gray-600">
                      {product.stock_quantity} available
                    </span>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock_quantity === 0}
                    className="w-full py-4 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {addedToCart ? (
                      <>
                        <Check className="h-5 w-5" />
                        Added to Cart!
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-5 w-5" />
                        {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </>
                    )}
                  </button>
                </div>

                {reviews.length > 0 && (
                  <div className="border-t pt-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      Customer Reviews
                    </h3>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {reviews.map(review => (
                        <div key={review.id} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="font-semibold text-gray-900">
                              {review.customer_name}
                            </span>
                            {review.is_verified_purchase && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                Verified Purchase
                              </span>
                            )}
                          </div>
                          {review.title && (
                            <h4 className="font-semibold text-gray-900 mb-1">
                              {review.title}
                            </h4>
                          )}
                          <p className="text-gray-700 text-sm mb-2">{review.comment}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(review.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
