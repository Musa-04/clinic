import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ImagePlus,
  Leaf,
  Menu,
  Package,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { addProduct, deleteProduct, getProducts, updateProduct } from "../utils/productStorage";
import { getProductCategories } from "../utils/adminManagementStorage";

const EMPTY_FORM = {
  name: "",
  category: "Ayurvedic",
  description: "",
  price: "",
  image: "",
};
const MAX_PRODUCT_IMAGE_SIZE = 1024 * 1024;
const PRODUCT_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const getInitialProductState = () => {
  try {
    return { products: getProducts(), categories: getProductCategories(), loadError: "" };
  } catch {
    return { products: [], categories: ["Ayurvedic", "Homeopathic"], loadError: "Products could not be loaded from browser storage." };
  }
};

const AdminProducts = ({ onNavigate, onOpenNav }) => {
  const [initialProductState] = useState(getInitialProductState);
  const [products, setProducts] = useState(initialProductState.products);
  const [categories, setCategories] = useState(initialProductState.categories);
  const [loadError, setLoadError] = useState(initialProductState.loadError);
  const [saveError, setSaveError] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [editingProduct, setEditingProduct] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [imageName, setImageName] = useState("");
  const [deletingProduct, setDeletingProduct] = useState(null);

  const refreshProducts = () => {
    try {
      setProducts(getProducts());
      setCategories(getProductCategories());
      setLoadError("");
    } catch {
      setLoadError("Products could not be loaded from browser storage.");
    }
  };

  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === null || event.key === "maliks_products") refreshProducts();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("maliks-categories-updated", refreshProducts);
    window.addEventListener("maliks-products-updated", refreshProducts);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("maliks-categories-updated", refreshProducts);
      window.removeEventListener("maliks-products-updated", refreshProducts);
    };
  }, []);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((product) => {
      const matchesCategory = categoryFilter === "All" || product.category === categoryFilter;
      const matchesSearch = !query || [product.name, product.category, product.description]
        .some((value) => String(value || "").toLowerCase().includes(query));
      return matchesCategory && matchesSearch;
    });
  }, [products, search, categoryFilter]);

  const openAddForm = () => {
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setImageName("");
    setIsFormOpen(true);
  };

  const openEditForm = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name || "",
      category: product.category || "Ayurvedic",
      description: product.description || "",
      price: String(product.price ?? ""),
      image: product.image || "",
    });
    setFormError("");
    setImageName(product.image?.startsWith("data:") ? "Uploaded image" : "");
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeForm = () => {
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setIsFormOpen(false);
    setImageName("");
  };

  const handleImageUpload = (event) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;

    if (!PRODUCT_IMAGE_TYPES.includes(file.type)) {
      setFormError("Choose a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > MAX_PRODUCT_IMAGE_SIZE) {
      setFormError("Image must be 1 MB or smaller.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string" || !reader.result.startsWith(`data:${file.type};base64,`)) {
        setFormError("The selected image could not be read. Please choose another image.");
        return;
      }
      setForm((current) => ({ ...current, image: reader.result }));
      setImageName(file.name);
      setFormError("");
    };
    reader.onerror = () => setFormError("The selected image could not be read. Please choose another image.");
    reader.readAsDataURL(file);
  };

  const saveForm = (event) => {
    event.preventDefault();
    setFormError("");
    setSaveError("");
    const price = Number(form.price);
    if (!form.name.trim() || !form.description.trim()) {
      setFormError("Enter a product name and description.");
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      setFormError("Enter a price greater than zero.");
      return;
    }
    if (form.image.trim() && !form.image.startsWith("data:image/")) {
      try {
        const imageUrl = new URL(form.image.trim());
        if (!["http:", "https:"].includes(imageUrl.protocol)) throw new Error();
      } catch {
        setFormError("Image must be a valid HTTP or HTTPS URL, or uploaded using the image chooser.");
        return;
      }
    }

    const product = {
      name: form.name.trim(),
      category: form.category,
      description: form.description.trim(),
      price,
      image: form.image.trim(),
    };

    try {
      const updatedProducts = editingProduct
        ? updateProduct(editingProduct.id, product)
        : addProduct(product);
      setProducts(updatedProducts);
      closeForm();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Product could not be saved.");
    }
  };

  const confirmDelete = () => {
    if (!deletingProduct) return;
    try {
      setProducts(deleteProduct(deletingProduct.id));
      setDeletingProduct(null);
      setSaveError("");
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Product could not be removed.");
    }
  };

  return (
    <div className="min-h-full overflow-x-hidden bg-[#0b0d0c] text-stone-100">
      <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-[#0b0d0c]/95 backdrop-blur-xl">
        <div className="mx-auto flex min-h-16 max-w-[1600px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" aria-label="Open admin navigation" onClick={onOpenNav} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 text-stone-300 transition hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 lg:hidden"><Menu className="h-5 w-5" aria-hidden="true" /></button>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-700"><Leaf className="h-5 w-5 text-emerald-100" aria-hidden="true" /></span>
            <div className="min-w-0"><p className="truncate text-sm font-bold text-white">Malik&apos;s Polyclinic</p><p className="text-[11px] text-stone-500">Admin · Products</p></div>
          </div>
          <button type="button" onClick={() => onNavigate("/admin/orders")} className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs font-semibold text-stone-300 hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"><ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Back to Orders</span><span className="sm:hidden">Orders</span></button>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-400">Store operations</p><h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">Product Management</h1><p className="mt-2 text-sm text-stone-400">Add products, update details and prices, or remove products from the catalog.</p></div>
          <button type="button" onClick={openAddForm} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 sm:w-auto"><Plus className="h-4 w-4" /> Add Product</button>
        </div>

        {loadError && <p role="alert" className="mb-4 rounded-xl border border-rose-300/15 bg-rose-300/[0.05] px-4 py-3 text-sm text-rose-200">{loadError} Check browser storage, then reload this page.</p>}
        {saveError && <p role="alert" className="mb-4 rounded-xl border border-rose-300/15 bg-rose-300/[0.05] px-4 py-3 text-sm text-rose-200">{saveError}</p>}

        {isFormOpen ? (
          <section aria-labelledby="product-form-title" className="mb-6 rounded-2xl border border-white/[0.07] bg-neutral-900/80 p-4 sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div><h2 id="product-form-title" className="text-base font-semibold text-white">{editingProduct ? "Edit Product" : "Add Product"}</h2><p className="mt-1 text-xs text-stone-500">Fields marked required must be completed.</p></div>
              <button type="button" aria-label="Close product form" onClick={closeForm} className="flex h-10 w-10 items-center justify-center rounded-xl text-stone-400 hover:bg-white/[0.05] hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            {formError && <p role="alert" className="mb-4 rounded-xl border border-rose-300/15 bg-rose-300/[0.05] px-4 py-3 text-sm text-rose-200">{formError}</p>}
            <form onSubmit={saveForm} className="grid gap-4 sm:grid-cols-2">
              <label className="block min-w-0"><span className="mb-1.5 block text-xs font-medium text-stone-400">Product name *</span><input required maxLength={120} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="min-h-11 w-full rounded-xl border border-white/[0.08] bg-neutral-950 px-3 text-sm text-white focus:border-emerald-400/60 focus:outline-none focus:ring-2 focus:ring-emerald-400/15" /></label>
              <label className="block min-w-0"><span className="mb-1.5 block text-xs font-medium text-stone-400">Category *</span><select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="min-h-11 w-full rounded-xl border border-white/[0.08] bg-neutral-950 px-3 text-sm text-white focus:border-emerald-400/60 focus:outline-none focus:ring-2 focus:ring-emerald-400/15">{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
              <label className="block min-w-0"><span className="mb-1.5 block text-xs font-medium text-stone-400">Price (₹) *</span><input required type="number" min="0.01" step="0.01" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} className="min-h-11 w-full rounded-xl border border-white/[0.08] bg-neutral-950 px-3 text-sm text-white focus:border-emerald-400/60 focus:outline-none focus:ring-2 focus:ring-emerald-400/15" /></label>
              <div className="min-w-0">
                <span className="mb-1.5 block text-xs font-medium text-stone-400">Product image</span>
                <label className="flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-emerald-400/30 bg-emerald-400/[0.04] px-3 text-sm font-medium text-emerald-200 transition hover:border-emerald-300/60 hover:bg-emerald-400/[0.08]">
                  <ImagePlus className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">{imageName || "Upload JPG, PNG, or WebP"}</span>
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageUpload} className="sr-only" />
                </label>
                <p className="mt-1.5 text-[11px] text-stone-500">Maximum file size: 1 MB. Or enter an image URL below.</p>
                {form.image && (
                  <div className="mt-3 flex items-center gap-3 rounded-xl border border-white/[0.07] bg-neutral-950/60 p-2">
                    <img src={form.image} alt="Product preview" className="h-16 w-16 rounded-lg bg-white object-contain" />
                    <span className="min-w-0 flex-1 truncate text-xs text-stone-400">{imageName || "Image preview"}</span>
                    <button type="button" onClick={() => { setForm((current) => ({ ...current, image: "" })); setImageName(""); }} className="min-h-9 rounded-lg px-2 text-xs font-medium text-rose-200 hover:bg-rose-300/[0.06]">Remove image</button>
                  </div>
                )}
              </div>
              <label className="block min-w-0"><span className="mb-1.5 block text-xs font-medium text-stone-400">Image URL</span><input type="url" value={form.image.startsWith("data:") ? "" : form.image} onChange={(event) => { setForm({ ...form, image: event.target.value }); setImageName(""); }} placeholder="https://example.com/product-image.jpg" className="min-h-11 w-full rounded-xl border border-white/[0.08] bg-neutral-950 px-3 text-sm text-white placeholder:text-stone-600 focus:border-emerald-400/60 focus:outline-none focus:ring-2 focus:ring-emerald-400/15" /></label>
              <label className="block min-w-0 sm:col-span-2"><span className="mb-1.5 block text-xs font-medium text-stone-400">Description *</span><textarea required rows={3} maxLength={1000} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="w-full rounded-xl border border-white/[0.08] bg-neutral-950 px-3 py-3 text-sm text-white focus:border-emerald-400/60 focus:outline-none focus:ring-2 focus:ring-emerald-400/15" /></label>
              <div className="flex flex-col-reverse gap-2 sm:col-span-2 sm:flex-row sm:justify-end"><button type="button" onClick={closeForm} className="min-h-11 rounded-xl border border-white/10 px-4 text-sm font-medium text-stone-300 hover:bg-white/[0.04]">Cancel</button><button type="submit" className="min-h-11 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white hover:bg-emerald-500">{editingProduct ? "Save Changes" : "Create Product"}</button></div>
            </form>
          </section>
        ) : null}

        <section aria-label="Product list" className="overflow-hidden rounded-2xl border border-white/[0.07] bg-neutral-900/80">
          <div className="grid gap-3 border-b border-white/[0.06] p-4 sm:grid-cols-[minmax(0,1fr)_12rem] sm:items-end sm:px-5">
            <label className="relative block min-w-0"><span className="sr-only">Search products</span><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products" className="min-h-11 w-full rounded-xl border border-white/[0.08] bg-neutral-950 pl-10 pr-3 text-sm text-white placeholder:text-stone-500 focus:border-emerald-400/60 focus:outline-none focus:ring-2 focus:ring-emerald-400/15" /></label>
            <label className="block min-w-0"><span className="mb-1.5 block text-[10px] font-medium text-stone-500">Category</span><select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="min-h-11 w-full rounded-xl border border-white/[0.08] bg-neutral-950 px-3 text-sm text-stone-200"><option>All</option>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
          </div>
          <div className="flex items-center justify-between px-4 py-3 text-xs text-stone-500 sm:px-5"><span>{filteredProducts.length} product{filteredProducts.length === 1 ? "" : "s"}</span><span>Changes save to this browser</span></div>
          {filteredProducts.length ? (
            <div className="grid gap-3 p-3 sm:grid-cols-2 sm:p-4 xl:grid-cols-3">
              {filteredProducts.map((product) => (
                <article key={product.id} className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-white/[0.07] bg-neutral-950/55">
                  <div className="flex h-40 items-center justify-center overflow-hidden bg-white p-3">{product.image ? <img src={product.image} alt={product.name} className="h-full w-full object-contain" /> : <ImagePlus className="h-8 w-8 text-stone-400" aria-hidden="true" />}</div>
                  <div className="flex flex-1 flex-col p-4">
                    <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h2 className="break-words text-sm font-semibold text-white">{product.name}</h2><p className="mt-1 text-xs text-stone-500">{product.category}</p></div><p className="shrink-0 text-sm font-bold text-emerald-300">₹{Number(product.price).toLocaleString("en-IN")}</p></div>
                    <p className="mt-3 line-clamp-3 flex-1 break-words text-xs leading-5 text-stone-400">{product.description}</p>
                    <div className="mt-4 flex gap-2 border-t border-white/[0.06] pt-3"><button type="button" onClick={() => openEditForm(product)} className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-white/10 text-xs font-semibold text-stone-200 hover:bg-white/[0.05]"><Pencil className="h-3.5 w-3.5" /> Edit</button><button type="button" onClick={() => setDeletingProduct(product)} className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-rose-300/15 text-xs font-semibold text-rose-200 hover:bg-rose-300/[0.06]"><Trash2 className="h-3.5 w-3.5" /> Remove</button></div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="px-5 py-14 text-center"><Package className="mx-auto h-8 w-8 text-stone-600" /><p className="mt-3 text-sm font-medium text-stone-300">{products.length ? "No products match your search." : "No products in the catalog."}</p></div>
          )}
        </section>
      </div>

      {deletingProduct && <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-3 backdrop-blur-sm sm:items-center sm:p-4"><section role="dialog" aria-modal="true" aria-labelledby="delete-product-title" className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-neutral-900 p-5 shadow-2xl sm:p-6"><h2 id="delete-product-title" className="text-base font-semibold text-white">Remove Product?</h2><p className="mt-2 break-words text-sm leading-6 text-stone-400">Remove <span className="font-semibold text-stone-200">{deletingProduct.name}</span> from the product catalog? This action cannot be undone.</p><div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={() => setDeletingProduct(null)} className="min-h-11 rounded-xl border border-white/10 px-4 text-sm font-medium text-stone-300 hover:bg-white/[0.04]">Cancel</button><button type="button" onClick={confirmDelete} className="min-h-11 rounded-xl bg-rose-600 px-4 text-sm font-semibold text-white hover:bg-rose-500">Remove Product</button></div></section></div>}
    </div>
  );
};

export default AdminProducts;
