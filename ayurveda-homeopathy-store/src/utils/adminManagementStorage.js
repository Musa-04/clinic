import { getProducts } from "./productStorage";

export const PRODUCT_CATEGORIES_STORAGE_KEY = "maliks_product_categories";
export const COUPONS_STORAGE_KEY = "maliks_coupons";
export const CLINIC_SETTINGS_STORAGE_KEY = "maliks_clinic_settings";

export const DEFAULT_PRODUCT_CATEGORIES = ["Ayurvedic", "Homeopathic"];
export const DEFAULT_CLINIC_SETTINGS = {
  clinicName: "Malik's Polyclinic",
  supportPhone: "",
  supportEmail: "",
  orderShippingFee: 0,
};

const getStorage = () => {
  if (typeof window === "undefined" || !window.localStorage) {
    throw new Error("Browser storage is not available.");
  }
  return window.localStorage;
};

const readArray = (key, label) => {
  const raw = getStorage().getItem(key);
  if (raw === null) return null;

  let value;
  try {
    value = JSON.parse(raw);
  } catch {
    throw new Error(`Saved ${label} could not be read. Check browser storage.`);
  }
  if (!Array.isArray(value)) {
    throw new Error(`Saved ${label} are not in a valid format.`);
  }
  return value;
};

const makeId = (prefix) => globalThis.crypto?.randomUUID?.()
  || `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const write = (key, value, label) => {
  try {
    getStorage().setItem(key, JSON.stringify(value));
  } catch (error) {
    if (error instanceof DOMException && error.name === "QuotaExceededError") {
      throw new Error("Browser storage is full. Clear some space before saving.");
    }
    if (error instanceof Error && error.message === "Browser storage is not available.") {
      throw error;
    }
    throw new Error(`${label} could not be saved to browser storage.`);
  }
  return value;
};

const normalizeCategory = (name) => {
  if (typeof name !== "string" || !name.trim()) {
    throw new Error("Enter a category name.");
  }
  return name.trim();
};

const ensureUniqueCategory = (categories, name, ignoredId) => {
  if (categories.some((category) => category.id !== ignoredId
    && category.name.toLocaleLowerCase() === name.toLocaleLowerCase())) {
    throw new Error("A category with this name already exists.");
  }
};

const normalizeCategoryEntries = (entries) => entries.map((entry) => {
  if (typeof entry === "string" && entry.trim()) {
    return { id: entry.trim(), name: entry.trim() };
  }
  if (entry && typeof entry === "object" && typeof entry.name === "string" && entry.name.trim()) {
    return { id: String(entry.id ?? entry.name), name: entry.name.trim() };
  }
  throw new Error("Saved categories are not in a valid format.");
});

const readCategories = () => {
  const stored = readArray(PRODUCT_CATEGORIES_STORAGE_KEY, "categories");
  return stored === null
    ? DEFAULT_PRODUCT_CATEGORIES.map((name) => ({ id: name, name }))
    : normalizeCategoryEntries(stored);
};

const persistCategories = (categories) => {
  const savedCategories = write(PRODUCT_CATEGORIES_STORAGE_KEY, categories, "Categories");
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("maliks-categories-updated"));
  }
  return savedCategories;
};

export const getProductCategories = () => readCategories().map(({ name }) => name);

export const addProductCategory = (name) => {
  const normalizedName = normalizeCategory(name);
  const categories = readCategories();
  ensureUniqueCategory(categories, normalizedName);
  const nextCategories = [...categories, { id: makeId("category"), name: normalizedName }];
  persistCategories(nextCategories);
  return nextCategories.map(({ name: categoryName }) => categoryName);
};

export const updateProductCategory = (categoryId, name) => {
  const normalizedName = normalizeCategory(name);
  const categories = readCategories();
  const current = categories.find((category) => String(category.id) === String(categoryId)
    || category.name === categoryId);
  if (!current) throw new Error("Category not found.");
  ensureUniqueCategory(categories, normalizedName, current.id);
  if (current.name !== normalizedName && getProducts().some((product) =>
    String(product.category || "").trim().toLocaleLowerCase() === current.name.toLocaleLowerCase())) {
    throw new Error("This category is assigned to products. Reassign those products before renaming it.");
  }
  const nextCategories = categories.map((category) => (
    category.id === current.id ? { ...category, name: normalizedName } : category
  ));
  persistCategories(nextCategories);
  return nextCategories.map(({ name: categoryName }) => categoryName);
};

export const deleteProductCategory = (categoryId) => {
  const categories = readCategories();
  const category = categories.find((entry) => String(entry.id) === String(categoryId)
    || entry.name === categoryId);
  if (!category) throw new Error("Category not found.");
  if (categories.length === 1) {
    throw new Error("At least one product category must remain.");
  }

  const products = getProducts();
  if (products.some((product) => String(product.category || "").trim().toLocaleLowerCase()
    === category.name.toLocaleLowerCase())) {
    throw new Error("This category is assigned to one or more products and cannot be deleted.");
  }

  const nextCategories = categories.filter((entry) => entry.id !== category.id);
  persistCategories(nextCategories);
  return nextCategories.map(({ name }) => name);
};

export const getCoupons = () => {
  const coupons = readArray(COUPONS_STORAGE_KEY, "coupons") || [];
  if (coupons.some((coupon) => !coupon || typeof coupon !== "object"
    || typeof coupon.id !== "string" || typeof coupon.code !== "string"
    || !["percent", "fixed"].includes(coupon.discountType)
    || !Number.isFinite(Number(coupon.value)) || typeof coupon.active !== "boolean")) {
    throw new Error("Saved coupons are not in a valid format.");
  }
  coupons.forEach((coupon) => normalizeCoupon(coupon));
  return coupons;
};

const normalizeCoupon = (coupon) => {
  const code = typeof coupon.code === "string" ? coupon.code.trim().toUpperCase() : "";
  const value = Number(coupon.value);
  if (!code) throw new Error("Enter a coupon code.");
  if (!["percent", "fixed"].includes(coupon.discountType)) {
    throw new Error("Choose a valid discount type.");
  }
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error("Discount value must be greater than zero.");
  }
  if (coupon.discountType === "percent" && value > 100) {
    throw new Error("Percentage discounts cannot exceed 100%.");
  }
  const expiresOn = coupon.expiresOn || "";
  if (expiresOn) {
    const parsedExpiry = new Date(`${expiresOn}T00:00:00.000Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(expiresOn)
      || Number.isNaN(parsedExpiry.getTime())
      || parsedExpiry.toISOString().slice(0, 10) !== expiresOn) {
      throw new Error("Enter a valid expiry date.");
    }
  }
  return { code, discountType: coupon.discountType, value, active: Boolean(coupon.active), expiresOn };
};

const ensureUniqueCouponCode = (coupons, code, ignoredId) => {
  if (coupons.some((coupon) => coupon.id !== ignoredId
    && coupon.code.toLocaleLowerCase() === code.toLocaleLowerCase())) {
    throw new Error("A coupon with this code already exists.");
  }
};

export const addCoupon = (coupon) => {
  const normalized = normalizeCoupon(coupon);
  const coupons = getCoupons();
  ensureUniqueCouponCode(coupons, normalized.code);
  const nextCoupons = [...coupons, { id: makeId("coupon"), ...normalized }];
  write(COUPONS_STORAGE_KEY, nextCoupons, "Coupon");
  return nextCoupons;
};

export const updateCoupon = (couponId, updates) => {
  const coupons = getCoupons();
  const index = coupons.findIndex((coupon) => String(coupon.id) === String(couponId));
  if (index < 0) throw new Error("Coupon not found.");
  const normalized = normalizeCoupon({ ...coupons[index], ...updates });
  ensureUniqueCouponCode(coupons, normalized.code, coupons[index].id);
  const nextCoupons = [...coupons];
  nextCoupons[index] = { ...coupons[index], ...normalized };
  write(COUPONS_STORAGE_KEY, nextCoupons, "Coupon");
  return nextCoupons;
};

export const deleteCoupon = (couponId) => {
  const coupons = getCoupons();
  const nextCoupons = coupons.filter((coupon) => String(coupon.id) !== String(couponId));
  if (nextCoupons.length === coupons.length) throw new Error("Coupon not found.");
  write(COUPONS_STORAGE_KEY, nextCoupons, "Coupon");
  return nextCoupons;
};

export const getClinicSettings = () => {
  const raw = getStorage().getItem(CLINIC_SETTINGS_STORAGE_KEY);
  if (raw === null) return { ...DEFAULT_CLINIC_SETTINGS };
  let settings;
  try {
    settings = JSON.parse(raw);
  } catch {
    throw new Error("Saved clinic settings could not be read. Check browser storage.");
  }
  if (!settings || typeof settings !== "object" || Array.isArray(settings)) {
    throw new Error("Saved clinic settings are not in a valid format.");
  }
  const loaded = { ...DEFAULT_CLINIC_SETTINGS, ...settings };
  if (typeof loaded.clinicName !== "string" || typeof loaded.supportPhone !== "string"
    || typeof loaded.supportEmail !== "string"
    || !Number.isFinite(Number(loaded.orderShippingFee)) || Number(loaded.orderShippingFee) < 0) {
    throw new Error("Saved clinic settings are not in a valid format.");
  }
  return { ...loaded, orderShippingFee: Number(loaded.orderShippingFee) };
};

export const saveClinicSettings = (settings) => {
  const clinicName = typeof settings.clinicName === "string" ? settings.clinicName.trim() : "";
  const supportPhone = typeof settings.supportPhone === "string" ? settings.supportPhone.trim() : "";
  const supportEmail = typeof settings.supportEmail === "string" ? settings.supportEmail.trim() : "";
  const orderShippingFee = Number(settings.orderShippingFee);
  if (!clinicName) throw new Error("Enter a clinic name.");
  if (!Number.isFinite(orderShippingFee) || orderShippingFee < 0) {
    throw new Error("Shipping fee must be a number greater than or equal to zero.");
  }
  if (supportPhone && !/^[+\d().\s-]{7,40}$/.test(supportPhone)) {
    throw new Error("Enter a valid support phone number.");
  }
  if (supportEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supportEmail)) {
    throw new Error("Enter a valid support email address.");
  }
  const nextSettings = { clinicName, supportPhone, supportEmail, orderShippingFee };
  return write(CLINIC_SETTINGS_STORAGE_KEY, nextSettings, "Clinic settings");
};

export { addProductCategory as addCategory };
export { updateProductCategory as updateCategory };
export { deleteProductCategory as deleteCategory };
