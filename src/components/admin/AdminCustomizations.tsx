"use client";

import React, { useState, useEffect, useMemo } from "react";
import { apiClient } from "@/lib/api-client";
import {
  Coffee,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
  Settings2,
  Tag
} from "lucide-react";

export default function AdminCustomizations() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("all");

  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [deletingItem, setDeletingItem] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await apiClient.adminGetCustomizations();
      if (res.success && res.items) {
        setItems(res.items);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to load customizations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        item.name?.toLowerCase().includes(q) ||
        item.value?.toLowerCase().includes(q) ||
        item.type?.toLowerCase().includes(q);
      const matchesType = selectedType === "all" || item.type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [items, searchQuery, selectedType]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setErrorMsg(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingItem(item);
    setErrorMsg(null);
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingItem(null);
    setErrorMsg(null);
  };

  const handleToggleAvailable = async (item: any) => {
    try {
      const newStatus = !item.is_default;
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, is_default: newStatus } : i)));
      await apiClient.adminPatchCustomization(item.id, { is_default: newStatus });
    } catch (err) {
      console.error(err);
      fetchItems(); // revert on fail
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      type: formData.get("type") as string,
      name: formData.get("name") as string,
      label: (formData.get("label") as string) || (formData.get("name") as string),
      value: formData.get("value") as string,
      price_delta: parseFloat(formData.get("price_delta") as string) || 0,
      is_default: formData.get("is_default") === "on",
      display_order: parseInt(formData.get("display_order") as string) || 0,
    };

    if (!data.value) {
      // Auto-generate value if empty
      data.value = data.name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
    }

    try {
      if (editingItem) {
        await apiClient.adminUpdateCustomization({ id: editingItem.id, ...data });
      } else {
        await apiClient.adminCreateCustomization(data);
      }
      await fetchItems();
      handleCloseModal();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save customization");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    setIsSubmitting(true);
    try {
      await apiClient.adminDeleteCustomization(deletingItem.id);
      setItems((prev) => prev.filter((i) => i.id !== deletingItem.id));
      setDeletingItem(null);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to delete");
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { id: "all", label: "All Items" },
    { id: "topping", label: "Toppings" },
    { id: "addon", label: "Add-ons" },
    { id: "sugar", label: "Sugar Levels" },
    { id: "ice", label: "Ice Levels" },
    { id: "size", label: "Sizes" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-heading font-extrabold text-gray-900">Customizations & Modifiers</h2>
          <p className="text-xs text-gray-500">Manage toppings, add-ons, sugar levels, and sizes.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md shadow-brand-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Customization</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search modifiers..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedType(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedType === tab.id
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin text-brand-600 mb-2" />
            <p className="text-xs">Loading customizations...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Settings2 className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm font-semibold text-gray-700">No customizations found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 border-b border-gray-200/80 text-gray-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Price Delta</th>
                  <th className="py-3 px-4 text-center">Available/Default</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-900">{item.name}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5 font-mono">{item.value}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-[10px] font-bold uppercase tracking-wider">
                        {item.type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={item.price_delta > 0 ? "text-brand-700 font-bold" : "text-gray-500"}>
                        {item.price_delta > 0 ? `+$${Number(item.price_delta).toFixed(2)}` : "Free"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggleAvailable(item)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors cursor-pointer ${
                          item.is_default
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "bg-red-50 text-red-700 hover:bg-red-100"
                        }`}
                      >
                        {item.is_default ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" /> YES
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" /> NO
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex gap-1 justify-end">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { setDeletingItem(item); setErrorMsg(null); }}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
              <h3 className="font-heading font-extrabold text-xl text-gray-900">
                {editingItem ? "Edit Customization" : "Add Customization"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Type</label>
                  <select
                    name="type"
                    defaultValue={editingItem?.type || "topping"}
                    required
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                  >
                    <option value="topping">Topping</option>
                    <option value="addon">Add-on</option>
                    <option value="sugar">Sugar Level</option>
                    <option value="ice">Ice Level</option>
                    <option value="size">Size Option</option>
                  </select>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Price Delta ($)</label>
                  <input
                    type="number"
                    name="price_delta"
                    step="0.01"
                    min="0"
                    defaultValue={editingItem?.price_delta || 0}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Name (Display)</label>
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={editingItem?.name || ""}
                  placeholder="e.g., Honey Boba"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Internal Value / ID (Optional)</label>
                <input
                  type="text"
                  name="value"
                  defaultValue={editingItem?.value || ""}
                  placeholder="e.g., honey-boba"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 font-mono text-xs"
                />
              </div>

              <div className="flex items-center gap-3 py-2">
                <input
                  type="checkbox"
                  id="is_default"
                  name="is_default"
                  defaultChecked={editingItem ? editingItem.is_default : true}
                  className="w-4 h-4 text-brand-600 rounded border-gray-300 focus:ring-brand-500"
                />
                <label htmlFor="is_default" className="text-sm font-semibold text-gray-700">
                  Available / Active / Default
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-gray-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-xl shadow-md transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{editingItem ? "Save Changes" : "Create"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-heading font-extrabold text-gray-900 mb-2">Delete Customization?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete <span className="font-bold text-gray-900">{deletingItem.name}</span>? This action cannot be undone.
            </p>
            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-start gap-2 text-left">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => { setDeletingItem(null); setErrorMsg(null); }}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl shadow-md transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
