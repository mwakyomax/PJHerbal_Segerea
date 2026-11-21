/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  ShoppingCart,
  User,
  Phone,
  Menu,
  X,
  ChevronDown,
  MapPin,
  ArrowRight,
  ShieldCheck,
  LogOut,
  Home,
  ShoppingBag,
  BookOpen,
  Building2,
  ChevronRight,
  Layers
} from "lucide-react";
import { Product, Category, SiteSettings } from "../types";
import { FirebaseUser } from "../lib/firebase";
import { resolveProductImage, handleImageFallback } from "../lib/clinicMedia";

interface NavigationProps {
  currentPath: string;
  setCurrentPath: (path: string) => void;
  setProductSlug: (slug: string) => void;
  cartCount: number;
  products: Product[];
  currentCategory?: Category | null;
  onSelectCategory: (category: Category | null) => void;
  searchQuery?: string;
  onSearchSubmit?: (query: string) => void;
  siteSettings: SiteSettings;
  authUser: FirebaseUser | null;
  isAdmin: boolean;
  onSignOut: () => void;
}

export default function Navigation({
  currentPath,
  setCurrentPath,
  setProductSlug,
  cartCount,
  products,
  currentCategory = null,
  onSelectCategory,
  searchQuery: initialSearchQuery = "",
  onSearchSubmit,
  siteSettings,
  authUser,
  isAdmin,
  onSignOut
}: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialSearchQuery !== undefined) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const outsideDesktop = !searchContainerRef.current || !searchContainerRef.current.contains(target);
      const outsideMobile = !mobileSearchContainerRef.current || !mobileSearchContainerRef.current.contains(target);
      if (outsideDesktop && outsideMobile) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  const categories: Category[] = [
    "Men's Health",
    "Weight Management",
    "Energy & Immunity",
    "Women's Wellness",
    "Brain & Focus",
    "Detox & Digestion"
  ];

  const filteredProducts = searchQuery.trim()
    ? products.filter((p) => {
        const q = searchQuery.toLowerCase().trim();
        return (
          p.name.toLowerCase().includes(q) ||
          p.shortBenefits.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.ingredients && p.ingredients.some((ing) => ing.toLowerCase().includes(q))) ||
          (p.featuredBenefits && p.featuredBenefits.some((ben) => ben.toLowerCase().includes(q)))
        );
      })
    : [];

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (onSearchSubmit) {
      onSearchSubmit(query);
    }
    onSelectCategory(null);
    setCurrentPath("shop");
    setShowSearchResults(false);
    setMobileMenuOpen(false);
  };

  const handleSearchSelect = (slug: string) => {
    setProductSlug(slug);
    setCurrentPath(`product/${slug}`);
    setShowSearchResults(false);
    setMobileMenuOpen(false);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    if (onSearchSubmit) {
      onSearchSubmit("");
    }
    setShowSearchResults(false);
  };

  const handleCategoryClick = (cat: Category) => {
    onSelectCategory(cat);
    setCurrentPath("shop");
    setCategoriesOpen(false);
    setMobileMenuOpen(false);
  };

  const whatsappUrl = `https://wa.me/255629899017?text=${encodeURIComponent(
    "Hello PJHerbal Segerea! I would like to consult with a supplement specialist regarding my health goals."
  )}`;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-stone-200/90 shadow-xs font-sans w-full">
      {/* Top Announcement Bar (Synced with Firestore SiteSettings) */}
      <div className="bg-emerald-950 text-emerald-100 text-[11px] py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="font-medium tracking-wide truncate">
              {siteSettings.announcementText}
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-[10px] tracking-wide shrink-0">
            <span className="hidden md:inline text-emerald-200">
              Fast Delivery Nationwide
            </span>

            <span className="hidden md:inline text-emerald-600" aria-hidden="true">·</span>

            <a
              href="tel:+255629899017"
              className="inline-flex items-center gap-1 text-emerald-200 hover:text-white font-medium"
            >
              +255 629 899 017
            </a>
          </div>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          {/* 1. Brand Logo */}
          <button
            type="button"
            className="flex items-center gap-2 cursor-pointer shrink-0 text-left"
            onClick={() => {
              setCurrentPath("home");
              onSelectCategory(null);
            }}
            id="nav-logo-btn"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-800 flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-xs border border-amber-400/80 shrink-0">
              PJ
            </div>
            <div className="min-w-0">
              <span className="font-serif text-base sm:text-lg font-black text-emerald-950 tracking-tight leading-none block">
                PJHERBAL
              </span>
              <span className="text-[8px] sm:text-[9px] font-extrabold tracking-widest text-amber-600 block uppercase leading-tight mt-0.5">
                Segerea Branch
              </span>
            </div>
          </button>

          {/* 2. Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-5 shrink-0">
            <button
              type="button"
              onClick={() => {
                setCurrentPath("home");
                onSelectCategory(null);
              }}
              className={`text-xs font-bold tracking-wide transition-colors py-1.5 border-b-2 whitespace-nowrap shrink-0 cursor-pointer ${
                currentPath === "home"
                  ? "border-emerald-800 text-emerald-950"
                  : "border-transparent text-slate-600 hover:text-emerald-900 hover:border-stone-300"
              }`}
              id="nav-home-btn"
            >
              Home
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setCategoriesOpen(!categoriesOpen)}
                onBlur={() => setTimeout(() => setCategoriesOpen(false), 200)}
                className="flex items-center gap-1 text-xs font-bold tracking-wide text-slate-600 hover:text-emerald-900 transition-colors py-1.5 border-b-2 border-transparent hover:border-stone-300 whitespace-nowrap shrink-0 cursor-pointer"
                id="nav-categories-dropdown-btn"
              >
                Categories <ChevronDown className="w-3 h-3" />
              </button>
              {categoriesOpen && (
                <div className="absolute left-0 mt-2 w-60 bg-white rounded-xl shadow-lg border border-stone-200/90 p-1.5 z-50 space-y-0.5">
                  <button
                    type="button"
                    onMouseDown={() => {
                      onSelectCategory(null);
                      setCurrentPath("shop");
                      setCategoriesOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      currentPath === "shop" && currentCategory === null
                        ? "bg-emerald-900 text-white"
                        : "text-slate-700 hover:bg-emerald-50 hover:text-emerald-900"
                    }`}
                  >
                    <span>All Formulations</span>
                    <span className={`text-[11px] tabular-nums ${currentPath === "shop" && currentCategory === null ? "text-emerald-200" : "text-slate-400"}`}>
                      {products.length}
                    </span>
                  </button>
                  {categories.map((cat) => {
                    const count = products.filter((p) => p.category === cat).length;
                    const active = currentPath === "shop" && currentCategory === cat;
                    return (
                      <button
                        type="button"
                        key={cat}
                        onMouseDown={() => handleCategoryClick(cat)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          active
                            ? "bg-emerald-900 text-white"
                            : "text-slate-700 hover:bg-emerald-50 hover:text-emerald-900"
                        }`}
                      >
                        <span>{cat}</span>
                        <span className={`text-[11px] tabular-nums ${active ? "text-emerald-200" : "text-slate-400"}`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setCurrentPath("shop");
                onSelectCategory(null);
              }}
              className={`text-xs font-bold tracking-wide transition-colors py-1.5 border-b-2 whitespace-nowrap shrink-0 cursor-pointer ${
                currentPath === "shop"
                  ? "border-emerald-800 text-emerald-950"
                  : "border-transparent text-slate-600 hover:text-emerald-900 hover:border-stone-300"
              }`}
              id="nav-shop-btn"
            >
              Shop
            </button>

            <button
              type="button"
              onClick={() => setCurrentPath("blog")}
              className={`text-xs font-bold tracking-wide transition-colors py-1.5 border-b-2 whitespace-nowrap shrink-0 cursor-pointer ${
                currentPath === "blog" || currentPath.startsWith("blog/")
                  ? "border-emerald-800 text-emerald-950"
                  : "border-transparent text-slate-600 hover:text-emerald-900 hover:border-stone-300"
              }`}
              id="nav-blog-btn"
            >
              Blog
            </button>

            <button
              type="button"
              onClick={() => setCurrentPath("about")}
              className={`text-xs font-bold tracking-wide transition-colors py-1.5 border-b-2 whitespace-nowrap shrink-0 cursor-pointer ${
                currentPath === "about"
                  ? "border-emerald-800 text-emerald-950"
                  : "border-transparent text-slate-600 hover:text-emerald-900 hover:border-stone-300"
              }`}
              id="nav-about-btn"
            >
              About
            </button>

            <button
              type="button"
              onClick={() => setCurrentPath("contact")}
              className={`text-xs font-bold tracking-wide transition-colors py-1.5 border-b-2 whitespace-nowrap shrink-0 cursor-pointer ${
                currentPath === "contact"
                  ? "border-emerald-800 text-emerald-950"
                  : "border-transparent text-slate-600 hover:text-emerald-900 hover:border-stone-300"
              }`}
              id="nav-contact-btn"
            >
              Contact
            </button>
          </nav>

          {/* 3. Live Product Search Bar (Desktop & Tablet) */}
          <div ref={searchContainerRef} className="hidden md:flex relative flex-1 max-w-xs lg:max-w-sm xl:max-w-xs 2xl:max-w-md mx-2">
            <form onSubmit={handleSearchSubmit} className="relative w-full flex items-center">
              <input
                id="nav-desktop-search-input"
                type="text"
                placeholder="Search Moringa, Prostate, Detox..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchResults(true);
                }}
                onFocus={() => setShowSearchResults(true)}
                className="w-full bg-stone-100/90 border border-stone-200/80 focus:border-emerald-700 focus:bg-white rounded-full py-1.5 sm:py-2 pl-3.5 pr-14 text-xs outline-hidden transition-all duration-200 text-slate-800 placeholder-slate-400"
              />

              <div className="absolute right-1.5 flex items-center gap-0.5">
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
                    title="Clear search"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
                <button
                  id="nav-desktop-search-btn"
                  type="submit"
                  title="Search dispensary"
                  className="p-1 bg-emerald-800 hover:bg-emerald-900 text-white rounded-full transition-all shadow-xs"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

            {showSearchResults && searchQuery.trim() && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-stone-200/90 max-h-96 overflow-y-auto z-50 divide-y divide-stone-100">
                <div className="p-3 bg-stone-50/80 flex justify-between items-center sticky top-0 backdrop-blur-xs z-10">
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                    Matches ({filteredProducts.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowSearchResults(false)}
                    className="text-slate-400 hover:text-slate-700 text-xs font-semibold p-1"
                  >
                    Close
                  </button>
                </div>

                {filteredProducts.length > 0 ? (
                  <>
                    <div className="divide-y divide-stone-100">
                      {filteredProducts.slice(0, 5).map((p) => (
                        <button
                          type="button"
                          key={p.id}
                          onClick={() => handleSearchSelect(p.slug)}
                          className="w-full p-2.5 hover:bg-emerald-50/60 cursor-pointer transition-colors flex gap-2.5 items-center group text-left"
                        >
                          <img
                            src={resolveProductImage(p)}
                            alt={p.name}
                            onError={handleImageFallback}
                            className="w-10 h-10 object-cover rounded-xl border border-stone-200 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-900 truncate">
                              {p.name}
                            </p>
                            <p className="text-[10px] text-slate-500 truncate">
                              {p.category} • {p.shortBenefits}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-xs font-black text-emerald-800 block">
                              {p.price.toLocaleString()} TZS
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSearchSubmit()}
                      className="w-full p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 text-xs font-bold flex items-center justify-between transition-colors text-left"
                    >
                      <span>View all "{searchQuery}" in Shop ({filteredProducts.length})</span>
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-800" />
                    </button>
                  </>
                ) : (
                  <div className="p-5 text-center space-y-2">
                    <p className="text-xs text-slate-600">No supplements found matching "{searchQuery}"</p>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectCategory(null);
                        setCurrentPath("shop");
                        setShowSearchResults(false);
                      }}
                      className="text-xs font-bold text-emerald-800 hover:underline"
                    >
                      Browse Full Dispensary Catalog
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 4. Action Area: WhatsApp + Cart + Customer + Admin */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-white bg-green-600 border border-green-700 rounded-full hover:bg-green-700 active:scale-95 transition-all shadow-xs"
              title="Consult on WhatsApp"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.517 2.266 2.27 3.51 5.284 3.507 8.49-.006 6.66-5.344 11.997-11.957 11.997-2.005-.002-3.973-.502-5.731-1.45L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.413 9.865-9.83.003-2.623-1.01-5.092-2.855-6.941C16.638 1.986 14.168 1.94 11.99 1.94c-5.43 0-9.85 4.414-9.855 9.831-.001 1.748.46 3.454 1.336 4.974l-.99 3.613 3.71-.973zm11.367-7.36c-.32-.16-1.89-.933-2.185-1.043-.294-.11-.508-.16-.723.16-.215.32-.832 1.043-1.02 1.262-.188.218-.376.245-.696.085-.32-.16-1.349-.497-2.57-1.587-.95-.847-1.59-1.893-1.777-2.213-.188-.32-.02-.492.14-.65.144-.143.32-.376.48-.563.16-.188.213-.32.32-.533.107-.213.053-.4-.027-.56-.08-.16-.723-1.74-.99-2.388-.262-.63-.526-.54-.722-.55-.187-.01-.402-.01-.617-.01-.215 0-.565.08-.86.4-.294.32-1.125 1.1-1.125 2.68s1.153 3.11 1.314 3.322c.16.213 2.27 3.466 5.5 4.86 1.444.62 2.296.82 3.14.887.854.067 1.63-.12 2.244-.21.685-.1 1.89-.773 2.156-1.482.267-.71.267-1.317.187-1.442-.08-.125-.294-.205-.615-.365z" />
              </svg>
              <span className="hidden 2xl:inline">Consult WhatsApp</span>
            </a>

            <button
              type="button"
              onClick={() => setCurrentPath("cart")}
              className="relative p-2 text-stone-700 hover:text-emerald-800 hover:bg-stone-100 rounded-full transition-colors shrink-0"
              id="header-cart-btn"
              title="View shopping cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-amber-500 text-white font-extrabold text-[9px] w-4 h-4 rounded-full flex items-center justify-center border border-white">
                  {cartCount}
                </span>
              )}
            </button>

            {(!authUser || !isAdmin) && (
              <button
                type="button"
                onClick={() => setCurrentPath("customer-dashboard")}
                className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                  currentPath === "customer-dashboard"
                    ? "bg-emerald-950 text-white"
                    : "text-stone-700 hover:text-emerald-950 hover:bg-stone-100 border border-stone-200/80"
                }`}
                id="header-customer-btn"
                title={authUser ? `Signed in as ${authUser.email}` : "Patient Portal"}
              >
                <User className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {authUser ? (authUser.displayName?.split(" ")[0] || "Account") : "Customer"}
                </span>
              </button>
            )}

            {(!authUser || isAdmin) && (
              <button
                type="button"
                onClick={() => setCurrentPath("admin")}
                className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-extrabold transition-all shrink-0 ${
                  currentPath === "admin"
                    ? "bg-amber-600 text-white border-amber-700 shadow-xs"
                    : isAdmin
                      ? "bg-emerald-900 text-amber-300 border border-emerald-700 hover:bg-emerald-800"
                      : "bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 hover:border-amber-400 shadow-2xs"
                }`}
                id="header-admin-btn"
                title="Administrator Management Portal"
              >
                <ShieldCheck className={`w-3.5 h-3.5 shrink-0 ${currentPath === "admin" ? "text-white" : isAdmin ? "text-amber-300" : "text-amber-700"}`} />
                <span>Admin</span>
              </button>
            )}

            {authUser && (
              <button
                type="button"
                onClick={onSignOut}
                className="hidden sm:flex p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors shrink-0"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-1.5 sm:p-2 text-slate-700 hover:text-emerald-800 rounded-full hover:bg-slate-100 shrink-0"
              id="header-mobile-menu-btn"
              title="Open menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Left Sidebar Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 xl:hidden flex" role="dialog" aria-modal="true" aria-label="Clinic navigation menu">
          <div
            className="fixed inset-0 bg-emerald-950/45 backdrop-blur-[2px]"
            onClick={() => setMobileMenuOpen(false)}
          />

          <aside className="relative w-80 max-w-[86vw] h-full bg-white border-r border-stone-200 shadow-2xl flex flex-col z-10 text-left">
            {/* Sidebar Header */}
            <div className="px-4 py-3.5 border-b border-stone-200/80 flex items-center justify-between shrink-0 bg-stone-50/70">
              <button
                type="button"
                onClick={() => {
                  setCurrentPath("home");
                  onSelectCategory(null);
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2.5 text-left cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-900 flex items-center justify-center text-white font-bold text-xs border border-amber-400/80 shrink-0">
                  PJ
                </div>
                <div>
                  <span className="font-serif text-base font-black text-emerald-950 leading-none block">
                    PJHERBAL
                  </span>
                  <span className="text-[10px] font-semibold text-amber-700 block mt-0.5">
                    Segerea Branch Menu
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-stone-200/70 transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sidebar Search */}
            <div ref={mobileSearchContainerRef} className="p-3.5 border-b border-stone-100 bg-white shrink-0">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <input
                  id="nav-mobile-search-input"
                  type="text"
                  placeholder="Search Moringa, Prostate, Detox..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchResults(true);
                  }}
                  onFocus={() => setShowSearchResults(true)}
                  className="w-full bg-stone-50 border border-stone-200 focus:border-emerald-700 focus:bg-white rounded-xl py-2 pl-3.5 pr-16 text-xs outline-hidden text-slate-800"
                />
                <div className="absolute right-1.5 flex items-center gap-1">
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="submit"
                    className="p-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg"
                  >
                    <Search className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>

              {showSearchResults && searchQuery.trim() && (
                <div className="mt-2 bg-white rounded-xl border border-stone-200 max-h-56 overflow-y-auto shadow-md divide-y divide-stone-100">
                  {filteredProducts.length > 0 ? (
                    <>
                      <div className="divide-y divide-stone-100">
                        {filteredProducts.slice(0, 4).map((p) => (
                          <button
                            type="button"
                            key={p.id}
                            onClick={() => handleSearchSelect(p.slug)}
                            className="w-full p-2.5 hover:bg-stone-50 flex items-center gap-2.5 text-left cursor-pointer"
                          >
                            <img
                              src={resolveProductImage(p)}
                              alt={p.name}
                              onError={handleImageFallback}
                              className="w-9 h-9 object-cover rounded-lg border border-stone-200 shrink-0"
                              referrerPolicy="no-referrer"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-slate-800 truncate">{p.name}</p>
                              <p className="text-[10px] text-slate-500 truncate">{p.category}</p>
                            </div>
                            <span className="text-xs font-bold text-emerald-800 tabular-nums shrink-0">
                              {p.price.toLocaleString()} TZS
                            </span>
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSearchSubmit()}
                        className="w-full p-2.5 bg-emerald-50 text-emerald-950 text-xs font-bold flex items-center justify-between"
                      >
                        <span>View all results ({filteredProducts.length})</span>
                        <ArrowRight className="w-3.5 h-3.5 text-emerald-800" />
                      </button>
                    </>
                  ) : (
                    <div className="p-3.5 text-center space-y-1.5">
                      <p className="text-xs text-slate-500">No supplements found</p>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectCategory(null);
                          setCurrentPath("shop");
                          setMobileMenuOpen(false);
                        }}
                        className="text-xs font-bold text-emerald-800 underline"
                      >
                        Browse Shop Catalog
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar Vertical Selector Sections */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">
                  Dispensary Navigation
                </p>
                <div className="space-y-1">
                  {[
                    {
                      id: "home",
                      label: "Home",
                      icon: Home,
                      active: currentPath === "home",
                      onClick: () => {
                        setCurrentPath("home");
                        onSelectCategory(null);
                        setMobileMenuOpen(false);
                      }
                    },
                    {
                      id: "shop",
                      label: "Dispensary Shop",
                      icon: ShoppingBag,
                      active: currentPath === "shop" && currentCategory === null,
                      onClick: () => {
                        setCurrentPath("shop");
                        onSelectCategory(null);
                        setMobileMenuOpen(false);
                      }
                    },
                    {
                      id: "blog",
                      label: "Health Blog & Remedies",
                      icon: BookOpen,
                      active: currentPath === "blog" || currentPath.startsWith("blog/"),
                      onClick: () => {
                        setCurrentPath("blog");
                        setMobileMenuOpen(false);
                      }
                    },
                    {
                      id: "about",
                      label: "About Clinic & Specialists",
                      icon: Building2,
                      active: currentPath === "about",
                      onClick: () => {
                        setCurrentPath("about");
                        setMobileMenuOpen(false);
                      }
                    },
                    {
                      id: "contact",
                      label: "Contact & Branch Location",
                      icon: MapPin,
                      active: currentPath === "contact",
                      onClick: () => {
                        setCurrentPath("contact");
                        setMobileMenuOpen(false);
                      }
                    }
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={item.onClick}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                          item.active
                            ? "bg-emerald-900 text-white shadow-xs"
                            : "text-slate-700 hover:bg-stone-100 hover:text-emerald-950"
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <Icon className={`w-4 h-4 shrink-0 ${item.active ? "text-amber-300" : "text-slate-400"}`} />
                          <span>{item.label}</span>
                        </span>
                        <ChevronRight className={`w-3.5 h-3.5 ${item.active ? "text-emerald-200" : "text-slate-300"}`} />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">
                  Category Selector
                </p>
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectCategory(null);
                      setCurrentPath("shop");
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      currentPath === "shop" && currentCategory === null
                        ? "bg-emerald-900 text-white shadow-xs"
                        : "text-slate-700 hover:bg-stone-100 hover:text-emerald-950"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Layers
                        className={`w-4 h-4 shrink-0 ${
                          currentPath === "shop" && currentCategory === null ? "text-amber-300" : "text-slate-400"
                        }`}
                      />
                      <span>All Categories</span>
                    </span>
                    <span
                      className={`text-[11px] tabular-nums ${
                        currentPath === "shop" && currentCategory === null ? "text-emerald-200" : "text-slate-400"
                      }`}
                    >
                      {products.length}
                    </span>
                  </button>

                  {categories.map((cat) => {
                    const count = products.filter((p) => p.category === cat).length;
                    const active = currentPath === "shop" && currentCategory === cat;
                    return (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => handleCategoryClick(cat)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                          active
                            ? "bg-emerald-900 text-white font-semibold shadow-xs"
                            : "text-slate-600 hover:bg-stone-100 hover:text-emerald-950"
                        }`}
                      >
                        <span className="pl-6 truncate">{cat}</span>
                        <span className={`text-[11px] tabular-nums ${active ? "text-emerald-200" : "text-slate-400"}`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </nav>

            {/* Sidebar Footer */}
            <div className="p-3.5 border-t border-stone-200/80 bg-stone-50/80 space-y-2 shrink-0">
              <a
                href="tel:+255629899017"
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white border border-stone-200 text-slate-800 text-xs font-semibold hover:bg-stone-100 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-800" />
                <span>Call +255 629 899 017</span>
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-800 text-white text-xs font-semibold hover:bg-emerald-900 transition-colors"
              >
                <span>Consult via WhatsApp</span>
              </a>
            </div>
          </aside>
        </div>
      )}
    </header>
  );
}
