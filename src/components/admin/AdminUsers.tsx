"use client";

import React, { useState, useEffect, useMemo } from "react";
import { apiClient } from "@/lib/api-client";
import {
  Users,
  Search,
  Shield,
  ShieldCheck,
  ShieldAlert,
  UserX,
  Trash2,
  Sparkles,
  Loader2,
  AlertTriangle,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";

interface AdminUser {
  id: string;
  email: string;
  name?: string;
  phone?: string | null;
  role: "CUSTOMER" | "ADMIN";
  avatar_url?: string | null;
  created_at?: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Actions state
  const [confirmRoleUser, setConfirmRoleUser] = useState<AdminUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await apiClient.adminGetUsers();
      if (res.success && res.users) {
        setUsers(res.users);
      }
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesRole = selectedRole === "all" || u.role === selectedRole;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        u.email.toLowerCase().includes(q) ||
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.phone && u.phone.toLowerCase().includes(q));
      return matchesRole && matchesQuery;
    });
  }, [users, selectedRole, searchQuery]);

  // Toggle Admin / Customer Role
  const handleToggleRole = async () => {
    if (!confirmRoleUser) return;
    const targetRole = confirmRoleUser.role === "ADMIN" ? "CUSTOMER" : "ADMIN";

    try {
      setIsSubmitting(true);
      const res = await apiClient.adminUpdateUserRole(confirmRoleUser.id, targetRole);
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === confirmRoleUser.id ? { ...u, role: targetRole } : u))
        );
        showToast(
          `Updated ${confirmRoleUser.name || confirmRoleUser.email} to ${targetRole}`
        );
      }
    } catch (err: any) {
      console.error(err);
      showToast("Failed to update user role");
    } finally {
      setIsSubmitting(false);
      setConfirmRoleUser(null);
    }
  };

  // Delete User
  const handleDeleteUser = async () => {
    if (!deletingUser) return;

    try {
      setIsSubmitting(true);
      const res = await apiClient.adminDeleteUser(deletingUser.id);
      if (res.success) {
        setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
        showToast(`User ${deletingUser.email} deleted successfully`);
      }
    } catch (err: any) {
      console.error(err);
      showToast("Failed to delete user");
    } finally {
      setIsSubmitting(false);
      setDeletingUser(null);
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

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-heading font-extrabold text-gray-900">Customer Accounts Directory</h2>
          <p className="text-xs text-gray-500">
            Total {users.length} registered customer accounts on the storefront.
          </p>
        </div>
      </div>

      {/* Dedicated Master Admin Account Card */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-purple-950 p-4 rounded-2xl border border-gray-800 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">Single Master Admin Account:</span>
              <span className="font-mono font-bold bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30">
                admin@mitea.com
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Standalone master access. Not related to or affected by regular customer store logins.
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
          />
        </div>

        {/* Role Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setSelectedRole("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              selectedRole === "all" ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All Accounts ({users.length})
          </button>
          <button
            onClick={() => setSelectedRole("ADMIN")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              selectedRole === "ADMIN" ? "bg-purple-600 text-white" : "bg-purple-50 text-purple-700 hover:bg-purple-100"
            }`}
          >
            Admins
          </button>
          <button
            onClick={() => setSelectedRole("CUSTOMER")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              selectedRole === "CUSTOMER" ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            Customers
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin text-brand-600 mb-2" />
            <p className="text-xs">Loading user directory...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm font-semibold text-gray-700">No users found</p>
            <p className="text-xs text-gray-400 mt-1">Try another search keyword or role filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 border-b border-gray-200/80 text-gray-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
                {filteredUsers.map((user) => {
                  const isAdmin = user.role === "ADMIN";
                  const initial = (user.name?.charAt(0) || user.email.charAt(0)).toUpperCase();
                  const createdDate = user.created_at
                    ? new Date(user.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Active";

                  return (
                    <tr key={user.id} className="hover:bg-gray-50/60 transition-colors">
                      {/* Avatar & Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                              isAdmin
                                ? "bg-purple-100 text-purple-700 border border-purple-200"
                                : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                            }`}
                          >
                            {initial}
                          </div>
                          <div>
                            <div className="font-heading font-bold text-sm text-gray-900">
                              {user.name || "Customer"}
                            </div>
                            <div className="text-[11px] text-gray-400 flex items-center gap-1">
                              <Mail className="w-3 h-3 text-gray-400" />
                              <span>{user.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-3 px-4">
                        {user.phone ? (
                          <span className="flex items-center gap-1.5 text-gray-600">
                            <Phone className="w-3 h-3 text-gray-400" />
                            <span>{user.phone}</span>
                          </span>
                        ) : (
                          <span className="text-gray-400 text-[11px] italic">Not provided</span>
                        )}
                      </td>

                      {/* Role Pill */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                            isAdmin
                              ? "bg-purple-100 text-purple-800 border border-purple-200"
                              : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          }`}
                        >
                          {isAdmin ? <ShieldCheck className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                          <span>{user.role}</span>
                        </span>
                      </td>

                      {/* Created Date */}
                      <td className="py-3 px-4 text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <span>{createdDate}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => setConfirmRoleUser(user)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                              isAdmin
                                ? "bg-gray-100 text-gray-600 hover:bg-rose-50 hover:text-rose-700"
                                : "bg-purple-50 text-purple-700 hover:bg-purple-100"
                            }`}
                          >
                            {isAdmin ? "Demote to Customer" : "Promote to Admin"}
                          </button>
                          <button
                            onClick={() => setDeletingUser(user)}
                            title="Delete User"
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

      {/* ─── CONFIRM ROLE CHANGE DIALOG ────────────────────────────────────────── */}
      {confirmRoleUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-base text-gray-900">
                {confirmRoleUser.role === "ADMIN"
                  ? `Revoke Admin from "${confirmRoleUser.name || confirmRoleUser.email}"?`
                  : `Grant Admin to "${confirmRoleUser.name || confirmRoleUser.email}"?`}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {confirmRoleUser.role === "ADMIN"
                  ? "This user will lose access to the Admin Dashboard and will only have standard customer ordering capabilities."
                  : "This user will gain full operational access to the Admin Dashboard (menus, orders, users, promo codes)."}
              </p>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setConfirmRoleUser(null)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleToggleRole}
                className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md shadow-purple-900/30 cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── CONFIRM DELETE USER DIALOG ────────────────────────────────────────── */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <UserX className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-base text-gray-900">
                Delete User Profile?
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Are you sure you want to delete <strong>{deletingUser.email}</strong>? This action cannot be undone.
              </p>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDeleteUser}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md shadow-rose-900/30 cursor-pointer"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
