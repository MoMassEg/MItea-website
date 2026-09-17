"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useOrder } from "@/context/OrderContext";
import { MenuItem, CartItem } from "@/data/menu-data";
import { apiClient } from "@/lib/api-client";
import { X, Plus, Minus } from "lucide-react";

export default function ProductModal() {
  const { selectedProduct, closeProductModal, addToCart } = useOrder();

  if (!selectedProduct) return null;

  return (
    <ProductModalDialog
      key={selectedProduct.id}
      product={selectedProduct}
      onClose={closeProductModal}
      onAddToCart={addToCart}
    />
  );
}

function ProductModalDialog({
  product: initialProduct,
  onClose,
  onAddToCart,
}: {
  product: MenuItem;
  onClose: () => void;
  onAddToCart: (item: Omit<CartItem, "uid" | "totalPrice">) => void;
}) {
  // Task 9: live menu item details from API with static fallback
  const [product, setProduct] = useState<MenuItem>(initialProduct);
  useEffect(() => {
    let mounted = true;
    apiClient.getMenuItem(initialProduct.id)
      .then((res) => { if (mounted && res.item) setProduct(res.item as MenuItem); })
      .catch(() => {}); // keep static fallback
    return () => { mounted = false; };
  }, [initialProduct.id]);

  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState<string>("");

  const unitPrice = Number(product.price.toFixed(2));
  const totalPrice = Number((unitPrice * quantity).toFixed(2));

  const handleAdd = () => {
    onAddToCart({
      id: product.id,
      name: product.name,
      image: product.image,
      size: "Standard",
      sizePrice: 0,
      sugar: "",
      ice: "",
      toppings: [],
      basePrice: product.price,
      unitPrice: unitPrice,
      quantity: quantity,
      notes: notes.trim() || undefined
    });

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      {/* Dark backdrop */}
      <div
        className="fixed inset-0 glass-dark animate-backdrop"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-warm-300 animate-modal overflow-hidden relative z-10 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="relative h-48 sm:h-56 w-full bg-warm-200 shrink-0">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, 512px"
            className="object-cover"
          />
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/85 hover:bg-white text-gray-700 flex items-center justify-center shadow-md backdrop-blur-sm transition-all cursor-pointer z-10"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-4 sm:p-5 text-white">
            <span className="text-[11px] font-bold uppercase tracking-wider bg-brand-600 px-2 py-0.5 rounded-full inline-block mb-1">
              {product.category}
            </span>
            <h2 className="font-heading font-extrabold text-xl sm:text-2xl leading-tight">
              {product.name}
            </h2>
          </div>
        </div>

        {/* Scrollable Customization Options */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-grow">
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            {product.description}
          </p>

          {/* Special Instructions (free text) */}
          <div>
            <label
              htmlFor="product-notes"
              className="block font-heading font-bold text-sm text-[#1A1A1A] mb-2.5"
            >
              Special Instructions <span className="text-brand-600 font-semibold text-xs">Optional</span>
            </label>
            <textarea
              id="product-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value.slice(0, 200))}
              rows={3}
              maxLength={200}
              placeholder="e.g., less sweet, no ice, extra boba, allergies…"
              className="w-full p-3 rounded-xl border border-warm-300 bg-white text-sm text-gray-900 placeholder-warm-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-400 resize-none"
            />
            <div className="text-right text-[10px] text-gray-400 mt-1">
              {notes.length}/200
            </div>
          </div>
        </div>

        {/* Modal Footer: Stepper & Add CTA */}
        <div className="p-4 sm:p-5 bg-warm-100 border-t border-warm-300 flex items-center justify-between gap-4 shrink-0">
          {/* Quantity Stepper */}
          <div className="flex items-center bg-white border border-warm-300 rounded-full px-2 py-1 shadow-xs">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-7 h-7 rounded-full flex items-center justify-center text-gray-600 hover:bg-warm-200 transition-colors cursor-pointer"
              disabled={quantity <= 1}
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="font-heading font-bold text-sm px-3 text-gray-900">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="w-7 h-7 rounded-full flex items-center justify-center text-gray-600 hover:bg-warm-200 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add to Order Button */}
          <button
            type="button"
            onClick={handleAdd}
            className="flex-grow bg-brand-600 hover:bg-brand-800 text-white font-heading font-bold text-sm py-3 px-6 rounded-full shadow-md shadow-brand-600/20 btn-press transition-all flex items-center justify-between cursor-pointer"
          >
            <span>Add to Cart</span>
            <span>${totalPrice.toFixed(2)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
