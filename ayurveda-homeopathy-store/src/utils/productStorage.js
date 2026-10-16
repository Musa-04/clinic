
import { products as defaultProducts } from "../data/products";
import { supabase } from "../supabaseClient";

export const PRODUCTS_STORAGE_KEY = "maliks_products";

const PRODUCT_SELECT =
  "id, name, description, price, image_url, stock_quantity, is_active, category_id, categories(name), created_at";

const notifyProductChange = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("maliks-products-updated"));
  }
};

const MAX_BASE64_IMAGE_SIZE = 1024 * 1024 * 5 * 4 / 3;

const getErrorMessage = (error, fallback) => {
  if (error?.code === "42501") {
    return "You do not have permission to manage products. Please sign in with an authorized admin account.";
  }

  if (error?.code === "23503") {
    return "The selected category is unavailable. Refresh categories and try again.";
  }

  if (error?.message?.includes("Supabase is not configured")) {
    return "Supabase is not configured. Check your environment variables.";
  }

  return error?.message || fallback;
};

const mapProduct = (row) => ({
  id: row.id,
  name: row.name,
  category: row.categories?.name || "Uncategorized",
  categoryId: row.category_id,
  description: row.description || "",
  price: Number(row.price),
  image: row.image_url || "",
  stockQuantity: Number(row.stock_quantity ?? 0),
  isActive: row.is_active !== false,
  createdAt: row.created_at,
});

const getCategoryId = async (categoryName) => {
  const name = String(categoryName || "").trim();

  if (!name) {
    throw new Error("Please select a product category.");
  }

  const { data: existingCategory, error: lookupError } = await supabase
    .from("categories")
    .select("id, name")
    .eq("name", name)
    .maybeSingle();

  if (lookupError) {
    throw new Error(
      getErrorMessage(lookupError, "Could not load the product category."),
    );
  }

  if (existingCategory) {
    return existingCategory.id;
  }

  // Create a missing category only if the signed-in user has permission.
  const { data: newCategory, error: insertError } = await supabase
    .from("categories")
    .insert({
      name,
      is_active: true,
    })
    .select("id")
    .single();

  if (insertError) {
    throw new Error(
      getErrorMessage(
        insertError,
        `Could not find or create the category "${name}".`,
      ),
    );
  }

  window.dispatchEvent(new Event("maliks-categories-updated"));

  return newCategory.id;
};

/**
 * Loads products from Supabase.
 *
 * includeDemoFallback:
 *   If the database has no products, the storefront can continue showing
 *   the existing demo products. Set this to false in the admin panel.
 *
 * includeInactive:
 *   Allows the admin panel to load inactive products as well.
 */
export const getProducts = async ({
  includeDemoFallback = true,
  includeInactive = false,
} = {}) => {
  let query = supabase.from("products").select(PRODUCT_SELECT);

  if (!includeInactive) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query.order("created_at", {
    ascending: false,
  });

  if (error) {
    throw new Error(
      getErrorMessage(error, "Products could not be loaded from Supabase."),
    );
  }

  const databaseProducts = (data || []).map(mapProduct);

  if (databaseProducts.length > 0) {
    return databaseProducts;
  }

  // Keep the current storefront usable until real products are added.
  // Demo products are never automatically inserted into Supabase.
  return includeDemoFallback ? [...defaultProducts] : [];
};

export const addProduct = async (product) => {
  if (!product?.name?.trim()) {
    throw new Error("Enter a product name.");
  }

  const price = Number(product.price);

  if (!Number.isFinite(price) || price <= 0) {
    throw new Error("Enter a price greater than zero.");
  }

  if (product.image && String(product.image).startsWith("data:image/")) {
    const base64Size = String(product.image).length;
    if (base64Size > MAX_BASE64_IMAGE_SIZE) {
      throw new Error("Image must be 5 MB or smaller after encoding.");
    }
  }

  const categoryId = await getCategoryId(product.category);

  const { data, error } = await supabase
    .from("products")
    .insert({
      name: product.name.trim(),
      description: String(product.description || "").trim(),
      price,
      image_url: String(product.image || "").trim() || null,
      category_id: categoryId,
      stock_quantity: Number(product.stockQuantity ?? 0),
      is_active: true,
    })
    .select(PRODUCT_SELECT)
    .single();

  if (error) {
    throw new Error(
      getErrorMessage(error, "Product could not be added."),
    );
  }

  notifyProductChange();

  return mapProduct(data);
};

export const updateProduct = async (productId, updates) => {
  if (!productId) {
    throw new Error("A product ID is required.");
  }

  const changes = {};

  if (updates.name !== undefined) {
    const name = String(updates.name).trim();

    if (!name) {
      throw new Error("Enter a product name.");
    }

    changes.name = name;
  }

  if (updates.description !== undefined) {
    changes.description = String(updates.description).trim();
  }

  if (updates.price !== undefined) {
    const price = Number(updates.price);

    if (!Number.isFinite(price) || price <= 0) {
      throw new Error("Enter a price greater than zero.");
    }

    changes.price = price;
  }

  if (updates.image !== undefined) {
    changes.image_url = String(updates.image || "").trim() || null;
    if (changes.image_url && changes.image_url.startsWith("data:image/")) {
      const base64Size = changes.image_url.length;
      if (base64Size > MAX_BASE64_IMAGE_SIZE) {
        throw new Error("Image must be 5 MB or smaller after encoding.");
      }
    }
  }

  if (updates.category !== undefined) {
    changes.category_id = await getCategoryId(updates.category);
  }

  if (updates.stockQuantity !== undefined) {
    const stockQuantity = Number(updates.stockQuantity);

    if (!Number.isInteger(stockQuantity) || stockQuantity < 0) {
      throw new Error("Stock quantity must be a non-negative whole number.");
    }

    changes.stock_quantity = stockQuantity;
  }

  if (updates.isActive !== undefined) {
    changes.is_active = Boolean(updates.isActive);
  }

  const { data, error } = await supabase
    .from("products")
    .update(changes)
    .eq("id", productId)
    .select(PRODUCT_SELECT)
    .maybeSingle();

  if (error) {
    throw new Error(
      getErrorMessage(error, "Product could not be updated."),
    );
  }

  if (!data) {
    throw new Error(
      "Product not found, or you do not have permission to update it.",
    );
  }

  notifyProductChange();

  return mapProduct(data);
};

/**
 * Removes a product from the public catalog by deactivating it.
 * The record is preserved for historical order references.
 */
export const deleteProduct = async (productId) => {
  if (!productId) {
    throw new Error("A product ID is required.");
  }

  const { data, error } = await supabase
    .from("products")
    .update({ is_active: false })
    .eq("id", productId)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(
      getErrorMessage(error, "Product could not be removed."),
    );
  }

  if (!data) {
    throw new Error(
      "Product not found, or you do not have permission to remove it.",
    );
  }

  notifyProductChange();

  return data.id;
};
