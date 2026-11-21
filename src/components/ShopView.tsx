/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import {
  Search,
  SlidersHorizontal,
  Star,
  MessageCircle,
  CheckCircle,
  Tag,
  GitCompare,
  X,
  Plus,
  ArrowLeftRight,
  AlertTriangle,
  Heart
} from "lucide-react";
import { Product, Category, PromoCampaign } from "../types";

interface ShopViewProps {
  products: Product[];
  campaigns: PromoCampaign[];
  currentCategory: Category | null;
  onSelectCategory: (category: Category | null) => void;
  setCurrentPath: (path: string) => void;
  setProductSlug: (slug: string) => void;
  onAddToCart: (product: Product, quantity: number) => void;
  wishlistIds: string[];
  onToggleWishlist: (product: Product) => void;
  catalogLoading: boolean;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
}

export default function ShopView({
  products,
  campaigns,
  currentCategory,
  onSelectCategory,
  setCurrentPath,
  setProductSlug,
  onAddToCart,
  wishlistIds,
  onToggleWishlist,
  catalogLoading,
  searchQuery: externalSearchQuery,
  setSearchQuery: externalSetSearchQuery
}: ShopViewProps) {
  const [internalSearchQuery, setInternalSearchQuery] = useState("");
  const searchQuery = externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery;
  const setSearchQuery = externalSetSearchQuery || setInternalSearchQuery;

  const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc" | "rating">("default");
  const [compareList, setCompareList] = useState<Product[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [compareError, setCompareError] = useState<string | null>(null);

  const handleToggleCompare = (product: Product) => {
    const exists = compareList.find((p) => p.id === product.id);
    if (exists) {
      setCompareList((prev) => prev.filter((p) => p.id !== product.id));
      setCompareError(null);
    } else {
      if (compareList.length >= 3) {
        setCompareError("Inawezekana kulinganisha bidhaa hadi tatu tu! (Max 3 supplements can be compared.)");
        setTimeout(() => setCompareError(null), 4000);
        return;
      }
      setCompareList((prev) => [...prev, product]);
      setCompareError(null);
    }
  };

  const isCompared = (productId: string) => compareList.some((p) => p.id === productId);
  const handleRemoveFromCompare = (productId: string) => setCompareList((prev) => prev.filter((p) => p.id !== productId));
  const handleClearCompare = () => setCompareList([]);

  const categories: Category[] = [
    "Men's Health",
    "Weight Management",
    "Energy & Immunity",
    "Women's Wellness",
    "Brain & Focus",
    "Detox & Digestion"
  ];

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (currentCategory) {
      result = result.filter((p) => p.category === currentCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.shortBenefits.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.ingredients && p.ingredients.some((ing) => ing.toLowerCase().includes(q))) ||
          (p.featuredBenefits && p.featuredBenefits.some((ben) => ben.toLowerCase().includes(q)))
      );
    }

    if (sortBy === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [products, currentCategory, searchQuery, sortBy]);

  const getWhatsAppInquiryUrl = (productName: string) => {
    const message = `Mambo PJHerbal! Ningependa kuulizia kuhusu dawa/supplement ya "${productName}". Je, ipo stoo kwa ajili ya kufika kliniki Segerea au kutumiwa?`;
    return `https://wa.me/255629899017?text=${encodeURIComponent(message)}`;
  };

  const handleProductClick = (slug: string) => {
    setProductSlug(slug);
    setCurrentPath(`product/${slug}`);
  };

  const activeCampaign = campaigns.find((c) => c.active);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      <div className="text-left border-b border-slate-100 pb-6 mb-8">
        <h1 className="text-3xl font-serif font-bold text-emerald-950">Nutritional Supplements Dispensary</h1>
        <p className="text-slate-500 text-sm mt-1">
          Explore our certified range of pharmaceutical-grade, organic herbal formulations for perfect health.
        </p>
      </div>

      {/* Category Quick Filter Pills */}
      <div className="flex flex-wrap gap-2 mb-6 text-left">
        <button
          type="button"
          onClick={() => onSelectCategory(null)}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors border ${
            currentCategory === null
              ? "bg-emerald-900 text-white border-emerald-900"
              : "bg-white text-slate-600 border-slate-200 hover:border-emerald-600"
          }`}
        >
          All Categories ({products.length})
        </button>
        {categories.map((cat) => (
          <button
            type="button"
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors border ${
              currentCategory === cat
                ? "bg-emerald-900 text-white border-emerald-900"
                : "bg-white text-slate-600 border-slate-200 hover:border-emerald-600"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Live Promotion Banner */}
      {activeCampaign && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-8 flex flex-col md:flex-row justify-between items-center gap-4 text-left">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 rounded-xl text-amber-800">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-amber-900">
                Save {activeCampaign.discountPercentage}% — {activeCampaign.description}
              </h4>
              <p className="text-xs text-amber-700 font-light">
                Apply coupon code{" "}
                <span className="font-mono font-bold bg-amber-200 px-1.5 py-0.5 rounded-sm">
                  {activeCampaign.code}
                </span>{" "}
                at checkout.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-amber-700 bg-amber-200/50 px-2.5 py-1 rounded-full uppercase">
              Active Campaign
            </span>
          </div>
        </div>
      )}

      <main className="space-y-6">
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:max-w-xs flex items-center">
            <input
              id="shop-search-input"
              type="text"
              placeholder="Search within dispensary..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-3 pr-14 text-xs outline-hidden focus:border-emerald-700 focus:bg-white text-slate-800"
            />
            <div className="absolute right-2.5 flex items-center gap-1">
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <Search className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
            <span className="text-xs text-slate-500 shrink-0">
              Showing <strong className="text-slate-800">{filteredProducts.length}</strong> products
            </span>

            <div className="flex items-center gap-2 shrink-0">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "default" | "price-asc" | "price-desc" | "rating")}
                className="bg-slate-50 border border-slate-200 text-xs font-medium rounded-lg px-2.5 py-1.5 outline-hidden text-slate-700 cursor-pointer focus:border-emerald-700"
              >
                <option value="default">Default Sort</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>
        </div>

        {catalogLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white border border-slate-100 rounded-2xl h-96 animate-pulse" />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const isWishlisted = wishlistIds.includes(product.id);
              const outOfStock = product.stock <= 0;

              return (
                <div
                  key={product.id}
                  className="bg-white border border-slate-100 hover:border-emerald-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col group h-full text-left"
                >
                  <div
                    onClick={() => handleProductClick(product.slug)}
                    className="relative aspect-square overflow-hidden cursor-pointer bg-slate-50"
                  >
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    {product.isBestSeller && (
                      <span className="absolute top-3 left-3 bg-amber-400 text-emerald-950 font-bold text-[9px] px-2 py-0.5 rounded-sm uppercase tracking-wider">
                        Best Seller
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleWishlist(product);
                      }}
                      title={isWishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
                      className={`absolute top-3 right-3 p-2 rounded-full shadow-xs transition-all cursor-pointer ${
                        isWishlisted
                          ? "bg-rose-500 text-white"
                          : "bg-white/90 text-slate-600 hover:text-rose-500"
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isWishlisted ? "fill-current" : ""}`} />
                    </button>
                    <span className="absolute bottom-3 left-3 bg-emerald-950/85 text-emerald-300 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider backdrop-blur-xs">
                      {product.category}
                    </span>
                    <span
                      className={`absolute bottom-3 right-3 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase ${
                        outOfStock
                          ? "bg-rose-600 text-white"
                          : product.stock <= 5
                            ? "bg-amber-500 text-emerald-950"
                            : "bg-white/90 text-emerald-900"
                      }`}
                    >
                      {outOfStock ? "Out of Stock" : `${product.stock} in stock`}
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-slate-400 font-bold uppercase">{product.category}</span>
                          <span className="text-[10px] text-slate-300">•</span>
                          <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                            <CheckCircle className="w-2.5 h-2.5" /> Clinical
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleCompare(product);
                          }}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider border transition-all select-none ${
                            isCompared(product.id)
                              ? "bg-amber-400 text-emerald-950 border-amber-300"
                              : "bg-stone-50 text-slate-500 border-stone-200/60 hover:bg-emerald-50 hover:text-emerald-900 hover:border-emerald-100"
                          }`}
                        >
                          <GitCompare className="w-2.5 h-2.5" />
                          <span>{isCompared(product.id) ? "Added" : "Compare"}</span>
                        </button>
                      </div>

                      <h3
                        onClick={() => handleProductClick(product.slug)}
                        className="font-bold text-base text-slate-800 hover:text-emerald-800 transition-colors cursor-pointer line-clamp-1"
                      >
                        {product.name}
                      </h3>

                      <p className="text-xs text-slate-500 line-clamp-2 min-h-[32px] font-light leading-relaxed">
                        {product.shortBenefits}
                      </p>

                      <div className="flex items-center gap-1.5">
                        <div className="flex text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? "fill-current" : "text-slate-200"}`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] font-bold text-slate-500">({product.reviewsCount})</span>
                      </div>

                      <div className="pt-1.5 flex items-baseline gap-1.5">
                        <span className="text-base font-extrabold text-emerald-900">
                          {product.price.toLocaleString()} TZS
                        </span>
                        {product.originalPrice && (
                          <span className="text-xs text-slate-400 line-through">
                            {product.originalPrice.toLocaleString()} TZS
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        disabled={outOfStock}
                        onClick={() => onAddToCart(product, 1)}
                        className={`py-2 px-1.5 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1 ${
                          outOfStock
                            ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                            : "bg-emerald-800 hover:bg-emerald-700 active:scale-95 text-white cursor-pointer"
                        }`}
                      >
                        {outOfStock ? "Out of Stock" : "Add To Cart"}
                      </button>
                      <a
                        href={getWhatsAppInquiryUrl(product.name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2 px-1.5 rounded-lg bg-green-600 hover:bg-green-500 active:scale-95 text-white font-bold text-xs transition-all flex items-center justify-center gap-1"
                      >
                        <MessageCircle className="w-3.5 h-3.5 fill-current" />
                        Inquire
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center text-slate-500 max-w-md mx-auto space-y-4">
            <p className="text-sm font-semibold">
              {products.length === 0
                ? "The dispensary catalog is currently empty."
                : "No supplements match your exact filter guidelines."}
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                onSelectCategory(null);
              }}
              className="px-4 py-2 bg-emerald-800 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </main>

      {/* STICKY BOTTOM COMPARE DRAWER */}
      {compareList.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4">
          <div className="bg-emerald-950 text-white rounded-3xl p-4 shadow-xl border border-emerald-900 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
              <div className="text-left shrink-0">
                <div className="flex items-center gap-1.5">
                  <GitCompare className="w-4 h-4 text-amber-400" />
                  <span className="font-extrabold text-sm text-white">Compare Supplements</span>
                </div>
                <p className="text-[10px] text-emerald-300 font-medium">{compareList.length} of 3 selected</p>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto py-1">
                {compareList.map((item) => (
                  <div key={item.id} className="relative group shrink-0">
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      className="w-10 h-10 object-cover rounded-xl border border-emerald-800 bg-white"
                      referrerPolicy="no-referrer"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveFromCompare(item.id)}
                      className="absolute -top-1.5 -right-1.5 bg-rose-600 hover:bg-rose-500 text-white p-0.5 rounded-full shadow-xs transition-colors"
                      title="Remove"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {Array.from({ length: 3 - compareList.length }).map((_, idx) => (
                  <div
                    key={idx}
                    className="w-10 h-10 rounded-xl border-2 border-dashed border-emerald-800/60 flex items-center justify-center text-emerald-500 text-xs font-bold"
                    title="Select another product to compare"
                  >
                    +
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <button
                type="button"
                onClick={handleClearCompare}
                className="px-3 py-2 text-xs font-bold text-emerald-300 hover:text-white transition-colors"
              >
                Clear All
              </button>

              <button
                type="button"
                onClick={() => setShowCompareModal(true)}
                disabled={compareList.length < 2}
                className={`px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                  compareList.length < 2
                    ? "bg-emerald-900/60 text-emerald-600 cursor-not-allowed border border-emerald-900"
                    : "bg-amber-500 hover:bg-amber-600 text-emerald-950 border border-amber-400 shadow-md active:scale-95"
                }`}
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span>Compare Now</span>
              </button>
            </div>
          </div>

          {compareError && (
            <div className="mt-2 bg-red-600 text-white text-[11px] font-bold py-1.5 px-4 rounded-xl shadow-md text-center">
              {compareError}
            </div>
          )}
        </div>
      )}

      {/* COMPARISON MODAL OVERLAY */}
      {showCompareModal && (
        <div className="fixed inset-0 bg-emerald-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl border border-stone-200/80 flex flex-col max-h-[90vh] overflow-hidden text-slate-800">
            <div className="p-6 bg-stone-50 border-b border-stone-200/80 flex items-center justify-between shrink-0 text-left">
              <div>
                <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-widest block mb-0.5">
                  PJHERBAL DISPENSARY ANALYTICS
                </span>
                <h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                  <GitCompare className="w-5 h-5 text-emerald-800" /> Supplement Comparison Portal
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCompareModal(false)}
                className="p-2 rounded-full hover:bg-stone-200 text-slate-400 hover:text-slate-700 transition-colors"
                title="Close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6">
              <div className="min-w-[650px]">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-stone-200">
                      <th className="w-1/4 p-4 text-left font-extrabold text-xs text-slate-400 uppercase tracking-wider bg-stone-50 rounded-tl-2xl">
                        Supplement Profile
                      </th>
                      {compareList.map((product) => (
                        <th key={product.id} className="p-4 text-left w-1/4 relative group bg-stone-50 last:rounded-tr-2xl">
                          <button
                            type="button"
                            onClick={() => handleRemoveFromCompare(product.id)}
                            className="absolute top-2 right-2 bg-stone-200 hover:bg-rose-100 hover:text-rose-600 text-slate-500 p-1 rounded-full transition-colors"
                            title="Remove from comparison"
                          >
                            <X className="w-3 h-3" />
                          </button>

                          <div className="space-y-3 text-center">
                            <div className="aspect-square w-24 h-24 mx-auto rounded-2xl overflow-hidden bg-white border border-stone-200/80">
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <div>
                              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">
                                {product.category}
                              </span>
                              <h4 className="font-extrabold text-sm text-slate-800 mt-2 line-clamp-2 min-h-[40px] leading-snug">
                                {product.name}
                              </h4>
                            </div>
                          </div>
                        </th>
                      ))}

                      {Array.from({ length: 3 - compareList.length }).map((_, idx) => (
                        <th
                          key={idx}
                          className="p-4 text-slate-300 text-xs font-light text-center border-dashed border-l border-stone-100 bg-stone-50/40"
                        >
                          <div className="flex flex-col items-center justify-center py-8">
                            <Plus className="w-6 h-6 text-stone-300 mb-1" />
                            <span className="font-semibold text-[10px] uppercase tracking-wider text-stone-400">
                              Add supplement
                            </span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-stone-100 text-xs text-left">
                    <tr>
                      <td className="p-4 font-extrabold text-slate-700 uppercase tracking-wide bg-stone-50/50">Price (TZS)</td>
                      {compareList.map((product) => (
                        <td key={product.id} className="p-4 font-extrabold text-sm text-emerald-900">
                          <div>{product.price.toLocaleString()} TZS</div>
                          {product.originalPrice && (
                            <span className="text-[10px] text-slate-400 line-through font-normal">
                              {product.originalPrice.toLocaleString()} TZS
                            </span>
                          )}
                        </td>
                      ))}
                      {Array.from({ length: 3 - compareList.length }).map((_, idx) => (
                        <td key={idx} className="p-4 bg-stone-50/10" />
                      ))}
                    </tr>

                    <tr>
                      <td className="p-4 font-extrabold text-slate-700 uppercase tracking-wide bg-stone-50/50">
                        Patient Rating
                      </td>
                      {compareList.map((product) => (
                        <td key={product.id} className="p-4">
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span className="font-extrabold">{product.rating}</span>
                            <span className="text-slate-400">({product.reviewsCount} reviews)</span>
                          </div>
                        </td>
                      ))}
                      {Array.from({ length: 3 - compareList.length }).map((_, idx) => (
                        <td key={idx} className="p-4 bg-stone-50/10" />
                      ))}
                    </tr>

                    <tr>
                      <td className="p-4 font-extrabold text-slate-700 uppercase tracking-wide bg-stone-50/50">
                        Key Benefits
                      </td>
                      {compareList.map((product) => (
                        <td key={product.id} className="p-4 align-top">
                          <ul className="space-y-1.5 list-disc pl-4 text-slate-600 font-light leading-relaxed">
                            {product.benefits.map((benefit, i) => (
                              <li key={i}>{benefit}</li>
                            ))}
                          </ul>
                        </td>
                      ))}
                      {Array.from({ length: 3 - compareList.length }).map((_, idx) => (
                        <td key={idx} className="p-4 bg-stone-50/10" />
                      ))}
                    </tr>

                    <tr>
                      <td className="p-4 font-extrabold text-slate-700 uppercase tracking-wide bg-stone-50/50">
                        Active Ingredients
                      </td>
                      {compareList.map((product) => (
                        <td key={product.id} className="p-4 align-top">
                          <div className="flex flex-wrap gap-1">
                            {product.ingredients.map((ing, i) => (
                              <span
                                key={i}
                                className="text-[10px] bg-stone-100 text-slate-700 px-2.5 py-1 rounded-full font-bold border border-stone-200/50"
                              >
                                {ing}
                              </span>
                            ))}
                          </div>
                        </td>
                      ))}
                      {Array.from({ length: 3 - compareList.length }).map((_, idx) => (
                        <td key={idx} className="p-4 bg-stone-50/10" />
                      ))}
                    </tr>

                    <tr>
                      <td className="p-4 font-extrabold text-slate-700 uppercase tracking-wide bg-stone-50/50">
                        Dosage & Usage
                      </td>
                      {compareList.map((product) => (
                        <td key={product.id} className="p-4 align-top text-slate-600 leading-relaxed font-light">
                          {product.usageInstructions}
                        </td>
                      ))}
                      {Array.from({ length: 3 - compareList.length }).map((_, idx) => (
                        <td key={idx} className="p-4 bg-stone-50/10" />
                      ))}
                    </tr>

                    <tr>
                      <td className="p-4 font-extrabold text-slate-700 uppercase tracking-wide bg-stone-50/50">
                        Safety Warnings
                      </td>
                      {compareList.map((product) => (
                        <td key={product.id} className="p-4 align-top">
                          <div className="space-y-1 bg-red-50/50 border border-red-100 p-3 rounded-2xl">
                            {product.warnings.map((warn, i) => (
                              <div key={i} className="text-red-700 text-[11px] font-medium leading-relaxed flex items-start gap-1">
                                <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                                <span>{warn}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                      ))}
                      {Array.from({ length: 3 - compareList.length }).map((_, idx) => (
                        <td key={idx} className="p-4 bg-stone-50/10" />
                      ))}
                    </tr>

                    <tr>
                      <td className="p-4 font-extrabold text-slate-700 uppercase tracking-wide bg-stone-50/50 rounded-bl-2xl">
                        Purchase / Inquiry
                      </td>
                      {compareList.map((product) => (
                        <td key={product.id} className="p-4">
                          <div className="flex flex-col gap-2">
                            <button
                              type="button"
                              disabled={product.stock <= 0}
                              onClick={() => {
                                onAddToCart(product, 1);
                                setShowCompareModal(false);
                              }}
                              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 disabled:text-slate-500 text-emerald-950 font-extrabold transition-all border border-amber-400 text-center text-xs"
                            >
                              {product.stock <= 0 ? "Out of Stock" : "Add to Cart"}
                            </button>
                            <a
                              href={getWhatsAppInquiryUrl(product.name)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold transition-all border border-emerald-900 text-center text-xs flex items-center justify-center gap-1"
                            >
                              <MessageCircle className="w-3.5 h-3.5 fill-current" />
                              WhatsApp Inquire
                            </a>
                          </div>
                        </td>
                      ))}
                      {Array.from({ length: 3 - compareList.length }).map((_, idx) => (
                        <td key={idx} className="p-4 bg-stone-50/10 last:rounded-br-2xl" />
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-5 bg-stone-50 border-t border-stone-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
              <p className="text-[11px] text-slate-400 font-medium text-left">
                * Supplements are traditional health formulations clinically checked. Consult a medical specialist for personalized guidance.
              </p>
              <button
                type="button"
                onClick={() => setShowCompareModal(false)}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-all"
              >
                Close Portal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
