"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
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
  loyaltyStamps: number;
  addLoyaltyStamp: () => void;
  appliedPromo: PromoCode | null;
  applyPromo: (code: string) => { success: boolean; message: string };
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
  
  // Initial demo cart matching prototype
  const [cart, setCart] = useState<CartItem[]>([
    {
      uid: "init-cart-1",
      id: "coconut-milk-tea",
      name: "Coconut Milk Tea",
      image: MENU_DATA.items[0].image,
      size: "Regular (16 oz)",
      sizePrice: 0,
      sugar: "50%",
      ice: "Regular Ice",
      toppings: [{ id: "boba", name: "Tapioca Pearls", price: 0.75 }],
      basePrice: 5.50,
      unitPrice: 6.25,
      quantity: 1,
      totalPrice: 6.25
    },
    {
      uid: "init-cart-2",
      id: "brown-sugar-boba-milk",
      name: "Brown Sugar Boba Milk",
      image: MENU_DATA.items[1].image,
      size: "Regular (16 oz)",
      sizePrice: 0,
      sugar: "75%",
      ice: "Less Ice",
      toppings: [],
      basePrice: 6.75,
      unitPrice: 6.75,
      quantity: 1,
      totalPrice: 6.75
    }
  ]);

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
  const [loyaltyStamps, setLoyaltyStamps] = useState<number>(7);

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

  const addLoyaltyStamp = () => {
    setLoyaltyStamps((s) => {
      const next = s >= 10 ? 1 : s + 1;
      if (next === 10) {
        showToast("🎉 10th Stamp! You unlocked a FREE Drink voucher!", "success");
      } else {
        showToast(`Loyalty stamp punched! ${next}/10 stamps collected. 🧋`, "success");
      }
      return next;
    });
  };

  // Promo and Tip
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [selectedTip, setSelectedTip] = useState<number>(2.00);

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
  };

  // Promos
  const applyPromo = (code: string): { success: boolean; message: string } => {
    const clean = code.trim().toUpperCase();
    if (clean === "BOBA10") {
      setAppliedPromo({
        code: "BOBA10",
        percent: 10,
        description: "10% off your entire order"
      });
      showToast("Promo BOBA10 applied! 10% discount added.", "success");
      return { success: true, message: "10% off applied!" };
    } else if (clean === "FREEDROP") {
      setAppliedPromo({
        code: "FREEDROP",
        freeDelivery: true,
        description: "Free Delivery on orders over $15"
      });
      showToast("Promo FREEDROP applied! $3.99 delivery waived.", "success");
      return { success: true, message: "Free delivery applied!" };
    } else {
      showToast("Invalid promo code. Try 'BOBA10' or 'FREEDROP'.", "warning");
      return { success: false, message: "Invalid code" };
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

  const openLocationModal = (initialTab: "pickup" | "delivery" = "pickup") => {
    setLocationModalTab(initialTab);
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

  const deliveryFee = orderType === "pickup" ? 0 : appliedPromo?.freeDelivery ? 0 : 3.99;

  const discount = appliedPromo?.percent
    ? Number((subtotal * (appliedPromo.percent / 100)).toFixed(2))
    : 0;

  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = Number((taxableAmount * 0.08875).toFixed(2)); // Minnesota 8.875% tax

  const total = Number((taxableAmount + deliveryFee + tax + (selectedTip || 0)).toFixed(2));

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
        loyaltyStamps,
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
