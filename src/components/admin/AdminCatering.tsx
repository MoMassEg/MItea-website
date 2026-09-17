"use client";

import React, { useState, useEffect, useMemo } from "react";
import { apiClient } from "@/lib/api-client";
import {
  UtensilsCrossed,
  Search,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  Building,
  User,
  Eye,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Loader2,
  ChevronDown,
  DollarSign,
  Users as UsersIcon,
  X,
  FileText,
  Sparkles,
  AlertCircle,
} from "lucide-react";

const STATUS_CONFIG: Record<
  string,
  { bg: string; text: string; border: string; label: string }
> = {
  PENDING: { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200", label: "Pending Review" },
  CONFIRMED: { bg: "bg-blue-50", text: "text-blue-800", border: "border-blue-200", label: "Confirmed" },
  IN_PROGRESS: { bg: "bg-purple-50", text: "text-purple-800", border: "border-purple-200", label: "In Progress" },
  COMPLETED: { bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-200", label: "Completed" },
  CANCELLED: { bg: "bg-rose-50", text: "text-rose-800", border: "border-rose-200", label: "Cancelled" },
};

export default function AdminCatering() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeRequest, setActiveRequest] = useState<any | null>(null);
  const [adminNotes, setAdminNotes] = useState<string>("");
  const [savingNotes, setSavingNotes] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadRequests = async () => {
    try {
      setRefreshing(true);
      const res = await apiClient.adminGetCateringRequests();
      if (res.success && Array.isArray(res.requests)) {
        setRequests(res.requests);
      } else {
        setRequests([]);
      }
    } catch (err: any) {
      console.error("Failed to load catering requests:", err);
      showToast("Failed to fetch catering requests");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleStatusChange = async (requestId: string, newStatus: string) => {
    try {
      const res = await apiClient.adminUpdateCateringStatus(requestId, newStatus);
      if (res.success) {
        setRequests((prev) =>
          prev.map((r) => (r.id === requestId ? { ...r, status: newStatus } : r))
        );
        if (activeRequest && activeRequest.id === requestId) {
          setActiveRequest((prev: any) => ({ ...prev, status: newStatus }));
        }
        showToast(`Status updated to ${newStatus}`);
      }
    } catch (err: any) {
      showToast(err.response?.data?.error || err.message || "Failed to update status");
    }
  };

  const handleSaveNotes = async () => {
    if (!activeRequest) return;
    try {
      setSavingNotes(true);
      const res = await apiClient.adminUpdateCateringStatus(
        activeRequest.id,
        activeRequest.status,
        adminNotes
      );
      if (res.success) {
        setRequests((prev) =>
          prev.map((r) =>
            r.id === activeRequest.id ? { ...r, admin_notes: adminNotes } : r
          )
        );
        setActiveRequest((prev: any) => ({ ...prev, admin_notes: adminNotes }));
        showToast("Admin notes saved");
      }
    } catch (err: any) {
      showToast(err.response?.data?.error || err.message || "Failed to save notes");
    } finally {
      setSavingNotes(false);
    }
  };

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const matchesStatus =
        selectedStatus === "all" ||
        r.status?.toUpperCase() === selectedStatus.toUpperCase();

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        r.request_number?.toLowerCase().includes(q) ||
        r.full_name?.toLowerCase().includes(q) ||
        r.contact_name?.toLowerCase().includes(q) ||
        r.email?.toLowerCase().includes(q) ||
        r.contact_email?.toLowerCase().includes(q) ||
        r.phone?.toLowerCase().includes(q) ||
        r.event_type?.toLowerCase().includes(q) ||
        r.company?.toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [requests, selectedStatus, searchQuery]);

  // Key metrics
  const stats = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter((r) => r.status === "PENDING").length;
    const confirmedOrActive = requests.filter((r) =>
      ["CONFIRMED", "IN_PROGRESS"].includes(r.status)
    ).length;
    const estimatedRev = requests.reduce((sum, r) => {
      const val = Number(r.estimated_total || r.estimated_amount || 0);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);

    return { total, pending, confirmedOrActive, estimatedRev };
  }, [requests]);

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-gray-700 animate-in fade-in slide-in-from-bottom-5">
          <AlertCircle className="w-4 h-4 text-brand-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-black text-gray-900 tracking-tight flex items-center gap-2.5">
            <UtensilsCrossed className="w-7 h-7 text-brand-600" />
            <span>Catering & Event Inquiries</span>
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage large group orders, corporate events, and custom boba bar requests.
          </p>
        </div>

        <button
          onClick={loadRequests}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-brand-600" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Inquiries</span>
            <FileText className="w-4 h-4 text-brand-500" />
          </div>
          <p className="text-2xl font-black text-gray-900 font-heading">{stats.total}</p>
          <p className="text-[11px] text-gray-400 mt-1">All recorded requests</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Review</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600 font-heading">{stats.pending}</p>
          <p className="text-[11px] text-gray-400 mt-1">Needs confirmation</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Events</span>
            <Sparkles className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-blue-600 font-heading">{stats.confirmedOrActive}</p>
          <p className="text-[11px] text-gray-400 mt-1">Confirmed or preparing</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Est. Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 font-heading">
            ${stats.estimatedRev.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-gray-400 mt-1">Total estimated quote</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {["all", "PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"].map(
            (status) => {
              const active = selectedStatus === status;
              return (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                    active
                      ? "bg-brand-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200/70"
                  }`}
                >
                  {status === "all" ? "All Requests" : status.replace("_", " ")}
                </button>
              );
            }
          )}
        </div>

        {/* Search */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search request #, client, event..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Requests Table / Cards */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-12 text-center text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-brand-600" />
          <p className="text-xs font-semibold uppercase tracking-wider">Loading catering requests...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-12 text-center text-gray-400">
          <UtensilsCrossed className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p className="text-base font-bold text-gray-700">No catering requests found</p>
          <p className="text-xs text-gray-400 mt-1">
            {searchQuery || selectedStatus !== "all"
              ? "Try adjusting your filters or search terms."
              : "New requests submitted through the Catering modal will appear here."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-200/80">
                <tr>
                  <th className="px-5 py-3.5">Request #</th>
                  <th className="px-5 py-3.5">Client & Contact</th>
                  <th className="px-5 py-3.5">Event Details</th>
                  <th className="px-5 py-3.5">Style / Guests</th>
                  <th className="px-5 py-3.5">Est. Total</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRequests.map((req) => {
                  const statusConf = STATUS_CONFIG[req.status] || STATUS_CONFIG.PENDING;
                  const clientName = req.full_name || req.contact_name || "Guest";
                  const clientEmail = req.email || req.contact_email || "N/A";
                  const clientPhone = req.phone || req.contact_phone || "";
                  const eventDate = req.event_date || "TBD";
                  const eventType = req.event_type || "Catering Event";
                  const guestCount = req.guest_count || req.guests || "20";
                  const total = req.estimated_total || req.estimated_amount || 0;

                  return (
                    <tr key={req.id} className="hover:bg-gray-50/60 transition-colors">
                      {/* Request # */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded-md text-[11px]">
                          {req.request_number || req.id.slice(0, 8)}
                        </span>
                        <p className="text-[10px] text-gray-400 mt-1">
                          {new Date(req.created_at || 0).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </td>

                      {/* Client */}
                      <td className="px-5 py-4">
                        <div className="font-semibold text-gray-900">{clientName}</div>
                        <div className="text-gray-500 text-[11px] flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 shrink-0 text-gray-400" />
                          <span className="truncate max-w-[150px]">{clientEmail}</span>
                        </div>
                        {clientPhone && (
                          <div className="text-gray-400 text-[10px] flex items-center gap-1 mt-0.5">
                            <Phone className="w-2.5 h-2.5 shrink-0" />
                            <span>{clientPhone}</span>
                          </div>
                        )}
                        {req.company && (
                          <div className="text-brand-600 text-[10px] font-medium flex items-center gap-1 mt-0.5">
                            <Building className="w-2.5 h-2.5 shrink-0" />
                            <span>{req.company}</span>
                          </div>
                        )}
                      </td>

                      {/* Event Details */}
                      <td className="px-5 py-4">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200/60 mb-1">
                          {eventType}
                        </span>
                        <div className="text-gray-700 font-medium flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <span>{eventDate}</span>
                          {req.event_time && <span className="text-gray-400">@ {req.event_time}</span>}
                        </div>
                        {req.address && (
                          <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5 truncate max-w-[160px]">
                            <MapPin className="w-2.5 h-2.5 shrink-0" />
                            <span>{req.address}</span>
                          </div>
                        )}
                      </td>

                      {/* Style & Guests */}
                      <td className="px-5 py-4">
                        <div className="font-semibold text-gray-800 flex items-center gap-1">
                          <UsersIcon className="w-3 h-3 text-gray-400" />
                          <span>{guestCount} Guests</span>
                        </div>
                        <p className="text-[11px] text-gray-500 capitalize mt-0.5">
                          {req.service_style || "Drop-off Delivery"}
                        </p>
                      </td>

                      {/* Total */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="font-bold text-gray-900 text-sm">
                          ${Number(total).toFixed(2)}
                        </span>
                        {req.discount_percent > 0 && (
                          <p className="text-[10px] text-emerald-600 font-medium">
                            {req.discount_percent}% off applied
                          </p>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusConf.bg} ${statusConf.text} ${statusConf.border}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          <span>{statusConf.label}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 whitespace-nowrap text-right space-x-1.5">
                        <button
                          onClick={() => {
                            setActiveRequest(req);
                            setAdminNotes(req.admin_notes || "");
                          }}
                          className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Details</span>
                        </button>

                        {/* Quick Action */}
                        <select
                          value={req.status}
                          onChange={(e) => handleStatusChange(req.id, e.target.value)}
                          className="bg-white border border-gray-200 text-gray-700 text-[11px] rounded-lg px-2 py-1 focus:outline-none focus:border-brand-500 font-semibold cursor-pointer"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="CONFIRMED">Confirm</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="COMPLETED">Complete</option>
                          <option value="CANCELLED">Cancel</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detailed Request Modal */}
      {activeRequest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 space-y-6 my-8">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono font-black text-sm bg-brand-50 text-brand-700 px-2.5 py-0.5 rounded-lg border border-brand-200">
                    {activeRequest.request_number || activeRequest.id}
                  </span>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                      STATUS_CONFIG[activeRequest.status]?.bg
                    } ${STATUS_CONFIG[activeRequest.status]?.text} ${
                      STATUS_CONFIG[activeRequest.status]?.border
                    }`}
                  >
                    {STATUS_CONFIG[activeRequest.status]?.label || activeRequest.status}
                  </span>
                </div>
                <h3 className="text-xl font-heading font-black text-gray-900">
                  {activeRequest.event_type || "Catering Event Request"}
                </h3>
              </div>
              <button
                onClick={() => setActiveRequest(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Client & Event Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50/70 p-4 rounded-2xl border border-gray-100 text-xs">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Client Details
                </p>
                <p className="font-bold text-gray-900 text-sm">
                  {activeRequest.full_name || activeRequest.contact_name || "N/A"}
                </p>
                <p className="text-gray-600 mt-0.5">{activeRequest.email || activeRequest.contact_email}</p>
                {activeRequest.phone && (
                  <p className="text-gray-500 mt-0.5">{activeRequest.phone || activeRequest.contact_phone}</p>
                )}
                {activeRequest.company && (
                  <p className="text-brand-700 font-semibold mt-1 flex items-center gap-1">
                    <Building className="w-3 h-3" />
                    <span>{activeRequest.company}</span>
                  </p>
                )}
              </div>

              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Event & Venue
                </p>
                <p className="font-semibold text-gray-800 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-brand-500" />
                  <span>
                    {activeRequest.event_date}{" "}
                    {activeRequest.event_time ? `@ ${activeRequest.event_time}` : ""}
                  </span>
                </p>
                <p className="text-gray-600 mt-1 flex items-center gap-1.5">
                  <UsersIcon className="w-3.5 h-3.5 text-brand-500" />
                  <span>{activeRequest.guest_count || activeRequest.guests} Guests</span>
                </p>
                <p className="text-gray-600 mt-1 flex items-center gap-1.5">
                  <UtensilsCrossed className="w-3.5 h-3.5 text-brand-500" />
                  <span className="capitalize">{activeRequest.service_style || "Drop-off"}</span>
                </p>
                {activeRequest.address && (
                  <p className="text-gray-500 mt-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                    <span>{activeRequest.address}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Order Items Breakdown */}
            {activeRequest.order_details && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Order Breakdown ({activeRequest.order_details.mode === "packages" ? "Pre-set Packages" : "Custom Builder"})
                </h4>
                <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50/50 space-y-2 text-xs">
                  {/* Packages Mode */}
                  {activeRequest.order_details.packages &&
                    activeRequest.order_details.packages.map((pkg: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center py-1 border-b border-gray-100 last:border-0">
                        <div>
                          <span className="font-bold text-gray-900">{pkg.name}</span>
                          <span className="text-gray-500 ml-2">× {pkg.quantity}</span>
                        </div>
                        <span className="font-bold text-gray-800">${(pkg.unitPrice * pkg.quantity).toFixed(2)}</span>
                      </div>
                    ))}

                  {/* Custom Mode */}
                  {activeRequest.order_details.drinks &&
                    activeRequest.order_details.drinks.map((d: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center py-1 border-b border-gray-100 last:border-0">
                        <div>
                          <span className="font-bold text-gray-900">{d.name}</span>
                          <span className="text-gray-500 ml-2">× {d.quantity}</span>
                        </div>
                        <span className="font-bold text-gray-800">${(d.unitPrice * d.quantity).toFixed(2)}</span>
                      </div>
                    ))}

                  {/* Bakery Platters */}
                  {activeRequest.order_details.bakery &&
                    activeRequest.order_details.bakery.map((b: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center py-1 border-b border-gray-100 last:border-0">
                        <div>
                          <span className="font-bold text-gray-900">{b.name}</span>
                          <span className="text-gray-500 ml-2">× {b.quantity}</span>
                        </div>
                        <span className="font-bold text-gray-800">${(b.unitPrice * b.quantity).toFixed(2)}</span>
                      </div>
                    ))}

                  {/* Summary row */}
                  <div className="pt-2 flex justify-between items-center text-sm font-bold text-gray-900 border-t border-gray-200 mt-2">
                    <span>Estimated Total</span>
                    <span className="text-brand-700 text-base">
                      ${Number(activeRequest.estimated_total || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Special Instructions */}
            {activeRequest.notes && (
              <div className="p-3.5 bg-amber-50/50 rounded-2xl border border-amber-200/50 text-xs">
                <p className="font-bold text-amber-800 mb-0.5">Special Instructions / Customer Notes:</p>
                <p className="text-gray-700 whitespace-pre-wrap">{activeRequest.notes}</p>
              </div>
            )}

            {/* Admin Internal Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block">
                Internal Admin Notes
              </label>
              <textarea
                rows={3}
                placeholder="Add private staff notes, quote follow-ups, or delivery instructions..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                  className="px-3.5 py-1.5 bg-gray-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition-all cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {savingNotes && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Notes</span>
                </button>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500">Update Status:</span>
                {(["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const).map(
                  (st) => {
                    const active = activeRequest.status === st;
                    return (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(activeRequest.id, st)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          active
                            ? "bg-gray-900 text-white shadow-xs"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {st.replace("_", " ")}
                      </button>
                    );
                  }
                )}
              </div>

              <button
                onClick={() => setActiveRequest(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
