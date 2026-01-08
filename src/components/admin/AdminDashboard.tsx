import { useState, useEffect } from 'react';
import { TrendingUp, Package, ShoppingCart, Star, DollarSign } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    avgRating: 0,
    lowStockCount: 0,
    pendingReviews: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [products, orders, reviews] = await Promise.all([
        supabase.from('products').select('*'),
        supabase.from('orders').select('*'),
        supabase.from('product_reviews').select('*').eq('is_approved', false),
      ]);

      const totalProducts = products.data?.length || 0;
      const lowStockCount =
        products.data?.filter(p => p.stock_quantity <= p.low_stock_threshold).length || 0;
      const totalOrders = orders.data?.length || 0;
      const totalRevenue = orders.data?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
      const avgRating =
        products.data?.reduce((sum, p) => sum + p.average_rating, 0) / totalProducts || 0;
      const pendingReviews = reviews.data?.length || 0;

      setStats({
        totalProducts,
        totalOrders,
        totalRevenue,
        avgRating,
        lowStockCount,
        pendingReviews,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'bg-blue-500',
      subtext: `${stats.lowStockCount} low stock`,
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'bg-green-500',
      subtext: 'All time',
    },
    {
      title: 'Revenue',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-purple-500',
      subtext: 'Total revenue',
    },
    {
      title: 'Average Rating',
      value: stats.avgRating.toFixed(1),
      icon: Star,
      color: 'bg-yellow-500',
      subtext: `${stats.pendingReviews} pending reviews`,
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your store.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.title}</h3>
              <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.subtext}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="font-semibold text-gray-900">Add New Product</div>
              <div className="text-sm text-gray-600">Create a new product listing</div>
            </button>
            <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="font-semibold text-gray-900">View Orders</div>
              <div className="text-sm text-gray-600">Manage customer orders</div>
            </button>
            <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="font-semibold text-gray-900">Moderate Reviews</div>
              <div className="text-sm text-gray-600">
                {stats.pendingReviews} reviews pending approval
              </div>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">System Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Database Connection</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Active
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Payment Gateway</span>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                Setup Required
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Email Service</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Active
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Low Stock Alerts</span>
              <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                {stats.lowStockCount} Items
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
