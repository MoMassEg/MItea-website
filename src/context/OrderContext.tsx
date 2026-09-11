"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { apiClient } from '@/lib/api-client';
import {
  MENU_DATA,
  ADDRESS_DATABASE,
  MenuItem,
  StoreLocation,
  DeliveryAddress,
  CartItem
} from "@/data/menu-data";

export interface PromoCode {
  code: string;
  percent?: number;
  freeDelivery?: boolean;
  description: string;
}

export interface PlacedOrder {
  orderId: string;
  createdAt: string;
  orderType: "pickup" | "delivery";
  store: StoreLocation;
  deliveryAddress: DeliveryAddress;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  tax: number;
  tip: number;
  total: number;
  paymentMethod: string;
  customerName: string;
  customerPhone: string;
}

export interface ToastItem {
  id: string;
  message: string;
  type?: "success" | "info" | "warning";
}

interface OrderContextType {
  orderType: "pickup" | "delivery";
  setOrderType: (type: "pickup" | "delivery") => void;
  selectedStore: StoreLocation;
  setSelectedStore: (store: StoreLocation) => void;
  deliveryAddress: DeliveryAddress;
  setDeliveryAddress: (addr: DeliveryAddress) => void;
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "uid" | "totalPrice">) => void;
  updateQuantity: (uid: string, delta: number) => void;
  removeFromCart: (uid: string) => void;
  clearCart: () => void;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isStoreOpen: boolean;
  toggleStoreStatus: () => void;
  isLoadingDemo: boolean;
  toggleLoadingDemo: () => void;
  selectedProduct: MenuItem | null;
  openProductModal: (product: MenuItem) => void;
  closeProductModal: () => void;
  isCartDrawerOpen: boolean;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
  isLocationModalOpen: boolean;
  locationModalTab: "pickup" | "delivery";
  openLocationModal: (initialTab?: "pickup" | "delivery") => void;
  closeLocationModal: () => void;
  isCheckoutModalOpen: boolean;
  openCheckoutModal: () => void;
  closeCheckoutModal: () => void;
  isConfirmationModalOpen: boolean;
  openConfirmationModal: (order: PlacedOrder) => void;
  closeConfirmationModal: () => void;
  isSendGiftOpen: boolean;
  openSendGiftModal: () => void;
  closeSendGiftModal: () => void;
  isRewardsOpen: boolean;
  openRewardsModal: () => void;
  closeRewardsModal: () => void;
  isCateringOpen: boolean;
  openCateringModal: () => void;
  closeCateringModal: () => void;
  isGuildModalOpen: boolean;
  openGuildModal: () => void;
  closeGuildModal: () => void;
  isMobileNavOpen: boolean;
  openMobileNav: () => void;
  closeMobileNav: () => void;
  isOrderHistoryOpen: boolean;
  openOrderHistoryModal: () => void;
  closeOrderHistoryModal: () => void;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  currentUser: { id: string; email: string; name?: string; role?: string } | null;
  setCurrentUser: (user: { id: string; email: string; name?: string; role?: string } | null) => void;
  logout: () => Promise<void>;
  loyaltyStamps: number;
  setLoyaltyStamps: (stamps: number) => void;
  addLoyaltyStamp: () => void;
  appliedPromo: PromoCode | null;
  applyPromo: (code: string) => Promise<{ success: boolean; message: string }>;
  removePromo: () => void;
  selectedTip: number;
  setSelectedTip: (tip: number) => void;
  currentOrder: PlacedOrder | null;
  orderTrackingStep: number;
  setOrderTrackingStep: (step: number) => void;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  tax: number;
  total: number;
  totalItems: number;
  toasts: ToastItem[];
  showToast: (message: string, type?: "success" | "info" | "warning") => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orderType, setOrderType] = useState<"pickup" | "delivery">("pickup");
  const [selectedStore, setSelectedStore] = useState<StoreLocation>(MENU_DATA.stores[0]);
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>(ADDRESS_DATABASE[1]);
  
  // Cart — starts empty on both server and client (avoids SSR hydration mismatch)
  // Rehydrated from localStorage in useEffect after first mount
  const [cart, setCart] = useState<CartItem[]>([]);

  // After mount: restore cart from localStorage (client-only)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('mitea_cart');
      if (saved) {
        const parsed = JSON.parse(saved) as CartItem[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCart(parsed);
        }
      }
    } catch {
      // Ignore parse / storage errors
    }
  }, []);

  // Keep localStorage in sync whenever cart changes
  useEffect(() => {
    try {
      localStorage.setItem('mitea_cart', JSON.stringify(cart));
    } catch {
      // Silently ignore storage errors (private mode, quota exceeded, etc.)
    }
  }, [cart]);

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isStoreOpen, setIsStoreOpen] = useState<boolean>(true);
  const [isLoadingDemo, setIsLoadingDemo] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null);

  // Modals
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState<boolean>(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);
  const [locationModalTab, setLocationModalTab] = useState<"pickup" | "delivery">("pickup");
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState<boolean>(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState<boolean>(false);
  const [isSendGiftOpen, setIsSendGiftOpen] = useState<boolean>(false);
  const [isRewardsOpen, setIsRewardsOpen] = useState<boolean>(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);
  const [loyaltyStamps, setLoyaltyStamps] = useState<number>(0); // Task 8: start at 0; real count loaded from DB on login

  const openSendGiftModal = () => setIsSendGiftOpen(true);
  const closeSendGiftModal = () => setIsSendGiftOpen(false);

  const openRewardsModal = () => setIsRewardsOpen(true);
  const closeRewardsModal = () => setIsRewardsOpen(false);

  const [isCateringOpen, setIsCateringOpen] = useState<boolean>(false);
  const openCateringModal = () => setIsCateringOpen(true);
  const closeCateringModal = () => setIsCateringOpen(false);

  const [isGuildModalOpen, setIsGuildModalOpen] = useState<boolean>(false);
  const openGuildModal = () => setIsGuildModalOpen(true);
  const closeGuildModal = () => setIsGuildModalOpen(false);

  const openMobileNav = () => setIsMobileNavOpen(true);
  const closeMobileNav = () => setIsMobileNavOpen(false);

  // Order History Modal
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState<boolean>(false);
  const openOrderHistoryModal = () => setIsOrderHistoryOpen(true);
  const closeOrderHistoryModal = () => setIsOrderHistoryOpen(false);

  // Auth State & Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    email: string;
    name?: string;
    role?: string;
  } | null>(null);

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  useEffect(() => {
    let isMounted = true;
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.user && isMounted) {
            setCurrentUser({
              id: data.user.id,
              email: data.user.email,
              name: data.profile?.name || data.user.email?.split('@')[0],
              role: data.profile?.role || 'CUSTOMER',
            });
          }
        }
      } catch {
        // Dev fallback
      }
    }
    checkAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  // Hydrate loyalty stamps from API when authenticated
  useEffect(() => {
    if (!currentUser) return;
    let isMounted = true;
    async function fetchLoyalty() {
      try {
        const res = await fetch('/api/loyalty/stamps');
        if (res.ok) {
          const data = await res.json();
          if (data.card && isMounted) {
            setLoyaltyStamps(data.card.stamps);
          }
        }
      } catch {
        // Fallback
      }
    }
    fetchLoyalty();
    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setCurrentUser(null);
      showToast('You have been signed out.', 'info');
    } catch {
      showToast('Failed to sign out', 'warning');
    }
  };

  const addLoyaltyStamp = async () => {
    try {
      if (currentUser) {
        const res = await fetch('/api/loyalty/stamps', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ count: 1 }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.card) {
            setLoyaltyStamps(data.card.stamps);
            if (data.card.stamps >= 10) {
              showToast('🎉 10th Stamp! You unlocked a FREE Drink voucher!', 'success');
            } else {
              showToast(`Loyalty stamp punched! ${data.card.stamps}/10 stamps collected. 🧋`, 'success');
            }
            return;
          }
        }
      }
    } catch {
      // Fall through to local update
    }

    setLoyaltyStamps((s) => {
      const next = s >= 10 ? 1 : s + 1;
      if (next === 10) {
        showToast('🎉 10th Stamp! You unlocked a FREE Drink voucher!', 'success');
      } else {
        showToast(`Loyalty stamp punched! ${next}/10 stamps collected. 🧋`, 'success');
      }
      return next;
    });
  };

  // Promo and Tip
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [selectedTip, setSelectedTip] = useState<number>(0);

  // Orders and Tracking
  const [currentOrder, setCurrentOrder] = useState<PlacedOrder | null>(null);
  const [orderTrackingStep, setOrderTrackingStep] = useState<number>(1); // 0: Received, 1: Preparing, 2: Ready, 3: Completed

  // Toasts
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = (message: string, type: "success" | "info" | "warning" = "success") => {
    const id = "toast-" + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const toggleStoreStatus = () => {
    setIsStoreOpen((prev) => {
      const next = !prev;
      showToast(
        next ? "Store is now OPEN and accepting orders!" : "Store is now CLOSED. Ordering paused.",
        next ? "success" : "warning"
      );
      return next;
    });
  };

  const toggleLoadingDemo = () => {
    setIsLoadingDemo(true);
    showToast("Simulating slow connection shimmer...", "info");
    setTimeout(() => {
      setIsLoadingDemo(false);
      showToast("Data loading complete!", "success");
    }, 2000);
  };

  // Cart operations
  const addToCart = (item: Omit<CartItem, "uid" | "totalPrice">) => {
    if (!isStoreOpen) {
      showToast("Store is currently closed for new orders.", "warning");
      return;
    }
    const totalPrice = Number((item.unitPrice * item.quantity).toFixed(2));
    const newItem: CartItem = {
      ...item,
      uid: "cart-" + Math.random().toString(36).substring(2, 9),
      totalPrice
    };
    setCart((prev) => [...prev, newItem]);
    showToast(`Added ${item.name} to your cart! 🧋`, "success");
  };

  const updateQuantity = (uid: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.uid === uid) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...item,
              quantity: newQty,
              totalPrice: Number((item.unitPrice * newQty).toFixed(2))
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (uid: string) => {
    setCart((prev) => prev.filter((item) => item.uid !== uid));
    showToast("Item removed from cart.", "info");
  };

  const clearCart = () => {
    setCart([]);
    try { localStorage.removeItem('mitea_cart'); } catch { /* ignore */ }
  };

  // Promos
  const applyPromo = async (code: string): Promise<{ success: boolean; message: string }> => {
    const clean = code.trim().toUpperCase();
    if (!clean) {
      showToast("Please enter a promo code.", "warning");
      return { success: false, message: "Code is required" };
    }

    try {
      // Task 3: use typed apiClient instead of raw fetch
      const data = await apiClient.validatePromo(clean, subtotal);

      if (data.valid) {
        setAppliedPromo({
          code: clean,
          percent: data.discountPercent,
          freeDelivery: data.freeDelivery,
          description: data.description ?? '',
        });
        showToast(`Promo ${clean} applied! ${data.description}`, "success");
        return { success: true, message: data.description ?? '' };
      } else {
        showToast(data.reason || "Invalid promo code.", "warning");
        return { success: false, message: data.reason || "Invalid promo code" };
      }
    } catch {
      // Local fallback when API is unreachable
      if (clean === "BOBA10" || clean === "MITEA10" || clean === "WELCOME10" || clean === "GUILD10") {
        setAppliedPromo({
          code: clean,
          percent: 10,
          description: "10% off your entire order",
        });
        showToast(`Promo ${clean} applied! 10% discount added.`, "success");
        return { success: true, message: "10% off applied!" };
      } else if (clean === "FIRSTORDER") {
        setAppliedPromo({
          code: clean,
          percent: 15,
          freeDelivery: true,
          description: "15% off and free delivery on your first order over $15",
        });
        showToast(`Promo ${clean} applied! 15% discount & free delivery added.`, "success");
        return { success: true, message: "15% off and free delivery applied!" };
      } else {
        showToast("Invalid promo code. Try 'MITEA10' or 'GUILD10'.", "warning");
        return { success: false, message: "Invalid code" };
      }
    }
  };

  const removePromo = () => {
    setAppliedPromo(null);
    showToast("Promo code removed.", "info");
  };

  // Modal open/close
  const openProductModal = (product: MenuItem) => {
    setSelectedProduct(product);
  };

  const closeProductModal = () => {
    setSelectedProduct(null);
  };

  const openCartDrawer = () => setIsCartDrawerOpen(true);
  const closeCartDrawer = () => setIsCartDrawerOpen(false);

  const openLocationModal = (_initialTab: "pickup" | "delivery" = "pickup") => {
    setLocationModalTab("pickup");
    setIsLocationModalOpen(true);
  };
  const closeLocationModal = () => setIsLocationModalOpen(false);

  const openCheckoutModal = () => {
    if (cart.length === 0) {
      showToast("Your cart is empty! Add items to checkout.", "warning");
      return;
    }
    setIsCartDrawerOpen(false);
    setIsCheckoutModalOpen(true);
  };
  const closeCheckoutModal = () => setIsCheckoutModalOpen(false);

  const openConfirmationModal = (order: PlacedOrder) => {
    setCurrentOrder(order);
    setIsCheckoutModalOpen(false);
    setIsConfirmationModalOpen(true);
    setOrderTrackingStep(1); // Start preparing
  };
  const closeConfirmationModal = () => setIsConfirmationModalOpen(false);

  // Auto-progress simulated order tracker
  useEffect(() => {
    if (!isConfirmationModalOpen || !currentOrder) return;

    const timer1 = setTimeout(() => {
      setOrderTrackingStep(2); // Ready for pickup
    }, 9000);

    const timer2 = setTimeout(() => {
      setOrderTrackingStep(3); // Completed
    }, 18000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [isConfirmationModalOpen, currentOrder]);

  // Calculations
  const subtotal = Number(cart.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2));

  const deliveryFee = 0;

  const discount = appliedPromo?.percent
    ? Number((subtotal * (appliedPromo.percent / 100)).toFixed(2))
    : 0;

  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = Number((taxableAmount * 0.08875).toFixed(2)); // Minnesota 8.875% tax

  const total = cart.length === 0
    ? 0
    : Number((taxableAmount + deliveryFee + tax + (selectedTip || 0)).toFixed(2));

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <OrderContext.Provider
      value={{
        orderType,
        setOrderType,
        selectedStore,
        setSelectedStore,
        deliveryAddress,
        setDeliveryAddress,
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        activeCategory,
        setActiveCategory,
        searchQuery,
        setSearchQuery,
        isStoreOpen,
        toggleStoreStatus,
        isLoadingDemo,
        toggleLoadingDemo,
        selectedProduct,
        openProductModal,
        closeProductModal,
        isCartDrawerOpen,
        openCartDrawer,
        closeCartDrawer,
        isLocationModalOpen,
        locationModalTab,
        openLocationModal,
        closeLocationModal,
        isCheckoutModalOpen,
        openCheckoutModal,
        closeCheckoutModal,
        isConfirmationModalOpen,
        openConfirmationModal,
        closeConfirmationModal,
        isSendGiftOpen,
        openSendGiftModal,
        closeSendGiftModal,
        isRewardsOpen,
        openRewardsModal,
        closeRewardsModal,
        isCateringOpen,
        openCateringModal,
        closeCateringModal,
        isGuildModalOpen,
        openGuildModal,
        closeGuildModal,
        isMobileNavOpen,
        openMobileNav,
        closeMobileNav,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        isOrderHistoryOpen,
        openOrderHistoryModal,
        closeOrderHistoryModal,
        currentUser,
        setCurrentUser,
        logout,
        loyaltyStamps,
        setLoyaltyStamps,
        addLoyaltyStamp,
        appliedPromo,
        applyPromo,
        removePromo,
        selectedTip,
        setSelectedTip,
        currentOrder,
        orderTrackingStep,
        setOrderTrackingStep,
        subtotal,
        deliveryFee,
        discount,
        tax,
        total,
        totalItems,
        toasts,
        showToast
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrder must be used within an OrderProvider");
  }
  return context;
}
