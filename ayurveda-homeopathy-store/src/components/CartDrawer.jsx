import React from 'react';
import { X, Trash } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CartDrawer = ({ onCheckout }) => {
  const { items, isOpen, close, increase, decrease, removeItem, subtotal, clear, openCheckout } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1" onClick={close} />

      <aside className="w-full max-w-md bg-white shadow-2xl p-5 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Your Cart</h3>
          <button aria-label="Close cart" onClick={close} className="p-2 rounded-md hover:bg-stone-100 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

              {items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-stone-600">Your cart is empty.</p>
            <a href="#medicines" className="inline-flex mt-4 items-center px-4 py-2 rounded-xl bg-emerald-700 text-white">Browse Products</a>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((it) => (
              <div key={it.id} className="flex items-center gap-3 border rounded-xl p-3">
                <img src={it.image || '/vite.svg'} alt={it.name} className="w-16 h-16 object-cover rounded-lg" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm">{it.name}</h4>
                    <button aria-label="Remove item" onClick={() => removeItem(it.id)} className="p-1 rounded-md hover:bg-stone-100 cursor-pointer">
                      <Trash className="w-4 h-4 text-rose-600" />
                    </button>
                  </div>
                  <p className="text-xs text-stone-500">₹{Number(it.price).toLocaleString('en-IN')}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <button aria-label="Decrease quantity" onClick={() => decrease(it.id)} className="px-2 py-1 rounded-md border cursor-pointer">-</button>
                    <span className="px-3 py-1 border rounded-md">{it.quantity}</span>
                    <button aria-label="Increase quantity" onClick={() => increase(it.id)} className="px-2 py-1 rounded-md border cursor-pointer">+</button>
                  </div>
                </div>
              </div>
            ))}

              <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Subtotal</span>
                <span className="font-bold">₹{Number(subtotal).toLocaleString('en-IN')}</span>
              </div>

              <div className="mt-4 flex gap-2">
                <button onClick={clear} className="flex-1 rounded-xl border px-4 py-3 cursor-pointer">Clear Cart</button>
                <button onClick={() => { close(); onCheckout ? onCheckout() : openCheckout(); }} className="flex-1 rounded-xl bg-emerald-700 text-white px-4 py-3 text-center cursor-pointer">Proceed to Order</button>
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
};

export default CartDrawer;
