import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  writeBatch,
  Unsubscribe
} from "firebase/firestore";
import {
  db,
  auth,
  serverTimestamp,
  OperationType,
  handleFirestoreError,
  toSlug,
  safeId
} from "./firebase";
import {
  Product,
  Review,
  BlogArticle,
  PromoCampaign,
  Order,
  OrderStatus,
  DeliveryStep,
  SiteSettings,
  UserProfile,
  ContactMessage,
  PatientNote,
  CampaignDispatchLog
} from "../types";
import { INITIAL_PRODUCTS, INITIAL_BLOGS, INITIAL_CAMPAIGNS } from "../data";

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  announcementText: "Segerea Branch, Dar es Salaam, Tanzania • Fast Delivery Nationwide • +255 629 899 017",
  heroBadgeText: "100% Organic & Certified",
  heroTitleText: "Premium Herbal Science for Perfect Health",
  heroDescText:
    "Discover Tanzania's most trusted natural nutritional supplements. Formulated by clinical wellness specialists to restore, protect, and energize your daily health."
};

function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) {
      result[k] = v;
    }
  }
  return result as T;
}

// ==========================================
// PUBLIC SUBSCRIPTIONS (Products, Blogs, Campaigns, SiteSettings)
// ==========================================

export function subscribeProducts(
  onData: (products: Product[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const path = "products";
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: Product[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          ...(data as Omit<Product, "reviews">),
          id: d.id,
          reviews: []
        };
      });
      onData(list);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export function subscribeBlogs(
  onData: (blogs: BlogArticle[]) => void
): Unsubscribe {
  const path = "blogs";
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: BlogArticle[] = snapshot.docs.map((d) => ({
        ...(d.data() as BlogArticle),
        id: d.id
      }));
      onData(list);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, path)
  );
}

export function subscribeCampaigns(
  onData: (campaigns: PromoCampaign[]) => void
): Unsubscribe {
  const path = "campaigns";
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: PromoCampaign[] = snapshot.docs.map((d) => ({
        ...(d.data() as PromoCampaign),
        id: d.id
      }));
      onData(list);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, path)
  );
}

export function subscribeSiteSettings(
  onData: (settings: SiteSettings) => void
): Unsubscribe {
  const path = "siteSettings/clinic";
  return onSnapshot(
    doc(db, "siteSettings", "clinic"),
    (snap) => {
      if (snap.exists()) {
        onData(snap.data() as SiteSettings);
      } else {
        onData(DEFAULT_SITE_SETTINGS);
      }
    },
    (error) => handleFirestoreError(error, OperationType.GET, path)
  );
}

export function subscribeProductReviews(
  productId: string,
  onData: (reviews: Review[]) => void
): Unsubscribe {
  const path = `products/${productId}/reviews`;
  return onSnapshot(
    query(collection(db, "products", productId, "reviews"), orderBy("createdAt", "desc")),
    (snapshot) => {
      const list: Review[] = snapshot.docs.map((d) => ({
        ...(d.data() as Review),
        id: d.id
      }));
      onData(list);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, path)
  );
}

// ==========================================
// AUTHENTICATED SUBSCRIPTIONS (Orders, UserProfile, Admin Docs)
// ==========================================

export function subscribeUserProfile(
  uid: string,
  onData: (profile: UserProfile | null) => void
): Unsubscribe {
  const path = `users/${uid}`;
  return onSnapshot(
    doc(db, "users", uid),
    (snap) => {
      onData(snap.exists() ? (snap.data() as UserProfile) : null);
    },
    (error) => handleFirestoreError(error, OperationType.GET, path)
  );
}

export function subscribeOrders(
  uid: string,
  isAdmin: boolean,
  onData: (orders: Order[]) => void
): Unsubscribe {
  const path = "orders";
  const q = isAdmin
    ? query(collection(db, path), orderBy("createdAt", "desc"))
    : query(collection(db, path), where("userId", "==", uid));

  return onSnapshot(
    q,
    (snapshot) => {
      const list: Order[] = snapshot.docs.map((d) => ({
        ...(d.data() as Order),
        id: d.id
      }));
      list.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
      onData(list);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, path)
  );
}

export function subscribeAdminData(
  onUsers: (users: UserProfile[]) => void,
  onMessages: (msgs: ContactMessage[]) => void,
  onNotes: (notes: PatientNote[]) => void,
  onCampaignLogs: (logs: CampaignDispatchLog[]) => void
): () => void {
  const unsubUsers = onSnapshot(
    collection(db, "users"),
    (snap) => onUsers(snap.docs.map((d) => d.data() as UserProfile)),
    (err) => handleFirestoreError(err, OperationType.LIST, "users")
  );
  const unsubMsgs = onSnapshot(
    query(collection(db, "contactMessages"), orderBy("createdAt", "desc")),
    (snap) => onMessages(snap.docs.map((d) => d.data() as ContactMessage)),
    (err) => handleFirestoreError(err, OperationType.LIST, "contactMessages")
  );
  const unsubNotes = onSnapshot(
    collection(db, "patientNotes"),
    (snap) => onNotes(snap.docs.map((d) => d.data() as PatientNote)),
    (err) => handleFirestoreError(err, OperationType.LIST, "patientNotes")
  );
  const unsubLogs = onSnapshot(
    query(collection(db, "campaignLogs"), orderBy("createdAt", "desc")),
    (snap) => onCampaignLogs(snap.docs.map((d) => d.data() as CampaignDispatchLog)),
    (err) => handleFirestoreError(err, OperationType.LIST, "campaignLogs")
  );

  return () => {
    unsubUsers();
    unsubMsgs();
    unsubNotes();
    unsubLogs();
  };
}

// ==========================================
// MUTATIONS
// ==========================================

const ensureProfileInFlight = new Map<string, Promise<UserProfile>>();

export async function ensureUserProfile(
  uid: string,
  email: string,
  displayName?: string | null
): Promise<UserProfile> {
  const existingPromise = ensureProfileInFlight.get(uid);
  if (existingPromise) {
    return existingPromise;
  }

  const task = (async () => {
    const path = `users/${uid}`;
    const ref = doc(db, "users", uid);
    try {
      const snap = await getDoc(ref);
      if (snap.exists()) {
        return snap.data() as UserProfile;
      }
      const cleanName = (displayName || email.split("@")[0] || "Patient").slice(0, 120);
      const newProfile: UserProfile = {
        uid,
        name: cleanName,
        email: email.slice(0, 150),
        phone: "",
        region: "Dar es Salaam",
        district: "Ilala (includes Segerea)",
        address: "",
        role: "customer",
        wishlistIds: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      await setDoc(ref, newProfile);
      return newProfile;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    } finally {
      ensureProfileInFlight.delete(uid);
    }
  })();

  ensureProfileInFlight.set(uid, task);
  return task;
}

export async function updateUserProfileFields(
  uid: string,
  updates: Partial<Pick<UserProfile, "name" | "phone" | "region" | "district" | "address" | "wishlistIds">>
): Promise<void> {
  const path = `users/${uid}`;
  try {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);
    if (!snap.exists() && auth.currentUser?.email) {
      await ensureUserProfile(uid, auth.currentUser.email, auth.currentUser.displayName);
    }
    await updateDoc(ref, {
      ...stripUndefined(updates),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function createOrderDoc(
  orderInput: Omit<Order, "userId" | "createdAt" | "updatedAt">
): Promise<void> {
  if (!auth.currentUser) throw new Error("Authentication required to place an order.");
  const path = `orders/${orderInput.id}`;
  try {
    const payload = stripUndefined({
      ...orderInput,
      userId: auth.currentUser.uid,
      status: "Pending" as OrderStatus,
      paymentStatus: "Pending" as const,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    await setDoc(doc(db, "orders", orderInput.id), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function cancelPendingOrderDoc(order: Order): Promise<void> {
  const path = `orders/${order.id}`;
  try {
    const updatedLogs = [
      ...order.trackingLogs,
      {
        status: "Cancelled" as OrderStatus,
        timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
        description: "Order cancelled by patient prior to clinic dispatch."
      }
    ].slice(-25);
    await updateDoc(doc(db, "orders", order.id), {
      status: "Cancelled",
      trackingLogs: updatedLogs,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function addReviewDoc(
  productId: string,
  review: Omit<Review, "productId" | "userId" | "createdAt">
): Promise<void> {
  if (!auth.currentUser) throw new Error("Sign in required to submit a review.");
  const path = `products/${productId}/reviews/${review.id}`;
  try {
    await setDoc(doc(db, "products", productId, "reviews", review.id), {
      id: review.id,
      productId,
      userId: auth.currentUser.uid,
      author: review.author.slice(0, 100),
      rating: Math.min(5, Math.max(1, Math.round(review.rating))),
      date: review.date.slice(0, 30),
      comment: review.comment.slice(0, 1000),
      verified: true,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function submitContactMessageDoc(
  name: string,
  email: string,
  message: string
): Promise<void> {
  if (!auth.currentUser) throw new Error("Sign in required to send a consultation message.");
  const id = safeId("msg");
  const path = `contactMessages/${id}`;
  try {
    await setDoc(doc(db, "contactMessages", id), {
      id,
      userId: auth.currentUser.uid,
      name: name.trim().slice(0, 120),
      email: email.trim().slice(0, 150),
      message: message.trim().slice(0, 2000),
      status: "Unread",
      createdAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function subscribeNewsletterDoc(email: string): Promise<void> {
  if (!auth.currentUser) throw new Error("Sign in required to subscribe to bulletins.");
  const id = safeId("sub");
  const path = `newsletterSubscribers/${id}`;
  try {
    await setDoc(doc(db, "newsletterSubscribers", id), {
      id,
      userId: auth.currentUser.uid,
      email: email.trim().toLowerCase().slice(0, 150),
      createdAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

// ==========================================
// ADMIN MUTATIONS
// ==========================================

export async function saveProductDoc(product: Product, isNew: boolean): Promise<void> {
  const path = `products/${product.id}`;
  try {
    const cleanPayload = stripUndefined({
      id: product.id,
      slug: toSlug(product.slug || product.name).slice(0, 120),
      name: product.name.trim().slice(0, 150),
      category: product.category,
      price: Math.max(1, Math.round(product.price)),
      originalPrice: product.originalPrice && product.originalPrice > 0 ? Math.round(product.originalPrice) : undefined,
      images: product.images.slice(0, 6),
      shortBenefits: product.shortBenefits.trim().slice(0, 300),
      description: product.description.trim().slice(0, 3000),
      ingredients: product.ingredients.slice(0, 20),
      usageInstructions: product.usageInstructions.trim().slice(0, 1000),
      benefits: product.benefits.slice(0, 15),
      warnings: product.warnings.slice(0, 15),
      rating: Number(product.rating) || 5.0,
      reviewsCount: Math.max(0, Math.round(product.reviewsCount || 0)),
      stock: Math.max(0, Math.round(product.stock)),
      isBestSeller: Boolean(product.isBestSeller),
      featuredBenefits: product.featuredBenefits.slice(0, 10),
      createdAt: isNew ? serverTimestamp() : product.createdAt || serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    await setDoc(doc(db, "products", product.id), cleanPayload);
  } catch (error) {
    handleFirestoreError(error, isNew ? OperationType.CREATE : OperationType.UPDATE, path);
  }
}

export async function updateProductStockDoc(productId: string, newStock: number): Promise<void> {
  const path = `products/${productId}`;
  try {
    await updateDoc(doc(db, "products", productId), {
      stock: Math.max(0, Math.round(newStock)),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteProductDoc(productId: string): Promise<void> {
  const path = `products/${productId}`;
  try {
    await deleteDoc(doc(db, "products", productId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function updateOrderAdminDoc(
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
): Promise<void> {
  const path = `orders/${orderId}`;
  try {
    await updateDoc(doc(db, "orders", orderId), {
      ...stripUndefined(updates),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function createCampaignDoc(campaign: PromoCampaign): Promise<void> {
  const path = `campaigns/${campaign.id}`;
  try {
    await setDoc(doc(db, "campaigns", campaign.id), {
      id: campaign.id,
      code: campaign.code.toUpperCase().replace(/[^A-Z0-9_-]/g, "").slice(0, 40),
      discountPercentage: Math.min(100, Math.max(1, Number(campaign.discountPercentage))),
      description: campaign.description.trim().slice(0, 300),
      active: Boolean(campaign.active),
      expiryDate: campaign.expiryDate.slice(0, 30),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function toggleCampaignDoc(campaignId: string, active: boolean): Promise<void> {
  const path = `campaigns/${campaignId}`;
  try {
    await updateDoc(doc(db, "campaigns", campaignId), {
      active,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteCampaignDoc(campaignId: string): Promise<void> {
  const path = `campaigns/${campaignId}`;
  try {
    await deleteDoc(doc(db, "campaigns", campaignId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function createBlogDoc(blog: BlogArticle): Promise<void> {
  const path = `blogs/${blog.id}`;
  try {
    await setDoc(doc(db, "blogs", blog.id), {
      id: blog.id,
      slug: toSlug(blog.slug || blog.title).slice(0, 150),
      title: blog.title.trim().slice(0, 200),
      summary: blog.summary.trim().slice(0, 500),
      content: blog.content.trim().slice(0, 20000),
      author: blog.author.trim().slice(0, 100),
      date: blog.date.slice(0, 40),
      readTime: blog.readTime.slice(0, 30),
      category: blog.category.slice(0, 80),
      image: blog.image.slice(0, 1000),
      tags: blog.tags.slice(0, 15),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteBlogDoc(blogId: string): Promise<void> {
  const path = `blogs/${blogId}`;
  try {
    await deleteDoc(doc(db, "blogs", blogId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveSiteSettingsDoc(settings: Omit<SiteSettings, "updatedAt">): Promise<void> {
  const path = "siteSettings/clinic";
  try {
    await setDoc(doc(db, "siteSettings", "clinic"), {
      announcementText: settings.announcementText.trim().slice(0, 300),
      heroBadgeText: settings.heroBadgeText.trim().slice(0, 80),
      heroTitleText: settings.heroTitleText.trim().slice(0, 160),
      heroDescText: settings.heroDescText.trim().slice(0, 500),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function savePatientNoteDoc(
  patientEmail: string,
  patientName: string,
  note: string,
  updatedBy: string
): Promise<void> {
  const id = `note-${patientEmail.toLowerCase().replace(/[^a-z0-9]/g, "-")}`.slice(0, 120);
  const path = `patientNotes/${id}`;
  try {
    await setDoc(doc(db, "patientNotes", id), {
      id,
      patientEmail: patientEmail.toLowerCase().slice(0, 150),
      patientName: patientName.slice(0, 120),
      note: note.slice(0, 3000),
      updatedBy: updatedBy.slice(0, 150),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function markContactMessageRepliedDoc(messageId: string): Promise<void> {
  const path = `contactMessages/${messageId}`;
  try {
    await updateDoc(doc(db, "contactMessages", messageId), {
      status: "Replied"
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function logCampaignDispatchDoc(
  phone: string,
  template: string,
  message: string,
  dispatchedBy: string
): Promise<void> {
  const id = safeId("wa");
  const path = `campaignLogs/${id}`;
  try {
    await setDoc(doc(db, "campaignLogs", id), {
      id,
      phone: phone.slice(0, 30),
      template: template.slice(0, 80),
      message: message.slice(0, 1500),
      dispatchedBy: dispatchedBy.slice(0, 150),
      createdAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

// One-time Admin Catalog Bootstrapper (writes clinic catalog to Firestore when empty)
export async function seedInitialClinicCatalog(): Promise<{ productsAdded: number; blogsAdded: number; campaignsAdded: number }> {
  const batch = writeBatch(db);
  let productsAdded = 0;
  let blogsAdded = 0;
  let campaignsAdded = 0;

  const existingProds = await getDocs(collection(db, "products"));
  if (existingProds.empty) {
    for (const p of INITIAL_PRODUCTS) {
      const ref = doc(db, "products", p.id);
      const clean = stripUndefined({
        id: p.id,
        slug: toSlug(p.slug),
        name: p.name,
        category: p.category,
        price: p.price,
        originalPrice: p.originalPrice,
        images: p.images,
        shortBenefits: p.shortBenefits,
        description: p.description,
        ingredients: p.ingredients,
        usageInstructions: p.usageInstructions,
        benefits: p.benefits,
        warnings: p.warnings,
        rating: p.rating,
        reviewsCount: p.reviewsCount,
        stock: p.stock,
        isBestSeller: p.isBestSeller,
        featuredBenefits: p.featuredBenefits,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      batch.set(ref, clean);
      productsAdded++;
    }
  }

  const existingBlogs = await getDocs(collection(db, "blogs"));
  if (existingBlogs.empty) {
    for (const b of INITIAL_BLOGS) {
      const ref = doc(db, "blogs", b.id);
      batch.set(ref, {
        ...b,
        slug: toSlug(b.slug),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      blogsAdded++;
    }
  }

  const existingCamps = await getDocs(collection(db, "campaigns"));
  if (existingCamps.empty) {
    for (const c of INITIAL_CAMPAIGNS) {
      const ref = doc(db, "campaigns", c.id);
      batch.set(ref, {
        ...c,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      campaignsAdded++;
    }
  }

  const settingsRef = doc(db, "siteSettings", "clinic");
  const existingSettings = await getDoc(settingsRef);
  if (!existingSettings.exists()) {
    batch.set(settingsRef, {
      ...DEFAULT_SITE_SETTINGS,
      updatedAt: serverTimestamp()
    });
  }

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, "products/blogs/campaigns");
  }

  return { productsAdded, blogsAdded, campaignsAdded };
}

export async function refreshAllPublicCollections(): Promise<{
  products: Product[];
  blogs: BlogArticle[];
  campaigns: PromoCampaign[];
}> {
  try {
    const [pSnap, bSnap, cSnap] = await Promise.all([
      getDocs(collection(db, "products")),
      getDocs(collection(db, "blogs")),
      getDocs(collection(db, "campaigns"))
    ]);
    return {
      products: pSnap.docs.map((d) => ({ ...(d.data() as Omit<Product, "reviews">), id: d.id, reviews: [] })),
      blogs: bSnap.docs.map((d) => ({ ...(d.data() as BlogArticle), id: d.id })),
      campaigns: cSnap.docs.map((d) => ({ ...(d.data() as PromoCampaign), id: d.id }))
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, "products");
  }
}
