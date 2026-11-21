/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import {
  BarChart3,
  ShoppingBag,
  Boxes,
  Megaphone,
  TrendingUp,
  AlertTriangle,
  Plus,
  RefreshCw,
  Check,
  Truck,
  MessageSquareCode,
  Globe,
  Settings,
  LogIn,
  LogOut,
  Users,
  FileEdit,
  LayoutTemplate,
  Trash2,
  Mail,
  ShieldAlert,
  Database,
  ExternalLink,
  CheckCircle2,
  PauseCircle,
  PlayCircle
} from "lucide-react";
import {
  Product,
  Order,
  PromoCampaign,
  BlogArticle,
  Category,
  OrderStatus,
  DeliveryStep,
  SiteSettings,
  UserProfile,
  ContactMessage,
  PatientNote,
  CampaignDispatchLog
} from "../types";
import { FirebaseUser, ADMIN_EMAIL, toSlug } from "../lib/firebase";
import {
  subscribeAdminData,
  savePatientNoteDoc,
  markContactMessageRepliedDoc,
  logCampaignDispatchDoc
} from "../lib/firestoreService";
import { motion, AnimatePresence } from "motion/react";
import {
  AreaChart,
  Area,
  BarChart as ReBarChart,
  Bar as ReBar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

interface AdminDashboardViewProps {
  authUser: FirebaseUser | null;
  authReady: boolean;
  isAdmin: boolean;
  onSignInWithGoogle: () => Promise<void>;
  onSignOut: () => Promise<void>;
  products: Product[];
  orders: Order[];
  campaigns: PromoCampaign[];
  blogs: BlogArticle[];
  siteSettings: SiteSettings;
  onUpdateStock: (productId: string, newStock: number) => Promise<void>;
  onDeleteProduct: (productId: string) => Promise<void>;
  onUpdateOrderAdmin: (
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
  ) => Promise<void>;
  onAddProduct: (product: Product) => Promise<void>;
  onAddCampaign: (campaign: PromoCampaign) => Promise<void>;
  onToggleCampaign: (campaignId: string, active: boolean) => Promise<void>;
  onDeleteCampaign: (campaignId: string) => Promise<void>;
  onAddBlog: (blog: BlogArticle) => Promise<void>;
  onDeleteBlog: (blogId: string) => Promise<void>;
  onSaveSiteSettings: (settings: Omit<SiteSettings, "updatedAt">) => Promise<void>;
  onSeedCatalog: () => Promise<{ productsAdded: number; blogsAdded: number; campaignsAdded: number }>;
  onRefreshData: () => Promise<void>;
}

const IMAGE_PRESETS = [
  { id: "capsules", url: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=500&auto=format&fit=crop", label: "Capsules" },
  { id: "amber-bottle", url: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=500&auto=format&fit=crop", label: "Bottle" },
  { id: "leaves-mortar", url: "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=500&auto=format&fit=crop", label: "Mortar" },
  { id: "dropper", url: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&auto=format&fit=crop", label: "Dropper" }
];

const DEFAULT_BLOG_IMAGE = "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&auto=format&fit=crop";

const COURIER_DIRECTORY: Record<string, string> = {
  Salim: "+255 629 899 017",
  Fatma: "+255 713 555 120",
  Moses: "+255 684 219 988"
};

function sanitizeWhatsAppPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("0")) return `255${digits.slice(1)}`;
  return digits || "255629899017";
}

export default function AdminDashboardView({
  authUser,
  authReady,
  isAdmin,
  onSignInWithGoogle,
  onSignOut,
  products,
  orders,
  campaigns,
  blogs,
  siteSettings,
  onUpdateStock,
  onDeleteProduct,
  onUpdateOrderAdmin,
  onAddProduct,
  onAddCampaign,
  onToggleCampaign,
  onDeleteCampaign,
  onAddBlog,
  onDeleteBlog,
  onSaveSiteSettings,
  onSeedCatalog,
  onRefreshData
}: AdminDashboardViewProps) {
  const [adminTab, setAdminTab] = useState<
    "analytics" | "orders" | "delivery" | "inventory" | "customers" | "marketing" | "blog-seo" | "landing-pages"
  >("analytics");
  const [chartTab, setChartTab] = useState<"sales-trend" | "category-sales" | "inventory-share">("sales-trend");

  // Auth action state
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  // Admin-only live Firestore data
  const [registeredUsers, setRegisteredUsers] = useState<UserProfile[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [patientNotes, setPatientNotes] = useState<PatientNote[]>([]);
  const [campaignLogs, setCampaignLogs] = useState<CampaignDispatchLog[]>([]);

  // Analytics & catalog initialization state
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string>("");
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState("");
  const [globalError, setGlobalError] = useState("");

  // New product form state
  const [newProdName, setNewProdName] = useState("");
  const [newProdCategory, setNewProdCategory] = useState<Category>("Men's Health");
  const [newProdPrice, setNewProdPrice] = useState(30000);
  const [newProdStock, setNewProdStock] = useState(25);
  const [newProdBenefits, setNewProdBenefits] = useState("");
  const [newProdImage, setNewProdImage] = useState<string>(IMAGE_PRESETS[0].url);
  const [prodSuccess, setProdSuccess] = useState("");
  const [prodError, setProdError] = useState("");
  const [savingProd, setSavingProd] = useState(false);
  const [confirmDeleteProdId, setConfirmDeleteProdId] = useState<string | null>(null);

  // New campaign form state
  const [newCampCode, setNewCampCode] = useState("");
  const [newCampDiscount, setNewCampDiscount] = useState(10);
  const [newCampDesc, setNewCampDesc] = useState("");
  const [campSuccess, setCampSuccess] = useState("");
  const [campError, setCampError] = useState("");
  const [confirmDeleteCampId, setConfirmDeleteCampId] = useState<string | null>(null);

  // WhatsApp CRM launcher & dispatch logger state
  const [whatsappPhone, setWhatsappPhone] = useState("+255629899017");
  const [whatsappTemplate, setWhatsappTemplate] = useState("order-notification");
  const [whatsappMessage, setWhatsappMessage] = useState(
    "PJHerbal Segerea: Hello! Your herbal order is packed and ready for dispatch with our clinic courier."
  );
  const [whatsappFeedback, setWhatsappFeedback] = useState("");
  const [loggingDispatch, setLoggingDispatch] = useState(false);

  // Delivery Tracking State
  const [selectedTrackingOrderId, setSelectedTrackingOrderId] = useState<string | null>(null);
  const [selectedCourier, setSelectedCourier] = useState("Salim");
  const [trackingNoInput, setTrackingNoInput] = useState("");
  const [deliveryStep, setDeliveryStep] = useState<DeliveryStep>("assigned");
  const [driverContact, setDriverContact] = useState("+255 629 899 017");
  const [deliverySuccess, setDeliverySuccess] = useState("");
  const [savingDelivery, setSavingDelivery] = useState(false);

  // Customer Management & Inbox State
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomerEmail, setSelectedCustomerEmail] = useState<string | null>(null);
  const [customerNoteInput, setCustomerNoteInput] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [noteStatusMsg, setNoteStatusMsg] = useState("");

  // Blog creation form state
  const [newBlogTitle, setNewBlogTitle] = useState("");
  const [newBlogAuthor, setNewBlogAuthor] = useState("Dr. Elieza Eliezer");
  const [newBlogExcerpt, setNewBlogExcerpt] = useState("");
  const [newBlogContent, setNewBlogContent] = useState("");
  const [newBlogTags, setNewBlogTags] = useState("");
  const [newBlogImage, setNewBlogImage] = useState(DEFAULT_BLOG_IMAGE);
  const [blogSuccess, setBlogSuccess] = useState("");
  const [blogError, setBlogError] = useState("");
  const [savingBlog, setSavingBlog] = useState(false);
  const [confirmDeleteBlogId, setConfirmDeleteBlogId] = useState<string | null>(null);

  // Landing pages visual manager state
  const [announcementText, setAnnouncementText] = useState(siteSettings.announcementText);
  const [heroBadgeText, setHeroBadgeText] = useState(siteSettings.heroBadgeText);
  const [heroTitleText, setHeroTitleText] = useState(siteSettings.heroTitleText);
  const [heroDescText, setHeroDescText] = useState(siteSettings.heroDescText);
  const [savingSettings, setSavingSettings] = useState(false);
  const [announcementSaved, setAnnouncementSaved] = useState(false);
  const [heroSaved, setHeroSaved] = useState(false);
  const [settingsError, setSettingsError] = useState("");

  // Search filters
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [inventorySearch, setInventorySearch] = useState("");

  // Subscribe to admin-only Firestore collections when signed in as Admin
  useEffect(() => {
    if (!isAdmin) {
      setRegisteredUsers([]);
      setContactMessages([]);
      setPatientNotes([]);
      setCampaignLogs([]);
      return;
    }
    const unsub = subscribeAdminData(
      setRegisteredUsers,
      setContactMessages,
      setPatientNotes,
      setCampaignLogs
    );
    return () => unsub();
  }, [isAdmin]);

  // Sync siteSettings prop into editor inputs
  useEffect(() => {
    setAnnouncementText(siteSettings.announcementText);
    setHeroBadgeText(siteSettings.heroBadgeText);
    setHeroTitleText(siteSettings.heroTitleText);
    setHeroDescText(siteSettings.heroDescText);
  }, [siteSettings]);

  // Keep a valid default selected order for Delivery tab and sync courier fields when selection changes
  useEffect(() => {
    if (orders.length === 0) {
      setSelectedTrackingOrderId(null);
      return;
    }
    const targetId =
      selectedTrackingOrderId && orders.some((o) => o.id === selectedTrackingOrderId)
        ? selectedTrackingOrderId
        : orders[0].id;

    if (targetId !== selectedTrackingOrderId) {
      setSelectedTrackingOrderId(targetId);
    }
  }, [orders, selectedTrackingOrderId]);

  useEffect(() => {
    if (!selectedTrackingOrderId) return;
    const active = orders.find((o) => o.id === selectedTrackingOrderId);
    if (!active) return;

    const courierName = active.deliveryCourier || "Salim";
    setSelectedCourier(courierName);
    setDriverContact(active.courierPhone || COURIER_DIRECTORY[courierName] || "+255 629 899 017");
    setTrackingNoInput(active.trackingNumber || `TRK-${active.id}`);
    setDeliveryStep(
      active.deliveryStep ||
        (active.status === "Delivered"
          ? "delivered"
          : active.status === "Dispatched"
          ? "en_route"
          : "assigned")
    );
  }, [selectedTrackingOrderId, orders]);

  // Update WhatsApp message template helper
  const applyWhatsAppTemplate = (tpl: string) => {
    setWhatsappTemplate(tpl);
    if (tpl === "order-notification") {
      setWhatsappMessage(
        "PJHerbal Segerea: Hello! Your herbal order is packed and ready for dispatch with our clinic courier."
      );
    } else if (tpl === "follow-up") {
      setWhatsappMessage(
        "PJHerbal Clinic Segerea: Habari! Our wellness specialist is checking in on your supplement dosage progress. Reply if you need guidance."
      );
    } else {
      const activePromo = campaigns.find((c) => c.active);
      setWhatsappMessage(
        activePromo
          ? `PJHerbal Segerea: Apply code ${activePromo.code} for ${activePromo.discountPercentage}% off natural supplements this week.`
          : "PJHerbal Segerea: Certified organic supplements are stocked at our Segerea Branch. Call +255 629 899 017 to order."
      );
    }
  };

  // Real KPI stats computed strictly from Firestore
  const totalSales = useMemo(
    () => orders.filter((o) => o.paymentStatus === "Paid").reduce((acc, o) => acc + o.totalAmount, 0),
    [orders]
  );
  const pendingRevenue = useMemo(
    () =>
      orders
        .filter((o) => o.paymentStatus === "Pending" && o.status !== "Cancelled")
        .reduce((acc, o) => acc + o.totalAmount, 0),
    [orders]
  );
  const lowStockProducts = useMemo(() => products.filter((p) => p.stock <= 5), [products]);
  const pendingOrdersCount = useMemo(
    () => orders.filter((o) => o.status !== "Delivered" && o.status !== "Cancelled").length,
    [orders]
  );
  const unreadMessagesCount = useMemo(
    () => contactMessages.filter((m) => m.status === "Unread").length,
    [contactMessages]
  );

  // Build real timeline chart strictly from Firestore orders
  const timelineChartData = useMemo(() => {
    const map: Record<string, { sales: number; count: number }> = {};
    orders.forEach((order) => {
      if (order.status === "Cancelled") return;
      const dateKey = (order.date || "Unknown").slice(0, 10);
      if (!map[dateKey]) {
        map[dateKey] = { sales: 0, count: 0 };
      }
      map[dateKey].count += 1;
      map[dateKey].sales += order.totalAmount;
    });
    return Object.keys(map)
      .sort((a, b) => a.localeCompare(b))
      .map((date) => ({
        date,
        Sales: map[date].sales,
        Orders: map[date].count
      }))
      .slice(-14);
  }, [orders]);

  // Build real category inventory & units sold strictly from Firestore products and orders
  const categories: Category[] = [
    "Men's Health",
    "Weight Management",
    "Energy & Immunity",
    "Women's Wellness",
    "Brain & Focus",
    "Detox & Digestion"
  ];

  const categoryChartData = useMemo(() => {
    const prodCatMap = new Map<string, Category>();
    products.forEach((p) => prodCatMap.set(p.id, p.category));

    const soldByCat: Record<string, number> = {};
    orders.forEach((o) => {
      if (o.status === "Cancelled") return;
      o.items.forEach((item) => {
        const cat = prodCatMap.get(item.productId);
        if (cat) {
          soldByCat[cat] = (soldByCat[cat] || 0) + item.quantity;
        }
      });
    });

    return categories.map((cat) => {
      const prods = products.filter((p) => p.category === cat);
      const stockCount = prods.reduce((sum, p) => sum + p.stock, 0);
      return {
        name: cat,
        Stock: stockCount,
        UnitsSold: soldByCat[cat] || 0,
        Products: prods.length
      };
    });
  }, [products, orders]);

  const totalInventoryUnits = useMemo(
    () => categoryChartData.reduce((sum, c) => sum + c.Stock, 0),
    [categoryChartData]
  );

  interface CompiledPatient {
    name: string;
    phone: string;
    address: string;
    district: string;
    region: string;
    totalSpend: number;
    count: number;
    email: string;
  }

  // Merged patient registry from Firestore `users` + `orders`
  const compiledPatients = useMemo<Record<string, CompiledPatient>>(() => {
    const map: Record<string, CompiledPatient> = {};

    registeredUsers.forEach((u) => {
      const key = u.email.toLowerCase();
      map[key] = {
        name: u.name || "Registered Patient",
        phone: u.phone || "Not set",
        address: u.address || "Not provided",
        district: u.district || "Ilala",
        region: u.region || "Dar es Salaam",
        totalSpend: 0,
        count: 0,
        email: key
      };
    });

    orders.forEach((o) => {
      const key = (o.customerDetails.email || "").toLowerCase();
      if (!key) return;
      if (!map[key]) {
        map[key] = {
          name: o.customerDetails.fullName,
          phone: o.customerDetails.phoneNumber,
          address: o.customerDetails.deliveryAddress,
          district: o.customerDetails.district,
          region: o.customerDetails.region,
          totalSpend: 0,
          count: 0,
          email: key
        };
      } else {
        if (!map[key].phone || map[key].phone === "Not set") map[key].phone = o.customerDetails.phoneNumber;
        if (!map[key].address || map[key].address === "Not provided") map[key].address = o.customerDetails.deliveryAddress;
      }
      map[key].count += 1;
      if (o.status !== "Cancelled") {
        map[key].totalSpend += o.totalAmount;
      }
    });

    return map;
  }, [registeredUsers, orders]);

  const notesByEmail = useMemo(() => {
    const m: Record<string, string> = {};
    patientNotes.forEach((n) => {
      m[n.patientEmail.toLowerCase()] = n.note;
    });
    return m;
  }, [patientNotes]);

  const PIE_COLORS = ["#065f46", "#d97706", "#059669", "#dc2626", "#4f46e5", "#0d9488"];

  // Action handlers
  const handleGoogleLogin = async () => {
    setAuthError("");
    setAuthLoading(true);
    try {
      await onSignInWithGoogle();
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Failed to complete Google sign-in.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSyncAnalytics = async () => {
    setIsSyncing(true);
    setGlobalError("");
    try {
      await onRefreshData();
      setLastSyncedAt(new Date().toLocaleTimeString());
    } catch (err) {
      setGlobalError(err instanceof Error ? err.message : "Failed to refresh Firestore collections.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSeedCatalog = async () => {
    setIsSeeding(true);
    setSeedMessage("");
    setGlobalError("");
    try {
      const res = await onSeedCatalog();
      setSeedMessage(
        `Initialized ${res.productsAdded} products, ${res.blogsAdded} articles, and ${res.campaignsAdded} campaigns in Firestore.`
      );
      setTimeout(() => setSeedMessage(""), 6000);
    } catch (err) {
      setGlobalError(err instanceof Error ? err.message : "Failed to initialize clinic catalog.");
    } finally {
      setIsSeeding(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setProdError("");
    setProdSuccess("");
    if (!newProdName.trim() || !newProdBenefits.trim()) return;

    const cleanImg = newProdImage.trim();
    if (!cleanImg.startsWith("https://") && !cleanImg.startsWith("http://")) {
      setProdError("Product image must be a valid HTTPS/HTTP URL (max 500 characters).");
      return;
    }
    if (cleanImg.length > 500) {
      setProdError("Product image URL must be 500 characters or fewer.");
      return;
    }

    const slug = toSlug(newProdName);
    const product: Product = {
      id: `prod-${Date.now()}`,
      slug,
      name: newProdName.trim(),
      category: newProdCategory,
      price: Math.max(1, Number(newProdPrice)),
      images: [cleanImg],
      shortBenefits: newProdBenefits.trim(),
      description: `Clinically formulated ${newProdName.trim()} dispensed by PJHerbal Clinic Segerea Branch for daily natural health support.`,
      ingredients: ["Organic Botanical Extracts", "Clinical Co-Factors"],
      usageInstructions: "Take 1 capsule daily with water after meals, or as advised by clinic staff.",
      benefits: [newProdBenefits.trim()],
      warnings: ["Consult a qualified clinician if pregnant, nursing, or taking prescription medication."],
      rating: 5.0,
      reviewsCount: 0,
      reviews: [],
      stock: Math.max(0, Math.round(Number(newProdStock))),
      isBestSeller: false,
      featuredBenefits: ["Clinical Purity", "Herbal Extract"]
    };

    setSavingProd(true);
    try {
      await onAddProduct(product);
      setProdSuccess(`"${product.name}" published to Firestore dispensary catalog!`);
      setNewProdName("");
      setNewProdBenefits("");
      setNewProdImage(IMAGE_PRESETS[0].url);
      setTimeout(() => setProdSuccess(""), 4000);
    } catch (err) {
      setProdError(err instanceof Error ? err.message : "Failed to save formulation.");
    } finally {
      setSavingProd(false);
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setCampError("");
    setCampSuccess("");
    const cleanCode = newCampCode.toUpperCase().replace(/[^A-Z0-9_-]/g, "").trim();
    if (cleanCode.length < 2 || newCampDesc.trim().length < 3) {
      setCampError("Provide a valid alphanumeric promo code and description.");
      return;
    }

    const campaign: PromoCampaign = {
      id: `camp-${Date.now()}`,
      code: cleanCode,
      discountPercentage: Math.min(100, Math.max(1, Number(newCampDiscount))),
      description: newCampDesc.trim(),
      active: true,
      expiryDate: "2026-12-31"
    };

    try {
      await onAddCampaign(campaign);
      setCampSuccess(`Campaign code "${cleanCode}" saved and activated in Firestore.`);
      setNewCampCode("");
      setNewCampDesc("");
      setTimeout(() => setCampSuccess(""), 4000);
    } catch (err) {
      setCampError(err instanceof Error ? err.message : "Failed to save campaign.");
    }
  };

  const handleLogWhatsAppDispatch = async () => {
    if (!authUser?.email || !whatsappMessage.trim()) return;
    setLoggingDispatch(true);
    setWhatsappFeedback("");
    try {
      await logCampaignDispatchDoc(
        whatsappPhone.trim(),
        whatsappTemplate,
        whatsappMessage.trim(),
        authUser.email
      );
      setWhatsappFeedback("Campaign dispatch logged to Firestore audit history.");
      setTimeout(() => setWhatsappFeedback(""), 4000);
    } catch (err) {
      setWhatsappFeedback(err instanceof Error ? err.message : "Failed to log campaign dispatch.");
    } finally {
      setLoggingDispatch(false);
    }
  };

  const handleSaveDeliveryDispatch = async (activeOrder: Order) => {
    setSavingDelivery(true);
    setDeliverySuccess("");
    try {
      const nextStatus: OrderStatus = deliveryStep === "delivered" ? "Delivered" : "Dispatched";
      const stepLabelMap: Record<DeliveryStep, string> = {
        assigned: `Assigned courier ${selectedCourier} (${driverContact}). Tracking: ${trackingNoInput || "N/A"}`,
        picked_up: `Courier ${selectedCourier} picked up parcel from Segerea Dispensary (${trackingNoInput || "N/A"})`,
        en_route: `Courier ${selectedCourier} en route to ${activeOrder.customerDetails.district}`,
        delivered: `Delivered to ${activeOrder.customerDetails.fullName} by ${selectedCourier}`
      };

      const updatedLogs = [
        ...activeOrder.trackingLogs,
        {
          status: nextStatus,
          timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
          description: stepLabelMap[deliveryStep]
        }
      ].slice(-25);

      await onUpdateOrderAdmin(activeOrder.id, {
        status: nextStatus,
        deliveryCourier: selectedCourier,
        courierPhone: driverContact,
        trackingNumber: trackingNoInput.trim() || `TRK-${activeOrder.id}`,
        deliveryStep,
        trackingLogs: updatedLogs
      });

      setDeliverySuccess("Courier assignment & order tracking saved to Firestore.");
      setTimeout(() => setDeliverySuccess(""), 4000);
    } catch (err) {
      setDeliverySuccess(err instanceof Error ? err.message : "Failed to update delivery dispatch.");
    } finally {
      setSavingDelivery(false);
    }
  };

  const handleSavePatientNote = async (email: string, name: string) => {
    if (!authUser?.email) return;
    setSavingNote(true);
    setNoteStatusMsg("");
    try {
      await savePatientNoteDoc(email, name, customerNoteInput, authUser.email);
      setNoteStatusMsg("Clinical note saved securely to Firestore.");
      setTimeout(() => setNoteStatusMsg(""), 4000);
    } catch (err) {
      setNoteStatusMsg(err instanceof Error ? err.message : "Failed to save patient note.");
    } finally {
      setSavingNote(false);
    }
  };

  const handleCreateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    setBlogError("");
    setBlogSuccess("");
    if (newBlogTitle.trim().length < 3 || newBlogContent.trim().length < 10) {
      setBlogError("Article title (3+ chars) and body content (10+ chars) are required.");
      return;
    }

    const cleanImg = newBlogImage.trim() || DEFAULT_BLOG_IMAGE;
    if (!cleanImg.startsWith("https://") && !cleanImg.startsWith("http://")) {
      setBlogError("Article cover image must be a valid HTTPS/HTTP URL.");
      return;
    }

    const blog: BlogArticle = {
      id: `blog-${Date.now()}`,
      slug: toSlug(newBlogTitle),
      title: newBlogTitle.trim(),
      author: newBlogAuthor.trim() || "Dr. Elieza Eliezer",
      date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
      summary: newBlogExcerpt.trim() || newBlogContent.trim().slice(0, 140),
      content: newBlogContent.trim(),
      tags: newBlogTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 15),
      readTime: `${Math.max(1, Math.ceil(newBlogContent.trim().split(/\s+/).length / 200))} min read`,
      category: "Clinical Wellness",
      image: cleanImg
    };

    setSavingBlog(true);
    try {
      await onAddBlog(blog);
      setBlogSuccess(`Article "${blog.title}" published to Firestore.`);
      setNewBlogTitle("");
      setNewBlogExcerpt("");
      setNewBlogContent("");
      setNewBlogTags("");
      setNewBlogImage(DEFAULT_BLOG_IMAGE);
      setTimeout(() => setBlogSuccess(""), 4000);
    } catch (err) {
      setBlogError(err instanceof Error ? err.message : "Failed to publish blog article.");
    } finally {
      setSavingBlog(false);
    }
  };

  const handleSaveSettings = async (target: "announcement" | "hero") => {
    setSettingsError("");
    setSavingSettings(true);
    try {
      await onSaveSiteSettings({
        announcementText: announcementText.trim(),
        heroBadgeText: heroBadgeText.trim(),
        heroTitleText: heroTitleText.trim(),
        heroDescText: heroDescText.trim()
      });
      if (target === "announcement") {
        setAnnouncementSaved(true);
        setTimeout(() => setAnnouncementSaved(false), 4000);
      } else {
        setHeroSaved(true);
        setTimeout(() => setHeroSaved(false), 4000);
      }
    } catch (err) {
      setSettingsError(err instanceof Error ? err.message : "Failed to save homepage settings.");
    } finally {
      setSavingSettings(false);
    }
  };

  // ==========================================
  // AUTH GATE
  // ==========================================
  if (!authReady) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-3 font-sans">
        <div className="w-10 h-10 border-4 border-emerald-800 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-bold text-slate-500">Verifying clinic administrator session...</p>
      </div>
    );
  }

  if (!authUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 font-sans text-slate-800 text-left">
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-stone-200 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-800 flex items-center justify-center text-white font-bold text-lg shadow-sm border border-amber-400 mx-auto">
              PJ
            </div>
            <span className="text-[10px] font-extrabold text-amber-600 uppercase tracking-widest block">
              Segerea Branch Console
            </span>
            <h2 className="text-2xl font-serif font-bold text-emerald-950">Clinic Admin Sign In</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Sign in with the verified PJHerbal administrator Google account to access orders, inventory, and clinic management.
            </p>
          </div>

          {authError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
              {authError}
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={authLoading}
            className="w-full py-3.5 bg-emerald-800 hover:bg-emerald-950 disabled:opacity-60 text-white font-extrabold uppercase tracking-widest text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>{authLoading ? "Connecting Google Auth..." : "Sign In with Google"}</span>
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 font-sans text-slate-800 text-left">
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-rose-200 space-y-5 text-center">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-700 flex items-center justify-center mx-auto border border-rose-200">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <span className="text-[10px] font-extrabold text-rose-600 uppercase tracking-widest block">
              Access Restricted
            </span>
            <h2 className="text-2xl font-serif font-bold text-emerald-950">Administrator Role Required</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              You are signed in as <strong className="font-mono text-slate-900">{authUser.email}</strong>, which does not hold Clinic Admin privileges ({ADMIN_EMAIL}).
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSignOut()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out & Switch Account</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans text-slate-800 text-left">
      {/* Header */}
      <div className="text-left mb-8 border-b border-slate-100 pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-emerald-950 flex items-center gap-2">
            <Settings className="w-8 h-8 text-emerald-800" /> Clinic Management Center
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Live Firestore analytics, order verification, stock control, patient registry, and Segerea storefront settings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="bg-amber-100 text-amber-800 font-extrabold text-[10px] uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-amber-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-700" />
            Admin: {authUser.email}
          </span>

          <button
            onClick={() => onSignOut()}
            className="flex items-center gap-1 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 text-[10px] font-extrabold uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-slate-200 transition-all cursor-pointer shadow-2xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {globalError && (
        <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700">
          {globalError}
        </div>
      )}

      {seedMessage && (
        <div className="mb-6 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{seedMessage}</span>
        </div>
      )}

      {/* Grid: Sidebar Left, Workspace Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar */}
        <div className="col-span-1 lg:col-span-3 lg:sticky lg:top-8 space-y-6">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-emerald-950 flex items-center justify-center text-white text-sm font-extrabold font-serif border-2 border-emerald-800 shadow-xs shrink-0">
                PJH
              </div>
              <div className="text-left min-w-0">
                <h3 className="text-xs font-extrabold text-slate-900 tracking-wide truncate">
                  {authUser.displayName || "Clinic Administrator"}
                </h3>
                <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">{authUser.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-200">
              <div className="bg-white p-2 rounded-xl border border-slate-100 text-center">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Unpaid</p>
                <p className="text-xs font-bold text-slate-700 mt-0.5">
                  {orders.filter((o) => o.paymentStatus !== "Paid" && o.status !== "Cancelled").length}
                </p>
              </div>
              <div className="bg-white p-2 rounded-xl border border-slate-100 text-center">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Inbox</p>
                <p className="text-xs font-bold text-slate-700 mt-0.5">{unreadMessagesCount}</p>
              </div>
            </div>
          </div>

          <nav className="bg-white border border-slate-100 rounded-2xl p-3 shadow-xs space-y-5 text-left">
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">
                Clinic Intelligence
              </p>
              <button
                onClick={() => setAdminTab("analytics")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-extrabold transition-all border cursor-pointer ${
                  adminTab === "analytics"
                    ? "bg-emerald-800 text-white border-emerald-800 shadow-sm"
                    : "text-slate-600 bg-white hover:bg-slate-50 border-transparent hover:text-slate-900"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <BarChart3 className={`w-4 h-4 ${adminTab === "analytics" ? "text-white" : "text-slate-400"}`} />
                  <span>Sales Analytics</span>
                </span>
              </button>
            </div>

            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">
                Patient Care & Logistics
              </p>
              <div className="space-y-1">
                {[
                  {
                    id: "orders" as const,
                    label: "Patient Orders",
                    icon: ShoppingBag,
                    badge:
                      pendingOrdersCount > 0 ? (
                        <span
                          className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${
                            adminTab === "orders" ? "bg-white text-emerald-900" : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {pendingOrdersCount}
                        </span>
                      ) : null
                  },
                  {
                    id: "delivery" as const,
                    label: "Delivery & Courier",
                    icon: Truck,
                    badge:
                      orders.filter((o) => o.status === "Dispatched" || o.status === "Processing").length > 0 ? (
                        <span
                          className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${
                            adminTab === "delivery" ? "bg-white text-emerald-900" : "bg-blue-50 text-blue-800"
                          }`}
                        >
                          {orders.filter((o) => o.status === "Dispatched" || o.status === "Processing").length}
                        </span>
                      ) : null
                  },
                  {
                    id: "customers" as const,
                    label: "Patients & Inbox",
                    icon: Users,
                    badge:
                      unreadMessagesCount > 0 ? (
                        <span
                          className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${
                            adminTab === "customers" ? "bg-white text-emerald-900" : "bg-rose-100 text-rose-700"
                          }`}
                        >
                          {unreadMessagesCount} new
                        </span>
                      ) : Object.keys(compiledPatients).length > 0 ? (
                        <span
                          className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${
                            adminTab === "customers" ? "bg-white text-emerald-900" : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {Object.keys(compiledPatients).length}
                        </span>
                      ) : null
                  }
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = adminTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setAdminTab(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-extrabold transition-all border cursor-pointer ${
                        isActive
                          ? "bg-emerald-800 text-white border-emerald-800 shadow-sm"
                          : "text-slate-600 bg-white hover:bg-slate-50 border-transparent hover:text-slate-900"
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                        <span>{item.label}</span>
                      </span>
                      {item.badge}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">
                Supplements Dispensary
              </p>
              <button
                onClick={() => setAdminTab("inventory")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-extrabold transition-all border cursor-pointer ${
                  adminTab === "inventory"
                    ? "bg-emerald-800 text-white border-emerald-800 shadow-sm"
                    : "text-slate-600 bg-white hover:bg-slate-50 border-transparent hover:text-slate-900"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Boxes className={`w-4 h-4 ${adminTab === "inventory" ? "text-white" : "text-slate-400"}`} />
                  <span>Stock & Catalog</span>
                </span>
                {lowStockProducts.length > 0 ? (
                  <span
                    className={`px-2 py-0.5 text-[9px] font-bold rounded-full flex items-center gap-0.5 ${
                      adminTab === "inventory" ? "bg-white text-emerald-900" : "bg-red-50 text-red-700 font-black"
                    }`}
                  >
                    <AlertTriangle className="w-2.5 h-2.5" />
                    <span>{lowStockProducts.length} low</span>
                  </span>
                ) : (
                  <span
                    className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${
                      adminTab === "inventory" ? "bg-white text-emerald-900" : "bg-emerald-50 text-emerald-800"
                    }`}
                  >
                    {products.length}
                  </span>
                )}
              </button>
            </div>

            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">
                Growth & Storefront
              </p>
              <div className="space-y-1">
                {[
                  {
                    id: "marketing" as const,
                    label: "Promo & WhatsApp",
                    icon: Megaphone,
                    badge:
                      campaigns.length > 0 ? (
                        <span
                          className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${
                            adminTab === "marketing" ? "bg-white text-emerald-900" : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {campaigns.length}
                        </span>
                      ) : null
                  },
                  {
                    id: "blog-seo" as const,
                    label: "Blogs & SEO Suite",
                    icon: Globe,
                    badge:
                      blogs.length > 0 ? (
                        <span
                          className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${
                            adminTab === "blog-seo" ? "bg-white text-emerald-900" : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {blogs.length}
                        </span>
                      ) : null
                  },
                  { id: "landing-pages" as const, label: "Landing Pages Manager", icon: LayoutTemplate, badge: null }
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = adminTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setAdminTab(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-extrabold transition-all border cursor-pointer ${
                        isActive
                          ? "bg-emerald-800 text-white border-emerald-800 shadow-sm"
                          : "text-slate-600 bg-white hover:bg-slate-50 border-transparent hover:text-slate-900"
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                        <span>{item.label}</span>
                      </span>
                      {item.badge}
                    </button>
                  );
                })}
              </div>
            </div>
          </nav>
        </div>

        {/* Main Workspace */}
        <div className="lg:col-span-9 bg-white border border-slate-100 rounded-2xl p-6 shadow-xs min-h-[500px]">
          {/* TAB 1: ANALYTICS */}
          {adminTab === "analytics" && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-8 text-left"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 pb-4">
                <div className="space-y-1">
                  <h2 className="text-xl font-serif font-bold text-emerald-950 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-800" /> Clinic & Dispensary Intelligence
                  </h2>
                  <p className="text-xs text-slate-400 font-light">
                    Real-time metrics computed directly from Firestore orders, stock, and patient records.
                    {lastSyncedAt && <span className="ml-2 text-emerald-700 font-medium">Synced at {lastSyncedAt}</span>}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {products.length === 0 && (
                    <button
                      type="button"
                      onClick={handleSeedCatalog}
                      disabled={isSeeding}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 rounded-xl text-[10px] font-extrabold uppercase tracking-wider text-emerald-950 transition-all cursor-pointer shadow-2xs"
                    >
                      <Database className="w-3.5 h-3.5" />
                      <span>{isSeeding ? "Initializing..." : "Initialize Starter Dispensary Catalog"}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleSyncAnalytics}
                    disabled={isSyncing}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-[10px] font-extrabold uppercase tracking-wider text-slate-600 transition-all cursor-pointer shadow-2xs"
                  >
                    <RefreshCw className={`w-3 h-3 text-emerald-800 ${isSyncing ? "animate-spin" : ""}`} />
                    <span>{isSyncing ? "Syncing..." : "Sync Analytics"}</span>
                  </button>
                </div>
              </div>

              {products.length === 0 && (
                <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-amber-950">Dispensary Catalog Empty</h3>
                    <p className="text-xs text-amber-800 font-light">
                      Seed the verified PJHerbal Segerea starter supplements, clinical blogs, and welcome promo campaign directly into Firestore, or add items manually in Stock & Catalog.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSeedCatalog}
                    disabled={isSeeding}
                    className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-950 text-white text-xs font-extrabold rounded-xl shrink-0 cursor-pointer"
                  >
                    {isSeeding ? "Populating Firestore..." : "Initialize Starter Dispensary Catalog"}
                  </button>
                </div>
              )}

              {/* Live KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    title: "Confirmed Paid Revenue",
                    value: `${totalSales.toLocaleString()} TZS`,
                    subtext: `${pendingRevenue.toLocaleString()} TZS pending verification`,
                    subStyle: "text-emerald-700 bg-emerald-100/60"
                  },
                  {
                    title: "Total Orders Received",
                    value: `${orders.length} Orders`,
                    subtext: `${pendingOrdersCount} awaiting fulfillment`,
                    subStyle: "text-slate-600 bg-slate-100"
                  },
                  {
                    title: "Low Stock Alert",
                    value: `${lowStockProducts.length} Items`,
                    subtext: `${products.length} total formulations`,
                    subStyle: lowStockProducts.length > 0 ? "text-rose-700 bg-rose-100/70 font-extrabold" : "text-slate-600 bg-slate-100"
                  },
                  {
                    title: "Patients & Inquiries",
                    value: `${Object.keys(compiledPatients).length} Patients`,
                    subtext: `${unreadMessagesCount} unread inbox messages`,
                    subStyle: unreadMessagesCount > 0 ? "text-amber-800 bg-amber-100" : "text-emerald-700 bg-emerald-100/60"
                  }
                ].map((stat, idx) => (
                  <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.04 }}
                    className="bg-stone-50/70 border border-stone-200/70 rounded-2xl p-5 space-y-1.5 text-left"
                  >
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
                      {stat.title}
                    </span>
                    <p className="text-2xl font-black text-emerald-950 font-mono tracking-tight leading-none">
                      {stat.value}
                    </p>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full inline-block ${stat.subStyle}`}>
                      {stat.subtext}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Charts */}
              <div className="border border-slate-100 rounded-3xl p-6 bg-white space-y-6 shadow-2xs">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 pb-4">
                  <div className="space-y-1">
                    <h3 className="font-serif font-bold text-sm text-emerald-950">Dispensary Performance Graphs</h3>
                    <p className="text-[11px] text-slate-400 font-light">
                      Aggregated directly from live Firestore orders and dispensary inventory.
                    </p>
                  </div>

                  <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200/60">
                    {[
                      { id: "sales-trend", label: "Sales Trend" },
                      { id: "category-sales", label: "Category Stock & Sold" },
                      { id: "inventory-share", label: "Stock Proportions" }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setChartTab(tab.id as "sales-trend" | "category-sales" | "inventory-share")}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                          chartTab === tab.id
                            ? "bg-white text-emerald-950 shadow-2xs border border-slate-200 font-black"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-[320px] w-full flex items-center justify-center bg-stone-50/30 rounded-2xl p-4 relative overflow-hidden border border-stone-100">
                  <AnimatePresence mode="wait">
                    {chartTab === "sales-trend" && (
                      <motion.div
                        key="sales-trend-chart"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="w-full h-full flex flex-col justify-between"
                      >
                        {timelineChartData.length === 0 ? (
                          <div className="h-full flex items-center justify-center text-xs text-slate-400 italic text-center px-4">
                            No non-cancelled orders recorded in Firestore yet. Order volume will chart here automatically as patients check out.
                          </div>
                        ) : (
                          <>
                            <ResponsiveContainer width="100%" height="90%">
                              <AreaChart data={timelineChartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                <defs>
                                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#047857" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="#047857" stopOpacity={0.01} />
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                                <YAxis
                                  stroke="#94a3b8"
                                  fontSize={10}
                                  tickLine={false}
                                  axisLine={false}
                                  tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`}
                                  dx={-5}
                                />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: "#ffffff",
                                    border: "1px solid #f1f5f9",
                                    borderRadius: "12px",
                                    fontSize: "11px"
                                  }}
                                  formatter={(value: unknown) => [`${Number(value).toLocaleString()} TZS`, "Order Total"]}
                                />
                                <Area
                                  type="monotone"
                                  dataKey="Sales"
                                  stroke="#047857"
                                  strokeWidth={2.5}
                                  fillOpacity={1}
                                  fill="url(#colorSales)"
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                            <div className="text-center text-[10px] text-slate-400 font-light pt-2 border-t border-slate-100">
                              Live daily order volume recorded in Firestore.
                            </div>
                          </>
                        )}
                      </motion.div>
                    )}

                    {chartTab === "category-sales" && (
                      <motion.div
                        key="category-sales-chart"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="w-full h-full flex flex-col justify-between"
                      >
                        {products.length === 0 ? (
                          <div className="h-full flex items-center justify-center text-xs text-slate-400 italic text-center px-4">
                            No dispensary products found in Firestore yet.
                          </div>
                        ) : (
                          <>
                            <ResponsiveContainer width="100%" height="90%">
                              <ReBarChart data={categoryChartData} margin={{ top: 15, right: 10, left: 10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                  dataKey="name"
                                  stroke="#94a3b8"
                                  fontSize={9}
                                  tickLine={false}
                                  axisLine={false}
                                  dy={10}
                                  tickFormatter={(tick) => String(tick).split(" ")[0]}
                                />
                                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} dx={-5} />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: "#ffffff",
                                    border: "1px solid #f1f5f9",
                                    borderRadius: "12px",
                                    fontSize: "11px"
                                  }}
                                />
                                <Legend wrapperStyle={{ fontSize: "10px", marginTop: "10px" }} />
                                <ReBar dataKey="UnitsSold" name="Units Ordered" fill="#047857" radius={[5, 5, 0, 0]} />
                                <ReBar dataKey="Stock" name="Current In-Stock Units" fill="#d97706" radius={[5, 5, 0, 0]} />
                              </ReBarChart>
                            </ResponsiveContainer>
                            <div className="text-center text-[10px] text-slate-400 font-light pt-2 border-t border-slate-100">
                              Live inventory stock vs units ordered per therapeutic category.
                            </div>
                          </>
                        )}
                      </motion.div>
                    )}

                    {chartTab === "inventory-share" && (
                      <motion.div
                        key="inventory-share-chart"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="w-full h-full flex flex-col md:flex-row justify-between items-center gap-4"
                      >
                        {totalInventoryUnits === 0 ? (
                          <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 italic text-center">
                            Inventory stock totals are currently zero. Add formulations or initialize the starter catalog.
                          </div>
                        ) : (
                          <>
                            <div className="w-full md:w-1/2 h-full min-h-[180px]">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={categoryChartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={80}
                                    paddingAngle={3}
                                    dataKey="Stock"
                                  >
                                    {categoryChartData.map((entry, index) => (
                                      <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                  </Pie>
                                  <Tooltip
                                    contentStyle={{
                                      backgroundColor: "#ffffff",
                                      border: "1px solid #f1f5f9",
                                      borderRadius: "12px",
                                      fontSize: "11px"
                                    }}
                                    formatter={(value: unknown) => [`${Number(value)} units`, "In Stock"]}
                                  />
                                </PieChart>
                              </ResponsiveContainer>
                            </div>

                            <div className="w-full md:w-1/2 grid grid-cols-2 gap-2 text-[10px] text-left">
                              {categoryChartData.map((entry, idx) => (
                                <div key={entry.name} className="flex items-center gap-1.5 p-1.5 border border-slate-100 rounded-lg bg-white">
                                  <span
                                    className="w-2.5 h-2.5 rounded-full shrink-0"
                                    style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                                  />
                                  <div className="truncate">
                                    <p className="font-bold text-slate-700 truncate">{entry.name}</p>
                                    <p className="text-slate-400 font-mono text-[9px]">{entry.Stock} units</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Actionable Operations Summary */}
              <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" /> Clinic Settlement & Inquiry Queue
                  </h4>
                  <p className="text-slate-600 font-light leading-relaxed">
                    There are{" "}
                    <strong>{orders.filter((o) => o.paymentStatus === "Pending" && o.status !== "Cancelled").length} orders</strong>{" "}
                    awaiting manual payment verification and <strong>{unreadMessagesCount} unread consultation messages</strong>.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setAdminTab("orders")}
                    className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-950 text-white font-bold rounded-xl text-[11px] cursor-pointer"
                  >
                    Verify Orders
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdminTab("customers")}
                    className="px-3.5 py-2 bg-white hover:bg-stone-50 border border-emerald-200 text-emerald-900 font-bold rounded-xl text-[11px] cursor-pointer"
                  >
                    Open Inbox
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: ORDERS MANAGEMENT */}
          {adminTab === "orders" && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6 text-left"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-serif font-bold text-emerald-950">Patient Order Fulfillment Queue</h2>
                  <p className="text-xs text-slate-400 font-light">
                    Verify direct payment references, update order status, and coordinate courier dispatch.
                  </p>
                </div>
                <div className="w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="Search by ID or Patient Name..."
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-hidden focus:border-emerald-800 focus:bg-white"
                  />
                </div>
              </div>

              {orders.filter(
                (o) =>
                  o.id.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
                  o.customerDetails.fullName.toLowerCase().includes(orderSearchQuery.toLowerCase())
              ).length > 0 ? (
                <div className="space-y-4">
                  {orders
                    .filter(
                      (o) =>
                        o.id.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
                        o.customerDetails.fullName.toLowerCase().includes(orderSearchQuery.toLowerCase())
                    )
                    .map((order) => {
                      const waText = `Habari ${order.customerDetails.fullName}, PJHerbal Segerea Branch imepokea oda yako ${order.id}. Hali ya oda: ${order.status} (Malipo: ${order.paymentStatus}).`;
                      const waHref = `https://wa.me/${sanitizeWhatsAppPhone(order.customerDetails.phoneNumber)}?text=${encodeURIComponent(waText)}`;
                      return (
                        <div
                          key={order.id}
                          className="border border-stone-200/80 hover:border-emerald-700/40 rounded-2xl overflow-hidden p-5 space-y-4 bg-white transition-all shadow-2xs"
                        >
                          <div className="flex flex-wrap justify-between items-center gap-3 border-b border-slate-100 pb-3 text-xs">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-extrabold text-slate-800">Order ID:</span>
                                <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-sm">
                                  {order.id}
                                </span>
                                <span
                                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                    order.paymentStatus === "Paid"
                                      ? "bg-emerald-100 text-emerald-800"
                                      : order.paymentStatus === "Failed"
                                      ? "bg-rose-100 text-rose-800"
                                      : "bg-amber-100 text-amber-800"
                                  }`}
                                >
                                  Payment: {order.paymentStatus}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500 mt-1">
                                Client: <strong className="text-slate-800 font-semibold">{order.customerDetails.fullName}</strong> (
                                {order.customerDetails.phoneNumber}) • {order.date}
                              </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                              <span className="font-black text-emerald-950 text-sm">
                                {order.totalAmount.toLocaleString()} TZS
                              </span>

                              <div className="flex items-center gap-1.5">
                                <label className="text-[10px] text-slate-400">Payment:</label>
                                <select
                                  value={order.paymentStatus}
                                  onChange={(e) =>
                                    onUpdateOrderAdmin(order.id, {
                                      paymentStatus: e.target.value as "Pending" | "Paid" | "Failed"
                                    })
                                  }
                                  className="bg-stone-100 border border-stone-200 text-[10px] font-bold rounded-lg px-2 py-1.5 outline-hidden text-slate-700 cursor-pointer focus:border-emerald-800"
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Paid">Paid</option>
                                  <option value="Failed">Failed</option>
                                </select>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <label className="text-[10px] text-slate-400">Status:</label>
                                <select
                                  value={order.status}
                                  onChange={(e) => {
                                    const nextStatus = e.target.value as OrderStatus;
                                    const newLogs = [
                                      ...order.trackingLogs,
                                      {
                                        status: nextStatus,
                                        timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
                                        description: `Order status updated to ${nextStatus} by clinic administrator.`
                                      }
                                    ].slice(-25);
                                    onUpdateOrderAdmin(order.id, {
                                      status: nextStatus,
                                      trackingLogs: newLogs
                                    });
                                  }}
                                  className="bg-stone-100 border border-stone-200 text-[10px] font-bold rounded-lg px-2 py-1.5 outline-hidden text-slate-700 cursor-pointer focus:border-emerald-800"
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Paid">Paid</option>
                                  <option value="Processing">Processing</option>
                                  <option value="Dispatched">Dispatched</option>
                                  <option value="Delivered">Delivered</option>
                                  <option value="Cancelled">Cancelled</option>
                                </select>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div className="space-y-1.5">
                              <p className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Items Ordered:</p>
                              <ul className="space-y-1 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                                {order.items.map((item, i) => (
                                  <li key={i} className="font-semibold text-slate-700 flex justify-between">
                                    <span>• {item.productName}</span>
                                    <span className="text-emerald-800 font-mono">x{item.quantity}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="space-y-1.5">
                              <p className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Fulfillment Destination:</p>
                              <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-100 space-y-1">
                                <p className="font-semibold text-slate-700">{order.customerDetails.deliveryAddress}</p>
                                <p className="text-[10px] text-slate-500">
                                  {order.customerDetails.district}, {order.customerDetails.region}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="pt-2.5 flex flex-wrap gap-2 justify-between items-center border-t border-slate-100">
                            <span className="text-[10px] text-slate-500 font-mono">
                              Settlement: <strong>{order.paymentMethod}</strong>
                              {order.paymentReference ? ` • Ref: ${order.paymentReference}` : ""}
                            </span>

                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedTrackingOrderId(order.id);
                                  setAdminTab("delivery");
                                }}
                                className="px-3 py-1.5 bg-amber-50 text-amber-800 hover:bg-amber-100 text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1 border border-amber-200 cursor-pointer"
                              >
                                <Truck className="w-3.5 h-3.5" /> Dispatch Delivery
                              </button>

                              <a
                                href={waHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1 border border-emerald-200"
                              >
                                <MessageSquareCode className="w-3.5 h-3.5" /> WhatsApp Patient
                              </a>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic py-8 bg-slate-50 rounded-xl text-center">
                  No orders found in Firestore matching your search filter.
                </p>
              )}
            </motion.div>
          )}

          {/* TAB 3: DELIVERY & COURIER TRACKING */}
          {adminTab === "delivery" && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6 text-left"
            >
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-serif font-bold text-emerald-950 flex items-center gap-2">
                  <Truck className="w-6 h-6 text-emerald-800" /> Manual Courier Dispatch & Tracking Logger
                </h2>
                <p className="text-xs text-slate-400 font-light mt-1">
                  Assign a Segerea clinic courier, enter a waybill/tracking code, and save real delivery milestones to the patient's Firestore order record.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-4 space-y-3">
                  <h3 className="font-serif font-bold text-sm text-emerald-950">Orders Queue</h3>
                  {orders.length === 0 ? (
                    <p className="text-xs text-slate-400 italic p-4 bg-slate-50 rounded-xl">No orders available to dispatch.</p>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                      {orders.map((o) => (
                        <button
                          key={o.id}
                          type="button"
                          onClick={() => setSelectedTrackingOrderId(o.id)}
                          className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all cursor-pointer ${
                            selectedTrackingOrderId === o.id
                              ? "bg-emerald-50 border-emerald-300 shadow-2xs"
                              : "bg-white border-slate-100 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex justify-between font-bold text-slate-800 mb-1">
                            <span className="font-mono">{o.id}</span>
                            <span className="text-emerald-950">{o.totalAmount.toLocaleString()} TZS</span>
                          </div>
                          <p className="text-slate-600 font-medium truncate">{o.customerDetails.fullName}</p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {o.status} • {o.customerDetails.district}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="md:col-span-8 bg-stone-50/50 border border-stone-200/60 rounded-2xl p-6 space-y-6">
                  {selectedTrackingOrderId ? (
                    (() => {
                      const activeOrder = orders.find((o) => o.id === selectedTrackingOrderId);
                      if (!activeOrder) {
                        return <p className="text-xs text-slate-400">Select an order to configure dispatch.</p>;
                      }

                      return (
                        <div className="space-y-6">
                          <div className="flex justify-between items-start border-b border-slate-200/60 pb-3">
                            <div>
                              <h4 className="font-serif font-bold text-emerald-950 text-base">
                                Dispatch Logistics for {activeOrder.id}
                              </h4>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                Destination: {activeOrder.customerDetails.deliveryAddress}, {activeOrder.customerDetails.district},{" "}
                                {activeOrder.customerDetails.region}
                              </p>
                            </div>
                            <span className="bg-emerald-800 text-white font-mono text-[10px] font-bold px-2.5 py-1 rounded-sm">
                              {activeOrder.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                Assigned Courier
                              </label>
                              <select
                                value={selectedCourier}
                                onChange={(e) => {
                                  const name = e.target.value;
                                  setSelectedCourier(name);
                                  if (COURIER_DIRECTORY[name]) {
                                    setDriverContact(COURIER_DIRECTORY[name]);
                                  }
                                }}
                                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-700 outline-hidden"
                              >
                                <option value="Salim">Salim (Segerea Swift)</option>
                                <option value="Fatma">Fatma (Ilala Courier)</option>
                                <option value="Moses">Moses (BodaBoda Link)</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                Courier Phone
                              </label>
                              <input
                                type="text"
                                value={driverContact}
                                onChange={(e) => setDriverContact(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs outline-hidden font-mono"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                Waybill / Tracking Code
                              </label>
                              <input
                                type="text"
                                value={trackingNoInput}
                                onChange={(e) => setTrackingNoInput(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs outline-hidden font-mono"
                              />
                            </div>
                          </div>

                          <div className="space-y-3">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              Delivery Milestone Step
                            </label>
                            <div className="grid grid-cols-4 gap-2 bg-white p-4 border border-slate-200/70 rounded-xl">
                              {[
                                { id: "assigned", label: "Assigned" },
                                { id: "picked_up", label: "Picked Up" },
                                { id: "en_route", label: "En Route" },
                                { id: "delivered", label: "Delivered" }
                              ].map((step, idx) => {
                                const stepOrder: DeliveryStep[] = ["assigned", "picked_up", "en_route", "delivered"];
                                const activeIdx = stepOrder.indexOf(deliveryStep);
                                const isPassed = stepOrder.indexOf(step.id as DeliveryStep) <= activeIdx;
                                return (
                                  <button
                                    key={step.id}
                                    type="button"
                                    onClick={() => setDeliveryStep(step.id as DeliveryStep)}
                                    className="flex flex-col items-center group cursor-pointer"
                                  >
                                    <div
                                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all ${
                                        isPassed
                                          ? "bg-emerald-800 text-white border-emerald-800 shadow-xs"
                                          : "bg-white text-slate-400 border-slate-200 group-hover:border-slate-400"
                                      }`}
                                    >
                                      {idx + 1}
                                    </div>
                                    <span
                                      className={`text-[10px] font-black mt-1 text-center ${
                                        isPassed ? "text-emerald-950" : "text-slate-400"
                                      }`}
                                    >
                                      {step.label}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {deliverySuccess && (
                            <p className="text-xs font-bold text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                              {deliverySuccess}
                            </p>
                          )}

                          <button
                            type="button"
                            disabled={savingDelivery}
                            onClick={() => handleSaveDeliveryDispatch(activeOrder)}
                            className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-950 disabled:opacity-60 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                            <span>{savingDelivery ? "Saving to Firestore..." : "Save Dispatch & Tracking Update"}</span>
                          </button>

                          <div className="bg-white border border-slate-200/70 rounded-xl p-4 space-y-2">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              Recorded Order Timeline ({activeOrder.trackingLogs.length})
                            </p>
                            <div className="space-y-1.5 max-h-40 overflow-y-auto text-xs">
                              {activeOrder.trackingLogs.map((log, i) => (
                                <div key={i} className="flex justify-between gap-3 border-b border-slate-100 pb-1 last:border-0">
                                  <span className="text-slate-700">
                                    <strong className="text-emerald-900">{log.status}:</strong> {log.description}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-mono shrink-0">{log.timestamp}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="py-20 text-center space-y-2 text-slate-400">
                      <Truck className="w-12 h-12 text-slate-300 mx-auto" />
                      <p className="text-xs italic">Select an order from the queue to update courier dispatch details.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: DISPENSARY STOCK & CATALOG */}
          {adminTab === "inventory" && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-8 text-left"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-serif font-bold text-emerald-950">Dispensary Stock & Formulation Database</h2>
                  <p className="text-xs text-slate-400 font-light">
                    Manage Segerea inventory stock levels, remove discontinued items, and publish new formulations.
                  </p>
                </div>
                <div className="w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="Search formulations..."
                    value={inventorySearch}
                    onChange={(e) => setInventorySearch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-hidden focus:border-emerald-800 focus:bg-white"
                  />
                </div>
              </div>

              {products.length === 0 && (
                <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <p className="text-xs text-amber-900">
                    No products are currently stored in Firestore. You can seed the starter PJHerbal dispensary catalog now or add one manually below.
                  </p>
                  <button
                    type="button"
                    onClick={handleSeedCatalog}
                    disabled={isSeeding}
                    className="px-4 py-2 bg-emerald-800 hover:bg-emerald-950 text-white text-xs font-extrabold rounded-xl shrink-0 cursor-pointer"
                  >
                    {isSeeding ? "Initializing..." : "Initialize Starter Dispensary Catalog"}
                  </button>
                </div>
              )}

              {lowStockProducts.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
                  <h4 className="font-bold text-amber-900 text-xs flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4 text-amber-700" /> Low Stock Alerts ({lowStockProducts.length})
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-amber-800 font-light">
                    {lowStockProducts.map((p) => (
                      <li key={p.id}>
                        • <strong>{p.name}</strong> — Only {p.stock} bottles remaining.
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                {/* Create Form */}
                <div className="xl:col-span-4 bg-slate-50/70 border border-slate-200 rounded-2xl p-5 space-y-4">
                  <div className="border-b border-slate-200 pb-2">
                    <h3 className="font-serif font-bold text-emerald-950 text-base flex items-center gap-1.5">
                      <Plus className="w-4 h-4 text-emerald-800" /> New Formulation
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Publish new herbal formulations directly to Firestore.</p>
                  </div>

                  {prodSuccess && (
                    <p className="text-xs font-bold text-emerald-700 bg-emerald-100/60 p-2.5 rounded-lg border border-emerald-200">
                      {prodSuccess}
                    </p>
                  )}
                  {prodError && (
                    <p className="text-xs font-bold text-rose-700 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                      {prodError}
                    </p>
                  )}

                  <form onSubmit={handleCreateProduct} className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Supplement Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., PJ Prostate Shield Max"
                        value={newProdName}
                        onChange={(e) => setNewProdName(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs outline-hidden focus:border-emerald-700 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Category
                      </label>
                      <select
                        value={newProdCategory}
                        onChange={(e) => setNewProdCategory(e.target.value as Category)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-700 outline-hidden"
                      >
                        {categories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Price (TZS)
                        </label>
                        <input
                          type="number"
                          required
                          min={100}
                          value={newProdPrice}
                          onChange={(e) => setNewProdPrice(Number(e.target.value))}
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs outline-hidden focus:border-emerald-700 font-mono font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Initial Stock
                        </label>
                        <input
                          type="number"
                          required
                          min={0}
                          value={newProdStock}
                          onChange={(e) => setNewProdStock(Number(e.target.value))}
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs outline-hidden focus:border-emerald-700 font-mono font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Health Benefits Summary
                      </label>
                      <textarea
                        required
                        rows={2}
                        placeholder="e.g., Supports urinary comfort and healthy cellular function..."
                        value={newProdBenefits}
                        onChange={(e) => setNewProdBenefits(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs outline-hidden focus:border-emerald-700"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Product Image URL (HTTPS)
                      </label>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 bg-white p-2 border border-slate-200 rounded-lg">
                          <img
                            src={newProdImage}
                            alt="Preview"
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 rounded-md object-cover bg-slate-50 border border-slate-100 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = IMAGE_PRESETS[0].url;
                            }}
                          />
                          <input
                            type="url"
                            required
                            maxLength={500}
                            placeholder="https://images.unsplash.com/..."
                            value={newProdImage}
                            onChange={(e) => setNewProdImage(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-[11px] outline-hidden focus:border-emerald-700 font-mono"
                          />
                        </div>

                        <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                            Quick Verified Image Presets:
                          </p>
                          <div className="grid grid-cols-4 gap-1.5">
                            {IMAGE_PRESETS.map((preset) => (
                              <button
                                key={preset.id}
                                type="button"
                                onClick={() => setNewProdImage(preset.url)}
                                className={`group relative h-10 rounded-md overflow-hidden border-2 transition-all cursor-pointer ${
                                  newProdImage === preset.url
                                    ? "border-emerald-700 ring-2 ring-emerald-100"
                                    : "border-slate-100 hover:border-slate-300"
                                }`}
                                title={preset.label}
                              >
                                <img
                                  src={preset.url}
                                  alt={preset.label}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover"
                                />
                                <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[8px] text-white py-0.5 text-center font-medium">
                                  {preset.label}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={savingProd}
                      className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-950 disabled:opacity-60 text-white font-extrabold text-[11px] uppercase tracking-wider rounded-xl transition-all shadow-xs cursor-pointer"
                    >
                      {savingProd ? "Publishing..." : "Publish Formulation"}
                    </button>
                  </form>
                </div>

                {/* Stock Table */}
                <div className="xl:col-span-8 space-y-4">
                  <h3 className="font-serif font-bold text-sm text-emerald-950">Active Dispensary Stock Control</h3>
                  <div className="border border-stone-200 rounded-2xl overflow-hidden shadow-2xs bg-white">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-stone-50 border-b border-stone-200 font-bold text-slate-500">
                            <th className="p-4">Supplement Name</th>
                            <th className="p-4">Category</th>
                            <th className="p-4">Price</th>
                            <th className="p-4 text-center">Stock</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {products
                            .filter((p) => p.name.toLowerCase().includes(inventorySearch.toLowerCase()))
                            .map((prod) => (
                              <tr key={prod.id} className="hover:bg-slate-50/50">
                                <td className="p-4">
                                  <div className="font-bold text-slate-800">{prod.name}</div>
                                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">{prod.id}</div>
                                </td>
                                <td className="p-4 text-slate-500 font-medium">{prod.category}</td>
                                <td className="p-4 font-mono font-bold text-emerald-900">
                                  {prod.price.toLocaleString()} TZS
                                </td>
                                <td className="p-4 text-center">
                                  <span
                                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                      prod.stock <= 5 ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                                    }`}
                                  >
                                    {prod.stock} left
                                  </span>
                                </td>
                                <td className="p-4 text-right">
                                  <div className="flex gap-1.5 justify-end items-center">
                                    <button
                                      type="button"
                                      onClick={() => onUpdateStock(prod.id, prod.stock + 10)}
                                      className="px-2 py-1 bg-stone-100 text-stone-700 hover:bg-emerald-800 hover:text-white rounded-md text-[10px] font-bold transition-all cursor-pointer"
                                    >
                                      +10
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => onUpdateStock(prod.id, Math.max(0, prod.stock - 1))}
                                      className="px-2 py-1 bg-stone-100 text-stone-700 hover:bg-amber-700 hover:text-white rounded-md text-[10px] font-bold transition-all cursor-pointer"
                                    >
                                      -1
                                    </button>
                                    {confirmDeleteProdId === prod.id ? (
                                      <button
                                        type="button"
                                        onClick={async () => {
                                          await onDeleteProduct(prod.id);
                                          setConfirmDeleteProdId(null);
                                        }}
                                        className="px-2 py-1 bg-rose-700 text-white rounded-md text-[10px] font-bold cursor-pointer"
                                      >
                                        Confirm
                                      </button>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => setConfirmDeleteProdId(prod.id)}
                                        className="p-1.5 text-slate-400 hover:text-rose-700 rounded-md transition-colors cursor-pointer"
                                        title="Delete formulation"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 5: PATIENT REGISTRY & CONTACT INBOX */}
          {adminTab === "customers" && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-8 text-left"
            >
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-serif font-bold text-emerald-950 flex items-center gap-2">
                  <Users className="w-6 h-6 text-emerald-800" /> Patient Registry & Clinical Inbox
                </h2>
                <p className="text-xs text-slate-400 font-light mt-1">
                  Manage registered patient profiles, save confidential clinical notes to Firestore, and reply to patient inquiries.
                </p>
              </div>

              <input
                type="text"
                placeholder="Search by patient name, email, mobile, or district..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-hidden focus:border-emerald-800 focus:bg-white"
              />

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                <div className="xl:col-span-7 border border-stone-200 rounded-2xl overflow-hidden shadow-2xs bg-white">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-stone-50 border-b border-stone-200 font-bold text-slate-500">
                          <th className="p-4">Patient Profile</th>
                          <th className="p-4">Contact & Location</th>
                          <th className="p-4 text-center">Orders</th>
                          <th className="p-4 text-right">Total Spend</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(() => {
                          const allPatients: CompiledPatient[] = Object.values(compiledPatients);
                          const list = allPatients.filter(
                            (c) =>
                              c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                              c.email.toLowerCase().includes(customerSearch.toLowerCase()) ||
                              c.phone.includes(customerSearch) ||
                              c.district.toLowerCase().includes(customerSearch.toLowerCase())
                          );

                          if (list.length === 0) {
                            return (
                              <tr>
                                <td colSpan={4} className="p-8 text-center text-slate-400 italic">
                                  No registered patient records found in Firestore.
                                </td>
                              </tr>
                            );
                          }

                          return list.map((customer) => (
                            <tr
                              key={customer.email}
                              onClick={() => {
                                setSelectedCustomerEmail(customer.email);
                                setCustomerNoteInput(notesByEmail[customer.email] || "");
                                setNoteStatusMsg("");
                              }}
                              className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                                selectedCustomerEmail === customer.email ? "bg-emerald-50/50" : ""
                              }`}
                            >
                              <td className="p-4">
                                <div className="font-extrabold text-slate-800">{customer.name}</div>
                                <div className="text-[10px] text-slate-400 mt-0.5 font-mono">{customer.email}</div>
                              </td>
                              <td className="p-4 space-y-0.5">
                                <div className="font-medium text-slate-600">{customer.phone}</div>
                                <div className="text-[10px] text-slate-400">
                                  {customer.district}, {customer.region}
                                </div>
                              </td>
                              <td className="p-4 text-center font-bold text-slate-700">{customer.count}</td>
                              <td className="p-4 text-right font-black font-mono text-emerald-950">
                                {customer.totalSpend.toLocaleString()} TZS
                              </td>
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Patient Note Card */}
                <div className="xl:col-span-5 bg-stone-50 border border-stone-200 rounded-2xl p-6 space-y-4">
                  {selectedCustomerEmail && compiledPatients[selectedCustomerEmail] ? (
                    (() => {
                      const selectedC = compiledPatients[selectedCustomerEmail];
                      const waUrl = `https://wa.me/${sanitizeWhatsAppPhone(selectedC.phone)}?text=${encodeURIComponent(
                        `Habari ${selectedC.name}, hapa ni PJHerbal Clinic Segerea tukikufuata kuhusu huduma yako.`
                      )}`;
                      return (
                        <div className="space-y-4">
                          <div className="border-b border-slate-200 pb-3">
                            <span className="text-[9px] font-black text-emerald-800 uppercase tracking-widest block mb-0.5">
                              Active Patient File
                            </span>
                            <h4 className="font-serif font-bold text-emerald-950 text-base">{selectedC.name}</h4>
                            <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                              {selectedC.email} | {selectedC.phone}
                            </p>
                          </div>

                          <div className="space-y-1.5 text-xs">
                            <p className="font-bold text-slate-500 uppercase text-[9px] tracking-wider">Delivery Address:</p>
                            <p className="text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 font-light">
                              {selectedC.address}, {selectedC.district}, {selectedC.region}
                            </p>
                          </div>

                          <div className="space-y-1.5 text-xs">
                            <p className="font-bold text-slate-500 uppercase text-[9px] tracking-wider">
                              Clinical Notes & Preferences (Firestore):
                            </p>
                            <textarea
                              rows={4}
                              value={customerNoteInput}
                              onChange={(e) => setCustomerNoteInput(e.target.value)}
                              placeholder="Record clinical consultation notes, dosage guidance, or delivery instructions..."
                              className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs outline-hidden focus:border-emerald-700 leading-relaxed"
                            />
                          </div>

                          {noteStatusMsg && (
                            <p className="text-xs font-bold text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                              {noteStatusMsg}
                            </p>
                          )}

                          <div className="flex gap-2">
                            <button
                              type="button"
                              disabled={savingNote}
                              onClick={() => handleSavePatientNote(selectedC.email, selectedC.name)}
                              className="flex-1 py-2 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-60 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                            >
                              {savingNote ? "Saving..." : "Save Clinical Notes"}
                            </button>

                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3.5 py-2 bg-white hover:bg-stone-100 border border-slate-200 rounded-lg transition-all flex items-center justify-center text-emerald-800"
                              title="Message via WhatsApp"
                            >
                              <MessageSquareCode className="w-4 h-4" />
                            </a>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="py-20 text-center text-slate-400 space-y-2">
                      <Users className="w-12 h-12 text-slate-300 mx-auto" />
                      <p className="text-xs italic">Click a patient record on the left to view or update clinical notes.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Messages Inbox */}
              <div className="border-t border-slate-100 pt-6 space-y-4">
                <h3 className="font-serif font-bold text-base text-emerald-950 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-800" /> Patient Contact Messages Inbox ({contactMessages.length})
                </h3>
                {contactMessages.length === 0 ? (
                  <p className="text-xs text-slate-400 italic p-5 bg-slate-50 rounded-xl">
                    No consultation messages submitted yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {contactMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className="p-4 rounded-2xl border border-slate-200 bg-white flex flex-col sm:flex-row justify-between gap-4 text-xs"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{msg.name}</span>
                            <span className="text-[11px] font-mono text-slate-500">{msg.email}</span>
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                msg.status === "Replied"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {msg.status}
                            </span>
                          </div>
                          <p className="text-slate-600 leading-relaxed">{msg.message}</p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                          {msg.status !== "Replied" && (
                            <button
                              type="button"
                              onClick={() => markContactMessageRepliedDoc(msg.id)}
                              className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-950 text-white font-bold text-[10px] rounded-lg cursor-pointer"
                            >
                              Mark Replied
                            </button>
                          )}
                          <a
                            href={`mailto:${msg.email}?subject=${encodeURIComponent("PJHerbal Clinic Segerea Consultation Reply")}`}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] rounded-lg"
                          >
                            Email Reply
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 6: PROMO & WHATSAPP */}
          {adminTab === "marketing" && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-8 text-left"
            >
              <div>
                <h2 className="text-xl font-serif font-bold text-emerald-950">Promo Campaigns & WhatsApp CRM</h2>
                <p className="text-xs text-slate-400 font-light mt-1">
                  Create checkout discount codes in Firestore and launch real WhatsApp patient outreach messages.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                <h3 className="font-serif font-bold text-emerald-950 text-base">Generate Promo Code</h3>

                {campSuccess && <p className="text-xs font-bold text-emerald-700 bg-emerald-100/60 p-2.5 rounded-lg">{campSuccess}</p>}
                {campError && <p className="text-xs font-bold text-rose-700 bg-rose-50 p-2.5 rounded-lg">{campError}</p>}

                <form onSubmit={handleCreateCampaign} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Coupon Code</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., SEGEREA15"
                      value={newCampCode}
                      onChange={(e) => setNewCampCode(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs outline-hidden focus:border-emerald-700 uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Discount %</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={100}
                      value={newCampDiscount}
                      onChange={(e) => setNewCampDiscount(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs outline-hidden focus:border-emerald-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Campaign Description</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Wellness seasonal discount"
                      value={newCampDesc}
                      onChange={(e) => setNewCampDesc(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs outline-hidden focus:border-emerald-700"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-emerald-800 text-white font-bold text-xs rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer"
                    >
                      Save & Activate Campaign Code
                    </button>
                  </div>
                </form>
              </div>

              <div className="space-y-3">
                <h3 className="font-serif font-bold text-sm text-emerald-950">Clinic Promo Codes ({campaigns.length})</h3>
                {campaigns.length === 0 ? (
                  <p className="text-xs text-slate-400 italic p-4 bg-slate-50 rounded-xl">No promo campaigns created yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {campaigns.map((camp) => (
                      <div
                        key={camp.id}
                        className={`border rounded-xl p-4 bg-white space-y-2 text-left ${
                          camp.active ? "border-emerald-200" : "border-slate-200 opacity-75"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-sm text-xs">
                            {camp.code}
                          </span>
                          <span className="text-xs font-bold text-emerald-950">{camp.discountPercentage}% Off</span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-light">{camp.description}</p>
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => onToggleCampaign(camp.id, !camp.active)}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 hover:underline cursor-pointer"
                          >
                            {camp.active ? <PauseCircle className="w-3.5 h-3.5" /> : <PlayCircle className="w-3.5 h-3.5" />}
                            <span>{camp.active ? "Pause" : "Activate"}</span>
                          </button>

                          {confirmDeleteCampId === camp.id ? (
                            <button
                              type="button"
                              onClick={async () => {
                                await onDeleteCampaign(camp.id);
                                setConfirmDeleteCampId(null);
                              }}
                              className="text-[10px] font-bold text-white bg-rose-700 px-2 py-0.5 rounded cursor-pointer"
                            >
                              Confirm Delete
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteCampId(camp.id)}
                              className="text-slate-400 hover:text-rose-700 cursor-pointer"
                              title="Delete campaign"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Real WhatsApp CRM Launcher + Firestore Dispatch Log */}
              <div className="border border-slate-200 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-12 gap-8">
                <div className="md:col-span-5 space-y-4">
                  <h3 className="font-serif font-bold text-sm text-emerald-950">WhatsApp Patient Outreach</h3>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Patient WhatsApp Number
                    </label>
                    <input
                      type="text"
                      value={whatsappPhone}
                      onChange={(e) => setWhatsappPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Message Template
                    </label>
                    <select
                      value={whatsappTemplate}
                      onChange={(e) => applyWhatsAppTemplate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-700 font-semibold outline-hidden cursor-pointer"
                    >
                      <option value="order-notification">Order Packed Notification</option>
                      <option value="follow-up">Patient Dosage Check-in</option>
                      <option value="promo-offer">Active Promo Broadcast</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Message Text
                    </label>
                    <textarea
                      rows={3}
                      value={whatsappMessage}
                      onChange={(e) => setWhatsappMessage(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-hidden"
                    />
                  </div>

                  {whatsappFeedback && (
                    <p className="text-[11px] font-bold text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                      {whatsappFeedback}
                    </p>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2">
                    <a
                      href={`https://wa.me/${sanitizeWhatsAppPhone(whatsappPhone)}?text=${encodeURIComponent(whatsappMessage)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2.5 bg-emerald-800 hover:bg-emerald-950 text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open in WhatsApp</span>
                    </a>
                    <button
                      type="button"
                      disabled={loggingDispatch}
                      onClick={handleLogWhatsAppDispatch}
                      className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-slate-800 font-bold text-xs rounded-lg transition-all cursor-pointer"
                    >
                      {loggingDispatch ? "Logging..." : "Log Dispatch to DB"}
                    </button>
                  </div>
                </div>

                <div className="md:col-span-7 bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 max-h-80 overflow-y-auto">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-widest">
                      Logged Outreach History (Firestore)
                    </span>
                    <span className="text-[10px] font-mono text-emerald-800 font-bold">{campaignLogs.length} records</span>
                  </div>
                  {campaignLogs.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-8 text-center">
                      No outreach dispatches logged yet. Click &quot;Log Dispatch to DB&quot; after opening WhatsApp.
                    </p>
                  ) : (
                    campaignLogs.map((log) => (
                      <div key={log.id} className="bg-white p-3 rounded-lg border border-slate-200/70 text-xs space-y-1">
                        <div className="flex justify-between font-mono text-[10px] text-slate-500">
                          <span>To: {log.phone}</span>
                          <span>Template: {log.template}</span>
                        </div>
                        <p className="text-slate-700">{log.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 7: BLOGS & SEO SUITE */}
          {adminTab === "blog-seo" && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6 text-left"
            >
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-serif font-bold text-emerald-950 flex items-center gap-2">
                  <Globe className="w-6 h-6 text-emerald-800" /> Clinical Blogs & SEO Suite
                </h2>
                <p className="text-xs text-slate-400 font-light mt-1">
                  Publish educational articles to Firestore and inspect dynamic sitemap routes.
                </p>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                <div className="xl:col-span-4 bg-slate-50/70 border border-slate-200 rounded-2xl p-5 space-y-4">
                  <div className="border-b border-slate-200 pb-2">
                    <h3 className="font-serif font-bold text-emerald-950 text-base flex items-center gap-1.5">
                      <FileEdit className="w-4 h-4 text-emerald-800" /> Publish Health Blog
                    </h3>
                  </div>

                  {blogSuccess && (
                    <p className="text-xs font-bold text-emerald-700 bg-emerald-100/60 p-2.5 rounded-lg border border-emerald-200">
                      {blogSuccess}
                    </p>
                  )}
                  {blogError && (
                    <p className="text-xs font-bold text-rose-700 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                      {blogError}
                    </p>
                  )}

                  <form onSubmit={handleCreateBlog} className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Article Title
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., Moringa Benefits for Daily Vitality"
                        value={newBlogTitle}
                        onChange={(e) => setNewBlogTitle(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs outline-hidden focus:border-emerald-700 font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Author
                        </label>
                        <input
                          type="text"
                          required
                          value={newBlogAuthor}
                          onChange={(e) => setNewBlogAuthor(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs outline-hidden focus:border-emerald-700"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Tags (comma-sep)
                        </label>
                        <input
                          type="text"
                          placeholder="Moringa, Segerea"
                          value={newBlogTags}
                          onChange={(e) => setNewBlogTags(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs outline-hidden focus:border-emerald-700"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Cover Image URL
                      </label>
                      <input
                        type="url"
                        required
                        value={newBlogImage}
                        onChange={(e) => setNewBlogImage(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs outline-hidden focus:border-emerald-700 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Excerpt Summary
                      </label>
                      <input
                        type="text"
                        placeholder="Short overview shown on article cards..."
                        value={newBlogExcerpt}
                        onChange={(e) => setNewBlogExcerpt(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs outline-hidden focus:border-emerald-700"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Body Content
                      </label>
                      <textarea
                        required
                        rows={4}
                        placeholder="Enter full clinical article text..."
                        value={newBlogContent}
                        onChange={(e) => setNewBlogContent(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs outline-hidden focus:border-emerald-700 leading-relaxed"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={savingBlog}
                      className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-950 disabled:opacity-60 text-white font-extrabold text-[11px] uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                    >
                      {savingBlog ? "Publishing..." : "Publish Article"}
                    </button>
                  </form>
                </div>

                <div className="xl:col-span-8 space-y-6">
                  <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs bg-white">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500">
                            <th className="p-4">Author</th>
                            <th className="p-4">Article Title</th>
                            <th className="p-4">Tag</th>
                            <th className="p-4 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {blogs.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="p-6 text-center text-slate-400 italic">
                                No blog articles published yet.
                              </td>
                            </tr>
                          ) : (
                            blogs.map((b) => (
                              <tr key={b.id} className="hover:bg-slate-50/50">
                                <td className="p-4">
                                  <div className="font-bold text-slate-800">{b.author}</div>
                                  <div className="text-[10px] text-slate-400 mt-0.5">{b.date}</div>
                                </td>
                                <td className="p-4 text-slate-700 font-medium max-w-xs truncate">{b.title}</td>
                                <td className="p-4 font-mono text-emerald-800">{b.tags[0] || "Wellness"}</td>
                                <td className="p-4 text-right">
                                  {confirmDeleteBlogId === b.id ? (
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        await onDeleteBlog(b.id);
                                        setConfirmDeleteBlogId(null);
                                      }}
                                      className="px-2 py-1 bg-rose-700 text-white rounded text-[10px] font-bold cursor-pointer"
                                    >
                                      Confirm
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => setConfirmDeleteBlogId(b.id)}
                                      className="p-1.5 text-slate-400 hover:text-rose-700 cursor-pointer"
                                      title="Delete blog article"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="bg-slate-900 text-amber-400 p-5 rounded-2xl border border-slate-800 font-mono text-[10px] text-left space-y-1 shadow-inner">
                    <p className="text-slate-400 font-bold border-b border-slate-800 pb-1 flex justify-between">
                      <span>XML SITEMAP PREVIEW</span>
                      <span>{2 + blogs.length} ROUTES</span>
                    </p>
                    <p>&lt;?xml version=&quot;1.0&quot; encoding=&quot;UTF-8&quot;?&gt;</p>
                    <p>&lt;urlset xmlns=&quot;http://www.sitemaps.org/schemas/sitemap/0.9&quot;&gt;</p>
                    <p>&nbsp;&nbsp;&lt;url&gt;&lt;loc&gt;https://pjherbal-segerea.com/&lt;/loc&gt;&lt;priority&gt;1.0&lt;/priority&gt;&lt;/url&gt;</p>
                    <p>&nbsp;&nbsp;&lt;url&gt;&lt;loc&gt;https://pjherbal-segerea.com/shop&lt;/loc&gt;&lt;priority&gt;0.9&lt;/priority&gt;&lt;/url&gt;</p>
                    {blogs.map((b) => (
                      <p key={b.id}>
                        &nbsp;&nbsp;&lt;url&gt;&lt;loc&gt;https://pjherbal-segerea.com/blog/{b.slug}&lt;/loc&gt;&lt;priority&gt;0.7&lt;/priority&gt;&lt;/url&gt;
                      </p>
                    ))}
                    <p>&lt;/urlset&gt;</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 8: LANDING PAGES MANAGER */}
          {adminTab === "landing-pages" && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6 text-left"
            >
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-serif font-bold text-emerald-950 flex items-center gap-2">
                  <LayoutTemplate className="w-6 h-6 text-emerald-800" /> Landing Pages & Storefront Controller
                </h2>
                <p className="text-xs text-slate-400 font-light mt-1">
                  Changes saved here write to Firestore (siteSettings/clinic) and update the live header and homepage hero immediately.
                </p>
              </div>

              {settingsError && (
                <p className="text-xs font-bold text-rose-700 bg-rose-50 p-3 rounded-xl border border-rose-200">
                  {settingsError}
                </p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                    <h3 className="font-serif font-bold text-emerald-950 text-sm">Announcement Bar Control</h3>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                        Active Announcement Message
                      </label>
                      <textarea
                        rows={2}
                        value={announcementText}
                        onChange={(e) => {
                          setAnnouncementText(e.target.value);
                          setAnnouncementSaved(false);
                        }}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs outline-hidden focus:border-emerald-700 leading-normal"
                      />
                    </div>
                    <button
                      type="button"
                      disabled={savingSettings}
                      onClick={() => handleSaveSettings("announcement")}
                      className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-60 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                    >
                      {savingSettings ? "Saving..." : announcementSaved ? "Saved to Live Site!" : "Save Announcement"}
                    </button>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                    <h3 className="font-serif font-bold text-emerald-950 text-sm">Hero Promotional Canvas</h3>
                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Hero Badge Text</label>
                        <input
                          type="text"
                          value={heroBadgeText}
                          onChange={(e) => {
                            setHeroBadgeText(e.target.value);
                            setHeroSaved(false);
                          }}
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs outline-hidden focus:border-emerald-700"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Hero Display Title</label>
                        <input
                          type="text"
                          value={heroTitleText}
                          onChange={(e) => {
                            setHeroTitleText(e.target.value);
                            setHeroSaved(false);
                          }}
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs outline-hidden focus:border-emerald-700 font-serif font-bold text-emerald-950"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Hero Description</label>
                        <textarea
                          rows={3}
                          value={heroDescText}
                          onChange={(e) => {
                            setHeroDescText(e.target.value);
                            setHeroSaved(false);
                          }}
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs outline-hidden focus:border-emerald-700 leading-normal"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={savingSettings}
                      onClick={() => handleSaveSettings("hero")}
                      className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-60 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                    >
                      {savingSettings ? "Saving..." : heroSaved ? "Live Hero Updated!" : "Save Hero Settings"}
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-serif font-bold text-sm text-emerald-950">Live Homepage Preview</h3>

                  <div className="bg-emerald-900 text-amber-300 py-1.5 px-3 text-[10px] font-extrabold tracking-wide text-center uppercase border-b border-amber-400/20 rounded-md">
                    {announcementText}
                  </div>

                  <div className="relative rounded-2xl overflow-hidden aspect-video bg-emerald-950 flex items-center p-6 text-left border border-emerald-800 shadow-md">
                    <div className="relative z-10 max-w-sm space-y-2">
                      <span className="inline-block bg-amber-500/25 border border-amber-400 text-amber-300 font-black text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-full">
                        {heroBadgeText}
                      </span>
                      <h4 className="font-serif font-extrabold text-white text-base sm:text-lg leading-tight">
                        {heroTitleText}
                      </h4>
                      <p className="text-[10px] text-slate-300 leading-relaxed font-light">{heroDescText}</p>
                      <span className="inline-block px-3 py-1.5 bg-amber-500 text-emerald-950 font-black text-[9px] uppercase tracking-wider rounded-lg">
                        Shop Supplements Now
                      </span>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-4 text-xs space-y-2">
                    <p className="font-bold text-slate-800">Segerea Clinic Physical Coordinates:</p>
                    <ul className="text-[11px] text-slate-600 space-y-1">
                      <li>• <strong>Address:</strong> Segerea Mwisho, Catholic Church Road, Dar es Salaam, TZ</li>
                      <li>• <strong>Consultation Line:</strong> +255 629 899 017</li>
                      <li>• <strong>Working Hours:</strong> Monday - Sunday (8:00 AM - 10:00 PM)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
