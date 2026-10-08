import { products as defaultProducts } from "../data/products";

export const PRODUCTS_STORAGE_KEY = "maliks_products";

const notifyProductChange = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("maliks-products-updated"));
  }
};

export const getProducts = () => {
  const storedProducts = window.localStorage.getItem(PRODUCTS_STORAGE_KEY);
  if (!storedProducts) return defaultProducts;

  const parsedProducts = JSON.parse(storedProducts);
  if (!Array.isArray(parsedProducts) || parsedProducts.some((product) =>
    !product || typeof product !== "object" || !("id" in product)
    || typeof product.name !== "string" || !Number.isFinite(Number(product.price))
  )) {
    throw new Error("Saved products are not in a valid format.");
  }

  return parsedProducts;
};

const persistProducts = (nextProducts) => {
  try {
    window.localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(nextProducts));
  } catch (error) {
    if (error instanceof DOMException && error.name === "QuotaExceededError") {
      throw new Error("Browser storage is full. Remove products or use smaller images before saving.");
    }
    throw error;
  }
  notifyProductChange();
  return nextProducts;
};

export const addProduct = (product) => {
  const id = globalThis.crypto?.randomUUID?.()
    || `product-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const newProduct = { ...product, id };
  return persistProducts([...getProducts(), newProduct]);
};

export const updateProduct = (productId, updates) => {
  const currentProducts = getProducts();
  const index = currentProducts.findIndex((product) => String(product.id) === String(productId));
  if (index === -1) throw new Error("Product not found.");

  const nextProducts = [...currentProducts];
  nextProducts[index] = { ...nextProducts[index], ...updates, id: nextProducts[index].id };
  return persistProducts(nextProducts);
};

export const deleteProduct = (productId) => {
  const currentProducts = getProducts();
  const nextProducts = currentProducts.filter((product) => String(product.id) !== String(productId));
  if (nextProducts.length === currentProducts.length) throw new Error("Product not found.");
  return persistProducts(nextProducts);
};
