"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useOrder } from "@/context/OrderContext";
import { MenuItem, CartItem } from "@/data/menu-data";
import { apiClient } from "@/lib/api-client";
import { useCustomizations } from "@/lib/hooks/useCustomizations";
import { X, Plus, Minus, Check } from "lucide-react";

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

  const { presets } = useCustomizations();

  // Toppings & Add-ons state
  const toppings = presets.toppings || [];
  const addOns = presets.addOns || [];
  const [selectedToppings, setSelectedToppings] = useState<Set<string>>(new Set());
  const [selectedAddOns, setSelectedAddOns] = useState<Set<string>>(new Set());

  // Sugar, Ice, Size state
  const sugarLevels = presets.sugarLevels || [];
  const iceLevels = presets.iceLevels || [];
  const sizes = presets.sizes || [];

  const [selectedSugar, setSelectedSugar] = useState<string>("");
  const [selectedIce, setSelectedIce] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");

  useEffect(() => {
    if (sugarLevels.length > 0 && !selectedSugar) {
      setSelectedSugar(sugarLevels.find(s => s.isDefault)?.value || sugarLevels[0]?.value || "");
    }
    if (iceLevels.length > 0 && !selectedIce) {
      setSelectedIce(iceLevels.find(i => i.isDefault)?.value || iceLevels[0]?.value || "");
    }
    if (sizes.length > 0 && !selectedSize) {
      setSelectedSize(sizes.find(s => s.isDefault)?.value || sizes[0]?.value || "");
    }
  }, [sugarLevels, iceLevels, sizes, selectedSugar, selectedIce, selectedSize]);

  const toggleTopping = (id: string) => {
    setSelectedToppings((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAddOn = (id: string) => {
    setSelectedAddOns((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Price calculation
  const toppingsTotal = useMemo(() => {
    let sum = 0;
    for (const t of toppings) {
      if (selectedToppings.has(t.id)) sum += t.price;
    }
    return sum;
  }, [selectedToppings, toppings]);

  const addOnsTotal = useMemo(() => {
    let sum = 0;
    for (const a of addOns) {
      if (selectedAddOns.has(a.id)) sum += a.price;
    }
    return sum;
  }, [selectedAddOns, addOns]);

  const sizePrice = useMemo(() => {
    return sizes.find((s) => s.value === selectedSize)?.priceModifier || 0;
  }, [sizes, selectedSize]);

  const unitPrice = Number((product.price + sizePrice + toppingsTotal + addOnsTotal).toFixed(2));
  const totalPrice = Number((unitPrice * quantity).toFixed(2));

  const handleAdd = () => {
    const chosenToppings = toppings
      .filter((t) => selectedToppings.has(t.id))
      .map((t) => ({ id: t.id, name: t.name, price: t.price }));

    const chosenAddOns = addOns
      .filter((a) => selectedAddOns.has(a.id))
      .map((a) => ({ id: a.id, name: a.name, price: a.price }));

    const sizeOption = sizes.find(s => s.value === selectedSize);
    const sugarOption = sugarLevels.find(s => s.value === selectedSugar);
    const iceOption = iceLevels.find(i => i.value === selectedIce);

    onAddToCart({
      id: product.id,
      name: product.name,
      image: product.image,
      size: sizeOption?.label || "Standard",
      sizePrice: sizeOption?.priceModifier || 0,
      sugar: sugarOption?.label || "",
      ice: iceOption?.label || "",
      toppings: chosenToppings,
      addOns: chosenAddOns.length > 0 ? chosenAddOns : undefined,
      basePrice: product.price,
      unitPrice: unitPrice,
      quantity: quantity,
      notes: notes.trim() || undefined
    });

    onClose();
  };

  const isCustomizable = product.customizable;

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
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-grow">
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            {product.description}
          </p>

          {/* ── Make it your own: Toppings ── */}
          {isCustomizable && (
            <div className="space-y-6">
              {/* Sizes */}
              {sizes.length > 0 && (
                <div>
                  <h3 className="font-heading font-bold text-sm text-[#1A1A1A] mb-3 flex items-center justify-between">
                    <span>Size</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((s) => (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => setSelectedSize(s.value)}
                        className={`px-4 py-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                          selectedSize === s.value
                            ? "bg-brand-50 border-brand-500 text-brand-700 ring-1 ring-brand-400"
                            : "bg-white border-warm-300 text-gray-700 hover:bg-warm-50"
                        }`}
                      >
                        {s.label} {s.priceModifier > 0 && <span className="text-brand-600 ml-1">(+${s.priceModifier.toFixed(2)})</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sugar Levels */}
              {sugarLevels.length > 0 && (
                <div>
                  <h3 className="font-heading font-bold text-sm text-[#1A1A1A] mb-3">Sugar Level</h3>
                  <div className="flex flex-wrap gap-2">
                    {sugarLevels.map((s) => (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => setSelectedSugar(s.value)}
                        className={`px-4 py-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                          selectedSugar === s.value
                            ? "bg-brand-50 border-brand-500 text-brand-700 ring-1 ring-brand-400"
                            : "bg-white border-warm-300 text-gray-700 hover:bg-warm-50"
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Ice Levels */}
              {iceLevels.length > 0 && (
                <div>
                  <h3 className="font-heading font-bold text-sm text-[#1A1A1A] mb-3">Ice Level</h3>
                  <div className="flex flex-wrap gap-2">
                    {iceLevels.map((i) => (
                      <button
                        key={i.value}
                        type="button"
                        onClick={() => setSelectedIce(i.value)}
                        className={`px-4 py-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                          selectedIce === i.value
                            ? "bg-brand-50 border-brand-500 text-brand-700 ring-1 ring-brand-400"
                            : "bg-white border-warm-300 text-gray-700 hover:bg-warm-50"
                        }`}
                      >
                        {i.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Toppings */}
              {toppings.length > 0 && (
                <div>
                  <h3 className="font-heading font-bold text-sm text-[#1A1A1A] mb-3 flex items-center gap-2">
                    <span>Make it your own</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {toppings.map((t) => {
                      const isSelected = selectedToppings.has(t.id);
                      const isUnavailable = t.available === false;
                      return (
                    <button
                      key={t.id}
                      type="button"
                      disabled={isUnavailable}
                      onClick={() => toggleTopping(t.id)}
                      className={`relative flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                        isSelected
                          ? "border-brand-500 bg-brand-50 ring-1 ring-brand-400"
                          : "border-warm-300 bg-white hover:border-warm-400 hover:bg-warm-50"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? "bg-brand-600 border-brand-600 text-white"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="font-semibold text-gray-900 truncate">{t.name}</div>
                        <div className="text-brand-700 font-bold">+${t.price.toFixed(2)}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            )}
            </div>
          )}

          {/* ── Add-Ons (Mochi Donut, Labubu, etc.) ── */}
          {isCustomizable && addOns.length > 0 && (
            <div className="space-y-2">
              {addOns.map((addon) => {
                const isSelected = selectedAddOns.has(addon.id);
                const isSoldOut = !addon.available;
                return (
                  <button
                    key={addon.id}
                    type="button"
                    disabled={isSoldOut}
                    onClick={() => toggleAddOn(addon.id)}
                    className={`w-full flex items-center justify-between gap-3 p-3 rounded-xl border text-left text-xs transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                      isSelected
                        ? "border-brand-500 bg-brand-50 ring-1 ring-brand-400"
                        : "border-warm-300 bg-warm-50 hover:border-warm-400"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? "bg-brand-600 border-brand-600 text-white"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-gray-900 truncate">{addon.name}</div>
                        <span className="text-[10px] text-gray-500">Pick {addon.pickLimit}</span>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      {isSoldOut ? (
                        <span className="text-[11px] font-bold text-red-500 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">Sold out</span>
                      ) : (
                        <span className="font-heading font-bold text-brand-700">
                          {addon.price > 0 ? `Add $${addon.price.toFixed(2)}` : "Free"}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

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
