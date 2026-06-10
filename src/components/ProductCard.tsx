import React from 'react';
import { Trash2, AlertCircle, Package } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onDelete: (id: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onDelete }) => {
  const isOutOfStock = product.stock_quantity === 0;
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 10;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between relative group">
      <div className="flex justify-between items-start gap-4 mb-3">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
          {product.category?.name || 'Uncategorised'}
        </span>
        <span className="text-xl font-bold text-white font-mono">
          ${Number(product.price).toFixed(2)}
        </span>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-100 tracking-tight group-hover:text-white transition-colors">
          {product.name}
        </h3>
        <p className="text-slate-400 text-sm mt-1.5 leading-relaxed line-clamp-2">
          {product.description || 'No description provided.'}
        </p>
      </div>

      <div className="mt-auto pt-4 border-t border-slate-800/60 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-medium">
          <Package className="h-4 w-4 text-slate-500" />
          {isOutOfStock ? (
            <span className="inline-flex items-center gap-1 text-red-400 font-medium">
              <AlertCircle className="h-3 w-3" /> Out of stock
            </span>
          ) : isLowStock ? (
            <span className="inline-flex items-center gap-1 text-amber-400 font-medium">
              <AlertCircle className="h-3 w-3" /> Only {product.stock_quantity} left
            </span>
          ) : (
            <span className="text-slate-400 font-medium">{product.stock_quantity} in stock</span>
          )}
        </div>

        <button
          onClick={() => onDelete(product.id)}
          className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
          title="Delete Product"
        >
          <Trash2 className="h-4.5 w-4.5" />
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
