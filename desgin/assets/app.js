/**
 * MiTea - Premium Bubble Tea & Asian Dessert Online Ordering Controller
 * Flagship Store: 7724 Olson Mem Hwy, Golden Valley, MN 55427
 * Currency: USD ($)
 */

(function () {
  'use strict';

  // --- Central Application State ---
  const state = {
    orderType: 'pickup', // 'pickup' | 'delivery'
    selectedStore: MENU_DATA.stores[0], // Golden Valley, MN
    deliveryAddress: {
      street: '123 Main Street',
      apt: 'Apt 4B',
      city: 'Minneapolis, MN 55401',
      instructions: 'Please leave at front lobby desk.',
      estTime: '25–35 min',
      distance: '2.1 mi',
      valid: true
    },
    cart: [
      {
        uid: 'demo-item-1',
        id: 'coconut-milk-tea',
        name: 'Coconut Milk Tea',
        image: MENU_DATA.items[0].image,
        size: 'Regular (16 oz)',
        sizePrice: 0,
        sugar: '50%',
        ice: 'Regular Ice',
        toppings: [
          { id: 'boba', name: 'Tapioca Pearls', price: 0.75 }
        ],
        basePrice: 5.50,
        unitPrice: 6.25,
        quantity: 1,
        totalPrice: 6.25
      },
      {
        uid: 'demo-item-2',
        id: 'brown-sugar-boba-milk',
        name: 'Brown Sugar Boba Milk',
        image: MENU_DATA.items[1].image,
        size: 'Regular (16 oz)',
        sizePrice: 0,
        sugar: '75%',
        ice: 'Less Ice',
        toppings: [],
        basePrice: 6.75,
        unitPrice: 6.75,
        quantity: 1,
        totalPrice: 6.75
      }
    ],
    activeCategory: 'all',
    searchQuery: '',
    isStoreOpen: true,
    isSearching: false,
    selectedProduct: null,
    tempModalCustomization: {
      quantity: 1,
      size: 'regular',
      sizeModifier: 0,
      sugar: '50',
      ice: 'regular',
      toppings: ['boba']
    },
    activeCheckoutPayment: 'card', // 'card' | 'cash' | 'express'
    appliedPromo: null,
    selectedTip: 2.00,
    currentOrder: null,
    orderTrackingStep: 1, // 0: Received, 1: Preparing, 2: Ready, 3: Completed
    isLoadingDemo: false
  };

  // --- Helper Functions ---
  const formatMoney = (amount) => `$${Number(amount).toFixed(2)}`;

  const findProductById = (id) => MENU_DATA.items.find(item => item.id === id);

  const getSubtotal = () => state.cart.reduce((sum, item) => sum + item.totalPrice, 0);

  const getDeliveryFee = () => {
    if (state.orderType === 'pickup') return 0;
    if (state.appliedPromo && state.appliedPromo.freeDelivery) return 0;
    return 3.99;
  };

  const getDiscount = () => {
    if (!state.appliedPromo) return 0;
    if (state.appliedPromo.percent) {
      return getSubtotal() * (state.appliedPromo.percent / 100);
    }
    return 0;
  };

  const getTax = () => {
    const taxable = Math.max(0, getSubtotal() - getDiscount());
    return taxable * 0.08875; // 8.875% Minnesota state & local sales tax
  };

  const getTotal = () => {
    return Math.max(0, getSubtotal() - getDiscount()) + getDeliveryFee() + getTax() + (state.selectedTip || 0);
  };

  const getTotalItemCount = () => state.cart.reduce((sum, item) => sum + item.quantity, 0);

  // --- Toast Notification System ---
  function showToast(message, icon = 'check_circle') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'flex items-center gap-3 px-5 py-3.5 bg-gray-900 text-white rounded-2xl shadow-xl border border-gray-700 animate-toast z-50 text-sm font-medium';
    toast.innerHTML = `
      <span class="material-symbols-outlined text-green-400 text-xl">${icon}</span>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 3200);
  }

  // --- UI Renderers ---

  // 1. Order Status Bar
  function renderOrderStatus() {
    const statusContainer = document.getElementById('order-status-bar');
    if (!statusContainer) return;

    if (!state.isStoreOpen) {
      statusContainer.innerHTML = `
        <div class="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-sm font-medium">
          <div class="flex items-center gap-2.5 text-amber-800">
            <span class="material-symbols-outlined text-amber-600 text-lg">warning</span>
            <span><strong>Store Closed</strong> — Currently not accepting new online orders. Reopening tomorrow at 10:00 AM.</span>
          </div>
          <button onclick="window.app.toggleStoreStatus()" class="text-xs bg-amber-200 hover:bg-amber-300 text-amber-900 px-3 py-1 rounded-full font-bold transition-colors">
            Demo: Reopen Store
          </button>
        </div>
      `;
      statusContainer.className = 'bg-amber-100 border-b border-amber-200 transition-colors';
      return;
    }

    statusContainer.className = 'bg-[#F5F0E8] border-b border-[#E8E2D9] transition-colors';
    
    if (state.orderType === 'pickup') {
      statusContainer.innerHTML = `
        <div class="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-sm">
          <div class="flex items-center flex-wrap gap-2 text-[#6B6B6B]">
            <span class="inline-flex items-center gap-1 text-[#2D5A3D] font-semibold bg-[#EBF3EE] px-2.5 py-0.5 rounded-full text-xs">
              <span class="material-symbols-outlined text-sm">shopping_bag</span> Pickup
            </span>
            <span>from <strong class="text-[#1A1A1A]">${state.selectedStore.name}</strong></span>
            <span class="text-xs text-gray-500 font-mono">(${state.selectedStore.shortAddress})</span>
            <span class="hidden sm:inline text-gray-400">•</span>
            <span class="flex items-center gap-1 text-xs sm:text-sm">
              <span class="material-symbols-outlined text-sm text-[#2D5A3D]">schedule</span> Today at <strong>10:15 AM</strong> (Ready in ${state.selectedStore.pickupTime})
            </span>
          </div>
          <div class="flex items-center gap-3">
            <button onclick="window.app.openLocationModal()" class="text-xs sm:text-sm font-semibold text-[#2D5A3D] hover:text-[#1F3F2B] hover:underline flex items-center gap-1">
              Change store or switch to Delivery <span class="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      `;
    } else {
      statusContainer.innerHTML = `
        <div class="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-sm">
          <div class="flex items-center flex-wrap gap-2 text-[#6B6B6B]">
            <span class="inline-flex items-center gap-1 text-[#D4A574] font-semibold bg-[#F9F3EA] px-2.5 py-0.5 rounded-full text-xs">
              <span class="material-symbols-outlined text-sm">moped</span> Delivery
            </span>
            <span>to <strong class="text-[#1A1A1A]">${state.deliveryAddress.street}${state.deliveryAddress.apt ? ', ' + state.deliveryAddress.apt : ''}</strong></span>
            <span class="hidden sm:inline text-gray-400">•</span>
            <span class="flex items-center gap-1 text-xs sm:text-sm">
              <span class="material-symbols-outlined text-sm text-[#2D5A3D]">timer</span> Est. ${state.deliveryAddress.estTime}
            </span>
          </div>
          <div class="flex items-center gap-3">
            <button onclick="window.app.openLocationModal()" class="text-xs sm:text-sm font-semibold text-[#2D5A3D] hover:text-[#1F3F2B] hover:underline flex items-center gap-1">
              Change address <span class="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      `;
    }
  }

  // 2. Category Navigation Bar
  function renderCategories() {
    const container = document.getElementById('category-nav-container');
    if (!container) return;

    container.innerHTML = MENU_DATA.categories.map(cat => {
      const isActive = state.activeCategory === cat.id;
      return `
        <button 
          onclick="window.app.selectCategory('${cat.id}')"
          class="category-pill shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap flex items-center gap-2 ${
            isActive ? 'active' : 'bg-[#F5F0E8] text-[#1A1A1A]'
          }"
        >
          <span class="material-symbols-outlined text-base ${isActive ? 'text-white' : 'text-[#2D5A3D]'}">${cat.icon}</span>
          ${cat.name}
        </button>
      `;
    }).join('');
  }

  // 3. Menu Grid
  function renderMenu() {
    const container = document.getElementById('menu-sections-container');
    if (!container) return;

    if (state.isLoadingDemo) {
      renderLoadingSkeletons(container);
      return;
    }

    let filteredItems = MENU_DATA.items;

    // Search filter
    if (state.searchQuery.trim()) {
      const q = state.searchQuery.toLowerCase();
      filteredItems = filteredItems.filter(item => 
        item.name.toLowerCase().includes(q) || 
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );

      if (filteredItems.length === 0) {
        container.innerHTML = `
          <div class="text-center py-20 px-4">
            <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-[#EBF3EE] flex items-center justify-center text-[#2D5A3D]">
              <span class="material-symbols-outlined text-4xl">search_off</span>
            </div>
            <h3 class="text-2xl font-bold font-heading text-[#1A1A1A] mb-2">No drinks found</h3>
            <p class="text-[#6B6B6B] max-w-md mx-auto mb-6">We couldn't find any drinks or desserts matching "<span class="font-semibold">${state.searchQuery}</span>". Try searching for taro, matcha, boba, or fruit tea.</p>
            <button onclick="window.app.clearSearch()" class="px-6 py-2.5 bg-[#2D5A3D] text-white font-medium rounded-full hover:bg-[#1F3F2B] transition-colors">
              Clear Search & Browse All
            </button>
          </div>
        `;
        return;
      }

      container.innerHTML = `
        <div class="mb-8">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold font-heading text-[#1A1A1A]">Search Results for "${state.searchQuery}"</h2>
            <span class="text-sm font-medium text-[#6B6B6B]">${filteredItems.length} items found</span>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${filteredItems.map(item => renderProductCard(item)).join('')}
          </div>
        </div>
      `;
      return;
    }

    // Category filter
    if (state.activeCategory === 'all') {
      const sections = [
        { id: 'most-popular', title: '🔥 Most Popular', subtitle: 'Our community’s favorite handcrafted boba drinks', items: MENU_DATA.items.filter(i => i.popular) },
        { id: 'milk-tea', title: '🧋 Classic & Signature Milk Tea', subtitle: 'Freshly steeped loose leaf tea blended with rich organic milk', items: MENU_DATA.items.filter(i => i.category === 'milk-tea') },
        { id: 'fruit-tea', title: '🍋 Real Fruit Teas', subtitle: 'Crisp green tea shaken with real crushed fruit purée and crystal ice', items: MENU_DATA.items.filter(i => i.category === 'fruit-tea') },
        { id: 'fresh-tea', title: '🍵 Fresh Brewed Loose Leaf Tea', subtitle: 'Single-origin Taiwanese loose leaf teas brewed fresh to order', items: MENU_DATA.items.filter(i => i.category === 'fresh-tea') },
        { id: 'energy', title: '⚡ Energy & Wellness Boosters', subtitle: 'Natural tea caffeine, antioxidants, and electrolytes for clean energy', items: MENU_DATA.items.filter(i => i.category === 'energy') },
        { id: 'no-caffeine', title: '🌿 Caffeine-Free Treats', subtitle: 'Delicious dessert shakes and fresh milk blends with zero caffeine', items: MENU_DATA.items.filter(i => i.category === 'no-caffeine') },
        { id: 'desserts', title: '🍩 Mochi & Artisan Desserts', subtitle: 'Daily freshly baked mochi donuts, daifuku, and egg drop toast', items: MENU_DATA.items.filter(i => i.category === 'desserts') },
        { id: 'snacks', title: '🥟 Savory Asian Street Snacks', subtitle: 'Hot & crispy Taiwanese street food to pair with your boba', items: MENU_DATA.items.filter(i => i.category === 'snacks') }
      ];

      container.innerHTML = sections.map(sec => `
        <section id="${sec.id}" class="mb-14 scroll-mt-36">
          <div class="flex flex-col sm:flex-row sm:items-end justify-between mb-6 pb-2 border-b border-[#E8E2D9]">
            <div>
              <h2 class="text-2xl font-bold font-heading text-[#1A1A1A]">${sec.title}</h2>
              <p class="text-sm text-[#6B6B6B] mt-0.5">${sec.subtitle}</p>
            </div>
            <span class="text-xs font-semibold text-[#2D5A3D] bg-[#EBF3EE] px-3 py-1 rounded-full mt-2 sm:mt-0 w-fit">${sec.items.length} items</span>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${sec.items.map(item => renderProductCard(item)).join('')}
          </div>
        </section>
      `).join('');
    } else {
      const currentCat = MENU_DATA.categories.find(c => c.id === state.activeCategory);
      const catItems = MENU_DATA.items.filter(i => i.category === state.activeCategory);

      container.innerHTML = `
        <div class="mb-14">
          <div class="flex items-center justify-between mb-6 pb-2 border-b border-[#E8E2D9]">
            <h2 class="text-2xl font-bold font-heading text-[#1A1A1A]">${currentCat ? currentCat.name : 'Menu'}</h2>
            <span class="text-xs font-semibold text-[#2D5A3D] bg-[#EBF3EE] px-3 py-1 rounded-full">${catItems.length} items</span>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${catItems.map(item => renderProductCard(item)).join('')}
          </div>
        </div>
      `;
    }
  }

  function renderProductCard(item) {
    const isStoreClosed = !state.isStoreOpen;
    const isItemAvailable = item.available && !isStoreClosed;

    return `
      <div 
        onclick="window.app.openProductModal('${item.id}')"
        class="product-card bg-white rounded-2xl border border-[#E8E2D9] overflow-hidden transition-card flex flex-col cursor-pointer group relative"
      >
        <div class="relative h-52 bg-[#F5F0E8] img-zoom-container">
          <img 
            src="${item.image}" 
            alt="${item.name}" 
            loading="lazy"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onerror="this.src='https://images.unsplash.com/photo-1558857563-b37cf0c84131?auto=format&fit=crop&w=800&q=80'"
          />
          
          <!-- Badges -->
          <div class="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            ${item.popular ? `<span class="bg-[#D4A574] text-white text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">Popular</span>` : ''}
            ${item.badge && !item.popular ? `<span class="bg-[#2D5A3D] text-white text-[11px] font-medium px-2.5 py-0.5 rounded-full shadow-sm">${item.badge}</span>` : ''}
          </div>

          <!-- Calories Indicator -->
          <div class="absolute bottom-2.5 right-3 bg-black/60 backdrop-blur-md text-white text-[11px] font-medium px-2 py-0.5 rounded-md">
            ${item.calories}
          </div>

          <!-- Unavailable Overlay -->
          ${!isItemAvailable ? `
            <div class="absolute inset-0 bg-white/75 backdrop-blur-[2px] flex items-center justify-center z-20">
              <span class="bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow">
                ${isStoreClosed ? 'Store Closed' : 'Sold Out'}
              </span>
            </div>
          ` : ''}
        </div>

        <div class="p-5 flex flex-col flex-grow justify-between">
          <div>
            <div class="flex justify-between items-start gap-2 mb-1.5">
              <h3 class="font-heading font-bold text-lg text-[#1A1A1A] group-hover:text-[#2D5A3D] transition-colors leading-snug">
                ${item.name}
              </h3>
              <span class="font-heading font-bold text-lg text-[#2D5A3D] shrink-0">
                ${formatMoney(item.price)}
              </span>
            </div>
            <p class="text-sm text-[#6B6B6B] line-clamp-2 leading-relaxed mb-4">
              ${item.description}
            </p>
          </div>

          <div class="flex items-center justify-between pt-2 border-t border-[#F5F0E8] mt-auto">
            <span class="text-xs text-[#9E9E9E] flex items-center gap-1 font-medium">
              <span class="material-symbols-outlined text-sm text-[#D4A574]">tune</span>
              ${item.customizable ? 'Customizable' : 'Ready to serve'}
            </span>
            
            <button 
              onclick="event.stopPropagation(); ${isItemAvailable ? `window.app.quickAddToCart('${item.id}')` : ''}"
              ${!isItemAvailable ? 'disabled' : ''}
              class="px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 flex items-center gap-1 ${
                isItemAvailable
                  ? 'bg-[#EBF3EE] text-[#2D5A3D] hover:bg-[#2D5A3D] hover:text-white group-hover:bg-[#2D5A3D] group-hover:text-white'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }"
            >
              <span class="material-symbols-outlined text-sm font-bold">add</span>
              ${isItemAvailable ? 'Quick Add' : 'Unavailable'}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  function renderLoadingSkeletons(container) {
    container.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${Array(6).fill(0).map(() => `
          <div class="bg-white rounded-2xl border border-[#E8E2D9] overflow-hidden p-0 flex flex-col">
            <div class="h-52 skeleton"></div>
            <div class="p-5 flex flex-col gap-3">
              <div class="h-6 w-3/4 skeleton"></div>
              <div class="h-4 w-full skeleton"></div>
              <div class="h-4 w-1/2 skeleton"></div>
              <div class="flex justify-between items-center pt-3 mt-2 border-t border-gray-100">
                <div class="h-5 w-16 skeleton"></div>
                <div class="h-8 w-24 skeleton rounded-full"></div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // 4. Product Customization Modal
  function openProductModal(productId) {
    const product = findProductById(productId);
    if (!product) return;

    state.selectedProduct = product;
    state.tempModalCustomization = {
      quantity: 1,
      size: 'regular',
      sizeModifier: 0,
      sugar: '50',
      ice: 'regular',
      toppings: product.customizable ? ['boba'] : []
    };

    const modalContainer = document.getElementById('product-modal-container');
    if (!modalContainer) return;

    renderProductModalContent();
    modalContainer.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function renderProductModalContent() {
    const modalContent = document.getElementById('product-modal-content');
    if (!modalContent || !state.selectedProduct) return;

    const p = state.selectedProduct;
    const isStoreClosed = !state.isStoreOpen;
    const isAvailable = p.available && !isStoreClosed;

    // Calculate current modal total
    let unitPrice = p.price + state.tempModalCustomization.sizeModifier;
    state.tempModalCustomization.toppings.forEach(topId => {
      const topObj = MENU_DATA.customizationPresets.toppings.find(t => t.id === topId);
      if (topObj) unitPrice += topObj.price;
    });
    const calculatedTotal = unitPrice * state.tempModalCustomization.quantity;

    modalContent.innerHTML = `
      <!-- Modal Header Image -->
      <div class="relative h-64 sm:h-72 bg-[#F5F0E8] overflow-hidden rounded-t-3xl">
        <img 
          src="${p.image}" 
          alt="${p.name}" 
          class="w-full h-full object-cover"
          onerror="this.src='https://images.unsplash.com/photo-1558857563-b37cf0c84131?auto=format&fit=crop&w=800&q=80'"
        />
        <button 
          onclick="window.app.closeProductModal()"
          class="absolute top-4 right-4 w-9 h-9 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-colors z-20"
          aria-label="Close modal"
        >
          <span class="material-symbols-outlined text-lg">close</span>
        </button>

        ${p.badge ? `
          <span class="absolute bottom-4 left-4 bg-[#2D5A3D] text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
            ${p.badge}
          </span>
        ` : ''}
      </div>

      <!-- Modal Body Content -->
      <div class="p-6 sm:p-8 space-y-6 max-h-[60vh] overflow-y-auto">
        <!-- Title & Price -->
        <div>
          <div class="flex justify-between items-start gap-4">
            <h2 class="text-2xl sm:text-3xl font-bold font-heading text-[#1A1A1A] leading-tight">
              ${p.name}
            </h2>
            <span class="text-2xl font-bold font-heading text-[#2D5A3D] shrink-0">
              ${formatMoney(p.price)}
            </span>
          </div>
          <p class="text-[#6B6B6B] mt-2 text-sm sm:text-base leading-relaxed">
            ${p.description}
          </p>

          <div class="flex items-center gap-4 mt-3 text-xs text-[#9E9E9E]">
            <span class="flex items-center gap-1 font-medium">
              <span class="material-symbols-outlined text-sm text-[#D4A574]">local_fire_department</span> ${p.calories}
            </span>
            <span>•</span>
            <span class="font-medium">${p.caffeine} Caffeine</span>
          </div>
        </div>

        ${!isAvailable ? `
          <div class="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
            <span class="material-symbols-outlined text-amber-600 text-xl shrink-0 mt-0.5">warning</span>
            <div>
              <p class="font-bold text-amber-900 text-sm">${isStoreClosed ? '⚠️ Our store is not currently accepting orders' : 'Item Currently Sold Out'}</p>
              <p class="text-amber-700 text-xs mt-0.5">We apologize for the inconvenience. We’ll be back online at 10:00 AM.</p>
            </div>
          </div>
        ` : ''}

        <!-- Quantity Selector -->
        <div class="flex items-center justify-between pt-4 border-t border-[#E8E2D9]">
          <label class="font-bold font-heading text-[#1A1A1A] text-base">Quantity</label>
          <div class="flex items-center gap-3 bg-[#F5F0E8] p-1 rounded-full">
            <button 
              onclick="window.app.updateModalQuantity(-1)"
              class="w-8 h-8 rounded-full bg-white text-[#1A1A1A] shadow-sm hover:bg-gray-100 flex items-center justify-center font-bold transition-colors"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span class="font-bold text-base w-6 text-center text-[#1A1A1A]">
              ${state.tempModalCustomization.quantity}
            </span>
            <button 
              onclick="window.app.updateModalQuantity(1)"
              class="w-8 h-8 rounded-full bg-[#2D5A3D] text-white shadow-sm hover:bg-[#1F3F2B] flex items-center justify-center font-bold transition-colors"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>

        <!-- Customizations -->
        ${p.customizable ? `
          <!-- Size Options -->
          <div class="space-y-3 pt-4 border-t border-[#E8E2D9]">
            <div class="flex justify-between items-center">
              <label class="font-bold font-heading text-[#1A1A1A] text-sm sm:text-base">Size</label>
              <span class="text-xs text-[#6B6B6B]">Select one</span>
            </div>
            <div class="grid grid-cols-2 gap-3">
              ${MENU_DATA.customizationPresets.sizes.map(s => `
                <label class="option-pill">
                  <input 
                    type="radio" 
                    name="modal-size" 
                    value="${s.value}" 
                    ${state.tempModalCustomization.size === s.value ? 'checked' : ''}
                    onchange="window.app.setModalSize('${s.value}', ${s.priceModifier})"
                  />
                  <span>
                    ${s.label} ${s.priceModifier > 0 ? `(+${formatMoney(s.priceModifier)})` : ''}
                  </span>
                </label>
              `).join('')}
            </div>
          </div>

          <!-- Sugar Level -->
          <div class="space-y-3 pt-4 border-t border-[#E8E2D9]">
            <div class="flex justify-between items-center">
              <label class="font-bold font-heading text-[#1A1A1A] text-sm sm:text-base">Sugar Level</label>
              <span class="text-xs text-[#2D5A3D] font-medium">Recommended: 50%</span>
            </div>
            <div class="grid grid-cols-5 gap-2">
              ${MENU_DATA.customizationPresets.sugarLevels.map(s => `
                <label class="option-pill">
                  <input 
                    type="radio" 
                    name="modal-sugar" 
                    value="${s.value}" 
                    ${state.tempModalCustomization.sugar === s.value ? 'checked' : ''}
                    onchange="window.app.setModalSugar('${s.value}')"
                  />
                  <span class="!px-1 !text-xs font-semibold">
                    ${s.label}
                  </span>
                </label>
              `).join('')}
            </div>
          </div>

          <!-- Ice Level -->
          <div class="space-y-3 pt-4 border-t border-[#E8E2D9]">
            <div class="flex justify-between items-center">
              <label class="font-bold font-heading text-[#1A1A1A] text-sm sm:text-base">Ice Level</label>
              <span class="text-xs text-[#2D5A3D] font-medium">Standard: Regular Ice</span>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              ${MENU_DATA.customizationPresets.iceLevels.map(i => `
                <label class="option-pill">
                  <input 
                    type="radio" 
                    name="modal-ice" 
                    value="${i.value}" 
                    ${state.tempModalCustomization.ice === i.value ? 'checked' : ''}
                    onchange="window.app.setModalIce('${i.value}')"
                  />
                  <span class="!text-xs font-semibold">
                    ${i.label}
                  </span>
                </label>
              `).join('')}
            </div>
          </div>

          <!-- Add-on Toppings -->
          <div class="space-y-3 pt-4 border-t border-[#E8E2D9]">
            <div class="flex justify-between items-center">
              <label class="font-bold font-heading text-[#1A1A1A] text-sm sm:text-base">Toppings & Add-ons</label>
              <span class="text-xs text-[#6B6B6B]">Choose multiple</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              ${MENU_DATA.customizationPresets.toppings.map(t => {
                const isChecked = state.tempModalCustomization.toppings.includes(t.id);
                return `
                  <label class="topping-pill">
                    <input 
                      type="checkbox" 
                      value="${t.id}" 
                      ${isChecked ? 'checked' : ''}
                      onchange="window.app.toggleModalTopping('${t.id}')"
                    />
                    <div class="topping-card">
                      <div class="flex items-center gap-2.5">
                        <div class="topping-check">
                          ${isChecked ? '<span class="material-symbols-outlined text-xs font-bold">check</span>' : ''}
                        </div>
                        <span class="text-xs font-medium text-[#1A1A1A]">${t.name}</span>
                      </div>
                      <span class="text-xs font-bold text-[#2D5A3D]">+${formatMoney(t.price)}</span>
                    </div>
                  </label>
                `;
              }).join('')}
            </div>
          </div>
        ` : ''}
      </div>

      <!-- Sticky Modal Footer CTA -->
      <div class="p-6 bg-white border-t border-[#E8E2D9] rounded-b-3xl">
        <button 
          onclick="${isAvailable ? 'window.app.confirmAddToCart()' : ''}"
          ${!isAvailable ? 'disabled' : ''}
          class="w-full py-4 rounded-full font-heading font-bold text-base flex items-center justify-center gap-2 transition-all duration-200 shadow-lg btn-press ${
            isAvailable
              ? 'bg-[#2D5A3D] text-white hover:bg-[#1F3F2B] shadow-green-900/20'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
          }"
        >
          <span class="material-symbols-outlined">${isAvailable ? 'shopping_bag' : 'block'}</span>
          <span>${isAvailable ? `Add to Cart — ${formatMoney(calculatedTotal)}` : `Not Available — ${formatMoney(p.price)}`}</span>
        </button>
      </div>
    `;
  }

  function closeProductModal() {
    const modalContainer = document.getElementById('product-modal-container');
    if (modalContainer) {
      modalContainer.classList.add('hidden');
      document.body.style.overflow = '';
    }
  }

  function updateModalQuantity(delta) {
    const newQ = state.tempModalCustomization.quantity + delta;
    if (newQ >= 1 && newQ <= 20) {
      state.tempModalCustomization.quantity = newQ;
      renderProductModalContent();
    }
  }

  function setModalSize(sizeVal, priceMod) {
    state.tempModalCustomization.size = sizeVal;
    state.tempModalCustomization.sizeModifier = priceMod;
    renderProductModalContent();
  }

  function setModalSugar(sugarVal) {
    state.tempModalCustomization.sugar = sugarVal;
    renderProductModalContent();
  }

  function setModalIce(iceVal) {
    state.tempModalCustomization.ice = iceVal;
    renderProductModalContent();
  }

  function toggleModalTopping(toppingId) {
    const idx = state.tempModalCustomization.toppings.indexOf(toppingId);
    if (idx > -1) {
      state.tempModalCustomization.toppings.splice(idx, 1);
    } else {
      state.tempModalCustomization.toppings.push(toppingId);
    }
    renderProductModalContent();
  }

  function confirmAddToCart() {
    if (!state.selectedProduct) return;
    const p = state.selectedProduct;

    const sizeObj = MENU_DATA.customizationPresets.sizes.find(s => s.value === state.tempModalCustomization.size);
    const sugarObj = MENU_DATA.customizationPresets.sugarLevels.find(s => s.value === state.tempModalCustomization.sugar);
    const iceObj = MENU_DATA.customizationPresets.iceLevels.find(i => i.value === state.tempModalCustomization.ice);
    
    const selectedToppingsList = state.tempModalCustomization.toppings.map(tId => 
      MENU_DATA.customizationPresets.toppings.find(t => t.id === tId)
    ).filter(Boolean);

    let unitPrice = p.price + (sizeObj ? sizeObj.priceModifier : 0);
    selectedToppingsList.forEach(top => { unitPrice += top.price; });

    const cartItem = {
      uid: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      id: p.id,
      name: p.name,
      image: p.image,
      size: sizeObj ? sizeObj.label : 'Regular',
      sizePrice: sizeObj ? sizeObj.priceModifier : 0,
      sugar: sugarObj ? sugarObj.label : '50%',
      ice: iceObj ? iceObj.label : 'Regular Ice',
      toppings: selectedToppingsList,
      basePrice: p.price,
      unitPrice: unitPrice,
      quantity: state.tempModalCustomization.quantity,
      totalPrice: unitPrice * state.tempModalCustomization.quantity
    };

    state.cart.push(cartItem);
    closeProductModal();
    updateCartUI();
    showToast(`Added ${cartItem.quantity}× ${p.name} to cart ✓`);
  }

  function quickAddToCart(productId) {
    const p = findProductById(productId);
    if (!p || !p.available || !state.isStoreOpen) return;

    const defaultToppings = p.customizable ? [MENU_DATA.customizationPresets.toppings[0]] : [];
    let unitPrice = p.price;
    defaultToppings.forEach(t => { unitPrice += t.price; });

    const cartItem = {
      uid: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      id: p.id,
      name: p.name,
      image: p.image,
      size: 'Regular (16 oz)',
      sizePrice: 0,
      sugar: '50%',
      ice: 'Regular Ice',
      toppings: defaultToppings,
      basePrice: p.price,
      unitPrice: unitPrice,
      quantity: 1,
      totalPrice: unitPrice
    };

    state.cart.push(cartItem);
    updateCartUI();
    showToast(`Added ${p.name} to cart ✓`);
  }

  // 5. Cart Drawer & Sticky Mobile Bar
  function updateCartUI() {
    const count = getTotalItemCount();
    const subtotal = getSubtotal();

    // Badges in header
    const badges = document.querySelectorAll('.cart-badge');
    badges.forEach(b => {
      b.textContent = count;
      if (count > 0) {
        b.classList.remove('hidden');
      } else {
        b.classList.add('hidden');
      }
    });

    // Mobile sticky bottom bar
    const mobileBar = document.getElementById('mobile-cart-bar');
    if (mobileBar) {
      if (count > 0) {
        mobileBar.classList.remove('hidden');
        document.getElementById('mobile-cart-count').textContent = `${count} ${count === 1 ? 'item' : 'items'}`;
        document.getElementById('mobile-cart-total').textContent = formatMoney(subtotal);
      } else {
        mobileBar.classList.add('hidden');
      }
    }

    renderCartDrawerItems();
  }

  function renderCartDrawerItems() {
    const itemsList = document.getElementById('cart-drawer-items');
    const footerSummary = document.getElementById('cart-drawer-footer');
    if (!itemsList || !footerSummary) return;

    if (state.cart.length === 0) {
      itemsList.innerHTML = `
        <div class="text-center py-16 px-4">
          <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-[#FAF7F2] flex items-center justify-center text-[#2D5A3D]">
            <span class="material-symbols-outlined text-4xl">shopping_cart</span>
          </div>
          <h3 class="text-xl font-bold font-heading text-[#1A1A1A] mb-1">Your cart is empty</h3>
          <p class="text-sm text-[#6B6B6B] max-w-xs mx-auto mb-6">Add something delicious from our loose leaf teas or fresh mochi to get started.</p>
          <button onclick="window.app.closeCartDrawer()" class="px-6 py-2.5 bg-[#2D5A3D] text-white text-sm font-semibold rounded-full hover:bg-[#1F3F2B] transition-colors">
            Browse Menu
          </button>
        </div>
      `;
      footerSummary.innerHTML = '';
      return;
    }

    itemsList.innerHTML = state.cart.map(item => `
      <div class="p-4 bg-white rounded-2xl border border-[#E8E2D9] flex gap-3.5 relative group">
        <img 
          src="${item.image}" 
          alt="${item.name}" 
          class="w-16 h-16 rounded-xl object-cover bg-[#F5F0E8] shrink-0"
          onerror="this.src='https://images.unsplash.com/photo-1558857563-b37cf0c84131?auto=format&fit=crop&w=800&q=80'"
        />
        
        <div class="flex-grow min-w-0">
          <div class="flex justify-between items-start gap-2">
            <h4 class="font-bold text-sm text-[#1A1A1A] truncate">${item.name}</h4>
            <span class="font-bold text-sm text-[#2D5A3D] shrink-0">${formatMoney(item.totalPrice)}</span>
          </div>

          <p class="text-xs text-[#6B6B6B] mt-0.5 leading-tight">
            ${item.size} • ${item.sugar} Sugar • ${item.ice}
            ${item.toppings.length > 0 ? `<br><span class="text-[#2D5A3D] font-medium">+ ${item.toppings.map(t => t.name).join(', ')}</span>` : ''}
          </p>

          <div class="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
            <div class="flex items-center gap-2 bg-[#F5F0E8] px-2 py-0.5 rounded-full">
              <button 
                onclick="window.app.updateCartItemQuantity('${item.uid}', -1)"
                class="w-5 h-5 rounded-full text-xs font-bold hover:bg-white flex items-center justify-center"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span class="text-xs font-bold w-4 text-center">${item.quantity}</span>
              <button 
                onclick="window.app.updateCartItemQuantity('${item.uid}', 1)"
                class="w-5 h-5 rounded-full text-xs font-bold text-[#2D5A3D] hover:bg-white flex items-center justify-center"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            <button 
              onclick="window.app.removeCartItem('${item.uid}')"
              class="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors"
            >
              <span class="material-symbols-outlined text-sm">delete</span> Remove
            </button>
          </div>
        </div>
      </div>
    `).join('');

    const subtotal = getSubtotal();
    const discount = getDiscount();
    const deliveryFee = getDeliveryFee();
    const tax = getTax();
    const total = getTotal();

    footerSummary.innerHTML = `
      <div class="space-y-2.5 text-sm pb-4 border-b border-[#E8E2D9]">
        <div class="flex justify-between text-[#6B6B6B]">
          <span>Subtotal</span>
          <span class="text-[#1A1A1A] font-medium">${formatMoney(subtotal)}</span>
        </div>
        ${discount > 0 ? `
          <div class="flex justify-between text-green-700 font-medium">
            <span>Promo Discount (${state.appliedPromo.code})</span>
            <span>-${formatMoney(discount)}</span>
          </div>
        ` : ''}
        <div class="flex justify-between text-[#6B6B6B]">
          <span>Delivery Fee (${state.orderType === 'pickup' ? 'Pickup' : 'Standard Delivery'})</span>
          <span class="text-[#1A1A1A] font-medium">${deliveryFee === 0 ? 'FREE' : formatMoney(deliveryFee)}</span>
        </div>
        <div class="flex justify-between text-[#6B6B6B]">
          <span>Estimated Taxes (8.875%)</span>
          <span class="text-[#1A1A1A] font-medium">${formatMoney(tax)}</span>
        </div>
        <div class="flex justify-between text-base font-bold text-[#1A1A1A] pt-2 border-t border-gray-100">
          <span>Estimated Total</span>
          <span class="text-xl text-[#2D5A3D] font-heading font-extrabold">${formatMoney(total)}</span>
        </div>
      </div>

      <button 
        onclick="window.app.openCheckoutModal()"
        class="w-full mt-4 py-4 bg-[#2D5A3D] hover:bg-[#1F3F2B] text-white font-heading font-bold text-base rounded-full flex items-center justify-center gap-2 shadow-lg shadow-green-900/20 btn-press transition-all"
      >
        <span>Proceed to Checkout</span>
        <span class="material-symbols-outlined text-lg">arrow_forward</span>
      </button>
    `;
  }

  function openCartDrawer() {
    const drawer = document.getElementById('cart-drawer');
    const backdrop = document.getElementById('cart-drawer-backdrop');
    if (!drawer || !backdrop) return;

    renderCartDrawerItems();
    drawer.classList.remove('translate-x-full');
    backdrop.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeCartDrawer() {
    const drawer = document.getElementById('cart-drawer');
    const backdrop = document.getElementById('cart-drawer-backdrop');
    if (!drawer || !backdrop) return;

    drawer.classList.add('translate-x-full');
    backdrop.classList.add('hidden');
    document.body.style.overflow = '';
  }

  function updateCartItemQuantity(uid, delta) {
    const item = state.cart.find(i => i.uid === uid);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      removeCartItem(uid);
      return;
    }
    item.totalPrice = item.unitPrice * item.quantity;
    updateCartUI();
  }

  function removeCartItem(uid) {
    state.cart = state.cart.filter(i => i.uid !== uid);
    updateCartUI();
    showToast('Item removed from order', 'delete');
  }

  // 6. Location & Ordering Method Modal (Pickup / Delivery)
  function openLocationModal(tab = null) {
    if (tab) state.orderType = tab;
    const modal = document.getElementById('location-modal');
    if (!modal) return;

    renderLocationModalContent();
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeLocationModal() {
    const modal = document.getElementById('location-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  }

  function renderLocationModalContent() {
    const container = document.getElementById('location-modal-content');
    if (!container) return;

    const isPickup = state.orderType === 'pickup';

    container.innerHTML = `
      <div class="p-6 sm:p-8">
        <!-- Header -->
        <div class="flex items-center justify-between pb-4 border-b border-[#E8E2D9]">
          <div>
            <h2 class="text-2xl font-bold font-heading text-[#1A1A1A]">How would you like to order?</h2>
            <p class="text-xs text-gray-500 mt-0.5">Select a store for pickup or enter your delivery address</p>
          </div>
          <button onclick="window.app.closeLocationModal()" class="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors">
            <span class="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <!-- Big Two Tabs -->
        <div class="grid grid-cols-2 gap-3 mt-6 p-1.5 bg-[#F5F0E8] rounded-2xl">
          <button 
            onclick="window.app.switchOrderType('pickup')"
            class="py-3 px-4 rounded-xl font-heading font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all ${
              isPickup ? 'bg-white text-[#2D5A3D] shadow-sm' : 'text-[#6B6B6B] hover:text-[#1A1A1A]'
            }"
          >
            <span class="material-symbols-outlined text-lg">storefront</span>
            Pickup
          </button>
          
          <button 
            onclick="window.app.switchOrderType('delivery')"
            class="py-3 px-4 rounded-xl font-heading font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all ${
              !isPickup ? 'bg-white text-[#2D5A3D] shadow-sm' : 'text-[#6B6B6B] hover:text-[#1A1A1A]'
            }"
          >
            <span class="material-symbols-outlined text-lg">moped</span>
            Delivery
          </button>
        </div>

        <!-- Dynamic Body: Pickup Flow OR Delivery Flow -->
        <div class="mt-6">
          ${isPickup ? renderPickupModalBody() : renderDeliveryModalBody()}
        </div>
      </div>
    `;
  }

  function renderPickupModalBody() {
    return `
      <div class="space-y-5">
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-[#6B6B6B] mb-2">Select Location</label>
          <div class="relative">
            <span class="material-symbols-outlined absolute left-3.5 top-3.5 text-gray-400">search</span>
            <input 
              type="text" 
              placeholder="Search by city, ZIP code, or street address..." 
              class="w-full pl-10 pr-28 py-3 rounded-xl border border-[#E8E2D9] bg-white text-sm focus:border-[#2D5A3D] focus:ring-1 focus:ring-[#2D5A3D]"
              oninput="window.app.filterStores(this.value)"
            />
            <button 
              onclick="window.app.useCurrentLocationForPickup()"
              class="absolute right-2 top-2 bg-[#EBF3EE] hover:bg-[#2D5A3D] text-[#2D5A3D] hover:text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <span class="material-symbols-outlined text-sm">my_location</span> Near Me
            </button>
          </div>
        </div>

        <!-- Store Cards List -->
        <div class="space-y-3 max-h-72 overflow-y-auto pr-1" id="store-list-container">
          ${MENU_DATA.stores.map(store => `
            <div 
              onclick="window.app.selectStore('${store.id}')"
              class="p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                state.selectedStore.id === store.id 
                  ? 'border-[#2D5A3D] bg-[#EBF3EE]/60 shadow-sm' 
                  : 'border-[#E8E2D9] hover:border-[#2D5A3D]/50 bg-white'
              }"
            >
              <div>
                <div class="flex items-center gap-2">
                  <h4 class="font-bold text-base text-[#1A1A1A]">${store.name}</h4>
                  ${store.isFlagship ? `<span class="bg-[#2D5A3D] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Flagship</span>` : ''}
                  ${store.isNearest && !store.isFlagship ? `<span class="bg-[#D4A574] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Nearest</span>` : ''}
                </div>
                <p class="text-xs text-[#6B6B6B] mt-0.5 font-medium">${store.address}</p>
                <div class="flex items-center gap-3 mt-2 text-xs font-medium">
                  <span class="text-green-700 font-semibold flex items-center gap-1">
                    <span class="w-2 h-2 rounded-full bg-green-600 pulse-dot"></span> ${store.openStatus}
                  </span>
                  <span class="text-gray-400">•</span>
                  <span class="text-[#6B6B6B]">${store.distance}</span>
                  <span class="text-gray-400">•</span>
                  <span class="text-[#2D5A3D] font-semibold">Pickup: ${store.pickupTime}</span>
                </div>
              </div>

              <button class="shrink-0 px-5 py-2 rounded-full text-xs font-bold transition-colors ${
                state.selectedStore.id === store.id
                  ? 'bg-[#2D5A3D] text-white'
                  : 'bg-[#F5F0E8] text-[#1A1A1A] hover:bg-[#2D5A3D] hover:text-white'
              }">
                ${state.selectedStore.id === store.id ? 'Selected ✓' : 'Select'}
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function renderDeliveryModalBody() {
    return `
      <div class="space-y-4">
        <!-- Address Input with Autocomplete -->
        <div>
          <div class="flex justify-between items-center mb-1.5">
            <label class="block text-xs font-bold uppercase tracking-wider text-[#6B6B6B]">Enter Delivery Address</label>
            <button 
              onclick="window.app.useCurrentLocationForDelivery()"
              class="text-xs text-[#2D5A3D] hover:underline font-semibold flex items-center gap-1"
            >
              <span class="material-symbols-outlined text-sm">my_location</span> Use Current Location
            </button>
          </div>
          
          <div class="relative">
            <span class="material-symbols-outlined absolute left-3.5 top-3.5 text-gray-400">location_on</span>
            <input 
              id="delivery-address-input"
              type="text" 
              value="${state.deliveryAddress.street || ''}"
              placeholder="Enter your delivery address" 
              class="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E8E2D9] bg-white text-sm focus:border-[#2D5A3D] focus:ring-1 focus:ring-[#2D5A3D]"
              oninput="window.app.handleAddressAutocomplete(this.value)"
            />
            
            <!-- Autocomplete suggestions popup -->
            <div id="address-suggestions-box" class="hidden absolute top-full left-0 right-0 mt-1 bg-white border border-[#E8E2D9] rounded-xl shadow-xl z-30 overflow-hidden">
            </div>
          </div>
        </div>

        <!-- Optional Apartment / Suite Field -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-[#6B6B6B] mb-1.5">
            Apartment, suite, floor, etc. <span class="text-gray-400 font-normal lowercase">(optional)</span>
          </label>
          <input 
            id="delivery-apt-input"
            type="text" 
            value="${state.deliveryAddress.apt || ''}"
            placeholder="Apt, suite, floor, unit, etc. (optional)" 
            class="w-full px-4 py-2.5 rounded-xl border border-[#E8E2D9] bg-white text-sm focus:border-[#2D5A3D] focus:ring-1 focus:ring-[#2D5A3D]"
          />
        </div>

        <!-- Optional Delivery Instructions -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-[#6B6B6B] mb-1.5">
            Delivery instructions <span class="text-gray-400 font-normal lowercase">(optional)</span>
          </label>
          <textarea 
            id="delivery-instructions-input"
            rows="2"
            placeholder="Gate code, building instructions, leave at door, etc. (optional)" 
            class="w-full px-4 py-2 rounded-xl border border-[#E8E2D9] bg-white text-sm focus:border-[#2D5A3D] focus:ring-1 focus:ring-[#2D5A3D]"
          >${state.deliveryAddress.instructions || ''}</textarea>
        </div>

        <!-- Validation Feedback Card -->
        <div id="delivery-validation-card" class="p-4 rounded-2xl bg-[#EBF3EE] border border-[#2D5A3D]/20 flex items-start gap-3">
          <span class="material-symbols-outlined text-[#2D5A3D] text-xl shrink-0 mt-0.5">verified</span>
          <div>
            <h5 class="font-bold text-sm text-[#1A1A1A]">Delivering to ${state.deliveryAddress.street}</h5>
            <p class="text-xs text-[#6B6B6B] mt-0.5">Estimated delivery: <strong class="text-[#2D5A3D]">25–35 min</strong> • Distance: ~2.1 mi</p>
          </div>
        </div>

        <!-- Continue Button -->
        <button 
          onclick="window.app.confirmDeliveryAddress()"
          class="w-full py-3.5 bg-[#2D5A3D] hover:bg-[#1F3F2B] text-white font-heading font-bold text-sm sm:text-base rounded-full shadow-md btn-press transition-all flex items-center justify-center gap-2"
        >
          <span>Continue</span>
          <span class="material-symbols-outlined text-lg">arrow_forward</span>
        </button>
      </div>
    `;
  }

  function handleAddressAutocomplete(query) {
    const box = document.getElementById('address-suggestions-box');
    if (!box) return;

    if (!query || query.trim().length < 2) {
      box.classList.add('hidden');
      return;
    }

    const matches = ADDRESS_DATABASE.filter(a => a.full.toLowerCase().includes(query.toLowerCase()));
    
    if (matches.length === 0) {
      box.innerHTML = `
        <div class="p-3 text-xs text-gray-500">
          No standard match. You can still use this address, or pick a suggested one:
        </div>
        <button onclick="window.app.selectAutocompleteAddress('${ADDRESS_DATABASE[0].full}', true)" class="w-full text-left p-3 hover:bg-[#F5F0E8] text-xs font-medium border-t border-gray-100 flex items-center gap-2">
          <span class="material-symbols-outlined text-sm text-[#2D5A3D]">location_on</span>
          ${ADDRESS_DATABASE[0].full}
        </button>
      `;
      box.classList.remove('hidden');
      return;
    }

    box.innerHTML = matches.map(m => `
      <button 
        onclick="window.app.selectAutocompleteAddress('${m.full}', ${m.valid})"
        class="w-full text-left p-3 hover:bg-[#F5F0E8] text-xs font-medium border-b border-gray-100 last:border-0 flex items-center justify-between gap-2"
      >
        <span class="flex items-center gap-2 truncate">
          <span class="material-symbols-outlined text-sm text-[#2D5A3D]">location_on</span>
          ${m.full}
        </span>
        ${m.valid 
          ? `<span class="text-[10px] font-bold text-[#2D5A3D] bg-[#EBF3EE] px-2 py-0.5 rounded-full shrink-0">${m.estTime}</span>`
          : `<span class="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full shrink-0">Out of zone</span>`
        }
      </button>
    `).join('');
    box.classList.remove('hidden');
  }

  function selectAutocompleteAddress(fullAddress, isValid) {
    const input = document.getElementById('delivery-address-input');
    const box = document.getElementById('address-suggestions-box');
    const card = document.getElementById('delivery-validation-card');
    
    if (input) input.value = fullAddress;
    if (box) box.classList.add('hidden');

    if (!isValid) {
      if (card) {
        card.className = 'p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3';
        card.innerHTML = `
          <span class="material-symbols-outlined text-red-600 text-xl shrink-0 mt-0.5">error</span>
          <div>
            <h5 class="font-bold text-sm text-red-900">Sorry, delivery isn't available at this address.</h5>
            <p class="text-xs text-red-700 mt-0.5">Please check and try again, or switch to store Pickup.</p>
          </div>
        `;
      }
    } else {
      if (card) {
        card.className = 'p-4 rounded-2xl bg-[#EBF3EE] border border-[#2D5A3D]/20 flex items-start gap-3';
        card.innerHTML = `
          <span class="material-symbols-outlined text-[#2D5A3D] text-xl shrink-0 mt-0.5">verified</span>
          <div>
            <h5 class="font-bold text-sm text-[#1A1A1A]">Delivering to ${fullAddress}</h5>
            <p class="text-xs text-[#6B6B6B] mt-0.5">Estimated delivery: <strong class="text-[#2D5A3D]">25–35 min</strong></p>
          </div>
        `;
      }
    }
  }

  function switchOrderType(type) {
    state.orderType = type;
    renderLocationModalContent();
    renderOrderStatus();
    updateCartUI();
  }

  function selectStore(storeId) {
    const store = MENU_DATA.stores.find(s => s.id === storeId);
    if (!store) return;
    state.selectedStore = store;
    state.orderType = 'pickup';
    closeLocationModal();
    renderOrderStatus();
    updateCartUI();
    showToast(`Store selected: ${store.name}`);
  }

  function confirmDeliveryAddress() {
    const input = document.getElementById('delivery-address-input');
    const aptInput = document.getElementById('delivery-apt-input');
    const instInput = document.getElementById('delivery-instructions-input');

    const streetVal = input ? input.value.trim() : '';
    if (!streetVal) {
      alert('Please enter a delivery address to continue.');
      return;
    }

    state.deliveryAddress.street = streetVal;
    state.deliveryAddress.apt = aptInput ? aptInput.value.trim() : '';
    state.deliveryAddress.instructions = instInput ? instInput.value.trim() : '';
    state.orderType = 'delivery';

    closeLocationModal();
    renderOrderStatus();
    updateCartUI();
    showToast(`Delivering to ${streetVal}`);
  }

  function useCurrentLocationForPickup() {
    showToast('Location detected: Golden Valley, MN', 'my_location');
    selectStore('golden-valley');
  }

  function useCurrentLocationForDelivery() {
    const input = document.getElementById('delivery-address-input');
    if (input) {
      input.value = '7724 Olson Mem Hwy, Golden Valley, MN 55427';
      selectAutocompleteAddress('7724 Olson Mem Hwy, Golden Valley, MN 55427', true);
    }
  }

  // 7. Checkout Flow
  function openCheckoutModal() {
    if (state.cart.length === 0) {
      alert('Your cart is empty! Please add some delicious drinks first.');
      return;
    }
    closeCartDrawer();
    const modal = document.getElementById('checkout-modal');
    if (!modal) return;

    renderCheckoutModalContent();
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeCheckoutModal() {
    const modal = document.getElementById('checkout-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  }

  function renderCheckoutModalContent() {
    const container = document.getElementById('checkout-modal-content');
    if (!container) return;

    const subtotal = getSubtotal();
    const discount = getDiscount();
    const deliveryFee = getDeliveryFee();
    const tax = getTax();
    const total = getTotal();

    container.innerHTML = `
      <div class="p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        <!-- Header -->
        <div class="flex items-center justify-between pb-4 border-b border-[#E8E2D9] mb-6">
          <div class="flex items-center gap-3">
            <button onclick="window.app.closeCheckoutModal()" class="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors">
              <span class="material-symbols-outlined text-lg">arrow_back</span>
            </button>
            <div>
              <h2 class="text-2xl font-bold font-heading text-[#1A1A1A]">Checkout</h2>
              <p class="text-xs text-gray-500">Order from ${state.selectedStore.name}</p>
            </div>
          </div>
          <span class="text-xs font-semibold text-[#2D5A3D] bg-[#EBF3EE] px-3 py-1 rounded-full flex items-center gap-1">
            <span class="material-symbols-outlined text-sm">lock</span> 256-Bit SSL Secure
          </span>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <!-- Left 7 Cols: Order Info, Contact, Payment -->
          <div class="lg:col-span-7 space-y-6">
            <!-- 1. Fulfillment Card -->
            <div class="p-5 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D9]">
              <div class="flex justify-between items-start mb-2">
                <span class="text-xs font-bold uppercase tracking-wider text-[#6B6B6B] flex items-center gap-1">
                  <span class="material-symbols-outlined text-sm text-[#2D5A3D]">${state.orderType === 'pickup' ? 'storefront' : 'moped'}</span>
                  ${state.orderType === 'pickup' ? 'Pickup Location' : 'Delivery Address'}
                </span>
                <button onclick="window.app.openLocationModal()" class="text-xs font-bold text-[#2D5A3D] hover:underline">Change</button>
              </div>

              ${state.orderType === 'pickup' ? `
                <h4 class="font-bold text-base text-[#1A1A1A]">${state.selectedStore.name}</h4>
                <p class="text-xs text-[#6B6B6B] mt-0.5">${state.selectedStore.address}</p>
                <div class="mt-2 text-xs text-[#2D5A3D] font-semibold flex items-center gap-1">
                  <span class="material-symbols-outlined text-sm">schedule</span> Ready for pickup in ${state.selectedStore.pickupTime}
                </div>
              ` : `
                <h4 class="font-bold text-base text-[#1A1A1A]">${state.deliveryAddress.street} ${state.deliveryAddress.apt || ''}</h4>
                <p class="text-xs text-[#6B6B6B] mt-0.5">${state.deliveryAddress.city}</p>
                ${state.deliveryAddress.instructions ? `<p class="text-xs text-[#D4A574] font-medium mt-1">Note: "${state.deliveryAddress.instructions}"</p>` : ''}
                <div class="mt-2 text-xs text-[#2D5A3D] font-semibold flex items-center gap-1">
                  <span class="material-symbols-outlined text-sm">timer</span> Estimated delivery: ${state.deliveryAddress.estTime}
                </div>
              `}
            </div>

            <!-- 2. Contact Information -->
            <div class="space-y-3">
              <h3 class="font-heading font-bold text-base text-[#1A1A1A]">Contact Details</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input 
                  type="text" 
                  id="checkout-name" 
                  value="Alex Rivers" 
                  placeholder="Full Name" 
                  class="px-4 py-2.5 rounded-xl border border-[#E8E2D9] text-sm focus:border-[#2D5A3D]"
                />
                <input 
                  type="tel" 
                  id="checkout-phone" 
                  value="(612) 555-0199" 
                  placeholder="Mobile Phone (for SMS updates)" 
                  class="px-4 py-2.5 rounded-xl border border-[#E8E2D9] text-sm focus:border-[#2D5A3D]"
                />
              </div>
              <input 
                type="email" 
                id="checkout-email" 
                value="alex.rivers@example.com" 
                placeholder="Email Address (for receipt)" 
                class="w-full px-4 py-2.5 rounded-xl border border-[#E8E2D9] text-sm focus:border-[#2D5A3D]"
              />
            </div>

            <!-- 3. Tip Selection -->
            <div class="space-y-2">
              <label class="block font-heading font-bold text-sm text-[#1A1A1A]">Add a Tip for the Tea Baristas</label>
              <div class="grid grid-cols-4 gap-2">
                ${[1.00, 2.00, 3.00, 0].map(tipAmt => `
                  <button 
                    onclick="window.app.setTipAmount(${tipAmt})"
                    class="py-2 rounded-xl text-xs font-bold border transition-all ${
                      state.selectedTip === tipAmt 
                        ? 'bg-[#2D5A3D] text-white border-[#2D5A3D]' 
                        : 'bg-white text-[#1A1A1A] border-[#E8E2D9] hover:bg-[#F5F0E8]'
                    }"
                  >
                    ${tipAmt === 0 ? 'No Tip' : formatMoney(tipAmt)}
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- 4. Payment Method -->
            <div class="space-y-4 pt-2">
              <h3 class="font-heading font-bold text-base text-[#1A1A1A]">Payment</h3>
              
              <!-- Payment Tabs -->
              <div class="grid grid-cols-3 gap-2">
                <button 
                  onclick="window.app.setPaymentMethod('card')"
                  class="py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    state.activeCheckoutPayment === 'card'
                      ? 'border-[#2D5A3D] bg-[#EBF3EE] text-[#2D5A3D]'
                      : 'border-[#E8E2D9] bg-white text-[#6B6B6B]'
                  }"
                >
                  <span class="material-symbols-outlined text-base">credit_card</span>
                  Card
                </button>

                <button 
                  onclick="window.app.setPaymentMethod('cash')"
                  class="py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    state.activeCheckoutPayment === 'cash'
                      ? 'border-[#2D5A3D] bg-[#EBF3EE] text-[#2D5A3D]'
                      : 'border-[#E8E2D9] bg-white text-[#6B6B6B]'
                  }"
                >
                  <span class="material-symbols-outlined text-base">payments</span>
                  Cash (${state.orderType === 'pickup' ? 'on Pickup' : 'on Delivery'})
                </button>

                <button 
                  onclick="window.app.setPaymentMethod('express')"
                  class="py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    state.activeCheckoutPayment === 'express'
                      ? 'border-[#2D5A3D] bg-[#EBF3EE] text-[#2D5A3D]'
                      : 'border-[#E8E2D9] bg-white text-[#6B6B6B]'
                  }"
                >
                  <span class="material-symbols-outlined text-base">phone_iphone</span>
                  Apple/Google
                </button>
              </div>

              <!-- Card Payment Fields -->
              ${state.activeCheckoutPayment === 'card' ? `
                <div class="p-4 rounded-2xl bg-white border border-[#E8E2D9] space-y-3">
                  <div>
                    <label class="block text-xs font-semibold text-[#6B6B6B] mb-1">Card Number</label>
                    <div class="relative">
                      <span class="material-symbols-outlined absolute left-3 top-2.5 text-gray-400">credit_card</span>
                      <input 
                        type="text" 
                        value="4242 •••• •••• 4242" 
                        class="w-full pl-10 pr-4 py-2 rounded-xl border border-[#E8E2D9] text-sm font-mono focus:border-[#2D5A3D]"
                      />
                    </div>
                  </div>
                  
                  <div class="grid grid-cols-3 gap-2">
                    <div>
                      <label class="block text-xs font-semibold text-[#6B6B6B] mb-1">Expiration</label>
                      <input type="text" value="08/28" placeholder="MM/YY" class="w-full px-3 py-2 rounded-xl border border-[#E8E2D9] text-sm font-mono focus:border-[#2D5A3D] text-center" />
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-[#6B6B6B] mb-1">CVC</label>
                      <input type="text" value="888" placeholder="CVC" class="w-full px-3 py-2 rounded-xl border border-[#E8E2D9] text-sm font-mono focus:border-[#2D5A3D] text-center" />
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-[#6B6B6B] mb-1">Billing ZIP</label>
                      <input type="text" value="55427" placeholder="ZIP" class="w-full px-3 py-2 rounded-xl border border-[#E8E2D9] text-sm font-mono focus:border-[#2D5A3D] text-center" />
                    </div>
                  </div>
                </div>
              ` : ''}

              <!-- Cash Payment Notice -->
              ${state.activeCheckoutPayment === 'cash' ? `
                <div class="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
                  <strong>💵 Cash Payment Selected:</strong> Please pay the exact amount of <strong class="text-amber-950">${formatMoney(total)}</strong> upon ${state.orderType === 'pickup' ? 'picking up at 7724 Olson Mem Hwy' : 'delivery to your address'}.
                </div>
              ` : ''}

              <!-- Apple / Google Pay Express -->
              ${state.activeCheckoutPayment === 'express' ? `
                <div class="space-y-2">
                  <button class="w-full py-3 bg-black text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors">
                    <span>Pay with</span> Pay
                  </button>
                  <button class="w-full py-3 bg-white border border-gray-300 text-gray-800 font-bold text-sm rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
                    <span>Pay with</span> GPay
                  </button>
                </div>
              ` : ''}
            </div>
          </div>

          <!-- Right 5 Cols: Order Summary & Place Order -->
          <div class="lg:col-span-5 space-y-5">
            <div class="p-5 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D9]">
              <h3 class="font-heading font-bold text-base text-[#1A1A1A] mb-4">Order Summary (${getTotalItemCount()})</h3>
              
              <div class="space-y-3 max-h-48 overflow-y-auto pr-1">
                ${state.cart.map(item => `
                  <div class="flex justify-between items-start text-xs pb-2 border-b border-gray-200 last:border-0">
                    <div>
                      <span class="font-bold text-[#1A1A1A]">${item.quantity}× ${item.name}</span>
                      <p class="text-[#6B6B6B] text-[11px]">${item.sugar} Sugar, ${item.ice}</p>
                    </div>
                    <span class="font-bold text-[#2D5A3D]">${formatMoney(item.totalPrice)}</span>
                  </div>
                `).join('')}
              </div>

              <!-- Promo Code Input -->
              <div class="pt-4 mt-3 border-t border-[#E8E2D9]">
                <div class="flex gap-2">
                  <input 
                    type="text" 
                    id="promo-input" 
                    placeholder="Promo code (e.g. BOBA10)" 
                    class="w-full px-3 py-2 text-xs rounded-xl border border-[#E8E2D9] uppercase focus:border-[#2D5A3D]"
                  />
                  <button 
                    onclick="window.app.applyPromoCode()"
                    class="px-4 py-2 bg-[#2D5A3D] text-white text-xs font-bold rounded-xl hover:bg-[#1F3F2B] shrink-0"
                  >
                    Apply
                  </button>
                </div>
                ${state.appliedPromo ? `
                  <p class="text-xs text-green-700 font-semibold mt-1.5 flex items-center gap-1">
                    <span class="material-symbols-outlined text-xs">check_circle</span> Code ${state.appliedPromo.code} applied!
                  </p>
                ` : ''}
              </div>

              <!-- Cost Breakdown -->
              <div class="space-y-2 pt-4 mt-4 border-t border-[#E8E2D9] text-xs">
                <div class="flex justify-between text-[#6B6B6B]">
                  <span>Subtotal</span>
                  <span>${formatMoney(subtotal)}</span>
                </div>
                ${discount > 0 ? `
                  <div class="flex justify-between text-green-700 font-semibold">
                    <span>Discount</span>
                    <span>-${formatMoney(discount)}</span>
                  </div>
                ` : ''}
                <div class="flex justify-between text-[#6B6B6B]">
                  <span>Delivery</span>
                  <span>${deliveryFee === 0 ? 'FREE' : formatMoney(deliveryFee)}</span>
                </div>
                <div class="flex justify-between text-[#6B6B6B]">
                  <span>Estimated Tax (8.875%)</span>
                  <span>${formatMoney(tax)}</span>
                </div>
                <div class="flex justify-between text-[#6B6B6B]">
                  <span>Tip</span>
                  <span>${formatMoney(state.selectedTip || 0)}</span>
                </div>
                <div class="flex justify-between text-base font-bold text-[#1A1A1A] pt-2 border-t border-gray-300">
                  <span>Total</span>
                  <span class="text-xl text-[#2D5A3D] font-heading font-extrabold">${formatMoney(total)}</span>
                </div>
              </div>
            </div>

            <!-- Place Order CTA -->
            <button 
              id="place-order-btn"
              onclick="window.app.placeOrder()"
              class="w-full py-4 bg-[#2D5A3D] hover:bg-[#1F3F2B] text-white font-heading font-bold text-base rounded-full shadow-lg shadow-green-900/20 btn-press transition-all flex items-center justify-center gap-2"
            >
              <span>Place Order — ${formatMoney(total)}</span>
              <span class="material-symbols-outlined text-lg">check_circle</span>
            </button>
            <p class="text-[11px] text-center text-[#9E9E9E]">
              By placing your order, you agree to MiTea’s Terms of Service.
            </p>
          </div>
        </div>
      </div>
    `;
  }

  function setPaymentMethod(method) {
    state.activeCheckoutPayment = method;
    renderCheckoutModalContent();
  }

  function setTipAmount(amount) {
    state.selectedTip = amount;
    renderCheckoutModalContent();
  }

  function applyPromoCode() {
    const input = document.getElementById('promo-input');
    if (!input) return;
    const code = input.value.trim().toUpperCase();
    
    if (code === 'BOBA10') {
      state.appliedPromo = { code: 'BOBA10', percent: 10 };
      showToast('10% Promo Code Applied! 🎉');
    } else if (code === 'FREEDROP') {
      state.appliedPromo = { code: 'FREEDROP', freeDelivery: true };
      showToast('Free Delivery Applied! 🚀');
    } else {
      alert('Invalid promo code. Try "BOBA10" for 10% off or "FREEDROP" for free delivery.');
      return;
    }
    renderCheckoutModalContent();
  }

  function placeOrder() {
    const btn = document.getElementById('place-order-btn');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<span class="inline-block animate-spin mr-2">⏳</span> Placing your order...`;
    }

    setTimeout(() => {
      state.currentOrder = {
        orderId: '10' + Math.floor(100 + Math.random() * 900),
        items: [...state.cart],
        subtotal: getSubtotal(),
        discount: getDiscount(),
        deliveryFee: getDeliveryFee(),
        tax: getTax(),
        tip: state.selectedTip,
        total: getTotal(),
        orderType: state.orderType,
        store: { ...state.selectedStore },
        deliveryAddress: { ...state.deliveryAddress },
        paymentMethod: state.activeCheckoutPayment,
        placedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        estCompletion: state.orderType === 'pickup' ? state.selectedStore.pickupTime : state.deliveryAddress.estTime
      };

      state.cart = [];
      state.orderTrackingStep = 1;
      updateCartUI();
      closeCheckoutModal();
      openConfirmationModal();
    }, 1200);
  }

  // 8. Order Confirmation & Tracker Modal
  function openConfirmationModal() {
    const modal = document.getElementById('confirmation-modal');
    if (!modal || !state.currentOrder) return;

    renderConfirmationModalContent();
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeConfirmationModal() {
    const modal = document.getElementById('confirmation-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  }

  function renderConfirmationModalContent() {
    const container = document.getElementById('confirmation-modal-content');
    if (!container || !state.currentOrder) return;

    const ord = state.currentOrder;
    const steps = [
      { name: 'Order Received', icon: 'receipt_long' },
      { name: 'Preparing', icon: 'blender' },
      { name: ord.orderType === 'pickup' ? 'Ready for Pickup' : 'Out for Delivery', icon: ord.orderType === 'pickup' ? 'store' : 'moped' },
      { name: 'Completed', icon: 'verified' }
    ];

    container.innerHTML = `
      <div class="p-6 sm:p-8 text-center max-h-[90vh] overflow-y-auto">
        <!-- Celebration Header -->
        <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-[#EBF3EE] text-[#2D5A3D] flex items-center justify-center shadow-inner">
          <span class="material-symbols-outlined text-3xl">celebration</span>
        </div>
        <span class="text-xs font-bold tracking-widest uppercase text-[#D4A574]">🎉 Order confirmed!</span>
        <h2 class="text-2xl sm:text-3xl font-bold font-heading text-[#1A1A1A] mt-1">Order #${ord.orderId}</h2>
        <p class="text-sm text-[#6B6B6B] mt-0.5">Your order is being prepared with care.</p>

        <!-- 4-Stage Progress Tracker -->
        <div class="mt-8 mb-8 p-5 bg-[#FAF7F2] rounded-2xl border border-[#E8E2D9]">
          <div class="flex items-center justify-between relative max-w-md mx-auto">
            <div class="absolute left-6 right-6 top-4 h-1 bg-gray-200 -z-0">
              <div 
                class="h-full bg-[#2D5A3D] transition-all duration-500" 
                style="width: ${(state.orderTrackingStep / (steps.length - 1)) * 100}%"
              ></div>
            </div>

            ${steps.map((step, idx) => {
              const isDone = idx < state.orderTrackingStep;
              const isCurrent = idx === state.orderTrackingStep;
              return `
                <div class="flex flex-col items-center relative z-10">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isDone 
                      ? 'bg-[#2D5A3D] text-white shadow-sm'
                      : isCurrent 
                        ? 'bg-[#2D5A3D] text-white ring-4 ring-green-100 pulse-dot'
                        : 'bg-white text-gray-400 border border-gray-300'
                  }">
                    ${isDone ? '✓' : `<span class="material-symbols-outlined text-sm">${step.icon}</span>`}
                  </div>
                  <span class="text-[11px] font-semibold mt-2 ${isCurrent ? 'text-[#2D5A3D]' : 'text-gray-500'}">
                    ${step.name}
                  </span>
                </div>
              `;
            }).join('')}
          </div>

          <div class="mt-4 pt-3 border-t border-gray-200 flex items-center justify-center gap-2 text-xs text-[#6B6B6B]">
            <span>${ord.orderType === 'pickup' ? 'Estimated pickup:' : 'Estimated delivery:'} <strong class="text-[#2D5A3D]">${ord.estCompletion}</strong></span>
            <span>•</span>
            <button onclick="window.app.advanceOrderTracking()" class="text-xs text-[#2D5A3D] font-bold hover:underline">
              [Simulate Tracker →]
            </button>
          </div>
        </div>

        <!-- Receipt & Location Summary -->
        <div class="text-left p-5 rounded-2xl bg-white border border-[#E8E2D9] space-y-4 max-w-lg mx-auto">
          <div class="flex justify-between items-start pb-3 border-b border-gray-100 text-xs">
            <div>
              <span class="font-bold text-gray-500 uppercase tracking-wider">${ord.orderType === 'pickup' ? 'Pickup from' : 'Delivering to'}</span>
              <p class="font-bold text-[#1A1A1A] text-sm mt-0.5">
                ${ord.orderType === 'pickup' ? ord.store.name : ord.deliveryAddress.street}
              </p>
              <p class="text-gray-500">
                ${ord.orderType === 'pickup' ? ord.store.address : ord.deliveryAddress.city}
              </p>
            </div>
            <span class="text-right">
              <span class="font-bold text-gray-500 uppercase tracking-wider">Placed At</span>
              <p class="font-bold text-[#1A1A1A] mt-0.5">${ord.placedAt}</p>
            </span>
          </div>

          <!-- Items Ordered List -->
          <div class="space-y-2 text-xs">
            <span class="font-bold text-gray-500 uppercase tracking-wider">Your Items</span>
            ${ord.items.map(item => `
              <div class="flex justify-between py-1 border-b border-gray-50">
                <div>
                  <span class="font-semibold text-[#1A1A1A]">${item.quantity}× ${item.name}</span>
                  <p class="text-gray-400 text-[10px]">${item.size} • ${item.sugar} Sugar • ${item.ice}</p>
                </div>
                <span class="font-bold text-[#2D5A3D]">${formatMoney(item.totalPrice)}</span>
              </div>
            `).join('')}
          </div>

          <!-- Paid Summary -->
          <div class="pt-2 flex justify-between items-center text-sm font-bold text-[#1A1A1A] border-t border-gray-200">
            <span>Total</span>
            <span class="text-lg text-[#2D5A3D] font-heading">${formatMoney(ord.total)}</span>
          </div>
        </div>

        <!-- Action Button -->
        <div class="mt-8 max-w-xs mx-auto">
          <button 
            onclick="window.app.closeConfirmationModal()"
            class="w-full py-3.5 bg-[#2D5A3D] hover:bg-[#1F3F2B] text-white font-heading font-bold text-sm rounded-full shadow-md transition-colors"
          >
            Browse Menu / Start New Order
          </button>
        </div>
      </div>
    `;
  }

  function advanceOrderTracking() {
    if (state.orderTrackingStep < 3) {
      state.orderTrackingStep++;
      renderConfirmationModalContent();
      showToast(`Order status updated: Step ${state.orderTrackingStep + 1} of 4`);
    } else {
      state.orderTrackingStep = 0;
      renderConfirmationModalContent();
      showToast('Tracker reset to Step 1');
    }
  }

  // 9. Search Engine
  function handleSearchInput(query) {
    state.searchQuery = query;
    renderMenu();
  }

  function clearSearch() {
    state.searchQuery = '';
    const input = document.getElementById('search-bar-input');
    if (input) input.value = '';
    renderMenu();
  }

  function toggleSearchBar() {
    const bar = document.getElementById('header-search-bar');
    if (!bar) return;
    bar.classList.toggle('hidden');
    if (!bar.classList.contains('hidden')) {
      const input = document.getElementById('search-bar-input');
      if (input) input.focus();
    }
  }

  function selectCategory(catId) {
    state.activeCategory = catId;
    state.searchQuery = '';
    const input = document.getElementById('search-bar-input');
    if (input) input.value = '';

    renderCategories();
    renderMenu();

    if (catId !== 'all') {
      const section = document.getElementById(catId);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  function toggleStoreStatus() {
    state.isStoreOpen = !state.isStoreOpen;
    renderOrderStatus();
    renderMenu();
    if (state.selectedProduct) {
      renderProductModalContent();
    }
    showToast(state.isStoreOpen ? 'Store is now OPEN and accepting orders' : 'Store is now CLOSED (Unavailable state)');
  }

  function toggleSkeletonLoaderDemo() {
    state.isLoadingDemo = !state.isLoadingDemo;
    renderMenu();
    showToast(state.isLoadingDemo ? 'Showing Loading Skeletons' : 'Loading Complete');
  }

  // --- Keyboard Shortcuts ---
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeProductModal();
      closeLocationModal();
      closeCartDrawer();
      closeCheckoutModal();
      closeConfirmationModal();
    }
  });

  // --- Initialization ---
  function init() {
    renderOrderStatus();
    renderCategories();
    renderMenu();
    updateCartUI();

    window.app = {
      openProductModal,
      closeProductModal,
      updateModalQuantity,
      setModalSize,
      setModalSugar,
      setModalIce,
      toggleModalTopping,
      confirmAddToCart,
      quickAddToCart,
      openCartDrawer,
      closeCartDrawer,
      updateCartItemQuantity,
      removeCartItem,
      openLocationModal,
      closeLocationModal,
      switchOrderType,
      selectStore,
      confirmDeliveryAddress,
      handleAddressAutocomplete,
      selectAutocompleteAddress,
      useCurrentLocationForPickup,
      useCurrentLocationForDelivery,
      openCheckoutModal,
      closeCheckoutModal,
      setPaymentMethod,
      setTipAmount,
      applyPromoCode,
      placeOrder,
      openConfirmationModal,
      closeConfirmationModal,
      advanceOrderTracking,
      handleSearchInput,
      clearSearch,
      toggleSearchBar,
      selectCategory,
      toggleStoreStatus,
      toggleSkeletonLoaderDemo
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
