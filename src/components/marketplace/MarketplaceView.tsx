import React, { useState } from 'react';
import { useSocial } from '../../context/SocialContext';
import {
  Search,
  Plus,
  ShoppingBag,
  SlidersHorizontal,
  MapPin,
  Tag,
  Bookmark,
  Sparkles,
  Laptop,
  Car,
  Home,
  Shirt,
  Armchair,
  Wrench,
  Boxes,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MarketplaceProduct, ProductCategory } from '../../types';
import { ProductDetailsModal } from './ProductDetailsModal';
import { AddProductModal } from './AddProductModal';

export const MarketplaceView: React.FC = () => {
  const {
    currentUser,
    marketplaceProducts,
    selectedProduct,
    setSelectedProduct,
    setIsAddProductModalOpen,
    toggleSaveProduct,
    setIsAuthModalOpen,
    t,
  } = useSocial();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [conditionFilter, setConditionFilter] = useState<'all' | 'new' | 'used'>('all');
  const [viewMode, setViewMode] = useState<'all' | 'myListings'>('all');

  const categories = [
    { id: 'all', label: t('allCategories'), icon: Boxes },
    { id: 'electronics', label: t('electronics'), icon: Laptop },
    { id: 'vehicles', label: t('vehicles'), icon: Car },
    { id: 'realestate', label: t('realestate'), icon: Home },
    { id: 'fashion', label: t('fashion'), icon: Shirt },
    { id: 'furniture', label: t('furniture'), icon: Armchair },
    { id: 'services', label: t('services'), icon: Wrench },
  ];

  const filteredProducts = marketplaceProducts.filter((product) => {
    if (viewMode === 'myListings') {
      if (product.sellerId !== currentUser?.id) return false;
    }
    if (selectedCategory !== 'all' && product.category !== selectedCategory) {
      return false;
    }
    if (conditionFilter !== 'all' && product.condition !== conditionFilter) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = product.title.toLowerCase().includes(q);
      const matchDesc = product.description.toLowerCase().includes(q);
      const matchLoc = product.location.toLowerCase().includes(q);
      return matchTitle || matchDesc || matchLoc;
    }
    return true;
  });

  return (
    <div className="space-y-4" id="marketplace-view">
      {/* Top Banner & Search */}
      <div className="bg-[#0D162B] border border-[#1A2846] rounded-3xl p-4 sm:p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 end-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                <ShoppingBag className="w-4 h-4" />
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                {t('marketplace')}
              </h2>
            </div>
            <p className="text-xs text-blue-400/80">
              بيع واشترِ المنتجات والسيارات والإلكترونيات بين مجتمع Zorvexa بكل أمان
            </p>
          </div>

          <button
            onClick={() => {
              if (!currentUser) setIsAuthModalOpen(true);
              else setIsAddProductModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-900/40 active:scale-95 transition"
          >
            <Plus className="w-4 h-4" />
            <span>{t('sellProduct')}</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative z-10">
          <Search className="w-4 h-4 text-zinc-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchMarketplace')}
            className="w-full ps-10 pe-4 py-2.5 text-xs bg-[#070D1E] border border-[#1A2846] rounded-2xl text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none transition"
          />
        </div>
      </div>

      {/* Categories Horizontal Scroll */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition active:scale-95 ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                  : 'bg-[#0D162B] text-zinc-400 hover:text-white border border-[#1A2846]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Sub-Filters Bar: View Mode & Condition */}
      <div className="flex items-center justify-between gap-2 bg-[#0D162B] border border-[#1A2846] p-2 rounded-2xl">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setViewMode('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              viewMode === 'all'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            جميع المعروضات ({marketplaceProducts.length})
          </button>
          {currentUser && (
            <button
              onClick={() => setViewMode('myListings')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                viewMode === 'myListings'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {t('myListings')}
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 text-[11px]">
          {(['all', 'new', 'used'] as const).map((cond) => (
            <button
              key={cond}
              onClick={() => setConditionFilter(cond)}
              className={`px-2.5 py-1 rounded-lg transition ${
                conditionFilter === cond
                  ? 'bg-[#1A2846] text-white font-bold'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {cond === 'all' ? 'الكل' : cond === 'new' ? 'جديد' : 'مستعمل'}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-[#0D162B] border border-[#1A2846] rounded-3xl p-10 text-center">
          <ShoppingBag className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-zinc-300 mb-1">{t('noProductsYet')}</h4>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-4">{t('noProductsDesc')}</p>
          <button
            onClick={() => {
              if (!currentUser) setIsAuthModalOpen(true);
              else setIsAddProductModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition"
          >
            {t('sellProduct')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              onClick={() => setSelectedProduct(product)}
              whileHover={{ y: -3 }}
              className="bg-[#0D162B] border border-[#1A2846] hover:border-blue-500/50 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition cursor-pointer flex flex-col group"
            >
              {/* Product Card Image */}
              <div className="relative aspect-video w-full bg-zinc-950 overflow-hidden">
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                {/* Price Badge */}
                <div className="absolute top-2.5 start-2.5 px-3 py-1 rounded-xl bg-[#070D1E]/90 backdrop-blur-md border border-[#1A2846] text-blue-400 font-bold font-mono text-xs shadow-md">
                  ${product.price.toLocaleString()} {product.currency}
                </div>

                {/* Condition Pill */}
                <div className="absolute top-2.5 end-2.5 px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold backdrop-blur-md">
                  {product.condition === 'new' ? 'جديد' : 'مستعمل'}
                </div>

                {/* Bookmark action */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSaveProduct(product.id);
                  }}
                  className={`absolute bottom-2.5 end-2.5 p-2 rounded-xl backdrop-blur-md transition ${
                    product.isSaved
                      ? 'bg-blue-600 text-white'
                      : 'bg-black/60 text-white/80 hover:text-white'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-1 group-hover:text-blue-400 transition mb-1">
                    {product.title}
                  </h3>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed mb-3">
                    {product.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#1A2846] flex items-center justify-between text-[11px] text-zinc-400">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <img
                      src={product.sellerAvatar}
                      alt={product.sellerName}
                      className="w-5 h-5 rounded-full object-cover shrink-0"
                    />
                    <span className="truncate">{product.sellerName}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 text-zinc-500">
                    <MapPin className="w-3 h-3 text-blue-400" />
                    <span className="truncate max-w-[100px]">{product.location}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Global Product Modals */}
      <ProductDetailsModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
      <AddProductModal />
    </div>
  );
};
