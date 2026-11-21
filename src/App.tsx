/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import { Phone, Mail, MapPin, Instagram, Facebook, Send, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import {
  Product,
  CartItem,
  Order,
  PromoCampaign,
  Category,
  OrderStatus,
  DeliveryStep,
  Review,
  BlogArticle,
  SiteSettings,
  UserProfile
} from "./types";
import {
  auth,
  onAuthStateChanged,
  signInWithGoogle,
  signOut,
  isUserAdmin,
  FirebaseUser
} from "./lib/firebase";
import {
  DEFAULT_SITE_SETTINGS,
  subscribeProducts,
  subscribeBlogs,
  subscribeCampaigns,
  subscribeSiteSettings,
  subscribeUserProfile,
  subscribeOrders,
  ensureUserProfile,
  updateUserProfileFields,
  createOrderDoc,
  cancelPendingOrderDoc,
  addReviewDoc,
  submitContactMessageDoc,
  subscribeNewsletterDoc,
  saveProductDoc,
  updateProductStockDoc,
  deleteProductDoc,
  updateOrderAdminDoc,
  createCampaignDoc,
  toggleCampaignDoc,
  deleteCampaignDoc,
  createBlogDoc,
  deleteBlogDoc,
  saveSiteSettingsDoc,
  seedInitialClinicCatalog,
  refreshAllPublicCollections
} from "./lib/firestoreService";

// Core Components
import Navigation from "./components/Navigation";
import HomeView from "./components/HomeView";
import ShopView from "./components/ShopView";
import ProductDetailView from "./components/ProductDetailView";
import CartView from "./components/CartView";
import CheckoutView from "./components/CheckoutView";
import OrderSuccessView from "./components/OrderSuccessView";
import CustomerDashboardView from "./components/CustomerDashboardView";
import AdminDashboardView from "./components/AdminDashboardView";

// Static Content Views
import {
  AboutView,
  ContactView,
  BlogListView,
  BlogDetailView,
  PrivacyPolicyView,
  TermsOfServiceView
} from "./components/StaticViews";

export default function App() {
  // Firebase Authentication & Profile
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const isAdmin = useMemo(() => isUserAdmin(authUser), [authUser]);

  // Live Firestore Public Collections
  const [products, setProducts] = useState<Product[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [blogs, setBlogs] = useState<BlogArticle[]>([]);
  const [campaigns, setCampaigns] = useState<PromoCampaign[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);

  // Live Authenticated Orders
  const [orders, setOrders] = useState<Order[]>([]);
  const [latestPlacedOrderId, setLatestPlacedOrderId] = useState<string | null>(null);

  // Transient Browser Session State (Cart, Coupon, Guest Wishlist)
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("pjh_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [couponCode, setCouponCode] = useState<string>(() => {
    return localStorage.getItem("pjh_coupon") || "";
  });
  const [guestWishlistIds, setGuestWishlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("pjh_guest_wishlist_ids");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Routing & Filters
  const [selectedRegion, setSelectedRegion] = useState("Dar es Salaam");
  const [currentPath, setCurrentPath] = useState("home");
  const [productSlug, setProductSlug] = useState("");
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Newsletter State
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubmitting, setNewsletterSubmitting] = useState(false);
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [newsletterError, setNewsletterError] = useState("");

  // -----------------------------------------
  // FIREBASE AUTH & FIRESTORE SUBSCRIPTIONS
  // -----------------------------------------
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      setAuthUser(user);
      setAuthReady(true);
      if (user && user.email) {
        try {
          await ensureUserProfile(user.uid, user.email, user.displayName);
        } catch (err) {
          console.error("Failed to initialize user profile:", err);
        }
      } else {
        setUserProfile(null);
        setOrders([]);
      }
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    const unsubProducts = subscribeProducts(
      (list) => {
        setProducts(list);
        setCatalogLoading(false);
      },
      () => setCatalogLoading(false)
    );
    const unsubBlogs = subscribeBlogs(setBlogs);
    const unsubCampaigns = subscribeCampaigns(setCampaigns);
    const unsubSettings = subscribeSiteSettings(setSiteSettings);

    return () => {
      unsubProducts();
      unsubBlogs();
      unsubCampaigns();
      unsubSettings();
    };
  }, []);

  useEffect(() => {
    if (!authUser) {
      setUserProfile(null);
      setOrders([]);
      return;
    }

    const unsubProfile = subscribeUserProfile(authUser.uid, setUserProfile);
    const unsubOrders = subscribeOrders(authUser.uid, isAdmin, setOrders);

    return () => {
      unsubProfile();
      unsubOrders();
    };
  }, [authUser, isAdmin]);

  // Persist transient cart/coupon/guest wishlist
  useEffect(() => {
    localStorage.setItem("pjh_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("pjh_coupon", couponCode);
  }, [couponCode]);

  useEffect(() => {
    localStorage.setItem("pjh_guest_wishlist_ids", JSON.stringify(guestWishlistIds));
  }, [guestWishlistIds]);

  // Keep cart items synchronized against live Firestore product prices and stock
  useEffect(() => {
    if (catalogLoading || products.length === 0) return;
    setCart((prev) => {
      let changed = false;
      const synced: CartItem[] = [];
      for (const item of prev) {
        const live = products.find((p) => p.id === item.product.id);
        if (!live || live.stock <= 0) {
          changed = true;
          continue;
        }
        const cappedQty = Math.min(item.quantity, live.stock);
        if (
          cappedQty !== item.quantity ||
          live.price !== item.product.price ||
          live.stock !== item.product.stock ||
          live.name !== item.product.name
        ) {
          changed = true;
        }
        synced.push({ product: live, quantity: cappedQty });
      }
      return changed ? synced : prev;
    });
  }, [products, catalogLoading]);

  // Scroll to top on view transitions
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPath, productSlug]);

  // Effective wishlist IDs & objects
  const wishlistIds = useMemo(() => {
    if (authUser && userProfile) {
      return userProfile.wishlistIds || [];
    }
    return guestWishlistIds;
  }, [authUser, userProfile, guestWishlistIds]);

  const wishlist = useMemo(
    () => products.filter((p) => wishlistIds.includes(p.id)),
    [products, wishlistIds]
  );

  // -----------------------------------------
  // AUTH ACTIONS
  // -----------------------------------------
  const handleSignInWithGoogle = async (): Promise<FirebaseUser | null> => {
    try {
      const cred = await signInWithGoogle();
      if (cred.user && cred.user.email) {
        await ensureUserProfile(cred.user.uid, cred.user.email, cred.user.displayName);
      }
      return cred.user;
    } catch (err) {
      console.error("Google sign-in error:", err);
      throw err;
    }
  };

  const handleSignOut = async (): Promise<void> => {
    await signOut(auth);
    setUserProfile(null);
    setOrders([]);
    setCurrentPath("home");
  };

  // -----------------------------------------
  // STOREFRONT & PATIENT ACTIONS
  // -----------------------------------------
  const handleAddToCart = (product: Product, quantity: number) => {
    if (product.stock <= 0) return;
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        const nextQty = Math.min(product.stock, existing.quantity + quantity);
        return prevCart.map((item) =>
          item.product.id === product.id ? { product, quantity: nextQty } : item
        );
      }
      return [...prevCart, { product, quantity: Math.min(product.stock, quantity) }];
    });
    setCurrentPath("cart");
  };

  const handleBuyNow = (product: Product, quantity: number) => {
    if (product.stock <= 0) return;
    setCart([{ product, quantity: Math.min(product.stock, quantity) }]);
    setCurrentPath("checkout");
  };

  const handleUpdateQty = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id !== productId) return item;
        return { ...item, quantity: Math.min(item.product.stock, quantity) };
      })
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleToggleWishlist = async (product: Product) => {
    const exists = wishlistIds.includes(product.id);
    const nextIds = exists
      ? wishlistIds.filter((id) => id !== product.id)
      : [...wishlistIds, product.id].slice(0, 50);

    if (authUser) {
      await updateUserProfileFields(authUser.uid, { wishlistIds: nextIds });
    } else {
      setGuestWishlistIds(nextIds);
    }
  };

  const handleRemoveFromWishlist = (product: Product) => {
    const nextIds = wishlistIds.filter((id) => id !== product.id);
    if (authUser) {
      updateUserProfileFields(authUser.uid, { wishlistIds: nextIds }).catch(console.error);
    } else {
      setGuestWishlistIds(nextIds);
    }
  };

  const handlePlaceOrder = async (
    orderInput: Omit<Order, "userId" | "createdAt" | "updatedAt">
  ): Promise<void> => {
    await createOrderDoc(orderInput);
    setLatestPlacedOrderId(orderInput.id);
    setCart([]);
    setCouponCode("");
  };

  const handleCancelOrder = async (order: Order): Promise<void> => {
    await cancelPendingOrderDoc(order);
  };

  const handleAddReview = async (
    productId: string,
    review: Omit<Review, "productId" | "userId" | "createdAt">
  ): Promise<void> => {
    await addReviewDoc(productId, review);
  };

  const handleUpdateProfile = async (
    updates: Partial<Pick<UserProfile, "name" | "phone" | "region" | "district" | "address">>
  ): Promise<void> => {
    if (!authUser) throw new Error("Sign in required to update profile.");
    await updateUserProfileFields(authUser.uid, updates);
  };

  const handleReorder = (order: Order) => {
    const itemsToAdd: CartItem[] = [];
    order.items.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId && p.stock > 0);
      if (prod) {
        itemsToAdd.push({ product: prod, quantity: Math.min(prod.stock, item.quantity) });
      }
    });

    if (itemsToAdd.length > 0) {
      setCart((prev) => {
        const updated = [...prev];
        itemsToAdd.forEach((newItem) => {
          const existing = updated.find((x) => x.product.id === newItem.product.id);
          if (existing) {
            existing.quantity = Math.min(
              newItem.product.stock,
              existing.quantity + newItem.quantity
            );
          } else {
            updated.push(newItem);
          }
        });
        return updated;
      });
      setCurrentPath("cart");
    }
  };

  const handleSubmitContactMessage = async (
    name: string,
    email: string,
    message: string
  ): Promise<void> => {
    await submitContactMessageDoc(name, email, message);
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewsletterError("");
    const cleanEmail = newsletterEmail.trim();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setNewsletterError("Enter a valid email address.");
      return;
    }

    setNewsletterSubmitting(true);
    try {
      let currentUser = authUser;
      if (!currentUser) {
        currentUser = await handleSignInWithGoogle();
      }
      if (!currentUser) {
        setNewsletterError("Google sign-in is required to verify newsletter subscriptions.");
        return;
      }
      await subscribeNewsletterDoc(cleanEmail);
      setNewsletterSubscribed(true);
      setNewsletterEmail("");
      setTimeout(() => setNewsletterSubscribed(false), 6000);
    } catch (err) {
      setNewsletterError(
        err instanceof Error ? err.message : "Could not save subscription. Please try again."
      );
    } finally {
      setNewsletterSubmitting(false);
    }
  };

  // -----------------------------------------
  // ADMIN MUTATIONS (FIRESTORE)
  // -----------------------------------------
  const handleUpdateStock = async (productId: string, newStock: number) => {
    await updateProductStockDoc(productId, newStock);
  };

  const handleDeleteProduct = async (productId: string) => {
    await deleteProductDoc(productId);
  };

  const handleUpdateOrderAdmin = async (
    orderId: string,
    updates: {
      status?: OrderStatus;
      paymentStatus?: "Pending" | "Paid" | "Failed";
      deliveryCourier?: string;
      courierPhone?: string;
      trackingNumber?: string;
      deliveryStep?: DeliveryStep;
      trackingLogs?: Order["trackingLogs"];
    }
  ) => {
    await updateOrderAdminDoc(orderId, updates);
  };

  const handleAddProduct = async (product: Product) => {
    await saveProductDoc(product, true);
  };

  const handleAddCampaign = async (campaign: PromoCampaign) => {
    await createCampaignDoc(campaign);
  };

  const handleToggleCampaign = async (campaignId: string, active: boolean) => {
    await toggleCampaignDoc(campaignId, active);
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    await deleteCampaignDoc(campaignId);
  };

  const handleAddBlog = async (blog: BlogArticle) => {
    await createBlogDoc(blog);
  };

  const handleDeleteBlog = async (blogId: string) => {
    await deleteBlogDoc(blogId);
  };

  const handleSaveSiteSettings = async (settings: Omit<SiteSettings, "updatedAt">) => {
    await saveSiteSettingsDoc(settings);
  };

  const handleRefreshData = async () => {
    const fresh = await refreshAllPublicCollections();
    setProducts(fresh.products);
    setBlogs(fresh.blogs);
    setCampaigns(fresh.campaigns);
  };

  // -----------------------------------------
  // VIEW ROUTER
  // -----------------------------------------
  const renderActiveView = () => {
    if (currentPath === "home") {
      return (
        <HomeView
          products={products}
          blogs={blogs}
          siteSettings={siteSettings}
          catalogLoading={catalogLoading}
          wishlistIds={wishlistIds}
          onToggleWishlist={handleToggleWishlist}
          setCurrentPath={setCurrentPath}
          setProductSlug={setProductSlug}
          onAddToCart={handleAddToCart}
          onSelectCategory={setCurrentCategory}
        />
      );
    }

    if (currentPath === "shop") {
      return (
        <ShopView
          products={products}
          campaigns={campaigns}
          currentCategory={currentCategory}
          onSelectCategory={setCurrentCategory}
          setCurrentPath={setCurrentPath}
          setProductSlug={setProductSlug}
          onAddToCart={handleAddToCart}
          wishlistIds={wishlistIds}
          onToggleWishlist={handleToggleWishlist}
          catalogLoading={catalogLoading}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      );
    }

    if (currentPath === "cart") {
      return (
        <CartView
          cartItems={cart}
          couponCode={couponCode}
          setCouponCode={setCouponCode}
          selectedRegion={selectedRegion}
          setSelectedRegion={setSelectedRegion}
          onUpdateQty={handleUpdateQty}
          onRemoveItem={handleRemoveCartItem}
          onClearCart={handleClearCart}
          setCurrentPath={setCurrentPath}
          availableCampaigns={campaigns}
        />
      );
    }

    if (currentPath === "checkout") {
      return (
        <CheckoutView
          cartItems={cart}
          couponCode={couponCode}
          selectedRegion={selectedRegion}
          setSelectedRegion={setSelectedRegion}
          availableCampaigns={campaigns}
          onPlaceOrder={handlePlaceOrder}
          onUpdateProfile={handleUpdateProfile}
          setCurrentPath={setCurrentPath}
          authUser={authUser}
          userProfile={userProfile}
          onSignInWithGoogle={handleSignInWithGoogle}
        />
      );
    }

    if (currentPath === "order-success") {
      const latestOrder =
        orders.find((o) => o.id === latestPlacedOrderId) || orders[0] || null;
      return <OrderSuccessView latestOrder={latestOrder} setCurrentPath={setCurrentPath} />;
    }

    if (currentPath === "customer-dashboard") {
      return (
        <CustomerDashboardView
          authUser={authUser}
          authReady={authReady}
          userProfile={userProfile}
          products={products}
          orders={orders}
          wishlist={wishlist}
          onSignInWithGoogle={handleSignInWithGoogle}
          onSignOut={handleSignOut}
          onUpdateProfile={handleUpdateProfile}
          onCancelOrder={handleCancelOrder}
          onRemoveFromWishlist={handleRemoveFromWishlist}
          onAddToCart={handleAddToCart}
          onReorder={handleReorder}
          setCurrentPath={setCurrentPath}
          setProductSlug={setProductSlug}
        />
      );
    }

    if (currentPath === "admin") {
      return (
        <AdminDashboardView
          authUser={authUser}
          authReady={authReady}
          isAdmin={isAdmin}
          onSignInWithGoogle={async () => {
            await handleSignInWithGoogle();
          }}
          onSignOut={handleSignOut}
          products={products}
          orders={orders}
          campaigns={campaigns}
          blogs={blogs}
          siteSettings={siteSettings}
          onUpdateStock={handleUpdateStock}
          onDeleteProduct={handleDeleteProduct}
          onUpdateOrderAdmin={handleUpdateOrderAdmin}
          onAddProduct={handleAddProduct}
          onAddCampaign={handleAddCampaign}
          onToggleCampaign={handleToggleCampaign}
          onDeleteCampaign={handleDeleteCampaign}
          onAddBlog={handleAddBlog}
          onDeleteBlog={handleDeleteBlog}
          onSaveSiteSettings={handleSaveSiteSettings}
          onSeedCatalog={seedInitialClinicCatalog}
          onRefreshData={handleRefreshData}
        />
      );
    }

    if (currentPath === "about") {
      return <AboutView setCurrentPath={setCurrentPath} />;
    }

    if (currentPath === "contact") {
      return (
        <ContactView
          authUser={authUser}
          onSignInWithGoogle={handleSignInWithGoogle}
          onSubmitMessage={handleSubmitContactMessage}
        />
      );
    }

    if (currentPath === "blog") {
      return (
        <BlogListView
          blogs={blogs}
          setCurrentPath={setCurrentPath}
          setProductSlug={setProductSlug}
        />
      );
    }

    if (currentPath === "privacy-policy") {
      return <PrivacyPolicyView />;
    }

    if (currentPath === "terms") {
      return <TermsOfServiceView />;
    }

    if (currentPath.startsWith("product/")) {
      const slug = currentPath.split("/")[1];
      const selectedProduct = products.find((p) => p.slug === slug);
      if (selectedProduct) {
        const related = products.filter(
          (p) => p.category === selectedProduct.category && p.id !== selectedProduct.id
        );
        return (
          <ProductDetailView
            product={selectedProduct}
            relatedProducts={related}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            setCurrentPath={setCurrentPath}
            setProductSlug={setProductSlug}
            onAddReview={handleAddReview}
            wishlistIds={wishlistIds}
            onToggleWishlist={handleToggleWishlist}
            authUser={authUser}
            onSignInWithGoogle={handleSignInWithGoogle}
          />
        );
      }
    }

    if (currentPath.startsWith("blog/")) {
      const slug = currentPath.split("/")[1];
      const selectedArticle = blogs.find((a) => a.slug === slug);
      if (selectedArticle) {
        return (
          <BlogDetailView
            article={selectedArticle}
            products={products}
            setCurrentPath={setCurrentPath}
            setProductSlug={setProductSlug}
          />
        );
      }
    }

    return (
      <HomeView
        products={products}
        blogs={blogs}
        siteSettings={siteSettings}
        catalogLoading={catalogLoading}
        wishlistIds={wishlistIds}
        onToggleWishlist={handleToggleWishlist}
        setCurrentPath={setCurrentPath}
        setProductSlug={setProductSlug}
        onAddToCart={handleAddToCart}
        onSelectCategory={setCurrentCategory}
      />
    );
  };

  const isInAuthenticatedDashboard = Boolean(
    authUser &&
      (currentPath === "customer-dashboard" || (currentPath === "admin" && isAdmin))
  );

  return (
    <div className="min-h-screen bg-slate-50/20 flex flex-col justify-between font-sans antialiased text-slate-800 w-full max-w-full overflow-x-hidden">
      {!isInAuthenticatedDashboard && (
        <Navigation
          currentPath={currentPath}
          setCurrentPath={setCurrentPath}
          setProductSlug={setProductSlug}
          cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
          products={products}
          currentCategory={currentCategory}
          searchQuery={searchQuery}
          onSearchSubmit={(query) => {
            setSearchQuery(query);
            setCurrentCategory(null);
            setCurrentPath("shop");
          }}
          onSelectCategory={(cat) => {
            setCurrentCategory(cat);
            setSearchQuery("");
            setCurrentPath("shop");
          }}
          siteSettings={siteSettings}
          authUser={authUser}
          isAdmin={isAdmin}
          onSignOut={handleSignOut}
        />
      )}

      <main className="flex-1 w-full max-w-full overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPath}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-full max-w-full overflow-x-hidden"
          >
            {renderActiveView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer & Newsletter */}
      {!isInAuthenticatedDashboard && (
      <footer className="bg-emerald-950 text-white border-t border-emerald-900 pt-16 pb-8 font-sans w-full max-w-full overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-emerald-900/60">
          <div className="bg-emerald-900/40 rounded-2xl p-6 md:p-10 border border-emerald-800 flex flex-col md:flex-row justify-between items-center gap-8 text-left">
            <div className="space-y-2 max-w-md">
              <span className="text-xs font-semibold text-amber-300 block">
                Segerea Clinic Notes
              </span>
              <h3 className="font-serif font-bold text-white text-xl sm:text-2xl leading-snug">
                Weekly Herbal Guides & Clinic Announcements
              </h3>
              <p className="text-xs text-emerald-200/80 font-light leading-relaxed">
                Receive preventative nutrition notes, seasonal herb availability, and Segerea dispensary updates.
              </p>
            </div>

            <div className="w-full md:w-auto shrink-0 min-w-[280px] sm:min-w-[350px] space-y-2">
              {newsletterSubscribed ? (
                <div className="p-4 bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold rounded-2xl text-center">
                  Thank you! Your subscription has been saved to PJHerbal Clinic Segerea.
                </div>
              ) : (
                <form
                  onSubmit={handleNewsletterSubmit}
                  className="flex gap-2 bg-emerald-950 p-1.5 rounded-full border border-emerald-800"
                >
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address..."
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="flex-1 bg-transparent px-4 py-2.5 text-xs text-white outline-hidden placeholder-emerald-300/50"
                  />
                  <button
                    type="submit"
                    disabled={newsletterSubmitting}
                    className="bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-emerald-950 font-bold px-5 py-2.5 rounded-full text-xs transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    {newsletterSubmitting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <span>Subscribe</span>
                        <Send className="w-3 h-3" />
                      </>
                    )}
                  </button>
                </form>
              )}
              {newsletterError && (
                <p className="text-[11px] text-rose-300 font-semibold px-2">{newsletterError}</p>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-12 gap-8 text-left">
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-emerald-950 font-bold text-sm shadow-md border border-amber-400">
                PJ
              </div>
              <span className="font-serif text-lg font-bold text-white leading-tight block">PJHERBAL</span>
            </div>
            <p className="text-xs text-emerald-200/60 leading-relaxed font-light">
              PJHerbal Clinic Segerea Branch is a clinical dispensary focused on pharmaceutical-grade organic botanical extracts and preventative nutrition.
            </p>
            <div className="flex gap-3 text-emerald-400">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-amber-400 transition-colors"
                aria-label="PJHerbal Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-amber-400 transition-colors"
                aria-label="PJHerbal Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest">Platform</h4>
            <ul className="space-y-1.5 text-xs text-emerald-200/70 font-light">
              <li>
                <button
                  onClick={() => {
                    setCurrentPath("home");
                    setCurrentCategory(null);
                  }}
                  className="hover:text-amber-400 transition-colors text-left cursor-pointer"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentPath("shop");
                    setCurrentCategory(null);
                  }}
                  className="hover:text-amber-400 transition-colors text-left cursor-pointer"
                >
                  Supplement Shop
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPath("blog")}
                  className="hover:text-amber-400 transition-colors text-left cursor-pointer"
                >
                  Health Blog
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPath("about")}
                  className="hover:text-amber-400 transition-colors text-left cursor-pointer"
                >
                  About Clinical Team
                </button>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest">Clinic & Legal</h4>
            <ul className="space-y-1.5 text-xs text-emerald-200/70 font-light">
              <li>
                <button
                  onClick={() => setCurrentPath("privacy-policy")}
                  className="hover:text-amber-400 transition-colors text-left cursor-pointer"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPath("terms")}
                  className="hover:text-amber-400 transition-colors text-left cursor-pointer"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPath("contact")}
                  className="hover:text-amber-400 transition-colors text-left cursor-pointer"
                >
                  Support Hotline
                </button>
              </li>
              {(!authUser || isAdmin) && (
                <li>
                  <button
                    onClick={() => setCurrentPath("admin")}
                    className="hover:text-amber-400 transition-colors text-left font-bold text-amber-400 cursor-pointer"
                  >
                    Admin Console
                  </button>
                </li>
              )}
            </ul>
          </div>

          <div className="md:col-span-4 space-y-3 text-xs">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest">Segerea Premises</h4>
            <div className="space-y-2 text-emerald-200/70 font-light">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Segerea Mwisho, near Catholic Church bus stop, Ilala, Dar es Salaam, Tanzania</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <a href="tel:+255629899017" className="hover:text-amber-400">
                  +255 629 899 017
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <a href="mailto:info@pjherbal-segerea.com" className="hover:text-amber-400">
                  info@pjherbal-segerea.com
                </a>
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-emerald-900/40 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-light text-emerald-200/65">
          <p>© 2026 PJHerbal Clinic - Segerea Branch. All Rights Reserved.</p>

          <p className="text-[11px] text-emerald-200/75 text-left sm:text-right">
            Accepted Payment: Cash on Delivery · Clinic Pickup · M-Pesa · Tigo Pesa · Airtel Money · CRDB / NMB
          </p>
        </div>
      </footer>
      )}
    </div>
  );
}
