import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  Star, 
  DollarSign,
  Users,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  BarChart3,
  Activity,
  FolderTree
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface RecentOrder {
  id: string;
  order_number: string;
  customer_name: string;
  total_amount: number;
  status: string;
  created_at: string;
}

interface TopProduct {
  id: string;
  name: string;
  images: string[];
  base_price: number;
  stock_quantity: number;
  review_count: number;
}

interface AdminDashboardProps {
  onPageChange: (page: string) => void;
}

export function AdminDashboard({ onPageChange }: AdminDashboardProps) {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    avgRating: 0,
    lowStockCount: 0,
    pendingReviews: 0,
    pendingOrders: 0,
    totalCustomers: 0,
    todayOrders: 0,
    todayRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);


  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [products, orders, reviews, customers] = await Promise.all([
        supabase.from('products').select('*'),
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('product_reviews').select('*').eq('is_approved', false),
        supabase.from('customers').select('id'),
      ]);

      const productData = products.data || [];
      const orderData = orders.data || [];

      const totalProducts = productData.length;
      const lowStockCount = productData.filter(p => p.stock_quantity <= p.low_stock_threshold).length;
      const totalOrders = orderData.length;
      const totalRevenue = orderData.reduce((sum, order) => sum + (order.total_amount || 0), 0);
      const avgRating = totalProducts > 0 
        ? productData.reduce((sum, p) => sum + (p.average_rating || 0), 0) / totalProducts 
        : 0;
      const pendingReviews = reviews.data?.length || 0;
      const pendingOrders = orderData.filter(o => o.status === 'pending').length;
      const totalCustomers = customers.data?.length || 0;

      const todayOrders = orderData.filter(o => new Date(o.created_at) >= today).length;
      const todayRevenue = orderData
        .filter(o => new Date(o.created_at) >= today)
        .reduce((sum, o) => sum + (o.total_amount || 0), 0);

      setStats({
        totalProducts,
        totalOrders,
        totalRevenue,
        avgRating,
        lowStockCount,
        pendingReviews,
        pendingOrders,
        totalCustomers,
        todayOrders,
        todayRevenue,
      });

      setRecentOrders(orderData.slice(0, 5));

      const sortedProducts = [...productData]
        .sort((a, b) => (b.review_count || 0) - (a.review_count || 0))
        .slice(0, 5);
      setTopProducts(sortedProducts);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'processing': return 'bg-blue-100 text-blue-700';
      case 'shipped': return 'bg-purple-100 text-purple-700';
      case 'delivered': return 'bg-emerald-100 text-emerald-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
              <div className="h-12 w-12 bg-gray-200 rounded-xl mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      subtext: `${formatCurrency(stats.todayRevenue)} today`,
      trend: stats.todayRevenue > 0 ? 'up' : 'neutral',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders.toLocaleString(),
      icon: ShoppingCart,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      subtext: `${stats.todayOrders} today`,
      trend: stats.todayOrders > 0 ? 'up' : 'neutral',
    },
    {
      title: 'Products',
      value: stats.totalProducts.toLocaleString(),
      icon: Package,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      subtext: `${stats.lowStockCount} low stock`,
      trend: stats.lowStockCount > 0 ? 'warning' : 'neutral',
    },
    {
      title: 'Avg Rating',
      value: stats.avgRating.toFixed(1),
      icon: Star,
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
      subtext: `${stats.pendingReviews} pending reviews`,
      trend: stats.avgRating >= 4 ? 'up' : 'neutral',
    },
  ];


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Welcome back! Here's what's happening with your store.</p>
        </div>
        <button 
          onClick={loadDashboardData}
          className="self-start inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors shadow-sm text-sm"
        >
          <Activity className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index} 
              className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className={`${stat.bgColor} p-2 sm:p-3 rounded-lg sm:rounded-xl`}>
                  <Icon className={`h-4 w-4 sm:h-6 sm:w-6 ${stat.iconColor}`} />
                </div>
                {stat.trend === 'up' && (
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                )}
                {stat.trend === 'warning' && (
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                )}
              </div>
              <p className="text-gray-600 text-xs sm:text-sm font-medium mb-1">{stat.title}</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-xs sm:text-sm text-gray-500 truncate">{stat.subtext}</p>
            </div>
          );
        })}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between mb-3">
            <Clock className="h-6 w-6 sm:h-8 sm:w-8 opacity-80" />
            <span className="text-2xl sm:text-3xl font-bold">{stats.pendingOrders}</span>
          </div>
          <p className="font-medium text-sm sm:text-base">Pending Orders</p>
          <p className="text-xs sm:text-sm opacity-80 mt-1">Awaiting processing</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between mb-3">
            <Users className="h-6 w-6 sm:h-8 sm:w-8 opacity-80" />
            <span className="text-2xl sm:text-3xl font-bold">{stats.totalCustomers}</span>
          </div>
          <p className="font-medium text-sm sm:text-base">Total Customers</p>
          <p className="text-xs sm:text-sm opacity-80 mt-1">Registered users</p>
        </div>

        <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between mb-3">
            <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 opacity-80" />
            <span className="text-2xl sm:text-3xl font-bold">{stats.lowStockCount}</span>
          </div>
          <p className="font-medium text-sm sm:text-base">Low Stock Items</p>
          <p className="text-xs sm:text-sm opacity-80 mt-1">Need restocking</p>
        </div>
      </div>

      {/* Orders and Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Recent Orders</h2>
              <button 
                onClick={() => onPageChange('orders')}
                className="text-emerald-600 hover:text-emerald-700 text-xs sm:text-sm font-medium flex items-center gap-1"
              >
                View All <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
            </div>
          </div>
          <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div key={order.id} className="p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">{order.order_number}</p>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">{order.customer_name}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-semibold text-gray-900 text-sm sm:text-base">{formatCurrency(order.total_amount)}</p>
                      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{formatDate(order.created_at)}</p>
                </div>
              ))
            ) : (
              <div className="p-6 sm:p-8 text-center text-gray-500">
                <ShoppingCart className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No orders yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Top Products</h2>
              <button 
                onClick={() => onPageChange('products')}
                className="text-emerald-600 hover:text-emerald-700 text-xs sm:text-sm font-medium flex items-center gap-1"
              >
                View All <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
            </div>
          </div>
          <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
            {topProducts.length > 0 ? (
              topProducts.map((product) => (
                <div key={product.id} className="p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <img
                      src={product.images?.[0] || 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=100'}
                      alt={product.name}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">{product.name}</p>
                      <p className="text-xs sm:text-sm text-gray-600">{formatCurrency(product.base_price)}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-900">{product.review_count} reviews</p>
                      <p className={`text-xs ${product.stock_quantity <= 10 ? 'text-red-600' : 'text-gray-500'}`}>
                        {product.stock_quantity} in stock
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 sm:p-8 text-center text-gray-500">
                <Package className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No products yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-4">
          <button 
            onClick={() => onPageChange('products')}
            className="p-3 sm:p-4 border border-gray-200 rounded-lg sm:rounded-xl hover:bg-emerald-50 hover:border-emerald-200 transition-all group"
          >
            <Package className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600 group-hover:text-emerald-600 mx-auto mb-1 sm:mb-2" />
            <p className="font-medium text-gray-900 group-hover:text-emerald-700 text-xs sm:text-sm text-center">Products</p>
          </button>
          <button 
            onClick={() => onPageChange('categories')}
            className="p-3 sm:p-4 border border-gray-200 rounded-lg sm:rounded-xl hover:bg-lime-50 hover:border-lime-200 transition-all group"
          >
            <FolderTree className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600 group-hover:text-lime-600 mx-auto mb-1 sm:mb-2" />
            <p className="font-medium text-gray-900 group-hover:text-lime-700 text-xs sm:text-sm text-center">Categories</p>
          </button>
          <button 
            onClick={() => onPageChange('orders')}
            className="p-3 sm:p-4 border border-gray-200 rounded-lg sm:rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-all group"
          >
            <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600 group-hover:text-blue-600 mx-auto mb-1 sm:mb-2" />
            <p className="font-medium text-gray-900 group-hover:text-blue-700 text-xs sm:text-sm text-center">Orders</p>
          </button>
          <button 
            onClick={() => onPageChange('reviews')}
            className="p-3 sm:p-4 border border-gray-200 rounded-lg sm:rounded-xl hover:bg-purple-50 hover:border-purple-200 transition-all group"
          >
            <Star className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600 group-hover:text-purple-600 mx-auto mb-1 sm:mb-2" />
            <p className="font-medium text-gray-900 group-hover:text-purple-700 text-xs sm:text-sm text-center">Reviews</p>
          </button>
          <button 
            onClick={() => onPageChange('hero-settings')}
            className="p-3 sm:p-4 border border-gray-200 rounded-lg sm:rounded-xl hover:bg-amber-50 hover:border-amber-200 transition-all group col-span-3 sm:col-span-1"
          >
            <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600 group-hover:text-amber-600 mx-auto mb-1 sm:mb-2" />
            <p className="font-medium text-gray-900 group-hover:text-amber-700 text-xs sm:text-sm text-center">Hero</p>
          </button>
        </div>
      </div>
    </div>
  );
}
