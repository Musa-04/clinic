import React, { createContext, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'maliks_polyclinic_cart';

const CartContext = createContext(null);

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [checkoutPrepared, setCheckoutPrepared] = useState(false);

  // load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // normalize loaded items to ensure numeric price and quantity
          const normalized = parsed.map((it) => ({
            ...it,
            price: Number(it.price) || 0,
            quantity: Number(it.quantity) || 1,
          }));
          setItems(normalized);
        }
      }
    } catch (e) {
      console.warn('Failed to load cart from localStorage', e);
      setItems([]);
    }
  }, []);

  // persist
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to save cart to localStorage', e);
    }
  }, [items]);

  const findIndex = (productId) => items.findIndex((i) => i.id === productId);

  const addItem = (product, quantity = 1) => {
    setItems((prev) => {
      const idx = prev.findIndex((p) => String(p.id) === String(product.id));
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = {
          ...copy[idx],
          quantity: Number(copy[idx].quantity || 0) + Number(quantity || 0),
        };
        return copy;
      }
      return [...prev, { ...product, price: Number(product.price) || 0, quantity: Number(quantity) || 1 }];
    });
  };

  const removeItem = (productId) => {
    setItems((prev) => prev.filter((p) => String(p.id) !== String(productId)));
  };

  const increase = (productId) => {
    setItems((prev) => prev.map((p) => String(p.id) === String(productId) ? { ...p, quantity: Number(p.quantity || 0) + 1 } : p));
  };

  const decrease = (productId) => {
    setItems((prev) => prev
      .map((p) => String(p.id) === String(productId) ? { ...p, quantity: Math.max(1, Number(p.quantity || 0) - 1) } : p)
    );
  };

  const clear = () => setItems([]);

  const subtotal = items.reduce((s, it) => s + (Number(it.price || 0) * Number(it.quantity || 0)), 0);

  const totalQuantity = items.reduce((s, it) => s + (Number(it.quantity || 0)), 0);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const openCheckout = () => setCheckoutOpen(true);
  const closeCheckout = () => setCheckoutOpen(false);

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      increase,
      decrease,
      clear,
      subtotal,
      totalQuantity,
      isOpen,
      open,
      close,
      checkoutOpen,
      openCheckout,
      closeCheckout,
      customerDetails,
      setCustomerDetails,
      checkoutPrepared,
      setCheckoutPrepared,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
