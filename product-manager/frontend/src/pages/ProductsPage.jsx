import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';
import ProductCard from '../components/ProductCard';
import ProductForm from '../components/ProductForm';
import { LogOut, User, DollarSign, Package, Layers, AlertCircle, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

const LIMIT = 6;

const ProductsPage = () => {
  const { user, logout } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  // Pagination bounds checking
  const [hasMore, setHasMore] = useState(true);

  // Fetch Categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await axiosClient.get('/products/categories');
      setCategories(response.data);
    } catch (err) {
      console.error('Failed to load categories:', err.message);
    }
  }, []);

  // Fetch Products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    try {
      // Add standard pagination limits (fetch one extra to check if hasMore)
      const response = await axiosClient.get(`/products?skip=${skip}&limit=${LIMIT + 1}`);
      const data = response.data;
      if (data.length > LIMIT) {
        setHasMore(true);
        setProducts(data.slice(0, LIMIT));
      } else {
        setHasMore(false);
        setProducts(data);
      }
    } catch (err) {
      setApiError(err.message || 'Could not fetch products. Make sure your local FastAPI backend is active.');
    } finally {
      setLoading(false);
    }
  }, [skip]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Create Product Action
  const handleCreateProduct = async (productData) => {
    setApiError(null);
    try {
      await axiosClient.post('/products', productData);
      fetchProducts(); // Refresh listings
    } catch (err) {
      setApiError(err.message || 'Failed to create product.');
    }
  };

  // Create Category Action
  const handleCreateCategory = async (categoryData) => {
    try {
      const response = await axiosClient.post('/products/categories', categoryData);
      setCategories((prev) => [...prev, response.data]);
      return response.data;
    } catch (err) {
      setApiError(err.message || 'Failed to create category.');
      throw err;
    }
  };

  // Delete Product Action
  const handleDeleteProduct = async (id) => {
    const doubleCheck = window.confirm('Are you sure you want to delete this product?');
    if (!doubleCheck) return;
    setApiError(null);
    try {
      await axiosClient.delete(`/products/${id}`);
      fetchProducts(); // Refresh listings
    } catch (err) {
      setApiError(err.message || 'Failed to delete product.');
    }
  };

  // Quick stats computed locally
  const totalInStock = products.reduce((acc, p) => acc + (p.stock_quantity || 0), 0);
  const lowStockCount = products.filter((p) => p.stock_quantity <= 10 && p.stock_quantity > 0).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      {/* Premium Header */}
      <header className="border-b border-slate-900 bg-slate-900/40 backdrop-blur sticky top-0 z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-indigo-600/10 text-indigo-400 rounded-lg border border-indigo-600/20 font-bold tracking-tight text-lg">
              PM
            </span>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">Product Manager</h1>
              <p className="text-xs text-slate-500 font-mono">Enterprise Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-slate-300">
              <User className="h-4 w-4 text-slate-400" />
              <span className="font-medium max-w-[150px] truncate">{user?.email}</span>
            </div>
            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer flex items-center gap-2 text-sm border border-transparent hover:border-red-500/10 px-3 py-1.5"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-8 space-y-8">
        {/* Error Banner */}
        {apiError && (
          <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 text-red-200 rounded-2xl text-sm relative overflow-hidden">
            <div className="absolute top-0 bottom-0 left-0 w-1 bg-red-500"></div>
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-white">Error Encountered</p>
              <p className="mt-0.5 text-slate-300">{apiError}</p>
            </div>
            <button
              onClick={() => {
                fetchProducts();
                fetchCategories();
              }}
              className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
              title="Retry fetching resources"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Database Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <p className="text-slate-500 text-xs font-mono uppercase tracking-wider">Loaded Products</p>
              <h3 className="text-2xl font-bold text-white mt-1">{products.length} items</h3>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-slate-500 text-xs font-mono uppercase tracking-wider">Low Stock alerts</p>
              <h3 className="text-2xl font-bold text-white mt-1">{lowStockCount} critical</h3>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <p className="text-slate-500 text-xs font-mono uppercase tracking-wider">Total Categories</p>
              <h3 className="text-2xl font-bold text-white mt-1">{categories.length} registered</h3>
            </div>
          </div>
        </div>

        {/* Dynamic content split - Form & Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Creator Widget */}
          <div className="lg:col-span-1">
            <ProductForm
              categories={categories}
              onSubmit={handleCreateProduct}
              onAddCategory={handleCreateCategory}
            />
          </div>

          {/* Listings & Pagination */}
          <div className="lg:col-span-2 space-y-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-20 bg-slate-900/40 border border-slate-900 rounded-2xl text-slate-500 space-y-3">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                <p className="text-sm font-medium">Synchronising listing catalog...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-20 bg-slate-900/45 border border-slate-900 border-dashed rounded-2xl text-center space-y-4">
                <div className="p-4 bg-slate-950 border border-slate-900 text-slate-500 rounded-full">
                  <Package className="h-10 w-10" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">No products registered</h3>
                  <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
                    There are no products saved on this database page. Fill out the creation form to register your first product.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onDelete={handleDeleteProduct}
                    />
                  ))}
                </div>

                {/* Standard Pagination Controls */}
                <div className="flex justify-between items-center bg-slate-900 border border-slate-800/80 p-4 rounded-xl">
                  <button
                    onClick={() => setSkip((prev) => Math.max(0, prev - LIMIT))}
                    disabled={skip === 0}
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </button>

                  <span className="text-slate-400 text-xs font-mono">
                    Showing entries {skip + 1} - {skip + products.length}
                  </span>

                  <button
                    onClick={() => setSkip((prev) => prev + LIMIT)}
                    disabled={!hasMore}
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductsPage;
