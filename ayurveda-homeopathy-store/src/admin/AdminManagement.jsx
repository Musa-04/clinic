import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BadgePercent,
  Building2,
  Check,
  CircleAlert,
  Menu,
  Pencil,
  Plus,
  Save,
  Settings2,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import {
  addCoupon,
  addProductCategory,
  deleteCoupon,
  deleteProductCategory,
  getClinicSettings,
  getCoupons,
  getProductCategories,
  saveClinicSettings,
  updateCoupon,
  updateProductCategory,
} from "../utils/adminManagementStorage";

const FIELD_CLASS = "min-h-11 w-full rounded-xl border border-white/[0.08] bg-neutral-950 px-3 text-sm text-white placeholder:text-stone-600 focus:border-emerald-400/60 focus:outline-none focus:ring-2 focus:ring-emerald-400/15";
const PANEL_CLASS = "rounded-2xl border border-white/[0.07] bg-neutral-900/80";
const EMPTY_COUPON = { code: "", discountType: "percent", value: "", active: true, expiresOn: "" };

const readManagementState = () => {
  const errors = [];
  let categories = [];
  let coupons = [];
  let settings;
  try {
    categories = getProductCategories();
  } catch (error) {
    errors.push(error instanceof Error ? error.message : "Categories could not be loaded.");
  }
  try {
    coupons = getCoupons();
  } catch (error) {
    errors.push(error instanceof Error ? error.message : "Coupons could not be loaded.");
  }
  try {
    settings = getClinicSettings();
  } catch (error) {
    errors.push(error instanceof Error ? error.message : "Clinic settings could not be loaded.");
    settings = { clinicName: "Malik's Polyclinic", supportPhone: "", supportEmail: "", orderShippingFee: 0 };
  }
  return { categories, coupons, settings, loadError: errors.join(" ") };
};

const AdminManagement = ({ section = "categories", onNavigate, onOpenNav }) => {
  const [data, setData] = useState(readManagementState);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [couponForm, setCouponForm] = useState(EMPTY_COUPON);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [settingsForm, setSettingsForm] = useState(data.settings);

  const refresh = () => {
    const nextData = readManagementState();
    setData(nextData);
    setSettingsForm(nextData.settings);
  };

  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === null || [
        "maliks_product_categories",
        "maliks_coupons",
        "maliks_clinic_settings",
      ].includes(event.key)) refresh();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const clearMessages = () => {
    setError("");
    setNotice("");
  };

  const sectionInfo = {
    categories: {
      title: "Product Categories",
      description: "Create and maintain the categories used to organize your product catalog.",
      icon: Tag,
    },
    coupons: {
      title: "Discount Coupons",
      description: "Create discount codes, set their value and expiry, and control whether they are active.",
      icon: BadgePercent,
    },
    settings: {
      title: "Clinic Settings",
      description: "Update the clinic’s public contact details and standard order shipping fee.",
      icon: Settings2,
    },
  };
  const currentSection = sectionInfo[section] ? section : "categories";
  const { title, description, icon: SectionIcon } = sectionInfo[currentSection];

  const saveCategory = (event) => {
    event.preventDefault();
    clearMessages();
    try {
      const next = editingCategory
        ? updateProductCategory(editingCategory, categoryName)
        : addProductCategory(categoryName);
      setData((current) => ({ ...current, categories: next }));
      setCategoryName("");
      setEditingCategory(null);
      setNotice(editingCategory ? "Category updated." : "Category created.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Category could not be saved.");
    }
  };

  const removeCategory = (category) => {
    clearMessages();
    if (!window.confirm(`Delete the “${category}” category? This cannot be undone.`)) return;
    try {
      const next = deleteProductCategory(category);
      setData((current) => ({ ...current, categories: next }));
      setNotice("Category deleted.");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Category could not be deleted.");
    }
  };

  const saveCoupon = (event) => {
    event.preventDefault();
    clearMessages();
    try {
      const next = editingCoupon
        ? updateCoupon(editingCoupon, couponForm)
        : addCoupon(couponForm);
      setData((current) => ({ ...current, coupons: next }));
      setCouponForm(EMPTY_COUPON);
      setEditingCoupon(null);
      setNotice(editingCoupon ? "Coupon updated." : "Coupon created.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Coupon could not be saved.");
    }
  };

  const beginEditCoupon = (coupon) => {
    clearMessages();
    setEditingCoupon(coupon.id);
    setCouponForm({
      code: coupon.code,
      discountType: coupon.discountType,
      value: String(coupon.value),
      active: coupon.active,
      expiresOn: coupon.expiresOn || "",
    });
  };

  const removeCoupon = (coupon) => {
    clearMessages();
    if (!window.confirm(`Delete coupon “${coupon.code}”? This cannot be undone.`)) return;
    try {
      setData((current) => ({ ...current, coupons: deleteCoupon(coupon.id) }));
      setNotice("Coupon deleted.");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Coupon could not be deleted.");
    }
  };

  const toggleCoupon = (coupon) => {
    clearMessages();
    try {
      const next = updateCoupon(coupon.id, { ...coupon, active: !coupon.active });
      setData((current) => ({ ...current, coupons: next }));
      setNotice(`Coupon ${coupon.active ? "deactivated" : "activated"}.`);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Coupon status could not be updated.");
    }
  };

  const saveSettings = (event) => {
    event.preventDefault();
    clearMessages();
    try {
      const settings = saveClinicSettings(settingsForm);
      setData((current) => ({ ...current, settings }));
      setSettingsForm(settings);
      setNotice("Clinic settings saved.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Clinic settings could not be saved.");
    }
  };

  return (
    <div className="min-h-full overflow-x-hidden bg-[#0b0d0c] text-stone-100">
      <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-[#0b0d0c]/95 backdrop-blur-xl">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-700">
              <Building2 className="h-5 w-5 text-emerald-100" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white">Malik&apos;s Polyclinic</p>
              <p className="text-[11px] text-stone-500">Admin · Management</p>
            </div>
          </div>
          <button type="button" aria-label="Open admin navigation" onClick={onOpenNav} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 text-stone-300 transition hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 lg:hidden">
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onNavigate?.("/admin/orders")}
            className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs font-semibold text-stone-300 transition hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Back to Orders</span>
            <span className="sm:hidden">Orders</span>
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-9">
        <div className="mb-6 flex items-start gap-4 sm:mb-8">
          <span className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.07] sm:flex">
            <SectionIcon className="h-5 w-5 text-emerald-300" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-400">Store operations</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">{title}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-400">{description}</p>
          </div>
        </div>

        {data.loadError && (
          <div role="alert" className="mb-4 flex gap-2 rounded-xl border border-rose-300/15 bg-rose-300/[0.05] px-4 py-3 text-sm text-rose-200">
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> {data.loadError}
          </div>
        )}
        {error && (
          <div role="alert" className="mb-4 flex gap-2 rounded-xl border border-rose-300/15 bg-rose-300/[0.05] px-4 py-3 text-sm text-rose-200">
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> {error}
          </div>
        )}
        {notice && (
          <div role="status" className="mb-4 flex gap-2 rounded-xl border border-emerald-300/15 bg-emerald-300/[0.05] px-4 py-3 text-sm text-emerald-200">
            <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> {notice}
          </div>
        )}

        {currentSection === "categories" && (
          <div className="grid gap-5 lg:grid-cols-[minmax(16rem,0.8fr)_minmax(0,1.2fr)]">
            <section className={`${PANEL_CLASS} h-fit p-4 sm:p-6`}>
              <h2 className="text-base font-semibold text-white">{editingCategory ? "Edit category" : "Add category"}</h2>
              <p className="mt-1 text-xs leading-5 text-stone-500">Category names must be unique. Categories assigned to products cannot be removed.</p>
              <form onSubmit={saveCategory} className="mt-5">
                <label className="block text-xs font-medium text-stone-400" htmlFor="category-name">Category name</label>
                <input
                  id="category-name"
                  required
                  maxLength={60}
                  value={categoryName}
                  onChange={(event) => setCategoryName(event.target.value)}
                  placeholder="e.g. Ayurvedic"
                  className={`${FIELD_CLASS} mt-2`}
                />
                <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row">
                  {editingCategory && (
                    <button type="button" onClick={() => { setEditingCategory(null); setCategoryName(""); clearMessages(); }} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 px-4 text-sm font-medium text-stone-300 hover:bg-white/[0.04]">
                      <X className="h-4 w-4" aria-hidden="true" /> Cancel
                    </button>
                  )}
                  <button type="submit" className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300">
                    <Plus className="h-4 w-4" aria-hidden="true" /> {editingCategory ? "Save category" : "Add category"}
                  </button>
                </div>
              </form>
            </section>
            <section aria-label="Product categories" className={`${PANEL_CLASS} overflow-hidden`}>
              <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-4 sm:px-5">
                <h2 className="text-sm font-semibold text-white">Categories</h2>
                <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[11px] text-stone-400">{data.categories.length}</span>
              </div>
              {data.categories.length ? (
                <ul className="divide-y divide-white/[0.05]">
                  {data.categories.map((category) => (
                    <li key={category} className="flex min-w-0 items-center justify-between gap-3 px-4 py-3.5 sm:px-5">
                      <span className="min-w-0 break-words text-sm font-medium text-stone-200">{category}</span>
                      <div className="flex shrink-0 gap-2">
                        <button type="button" aria-label={`Edit ${category}`} onClick={() => { setEditingCategory(category); setCategoryName(category); clearMessages(); }} className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] text-stone-300 transition hover:bg-white/[0.05] hover:text-white">
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button type="button" aria-label={`Delete ${category}`} onClick={() => removeCategory(category)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-300/15 text-rose-200 transition hover:bg-rose-300/[0.07]">
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : <p className="px-5 py-12 text-center text-sm text-stone-500">No categories have been added.</p>}
            </section>
          </div>
        )}

        {currentSection === "coupons" && (
          <div className="grid gap-5 lg:grid-cols-[minmax(17rem,0.8fr)_minmax(0,1.2fr)]">
            <section className={`${PANEL_CLASS} h-fit p-4 sm:p-6`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-white">{editingCoupon ? "Edit coupon" : "Create coupon"}</h2>
                  <p className="mt-1 text-xs leading-5 text-stone-500">Codes are stored in uppercase and must be unique.</p>
                </div>
                {editingCoupon && <button type="button" onClick={() => { setEditingCoupon(null); setCouponForm(EMPTY_COUPON); clearMessages(); }} aria-label="Cancel coupon editing" className="flex h-9 w-9 items-center justify-center rounded-lg text-stone-400 hover:bg-white/[0.05]"><X className="h-4 w-4" /></button>}
              </div>
              <form onSubmit={saveCoupon} className="mt-5 space-y-4">
                <label className="block text-xs font-medium text-stone-400" htmlFor="coupon-code">Coupon code</label>
                <input id="coupon-code" required maxLength={40} autoCapitalize="characters" value={couponForm.code} onChange={(event) => setCouponForm({ ...couponForm, code: event.target.value })} placeholder="e.g. WELCOME10" className={FIELD_CLASS} />
                <div className="grid grid-cols-2 gap-3">
                  <label className="block min-w-0 text-xs font-medium text-stone-400" htmlFor="coupon-type">Discount type
                    <select id="coupon-type" value={couponForm.discountType} onChange={(event) => setCouponForm({ ...couponForm, discountType: event.target.value })} className={`${FIELD_CLASS} mt-2`}>
                      <option value="percent">Percent (%)</option><option value="fixed">Fixed (₹)</option>
                    </select>
                  </label>
                  <label className="block min-w-0 text-xs font-medium text-stone-400" htmlFor="coupon-value">Value
                    <input id="coupon-value" required type="number" min="0.01" max={couponForm.discountType === "percent" ? 100 : undefined} step="0.01" value={couponForm.value} onChange={(event) => setCouponForm({ ...couponForm, value: event.target.value })} placeholder="10" className={`${FIELD_CLASS} mt-2`} />
                  </label>
                </div>
                <label className="block text-xs font-medium text-stone-400" htmlFor="coupon-expiry">Expiry date <span className="font-normal text-stone-600">(optional)</span>
                  <input id="coupon-expiry" type="date" value={couponForm.expiresOn} onChange={(event) => setCouponForm({ ...couponForm, expiresOn: event.target.value })} className={`${FIELD_CLASS} mt-2 [color-scheme:dark]`} />
                </label>
                <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-white/[0.07] bg-neutral-950/60 px-3">
                  <input type="checkbox" checked={couponForm.active} onChange={(event) => setCouponForm({ ...couponForm, active: event.target.checked })} className="h-4 w-4 accent-emerald-500" />
                  <span className="text-sm text-stone-300">Coupon is active</span>
                </label>
                <button type="submit" className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300">
                  <Save className="h-4 w-4" aria-hidden="true" /> {editingCoupon ? "Save changes" : "Create coupon"}
                </button>
              </form>
            </section>
            <section aria-label="Discount coupons" className={`${PANEL_CLASS} overflow-hidden`}>
              <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-4 sm:px-5">
                <h2 className="text-sm font-semibold text-white">Coupons</h2>
                <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[11px] text-stone-400">{data.coupons.length}</span>
              </div>
              {data.coupons.length ? (
                <div className="divide-y divide-white/[0.05]">
                  {data.coupons.map((coupon) => (
                    <article key={coupon.id} className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="break-all font-mono text-sm font-bold tracking-wide text-white">{coupon.code}</h3>
                          <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${coupon.active ? "bg-emerald-400/10 text-emerald-300" : "bg-stone-400/10 text-stone-400"}`}>{coupon.active ? "Active" : "Inactive"}</span>
                        </div>
                        <p className="mt-1.5 text-xs text-stone-400">
                          {coupon.discountType === "percent" ? `${coupon.value}% off` : `₹${Number(coupon.value).toLocaleString("en-IN")} off`}
                          {coupon.expiresOn ? ` · Expires ${coupon.expiresOn}` : " · No expiry"}
                        </p>
                      </div>
                      <div className="grid grid-cols-3 gap-2 sm:flex sm:shrink-0">
                        <button type="button" onClick={() => toggleCoupon(coupon)} className="min-h-10 rounded-lg border border-white/[0.08] px-2 text-[11px] font-medium text-stone-300 transition hover:bg-white/[0.05] sm:px-3">{coupon.active ? "Deactivate" : "Activate"}</button>
                        <button type="button" aria-label={`Edit coupon ${coupon.code}`} onClick={() => beginEditCoupon(coupon)} className="flex min-h-10 items-center justify-center gap-1.5 rounded-lg border border-white/[0.08] px-2 text-[11px] font-medium text-stone-300 transition hover:bg-white/[0.05] sm:px-3"><Pencil className="h-3.5 w-3.5" aria-hidden="true" /> Edit</button>
                        <button type="button" aria-label={`Delete coupon ${coupon.code}`} onClick={() => removeCoupon(coupon)} className="flex min-h-10 items-center justify-center gap-1.5 rounded-lg border border-rose-300/15 px-2 text-[11px] font-medium text-rose-200 transition hover:bg-rose-300/[0.06] sm:px-3"><Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Delete</button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : <div className="px-5 py-14 text-center"><BadgePercent className="mx-auto h-8 w-8 text-stone-600" aria-hidden="true" /><p className="mt-3 text-sm text-stone-400">No coupons created yet.</p></div>}
            </section>
          </div>
        )}

        {currentSection === "settings" && (
          <section className={`${PANEL_CLASS} max-w-3xl p-4 sm:p-7`}>
            <div className="mb-5 flex items-start gap-3 border-b border-white/[0.06] pb-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/[0.08] text-emerald-300"><Building2 className="h-5 w-5" aria-hidden="true" /></span>
              <div><h2 className="text-base font-semibold text-white">Clinic details</h2><p className="mt-1 text-xs leading-5 text-stone-500">These settings are saved in this browser for this application.</p></div>
            </div>
            <form onSubmit={saveSettings} className="grid gap-4 sm:grid-cols-2">
              <label className="block min-w-0 text-xs font-medium text-stone-400 sm:col-span-2" htmlFor="clinic-name">Clinic name
                <input id="clinic-name" required maxLength={120} value={settingsForm.clinicName} onChange={(event) => setSettingsForm({ ...settingsForm, clinicName: event.target.value })} className={`${FIELD_CLASS} mt-2`} />
              </label>
              <label className="block min-w-0 text-xs font-medium text-stone-400" htmlFor="support-phone">Support phone
                <input id="support-phone" type="tel" maxLength={40} value={settingsForm.supportPhone} onChange={(event) => setSettingsForm({ ...settingsForm, supportPhone: event.target.value })} placeholder="+91 00000 00000" className={`${FIELD_CLASS} mt-2`} />
              </label>
              <label className="block min-w-0 text-xs font-medium text-stone-400" htmlFor="support-email">Support email
                <input id="support-email" type="email" maxLength={254} value={settingsForm.supportEmail} onChange={(event) => setSettingsForm({ ...settingsForm, supportEmail: event.target.value })} placeholder="support@example.com" className={`${FIELD_CLASS} mt-2`} />
              </label>
              <label className="block min-w-0 text-xs font-medium text-stone-400 sm:col-span-2" htmlFor="shipping-fee">Order shipping fee (₹)
                <input id="shipping-fee" required type="number" min="0" step="0.01" value={settingsForm.orderShippingFee} onChange={(event) => setSettingsForm({ ...settingsForm, orderShippingFee: event.target.value })} className={`${FIELD_CLASS} mt-2 max-w-sm`} />
                <span className="mt-1.5 block font-normal text-stone-600">Use 0 for free shipping.</span>
              </label>
              <div className="flex justify-end border-t border-white/[0.06] pt-4 sm:col-span-2">
                <button type="submit" className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white transition hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 sm:w-auto">
                  <Save className="h-4 w-4" aria-hidden="true" /> Save settings
                </button>
              </div>
            </form>
          </section>
        )}
      </div>
    </div>
  );
};

export default AdminManagement;
