"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { apiClient } from "@/lib/api-client";
import { MenuItem, Category } from "@/data/menu-data";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Flame,
  Sparkles,
  Coffee,
  X,
  Loader2,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";

interface AdminProductsProps {
  onProductChanged?: () => void;
}

export default function AdminProducts({ onProductChanged }: AdminProductsProps) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<MenuItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    category: "milk-tea",
    price: 5.5,
    description: "",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAc2HEvhSUsgIgOxBCTvAEnJA2RRgA6hZcV9kbah9TfeiEh158W19nmSpuzf2MyhXBcr_twLtL9iZnBYU4wJn38hX7LdJN5CHwozsOHyVGbFki0-1tdGqMk_K-cDj4RQj-PyzR0va4DjNbTv_7x2PBe74l8V9ZiVV5coNkFFJRucCnxp3zQJ1shrY5dEoGy8-GGAaabHaOer0oXz_3RryX6rMOqCglFcYzjkc0i1XJs8hLO46AAAoLaW6mY8BKlT__nZqazMaim3pn4",
    popular: false,
    badge: "",
    caffeine: "Medium",
    calories: "280 kcal",
    available: true,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [catRes, itemsRes] = await Promise.allSettled([
        apiClient.getCategories(),
        apiClient.getMenuItems(),
      ]);

      if (catRes.status === "fulfilled" && catRes.value?.categories) {
        setCategories(catRes.value.categories);
      }
      if (itemsRes.status === "fulfilled" && itemsRes.value?.items) {
        setItems(itemsRes.value.items);
      }
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCat = selectedCategory === "all" || item.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [items, selectedCategory, searchQuery]);

  const handleOpenAdd = () => {
    setFormData({
      name: "",
      category: categories[1]?.id || "milk-tea",
      price: 5.5,
      description: "",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAc2HEvhSUsgIgOxBCTvAEnJA2RRgA6hZcV9kbah9TfeiEh158W19nmSpuzf2MyhXBcr_twLtL9iZnBYU4wJn38hX7LdJN5CHwozsOHyVGbFki0-1tdGqMk_K-cDj4RQj-PyzR0va4DjNbTv_7x2PBe74l8V9ZiVV5coNkFFJRucCnxp3zQJ1shrY5dEoGy8-GGAaabHaOer0oXz_3RryX6rMOqCglFcYzjkc0i1XJs8hLO46AAAoLaW6mY8BKlT__nZqazMaim3pn4",
      popular: false,
      badge: "",
      caffeine: "Medium",
      calories: "280 kcal",
      available: true,
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      price: item.price,
      description: item.description,
      image: item.image,
      popular: item.popular,
      badge: item.badge || "",
      caffeine: item.caffeine || "Medium",
      calories: item.calories || "280 kcal",
      available: item.available ?? true,
    });
  };

  // 1-Click Stock Toggle
  const handleToggleStock = async (item: MenuItem) => {
    const newStatus = !(item.available ?? true);
    // Optimistic update
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, available: newStatus } : i))
    );

    try {
      await apiClient.adminPatchProduct(item.id, { available: newStatus });
      showToast(`${item.name} marked as ${newStatus ? "In Stock" : "Sold Out"}`);
      onProductChanged?.();
    } catch (err: any) {
      // Revert on error
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, available: !newStatus } : i))
      );
      showToast("Failed to update availability");
    }
  };

  // Submit Add
  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await apiClient.adminCreateProduct({
        ...formData,
        price: Number(formData.price),
      });

      if (res.success && res.item) {
        setItems((prev) => [res.item, ...prev]);
        setIsAddModalOpen(false);
        showToast(`Created "${res.item.name}" successfully!`);
        onProductChanged?.();
      }
    } catch (err: any) {
      console.error(err);
      showToast("Failed to create product");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Edit
  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !formData.name.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await apiClient.adminUpdateProduct({
        id: editingItem.id,
        ...formData,
        price: Number(formData.price),
      });

      if (res.success && res.item) {
        setItems((prev) =>
          prev.map((i) => (i.id === editingItem.id ? res.item : i))
        );
        setEditingItem(null);
        showToast(`Updated "${res.item.name}"!`);
        onProductChanged?.();
      }
    } catch (err: any) {
      console.error(err);
      showToast("Failed to update product");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async (permanent: boolean) => {
    if (!deletingItem) return;

    try {
      setIsSubmitting(true);
      await apiClient.adminDeleteProduct(deletingItem.id, permanent);

      if (permanent) {
        setItems((prev) => prev.filter((i) => i.id !== deletingItem.id));
        showToast(`Permanently removed "${deletingItem.name}"`);
      } else {
        setItems((prev) =>
          prev.map((i) =>
            i.id === deletingItem.id ? { ...i, available: false } : i
          )
        );
        showToast(`Deactivated "${deletingItem.name}" (marked as sold out)`);
      }

      setDeletingItem(null);
      onProductChanged?.();
    } catch (err: any) {
      console.error(err);
      showToast("Failed to delete product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-gray-700 flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3">
          <Sparkles className="w-4 h-4 text-brand-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-heading font-extrabold text-gray-900">Products & Menu Management</h2>
          <p className="text-xs text-gray-500">
            Total {items.length} items in catalog. Add new drinks, adjust prices, or mark sold-out items.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-brand-900/30 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search drinks or snacks..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === "all"
                ? "bg-brand-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All Items ({items.length})
          </button>
          {categories
            .filter((c) => c.id !== "all")
            .map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-brand-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat.name}
              </button>
            ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin text-brand-600 mb-2" />
            <p className="text-xs">Loading menu items...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Coffee className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm font-semibold text-gray-700">No products match your search</p>
            <p className="text-xs text-gray-400 mt-1">Try another keyword or category filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 border-b border-gray-200/80 text-gray-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Item</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Calories & Caffeine</th>
                  <th className="py-3 px-4">Availability</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
                {filteredItems.map((item) => {
                  const isAvailable = item.available ?? true;
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                      {/* Thumbnail & Title */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-warm-100 shrink-0 border border-warm-200">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              sizes="48px"
                              className={`object-cover ${!isAvailable ? "grayscale opacity-60" : ""}`}
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-heading font-bold text-sm text-gray-900 truncate">
                                {item.name}
                              </span>
                              {item.popular && (
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded">
                                  <Flame className="w-2.5 h-2.5 text-amber-600" />
                                  Popular
                                </span>
                              )}
                              {item.badge && !item.popular && (
                                <span className="text-[9px] font-bold bg-gray-100 text-gray-600 px-1.5 py-0.2 rounded">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-gray-400 line-clamp-1 max-w-xs">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="inline-block bg-gray-100 text-gray-700 text-[11px] font-semibold px-2.5 py-1 rounded-md capitalize">
                          {item.category.replace("-", " ")}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4 font-heading font-extrabold text-sm text-gray-900">
                        ${item.price.toFixed(2)}
                      </td>

                      {/* Calories & Caffeine */}
                      <td className="py-3 px-4 text-gray-500">
                        <div>{item.calories || "240 kcal"}</div>
                        <div className="text-[10px] text-gray-400">
                          Caffeine: {item.caffeine || "Medium"}
                        </div>
                      </td>

                      {/* Stock Switch Toggle */}
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleStock(item)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                            isAvailable
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                              : "bg-rose-100 text-rose-800 hover:bg-rose-200"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isAvailable ? "bg-emerald-500" : "bg-rose-500"
                            }`}
                          />
                          <span>{isAvailable ? "In Stock" : "Sold Out"}</span>
                        </button>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            title="Edit Product"
                            className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingItem(item)}
                            title="Delete Product"
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── ADD / EDIT PRODUCT MODAL ────────────────────────────────────────────── */}
      {(isAddModalOpen || editingItem) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-heading font-extrabold text-gray-900">
                {editingItem ? `Edit: ${editingItem.name}` : "Add New Menu Product"}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingItem(null);
                }}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={editingItem ? handleSubmitEdit : handleSubmitAdd} className="space-y-4 text-xs">
              {/* Name */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Taro Lava Pearl Milk Tea"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                />
              </div>

              {/* Category & Price Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                  >
                    {categories
                      .filter((c) => c.id !== "all")
                      .map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Price ($ USD) *</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Tasting notes, tea origin, or ingredients..."
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Image URL</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                />
              </div>

              {/* Calories & Caffeine */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Calories</label>
                  <input
                    type="text"
                    value={formData.calories}
                    onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                    placeholder="e.g. 280 kcal"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Caffeine Level</label>
                  <select
                    value={formData.caffeine}
                    onChange={(e) => setFormData({ ...formData, caffeine: e.target.value })}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                  >
                    <option value="None">None (Caffeine-Free)</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              {/* Badges and Flags */}
              <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={formData.popular}
                    onChange={(e) => setFormData({ ...formData, popular: e.target.checked })}
                    className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
                  />
                  <span>Mark as "Best Seller"</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={formData.available}
                    onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                    className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
                  />
                  <span>Available (In Stock)</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingItem(null);
                  }}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl transition-all shadow-md shadow-brand-900/30 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingItem ? "Save Changes" : "Create Product"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── DELETE CONFIRMATION DIALOG ────────────────────────────────────────── */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-lg text-gray-900">
                Delete "{deletingItem.name}"?
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                You can either mark it as <strong>Sold Out</strong> (customers won't be able to buy it, but history remains) or <strong>Permanently Delete</strong> it completely.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleConfirmDelete(false)}
                className="w-full py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-xl text-xs transition-colors border border-amber-200 cursor-pointer"
              >
                Mark as Sold Out / Deactivate
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleConfirmDelete(true)}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md shadow-rose-900/30 cursor-pointer"
              >
                Permanently Delete from Database
              </button>
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                className="w-full py-2 text-gray-400 hover:text-gray-600 font-semibold text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
