import React, { useState } from 'react';
import { Plus, Tag } from 'lucide-react';

const ProductForm = ({ categories, onSubmit, onAddCategory }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [categoryId, setCategoryId] = useState('');
  
  // Category quick creation state
  const [showCategoryInput, setShowCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');
  const [submittingCategory, setSubmittingCategory] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !price || !stockQuantity) {
      alert('Please fill out all required fields.');
      return;
    }
    
    onSubmit({
      name,
      description: description || null,
      price: parseFloat(price),
      stock_quantity: parseInt(stockQuantity, 10),
      category_id: categoryId ? parseInt(categoryId, 10) : null,
    });

    // Reset inputs
    setName('');
    setDescription('');
    setPrice('');
    setStockQuantity('');
    setCategoryId('');
  };

  const handleCategoryCreate = async (e) => {
    e.preventDefault();
    if (!newCategoryName) return;
    setSubmittingCategory(true);
    try {
      const created = await onAddCategory({
        name: newCategoryName,
        description: newCategoryDesc || null
      });
      if (created && created.id) {
        setCategoryId(created.id.toString());
      }
      setNewCategoryName('');
      setNewCategoryDesc('');
      setShowCategoryInput(false);
    } catch (err) {
      alert(err.message || 'Failed to create category.');
    } finally {
      setSubmittingCategory(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Create New Product</h2>
        <p className="text-slate-400 text-sm mt-1">Register products into active database index</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-1.5" htmlFor="product-name">
            Product Name *
          </label>
          <input
            id="product-name"
            type="text"
            required
            className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm transition-colors"
            placeholder="e.g. Ergonomic Office Chair"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-slate-300 text-sm font-medium mb-1.5" htmlFor="product-desc">
            Description
          </label>
          <textarea
            id="product-desc"
            rows="3"
            className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm transition-colors resize-none"
            placeholder="Introduce the product features..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1.5" htmlFor="product-price">
              Price ($) *
            </label>
            <input
              id="product-price"
              type="number"
              step="0.01"
              min="0.01"
              required
              className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm transition-colors"
              placeholder="129.99"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1.5" htmlFor="product-stock">
              Stock Quantity *
            </label>
            <input
              id="product-stock"
              type="number"
              min="0"
              required
              className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm transition-colors"
              placeholder="50"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value)}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-slate-300 text-sm font-medium" htmlFor="product-category">
              Category
            </label>
            <button
              type="button"
              onClick={() => setShowCategoryInput(!showCategoryInput)}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium cursor-pointer"
            >
              {showCategoryInput ? 'Choose existing' : '+ Add category'}
            </button>
          </div>

          {!showCategoryInput ? (
            <select
              id="product-category"
              className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 text-sm transition-colors"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">Uncategorised</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          ) : (
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-3 mt-1">
              <div>
                <input
                  type="text"
                  placeholder="New Category Name (e.g. Furnitures)"
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs transition-colors"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Short Description (Optional)"
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs transition-colors"
                  value={newCategoryDesc}
                  onChange={(e) => setNewCategoryDesc(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleCategoryCreate}
                  disabled={submittingCategory || !newCategoryName}
                  className="px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shrink-0 cursor-pointer disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full mt-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </button>
      </form>
    </div>
  );
};

export default ProductForm;
