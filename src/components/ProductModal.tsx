"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useOrder } from "@/context/OrderContext";
import { MENU_DATA, MenuItem, CartItem } from "@/data/menu-data";
import { X, Check, Plus, Minus } from "lucide-react";

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
  product,
  onClose,
  onAddToCart,
}: {
  product: MenuItem;
  onClose: () => void;
  onAddToCart: (item: Omit<CartItem, "uid" | "totalPrice">) => void;
}) {
  const presets = MENU_DATA.customizationPresets;

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>("regular");
  const [selectedSugar, setSelectedSugar] = useState<string>("50");
  const [selectedIce, setSelectedIce] = useState<string>("regular");
  const [selectedToppings, setSelectedToppings] = useState<string[]>(["boba"]);

  const currentSizeObj = presets.sizes.find((s) => s.value === selectedSize) || presets.sizes[0];
  const sizePrice = currentSizeObj.priceModifier;

  const toppingsPrice = selectedToppings.reduce((sum, tid) => {
    const t = presets.toppings.find((item) => item.id === tid);
    return sum + (t ? t.price : 0);
  }, 0);

  const unitPrice = Number((product.price + sizePrice + toppingsPrice).toFixed(2));
  const totalPrice = Number((unitPrice * quantity).toFixed(2));

  const toggleTopping = (toppingId: string) => {
    setSelectedToppings((prev) =>
      prev.includes(toppingId) ? prev.filter((id) => id !== toppingId) : [...prev, toppingId]
    );
  };

  const handleAdd = () => {
    const sugarObj = presets.sugarLevels.find((s) => s.value === selectedSugar);
    const iceObj = presets.iceLevels.find((i) => i.value === selectedIce);
    const chosenToppings = selectedToppings
      .map((tid) => {
        const top = presets.toppings.find((t) => t.id === tid);
        return top ? { id: top.id, name: top.name, price: top.price } : null;
      })
      .filter(Boolean) as { id: string; name: string; price: number }[];

    onAddToCart({
      id: product.id,
      name: product.name,
      image: product.image,
      size: currentSizeObj.label,
      sizePrice: currentSizeObj.priceModifier,
      sugar: sugarObj ? sugarObj.label : "50%",
      ice: iceObj ? iceObj.label : "Regular Ice",
      toppings: chosenToppings,
      basePrice: product.price,
      unitPrice: unitPrice,
      quantity: quantity
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

          {/* Size Options */}
          <div>
            <label className="block font-heading font-bold text-sm text-[#1A1A1A] mb-2.5">
              Choose Size <span className="text-brand-600 font-semibold text-xs">*Required</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {presets.sizes.map((s) => {
                const isChecked = selectedSize === s.value;
                return (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setSelectedSize(s.value)}
                    className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isChecked
                        ? "border-brand-600 bg-brand-50 shadow-xs"
                        : "border-warm-300 hover:border-warm-400 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-heading font-bold text-sm text-gray-900">{s.label}</span>
                      {isChecked && <Check className="w-4 h-4 text-brand-600" />}
                    </div>
                    <span className="text-xs text-gray-500 mt-1">
                      {s.priceModifier > 0 ? `+$${s.priceModifier.toFixed(2)}` : "Included"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sweetness Level */}
          <div>
            <label className="block font-heading font-bold text-sm text-[#1A1A1A] mb-2.5">
              Sweetness Level <span className="text-brand-600 font-semibold text-xs">*Required</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {presets.sugarLevels.map((s) => {
                const isChecked = selectedSugar === s.value;
                return (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setSelectedSugar(s.value)}
                    className={`py-2 px-1 rounded-xl border text-center transition-all cursor-pointer text-xs font-semibold ${
                      isChecked
                        ? "border-brand-600 bg-brand-600 text-white shadow-xs"
                        : "border-warm-300 hover:bg-warm-100 text-gray-700 bg-white"
                    }`}
                  >
                    <div>{s.label}</div>
                    <span className={`text-[9px] block font-normal opacity-80 truncate px-1`}>
                      {s.desc.replace(" (Recommended)", "")}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ice Level */}
          <div>
            <label className="block font-heading font-bold text-sm text-[#1A1A1A] mb-2.5">
              Ice Level <span className="text-brand-600 font-semibold text-xs">*Required</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {presets.iceLevels.map((i) => {
                const isChecked = selectedIce === i.value;
                return (
                  <button
                    key={i.value}
                    type="button"
                    onClick={() => setSelectedIce(i.value)}
                    className={`py-2 px-1 rounded-xl border text-center transition-all cursor-pointer text-xs font-semibold ${
                      isChecked
                        ? "border-brand-600 bg-brand-600 text-white shadow-xs"
                        : "border-warm-300 hover:bg-warm-100 text-gray-700 bg-white"
                    }`}
                  >
                    <div>{i.label}</div>
                    <span className="text-[9px] block font-normal opacity-80 truncate px-1">
                      {i.desc.replace(" (Recommended)", "")}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Toppings Multi-Select */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="font-heading font-bold text-sm text-[#1A1A1A]">
                Add-on Toppings
              </label>
              <span className="text-xs text-gray-500 font-medium">Optional</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {presets.toppings.map((top: ToppingOption) => {
                const isChecked = selectedToppings.includes(top.id);
                return (
                  <button
                    key={top.id}
                    type="button"
                    onClick={() => toggleTopping(top.id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer text-left ${
                      isChecked
                        ? "border-brand-600 bg-brand-50 shadow-xs"
                        : "border-warm-300 hover:border-warm-400 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                          isChecked
                            ? "bg-brand-600 border-brand-600 text-white"
                            : "border-gray-400 bg-white"
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3" />}
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-gray-900 block leading-tight">
                          {top.name}
                        </span>
                        <span className="text-[10px] text-gray-500">{top.calories} kcal</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-brand-600 shrink-0 ml-2">
                      +${top.price.toFixed(2)}
                    </span>
                  </button>
                );
              })}
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
            <span>Add to Order</span>
            <span>${totalPrice.toFixed(2)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
