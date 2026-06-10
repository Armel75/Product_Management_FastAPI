import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';
import { Product, Category } from '../types';
import ProductCard from '../components/ProductCard';
import ProductForm from '../components/ProductForm';
import { LogOut, User, Package, Layers, AlertCircle, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

const LIMIT = 6;

export const ProductsPage: React.FC = () => {
  const { user, logout, isMocked, setMockMode } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Initialize browser localStorage seed data if in simulation mode and empty
  useEffect(() => {
    if (isMocked) {
      const savedCats = localStorage.getItem('localCategories');
      const savedProds = localStorage.getItem('localProducts');

      if (!savedCats) {
        const seedCats: Category[] = [
          { id: 1, name: 'Consumer Electronics', description: 'Smartphones, computers, and home devices' },
          { id: 2, name: 'Ergonomic Furnitures', description: 'Comfortable chairs, desks, and workspace cabinets' },
          { id: 3, name: 'Premium Apparel', description: 'Designer streetwear and brand merchandise' },
        ];
        localStorage.setItem('localCategories', JSON.stringify(seedCats));
      }

      if (!savedProds) {
        const seedProds: Product[] = [
          {
            id: 1,
            name: 'Macbook Pro Max M3',
            description: '16-inch workhorse laptop with 36GB memory and 1TB fast SSD storage.',
            price: 2499.00,
            stock_quantity: 14,
            category_id: 1,
            created_by: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            category: { id: 1, name: 'Consumer Electronics' }
          },
          {
            id: 2,
            name: 'Sony WH-1000XM5 ANC',
            description: 'Industry leading active noise cancelling wireless headphones.',
            price: 349.99,
            stock_quantity: 8,
            category_id: 1,
            created_by: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            category: { id: 1, name: 'Consumer Electronics' }
          },
          {
            id: 3,
            name: 'Executive Ergonomic Chair',
            description: 'Adaptive lumbar support office seat with mesh backrest and multi-axis armrests.',
            price: 289.00,
            stock_quantity: 52,
            category_id: 2,
            created_by: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            category: { id: 2, name: 'Ergonomic Furnitures' }
          },
          {
            id: 4,
            name: 'Standing Desk Dual Motor',
            description: 'Programmable electronic height adjuster desk with digital control memory preset keys.',
            price: 499.50,
            stock_quantity: 3,
            category_id: 2,
            created_by: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            category: { id: 2, name: 'Ergonomic Furnitures' }
          },
          {
            id: 5,
            name: 'Heavyweight Winter Hoodie',
            description: 'Double-brushed cotton fleece hoodie with premium stitched typography lines.',
            price: 79.99,
            stock_quantity: 120,
            category_id: 3,
            created_by: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            category: { id: 3, name: 'Premium Apparel' }
          }
        ];
        localStorage.setItem('localProducts', JSON.stringify(seedProds));
      }
    }
  }, [isMocked]);

  // Fetch Categories
  const fetchCategories = useCallback(async () => {
    if (isMocked) {
      const savedCats = JSON.parse(localStorage.getItem('localCategories') || '[]');
      setCategories(savedCats);
      return;
    }

    try {
      const response = await axiosClient.get('/products/categories');
      setCategories(response.data);
    } catch (err: any) {
      console.error('Failed to load classes from FastAPI backend:', err.message);
    }
  }, [isMocked]);

  // Fetch Products with skip/limit
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setApiError(null);

    if (isMocked) {
      const localProds: Product[] = JSON.parse(localStorage.getItem('localProducts') || '[]');
      const paginated = localProds.slice(skip, skip + LIMIT + 1);
      
      if (paginated.length > LIMIT) {
        setHasMore(true);
        setProducts(paginated.slice(0, LIMIT));
      } else {
        setHasMore(false);
        setProducts(paginated);
      }
      setLoading(false);
      return;
    }

    try {
      const response = await axiosClient.get(`/products?skip=${skip}&limit=${LIMIT + 1}`);
      const data = response.data;
      if (data.length > LIMIT) {
        setHasMore(true);
        setProducts(data.slice(0, LIMIT));
      } else {
        setHasMore(false);
        setProducts(data);
      }
    } catch (err: any) {
      setApiError(err.message || 'Could not fetch database records. Connect your uvicorn service.');
    } finally {
      setLoading(false);
    }
  }, [skip, isMocked]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Create Product
  const handleCreateProduct = async (productData: {
    name: string;
    description: string | null;
    price: number;
    stock_quantity: number;
    category_id: number | null;
  }) => {
    setApiError(null);
    if (isMocked) {
      const localProds: Product[] = JSON.parse(localStorage.getItem('localProducts') || '[]');
      const localCats: Category[] = JSON.parse(localStorage.getItem('localCategories') || '[]');
      const matchedCat = localCats.find(c => c.id === productData.category_id) || null;

      const newProd: Product = {
        id: localProds.length ? Math.max(...localProds.map(p => p.id)) + 1 : 1,
        name: productData.name,
        description: productData.description,
        price: productData.price,
        stock_quantity: productData.stock_quantity,
        category_id: productData.category_id,
        created_by: user?.id || 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        category: matchedCat
      };

      const updated = [newProd, ...localProds];
      localStorage.setItem('localProducts', JSON.stringify(updated));
      fetchProducts();
      return;
    }

    try {
      await axiosClient.post('/products', productData);
      fetchProducts();
    } catch (err: any) {
      setApiError(err.message || 'Failed to create product.');
    }
  };

  // Add Category
  const handleCreateCategory = async (categoryData: { name: string; description: string | null }) => {
    if (isMocked) {
      const localCats: Category[] = JSON.parse(localStorage.getItem('localCategories') || '[]');
      const newCat: Category = {
        id: localCats.length ? Math.max(...localCats.map(c => c.id)) + 1 : 1,
        name: categoryData.name,
        description: categoryData.description
      };
      const updated = [...localCats, newCat];
      localStorage.setItem('localCategories', JSON.stringify(updated));
      setCategories(updated);
      return newCat;
    }

    try {
      const response = await axiosClient.post('/products/categories', categoryData);
      setCategories((prev) => [...prev, response.data]);
      return response.data;
    } catch (err: any) {
      setApiError(err.message || 'Failed to register category.');
      throw err;
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id: number) => {
    const doubleCheck = window.confirm('Are you sure you want to delete this product?');
    if (!doubleCheck) return;
    setApiError(null);

    if (isMocked) {
      const localProds: Product[] = JSON.parse(localStorage.getItem('localProducts') || '[]');
      const filtered = localProds.filter(p => p.id !== id);
      localStorage.setItem('localProducts', JSON.stringify(filtered));
      fetchProducts();
      return;
    }

    try {
      await axiosClient.delete(`/products/${id}`);
      fetchProducts();
    } catch (err: any) {
      setApiError(err.message || 'Failed to delete product.');
    }
  };

  const totalInStock = products.reduce((acc, p) => acc + (p.stock_quantity || 0), 0);
  const lowStockCount = products.filter((p) => p.stock_quantity <= 10 && p.stock_quantity > 0).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-900/40 backdrop-blur sticky top-0 z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-indigo-600/10 text-indigo-400 rounded-lg border border-indigo-600/20 font-bold tracking-tight text-lg">
              PM
            </span>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">Product Manager</h1>
              <p className="text-xs text-slate-500 font-mono">
                {isMocked ? 'Demo Mode (Local sandbox)' : 'Connected to FastAPI PostgreSQL'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 animate-fadeIn">
            {/* Database Engine Toggle (Super helpful for previews vs dev tests) */}
            <button
              onClick={() => {
                setMockMode(!isMocked);
                setSkip(0);
              }}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium cursor-pointer transition-all ${
                isMocked
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
              }`}
              title="Toggle between browser simulation and actual FastAPI"
            >
              {isMocked ? '🔌 Switch to Live Server' : '⚙️ Switch to Demo Mode'}
            </button>

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
        {/* Connection warning or general error */}
        {apiError && (
          <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 text-amber-200 rounded-2xl text-sm relative overflow-hidden">
            <div className="absolute top-0 bottom-0 left-0 w-1 bg-amber-500"></div>
            <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-white">FastAPI Server Offline</p>
              <p className="mt-0.5 text-slate-300">{apiError}</p>
              <button 
                onClick={() => setMockMode(true)}
                className="mt-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
              >
                Launch Browser Sandbox instead (No Backend needed)
              </button>
            </div>
          </div>
        )}

        {/* Local database stats */}
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

        {/* Dynamic layout split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-1">
            <ProductForm
              categories={categories}
              onSubmit={handleCreateProduct}
              onAddCategory={handleCreateCategory}
            />
          </div>

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

                {/* Pagination Controls */}
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
