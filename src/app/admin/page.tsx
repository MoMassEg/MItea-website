"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import AdminSidebar, { AdminTab } from "@/components/admin/AdminSidebar";
import AdminOverview from "@/components/admin/AdminOverview";
import AdminOrders from "@/components/admin/AdminOrders";
import AdminProducts from "@/components/admin/AdminProducts";
import AdminCatering from "@/components/admin/AdminCatering";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminPromos from "@/components/admin/AdminPromos";
import AdminStoreSettings from "@/components/admin/AdminStoreSettings";
import {
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
  Lock,
  Loader2,
  LogIn,
  KeyRound,
} from "lucide-react";

export default function AdminPage() {
  const [adminUser, setAdminUser] = useState<{ email: string; name: string } | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [pendingOrdersCount, setPendingOrdersCount] = useState<number>(0);

  // Dedicated Admin Auth State
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [adminEmail, setAdminEmail] = useState<string>("");
  const [adminPass, setAdminPass] = useState<string>("");
  const [loginLoading, setLoginLoading] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Check dedicated admin session on mount
  const checkAdminSession = async () => {
    try {
      const res = await fetch("/api/admin/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.admin) {
          setAdminUser(data.admin);
        } else {
          setAdminUser(null);
        }
      } else {
        setAdminUser(null);
      }
    } catch {
      setAdminUser(null);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkAdminSession();
  }, []);

  // Poll for pending orders badge
  const updatePendingCount = async () => {
    try {
      const res = await apiClient.adminGetStats();
      if (res.success && res.stats?.statusBreakdown?.PENDING) {
        setPendingOrdersCount(res.stats.statusBreakdown.PENDING);
      }
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    if (adminUser) {
      updatePendingCount();
      const interval = setInterval(updatePendingCount, 20000);
      return () => clearInterval(interval);
    }
  }, [adminUser]);

  // Dedicated Master Admin Login
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: adminEmail, password: adminPass }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      setAdminUser(data.admin);
    } catch (err: any) {
      setLoginError(err.message || "Invalid administrator credentials");
    } finally {
      setLoginLoading(false);
    }
  };

  // Dedicated Master Admin Logout
  const handleAdminLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } catch {
      // Ignore
    } finally {
      setAdminUser(null);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-[#0B0F17] flex flex-col items-center justify-center text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500 mb-3" />
        <p className="text-xs font-semibold tracking-wide uppercase">Checking Admin Session...</p>
      </div>
    );
  }

  // Standalone Admin Login Portal (Not related to normal customer user)
  if (!adminUser) {
    return (
      <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500/20 to-amber-500/20 border border-brand-500/30 text-brand-400 flex items-center justify-center mx-auto shadow-inner">
            <KeyRound className="w-8 h-8 text-brand-400" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-full border border-brand-500/20 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
              <span>Master Admin Access</span>
            </div>
            <h1 className="text-2xl font-heading font-black text-white tracking-tight">
              MiTea Operations Portal
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Separate master administrator sign-in. Independent of customer store accounts.
            </p>
          </div>

          {/* Standalone Admin Sign In Form */}
          <form onSubmit={handleAdminLogin} className="space-y-4 text-left">
            {loginError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                Admin Username / Email
              </label>
              <input
                type="email"
                required
                autoComplete="off"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="Enter administrator email..."
                className="w-full px-3.5 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                Admin Master Password
              </label>
              <input
                type="password"
                required
                autoComplete="new-password"
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
                placeholder="Enter secret password..."
                className="w-full px-3.5 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-brand-900/40 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loginLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              <span>Authenticate as Master Admin</span>
            </button>
          </form>

          <div className="pt-3 border-t border-gray-800/80 flex items-center justify-center text-xs">
            <Link
              href="/"
              className="text-gray-400 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Customer Store</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Master Admin Dashboard
  return (
    <div className="min-h-screen bg-[#F7F5F0] text-gray-900 flex flex-col antialiased">
      <div className="flex flex-1 min-h-screen">
        {/* Persistent Left Sidebar */}
        <AdminSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          pendingOrdersCount={pendingOrdersCount}
          currentUser={adminUser}
          onLogout={handleAdminLogout}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {activeTab === "overview" && <AdminOverview onNavigate={setActiveTab} />}
          {activeTab === "orders" && <AdminOrders />}
          {activeTab === "products" && <AdminProducts onProductChanged={updatePendingCount} />}
          {activeTab === "catering" && <AdminCatering />}
          {activeTab === "users" && <AdminUsers />}
          {activeTab === "promos" && <AdminPromos />}
          {activeTab === "store" && <AdminStoreSettings />}
        </main>
      </div>
    </div>
  );
}
