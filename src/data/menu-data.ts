export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
}

export interface SugarLevel {
  label: string;
  value: string;
  desc: string;
  isDefault?: boolean;
}

export interface IceLevel {
  label: string;
  value: string;
  desc: string;
  isDefault?: boolean;
}

export interface SizeOption {
  label: string;
  value: string;
  priceModifier: number;
  isDefault?: boolean;
}

export interface ToppingOption {
  id: string;
  name: string;
  price: number;
  calories: number;
  defaultSelected?: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  popular: boolean;
  badge: string;
  caffeine: string;
  calories: string;
  available: boolean;
  customizable: boolean;
}

export interface StoreLocation {
  id: string;
  name: string;
  address: string;
  shortAddress: string;
  city: string;
  state: string;
  zip: string;
  distance: string;
  phone: string;
  isOpen: boolean;
  openStatus: string;
  closingTime: string;
  pickupTime: string;
  deliveryTime: string;
  isNearest: boolean;
  isFlagship: boolean;
  acceptingOrders: boolean;
}

export interface DeliveryAddress {
  full: string;
  street: string;
  city: string;
  valid: boolean;
  estTime?: string;
  distance: string;
  reason?: string;
}

export interface CartItem {
  uid: string;
  id: string;
  name: string;
  image: string;
  size: string;
  sizePrice: number;
  sugar: string;
  ice: string;
  toppings: { id: string; name: string; price: number }[];
  basePrice: number;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface CustomizationPresets {
  sugarLevels: SugarLevel[];
  iceLevels: IceLevel[];
  sizes: SizeOption[];
  toppings: ToppingOption[];
}

export const MENU_DATA = {
  currency: "USD",
  currencySymbol: "$",

  categories: [
    { id: "all", name: "Most Popular", icon: "flame", count: 6 },
    { id: "milk-tea", name: "Milk Tea", icon: "coffee", count: 6 },
    { id: "fruit-tea", name: "Fruit Tea", icon: "citrus", count: 5 },
    { id: "fresh-tea", name: "Fresh Tea", icon: "leaf", count: 4 },
    { id: "energy", name: "Energy Series", icon: "zap", count: 3 },
    { id: "no-caffeine", name: "No Caffeine", icon: "droplets", count: 4 },
    { id: "desserts", name: "Desserts & Mochi", icon: "cake", count: 4 },
    { id: "snacks", name: "Asian Snacks", icon: "utensils", count: 4 },
    { id: "catering", name: "Catering & Events", icon: "sparkles", count: 4 }
  ] as Category[],

  customizationPresets: {
    sugarLevels: [
      { label: "0%", value: "0", desc: "Unsweetened" },
      { label: "25%", value: "25", desc: "Light Sweet" },
      { label: "50%", value: "50", desc: "Half Sweet (Recommended)", isDefault: true },
      { label: "75%", value: "75", desc: "Less Sweet" },
      { label: "100%", value: "100", desc: "Regular Sweet" }
    ],
    iceLevels: [
      { label: "No Ice", value: "none", desc: "Room temperature / Chilled" },
      { label: "Less Ice", value: "less", desc: "25% Ice" },
      { label: "Regular Ice", value: "regular", desc: "Standard Ice (Recommended)", isDefault: true },
      { label: "Extra Ice", value: "extra", desc: "Super Chilled" }
    ],
    sizes: [
      { label: "Regular (16 oz)", value: "regular", priceModifier: 0, isDefault: true },
      { label: "Large (24 oz)", value: "large", priceModifier: 1.00 }
    ],
    toppings: [
      { id: "boba", name: "Slow-Cooked Tapioca Pearls", price: 0.75, calories: 120, defaultSelected: true },
      { id: "coconut-jelly", name: "Coconut Nata Jelly", price: 0.75, calories: 60 },
      { id: "grass-jelly", name: "Silky Grass Jelly", price: 0.75, calories: 40 },
      { id: "handmade-mochi", name: "Handmade Milk Mochi", price: 1.00, calories: 95 },
      { id: "cheese-foam", name: "Salted Cheese Cream Foam", price: 1.25, calories: 140 },
      { id: "popping-boba", name: "Mango Popping Boba", price: 0.85, calories: 50 },
      { id: "aloe-vera", name: "Juicy Aloe Vera Cubes", price: 0.75, calories: 35 },
      { id: "egg-pudding", name: "Velvety Custard Egg Pudding", price: 0.75, calories: 85 }
    ]
  } as CustomizationPresets,

  stores: [
    {
      id: "golden-valley",
      name: "Mitea — Golden Valley",
      address: "7724 Olson Mem Hwy, Golden Valley, MN 55427, United States",
      shortAddress: "7724 Olson Mem Hwy",
      city: "Golden Valley",
      state: "MN",
      zip: "55427",
      distance: "Golden Valley, MN",
      phone: "(763) 555-0192",
      isOpen: true,
      openStatus: "Open now",
      closingTime: "10:00 PM",
      pickupTime: "10–15 min",
      deliveryTime: "",
      isNearest: true,
      isFlagship: true,
      acceptingOrders: true
    }
  ] as StoreLocation[],

  items: [
    // --- MILK TEA ---
    {
      id: "coconut-milk-tea",
      name: "Coconut Milk Tea",
      category: "milk-tea",
      price: 5.50,
      description: "Made with freshly brewed loose leaf Assam black tea. Nutty coconut milk meets smooth black tea for a creamy, velvety delight.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAc2HEvhSUsgIgOxBCTvAEnJA2RRgA6hZcV9kbah9TfeiEh158W19nmSpuzf2MyhXBcr_twLtL9iZnBYU4wJn38hX7LdJN5CHwozsOHyVGbFki0-1tdGqMk_K-cDj4RQj-PyzR0va4DjNbTv_7x2PBe74l8V9ZiVV5coNkFFJRucCnxp3zQJ1shrY5dEoGy8-GGAaabHaOer0oXz_3RryX6rMOqCglFcYzjkc0i1XJs8hLO46AAAoLaW6mY8BKlT__nZqazMaim3pn4",
      popular: true,
      badge: "Popular",
      caffeine: "Medium",
      calories: "280 kcal",
      available: true,
      customizable: true
    },
    {
      id: "brown-sugar-boba-milk",
      name: "Brown Sugar Boba Milk",
      category: "milk-tea",
      price: 6.75,
      description: "Slow-simmered Okinawa brown sugar boba layered with fresh organic whole milk and rich caramelized tiger syrup.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAis78aZVZ7V_-tnQfcpV4MvNewdbdFCWctgYGPfIfI-UHEjYqDhNWnJD0QFl5qoCwkQ-SYu0_FxRLU3C1_lREJ3dqWNgtlZ7KR0SbSrMCmAehp2JGpy8QES0fFdP1H7ZX2ZFNGc-ypOGzr0lpH1RxWciDPUdK1wOwQR07KzOp2w4WwXk9wgkX7zgz8l3729BGqltqCKdP6JbvdK3AvylPwoQr4DVjWrk-Fn7ngYKuafTNtIRANiv3KIoleu59jmUejqoJ-RT3etyUf",
      popular: true,
      badge: "Best Seller",
      caffeine: "Caffeine-Free",
      calories: "390 kcal",
      available: true,
      customizable: true
    },
    {
      id: "matcha-milk-tea",
      name: "Ceremonial Matcha Milk Tea",
      category: "milk-tea",
      price: 6.25,
      description: "First-harvest ceremonial Japanese Uji matcha hand-whisked to order, layered over rich whole milk with a hint of cane sweetness.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAiZ2Cl3ypSLhFm-X_FGupnsJe0g6gAwyaOwhXoQfvMJXFyTYXEVCfFp-kQYYNstKsMG_haet20hTWPoT0Vz9uqHD0aFKCkMCxtG7NTNmppU3i9DMgnHD33hUOUBUqs-ZDCYb_DywTVH8a3C79TOqERl7nIYqA4nLQYEDrUDbTprh7x3FMEhLdJVN4X6GSvZFVaysdQUxKAxlNmHPles4y4DS0wmpeQXg2nVDo0wUbEAeqcfiNQ70CjIztHzFdKeYXNjCA2_5Z0H6pd",
      popular: true,
      badge: "Signature",
      caffeine: "High",
      calories: "260 kcal",
      available: true,
      customizable: true
    },
    {
      id: "jasmine-milk-tea",
      name: "Jasmine Green Milk Tea",
      category: "milk-tea",
      price: 5.50,
      description: "Delicate loose leaf green tea scented with midnight-blooming jasmine flowers, blended with fresh creamy milk.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDlBUZa_5FGUJSHs5neKtA_7QXFf_hxC8A8Y-mo3b_6GBrBJBpVZzcAJGBfODtalYAjKGRDOqpbuEpE7NMIO_NaqmEpeIneWt5OaEJbDCuEmnsIV1IpT-81KUPqIqTXSoKw9qvcaO0EuaTNI7mtwy-Ox9ovGYj0hOO7SLzaL9narhWIE3QpKNAjjpNjB-RVVAThh1YRC9x3esH-yPAondbOQsG-fRQbNqKUTybMWEE1ydQWs552EPFpubx4VA8DRGm3c-aUAD-OLKPR",
      popular: true,
      badge: "Floral",
      caffeine: "Medium",
      calories: "240 kcal",
      available: true,
      customizable: true
    },
    {
      id: "taro-milk-tea",
      name: "Taro Paste Milk Tea",
      category: "milk-tea",
      price: 6.00,
      description: "Real slow-steamed Taiwanese taro root puréed into velvety richness, combined with loose leaf black tea.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuChd5WET2vLT2aLDDIJQsDMm77O0qMllmwZOKPeKHDC2xqw2HzZXph0WZhu8e3CQ85OHmVvNypKRwZPoI-XbK1F-8NpY0cy2lWy-MmlWqU4E99v2knbw5QnFzWuz5bptGqyeJXtWQ3TtKrtmLmV3fyYx8xFTD-s1RUm2GgW7tX3WxINE3KUaKLg3l9tFrXIoYivx1m9xF2Mzh6RUXt1d_hhfTDsUY5Kf59cQ6cmB7AKGvXEgyb-8Wfbh4ybH70j_TYJErR-1c5RmQSa",
      popular: true,
      badge: "Fan Favorite",
      caffeine: "Low",
      calories: "320 kcal",
      available: true,
      customizable: true
    },
    {
      id: "thai-milk-tea",
      name: "Classic Spiced Thai Milk Tea",
      category: "milk-tea",
      price: 5.75,
      description: "Slow-brewed spiced Ceylon tea leaves infused with star anise and cardamom, topped with sweetened condensed milk.",
      image: "/images/drinks/brown_sugar_boba.jpg",
      popular: false,
      badge: "Spiced",
      caffeine: "High",
      calories: "310 kcal",
      available: true,
      customizable: true
    },

    // --- FRUIT TEA ---
    {
      id: "mango-green-tea",
      name: "Mango Passion Green Tea",
      category: "fruit-tea",
      price: 5.75,
      description: "Crisp Jasmine green tea shaken with real mango purée and fragrant passion fruit seeds.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBSeMLpTrkd3MNUl5PMGMeDq_BRQ52_Z_w3CClKg0j4TqWcDwmjsOkgCpFPNcsSLb-_YVQr69bgqsmG_R4m9Jc4_CCneUEXtXfNbVFdS3gT9Q0RsmPhSrk19TPZZog2GU212fkyzpCCBmqLvzRgRVKMhXM92P-WneVKPObbnhSn3nFbix9ZxKBfjPhOXRFQyJyv5ctILQqSLgaM7T_VGciQgVVYUiTiWFlPffzYL0HFwSWxHXQFdKoadDF-lYJgTL0sL94ATKw7R0O8",
      popular: true,
      badge: "Refreshing",
      caffeine: "Medium",
      calories: "190 kcal",
      available: true,
      customizable: true
    },
    {
      id: "passion-fruit-tea",
      name: "Golden Passion Fruit Oolong",
      category: "fruit-tea",
      price: 5.50,
      description: "Tart and aromatic fresh passion fruit pulp infused into Four Seasons spring oolong tea with crushed ice.",
      image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80",
      popular: false,
      badge: "Vitamin C",
      caffeine: "Medium",
      calories: "170 kcal",
      available: true,
      customizable: true
    },
    {
      id: "strawberry-green-tea",
      name: "Strawberry Basil Green Tea",
      category: "fruit-tea",
      price: 5.75,
      description: "Hand-muddled ripe strawberries, sweet organic basil leaves, and cold-brewed green tea over crystal ice.",
      image: "https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=800&q=80",
      popular: false,
      badge: "Fresh Fruit",
      caffeine: "Medium",
      calories: "185 kcal",
      available: true,
      customizable: true
    },
    {
      id: "pure-honey-jasmine",
      name: "Pure Honey Jasmine Green Tea",
      category: "fruit-tea",
      price: 5.25,
      description: "Raw wildflower honey dissolved into fragrant jasmine green tea with crisp lemon wheels.",
      image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80",
      popular: false,
      badge: "Raw Honey",
      caffeine: "Medium",
      calories: "140 kcal",
      available: true,
      customizable: true
    },
    {
      id: "grapefruit-ruby-tea",
      name: "Ruby Red Grapefruit Green Tea",
      category: "fruit-tea",
      price: 5.95,
      description: "Freshly squeezed ruby grapefruit with juicy pulp floating in lightly sweet Jasmine green tea.",
      image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
      popular: false,
      badge: "Fresh Squeezed",
      caffeine: "Medium",
      calories: "160 kcal",
      available: true,
      customizable: true
    },

    // --- FRESH TEA ---
    {
      id: "alishan-oolong",
      name: "Alishan High Mountain Oolong",
      category: "fresh-tea",
      price: 4.75,
      description: "Single-origin mountain tea known for orchid notes, honey undertones, and a smooth, lingering finish.",
      image: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=800&q=80",
      popular: false,
      badge: "Single Origin",
      caffeine: "Medium",
      calories: "5 kcal",
      available: true,
      customizable: true
    },
    {
      id: "four-seasons-spring",
      name: "Four Seasons Spring Green Tea",
      category: "fresh-tea",
      price: 4.50,
      description: "Lightly oxidized oolong with bright floral aromas reminiscent of early spring blossoms. Clean and crisp.",
      image: "https://images.unsplash.com/photo-1563822249548-9a72b6353cd1?auto=format&fit=crop&w=800&q=80",
      popular: false,
      badge: "Aromatic",
      caffeine: "Medium",
      calories: "5 kcal",
      available: true,
      customizable: true
    },
    {
      id: "roasted-tie-guan-yin",
      name: "Roasted Charcoal Tie Guan Yin",
      category: "fresh-tea",
      price: 4.75,
      description: "Deeply charcoal-roasted Iron Goddess of Mercy oolong with warm toasty notes and rich amber liquor.",
      image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80",
      popular: false,
      badge: "Charcoal Roasted",
      caffeine: "High",
      calories: "5 kcal",
      available: true,
      customizable: true
    },
    {
      id: "assam-black-loose-leaf",
      name: "Assam Reserve Black Tea",
      category: "fresh-tea",
      price: 4.50,
      description: "Full-bodied whole leaf black tea with rich malt character and deep crimson infusion.",
      image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80",
      popular: false,
      badge: "Full Bodied",
      caffeine: "High",
      calories: "5 kcal",
      available: true,
      customizable: true
    },

    // --- ENERGY SERIES ---
    {
      id: "matcha-energy-booster",
      name: "Matcha Electro-Boost",
      category: "energy",
      price: 6.95,
      description: "Ceremonial matcha infused with green coffee extract, B-vitamins, coconut water electrolytes, and mint.",
      image: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=800&q=80",
      popular: false,
      badge: "Electrolytes",
      caffeine: "High (160mg)",
      calories: "120 kcal",
      available: true,
      customizable: true
    },
    {
      id: "yuzu-ginseng-energy",
      name: "Citrus Yuzu Ginseng Fuel",
      category: "energy",
      price: 6.75,
      description: "Japanese Yuzu citrus juice with red Korean ginseng, guarana, and sparkling Four Seasons oolong.",
      image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
      popular: false,
      badge: "Sparkling",
      caffeine: "High (140mg)",
      calories: "135 kcal",
      available: true,
      customizable: true
    },
    {
      id: "dragonfruit-green-coffee",
      name: "Dragonfruit Spark Refresher",
      category: "energy",
      price: 6.50,
      description: "Vibrant red pitaya fruit purée with green coffee bean antioxidants, lime juice, and aloe vera chunks.",
      image: "https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=800&q=80",
      popular: false,
      badge: "Antioxidants",
      caffeine: "Medium (90mg)",
      calories: "150 kcal",
      available: true,
      customizable: true
    },

    // --- NO CAFFEINE ---
    {
      id: "wintermelon-fresh-milk",
      name: "Wintermelon Fresh Milk",
      category: "no-caffeine",
      price: 5.50,
      description: "Caramelized traditional brown sugar wintermelon infusion paired with organic whole milk. Naturally caffeine-free.",
      image: "https://images.unsplash.com/photo-1558857563-b37cf0c84131?auto=format&fit=crop&w=800&q=80",
      popular: false,
      badge: "0mg Caffeine",
      caffeine: "Caffeine-Free",
      calories: "220 kcal",
      available: true,
      customizable: true
    },
    {
      id: "taro-coconut-shake",
      name: "Taro Coconut Cloud Shake",
      category: "no-caffeine",
      price: 6.50,
      description: "Smooth purple taro root blended with rich coconut cream and crushed ice. Thick, creamy, and 100% tea-free.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuChd5WET2vLT2aLDDIJQsDMm77O0qMllmwZOKPeKHDC2xqw2HzZXph0WZhu8e3CQ85OHmVvNypKRwZPoI-XbK1F-8NpY0cy2lWy-MmlWqU4E99v2knbw5QnFzWuz5bptGqyeJXtWQ3TtKrtmLmV3fyYx8xFTD-s1RUm2GgW7tX3WxINE3KUaKLg3l9tFrXIoYivx1m9xF2Mzh6RUXt1d_hhfTDsUY5Kf59cQ6cmB7AKGvXEgyb-8Wfbh4ybH70j_TYJErR-1c5RmQSa",
      popular: false,
      badge: "Kids Favorite",
      caffeine: "Caffeine-Free",
      calories: "340 kcal",
      available: true,
      customizable: true
    },
    {
      id: "strawberry-cloud-milk",
      name: "Strawberry Pure Cloud Milk",
      category: "no-caffeine",
      price: 5.95,
      description: "Crushed fresh sweet strawberries simmered into compote, layered over cold creamy organic milk.",
      image: "https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=800&q=80",
      popular: false,
      badge: "Fresh Berry",
      caffeine: "Caffeine-Free",
      calories: "230 kcal",
      available: true,
      customizable: true
    },
    {
      id: "peach-calpico-sparkle",
      name: "White Peach Calpico Fizz",
      category: "no-caffeine",
      price: 5.75,
      description: "Japanese Calpico yogurt soda with white peach purée and coconut jelly cubes.",
      image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
      popular: false,
      badge: "Probiotic",
      caffeine: "Caffeine-Free",
      calories: "175 kcal",
      available: true,
      customizable: true
    },

    // --- DESSERTS ---
    {
      id: "mochi-donuts-box",
      name: "Pon de Ring Mochi Donuts (3pc)",
      category: "desserts",
      price: 6.95,
      description: "Chewy, pull-apart Japanese rice flour donuts with signature glazes: Matcha Green Tea, Black Sesame, and Strawberry Cream.",
      image: "https://images.unsplash.com/photo-1527515862127-a4fc05baf7a5?auto=format&fit=crop&w=800&q=80",
      popular: true,
      badge: "Chef's Special",
      caffeine: "None",
      calories: "380 kcal",
      available: true,
      customizable: false
    },
    {
      id: "classic-mochi-set",
      name: "Artisan Daifuku Mochi Set (4pc)",
      category: "desserts",
      price: 6.50,
      description: "Handcrafted soft rice cake filled with sweet red bean paste, fresh mango cream, and roasted soybean kinako.",
      image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80",
      popular: false,
      badge: "Handmade Daily",
      caffeine: "None",
      calories: "290 kcal",
      available: true,
      customizable: false
    },
    {
      id: "egg-drop-slider",
      name: "Korean Fluffy Egg Drop Slider",
      category: "desserts",
      price: 6.50,
      description: "Thick-cut butter toasted brioche filled with creamy scrambled eggs, cheddar cheese, and sweet sriracha mayo.",
      image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80",
      popular: false,
      badge: "Savory Snack",
      caffeine: "None",
      calories: "420 kcal",
      available: true,
      customizable: false
    },
    {
      id: "matcha-crepe-cake",
      name: "Mille Crepe Matcha Cake Slice",
      category: "desserts",
      price: 7.25,
      description: "20 delicate paper-thin green tea crepes layered with airy Uji matcha whipped cream.",
      image: "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=800&q=80",
      popular: false,
      badge: "Premium",
      caffeine: "Low",
      calories: "340 kcal",
      available: true,
      customizable: false
    },

    // --- SNACKS ---
    {
      id: "crispy-popcorn-chicken",
      name: "Taiwanese Basil Popcorn Chicken",
      category: "snacks",
      price: 7.95,
      description: "Crispy double-fried marinated bite-sized chicken thigh tossed with fried Thai basil and 5-spice white pepper seasoning.",
      image: "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80",
      popular: true,
      badge: "Hot & Crispy",
      caffeine: "None",
      calories: "460 kcal",
      available: true,
      customizable: false
    },
    {
      id: "salt-pepper-tofu",
      name: "Golden Salt & Pepper Tofu",
      category: "snacks",
      price: 6.75,
      description: "Silken tofu coated in a light crispy crust, tossed with scallions, fresh garlic, minced chili, and sea salt.",
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
      popular: false,
      badge: "Vegan",
      caffeine: "None",
      calories: "280 kcal",
      available: true,
      customizable: false
    },
    {
      id: "osaka-takoyaki",
      name: "Osaka Takoyaki Octopus Balls (6pc)",
      category: "snacks",
      price: 7.50,
      description: "Crispy round savory batter balls with tender octopus pieces, drizzled with Japanese kewpie mayo, sweet unagi glaze, and bonito flakes.",
      image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80",
      popular: false,
      badge: "Street Food",
      caffeine: "None",
      calories: "390 kcal",
      available: true,
      customizable: false
    },
    {
      id: "sweet-potato-plum-fries",
      name: "Sweet Potato Plum Fries",
      category: "snacks",
      price: 5.75,
      description: "Crinkle-cut golden sweet potato fries dusted with traditional sweet and sour Taiwanese plum powder.",
      image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80",
      popular: false,
      badge: "Sweet & Salty",
      caffeine: "None",
      calories: "310 kcal",
      available: true,
      customizable: false
    },
    {
      id: "catering-artisan-boba-bar",
      name: "Artisan Boba Bar (Serves 25–30)",
      category: "catering",
      price: 145.0,
      description: "Complete pop-up tea bar: 2 gallons of freshly brewed teas (Classic Roasted Black Milk Tea + Jasmine Green Tea), 2 large boba topping tubs (Slow-Cooked Kokuto Boba & Lychee Jelly), cups, giant boba straws, sweet cream, and ice station.",
      image: "https://images.unsplash.com/photo-1558857563-b37cf5a13348?auto=format&fit=crop&w=800&q=80",
      popular: false,
      badge: "Best For Teams",
      caffeine: "Medium",
      calories: "Serves 25–30",
      available: true,
      customizable: false
    },
    {
      id: "catering-grand-celebration-bar",
      name: "Grand Celebration Tea Bar (Serves 50–60)",
      category: "catering",
      price: 275.0,
      description: "Deluxe catering setup: 4 gallons of signature teas (Brown Sugar Boba, Uji Matcha Latte, Passion Fruit Green Tea, Mango Oolong), 4 boba & jelly toppings, fresh organic dairy & oat milk, cups, straws, and ice kit.",
      image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80",
      popular: false,
      badge: "Weddings & Galas",
      caffeine: "Low to Med",
      calories: "Serves 50–60",
      available: true,
      customizable: false
    },
    {
      id: "catering-mochi-donut-platter",
      name: "Pon de Ring Mochi Donut Platter (24 Pack)",
      category: "catering",
      price: 68.0,
      description: "24 freshly baked pull-apart chewy mochi donuts in an assorted luxury display box: Uji Matcha, Black Sesame, Strawberry Sakura, and Kokuto Brown Sugar glazes.",
      image: "https://images.unsplash.com/photo-1527515862127-a4fc05baf7a5?auto=format&fit=crop&w=800&q=80",
      popular: false,
      badge: "Crowd Favorite",
      caffeine: "None",
      calories: "24 Pieces",
      available: true,
      customizable: false
    },
    {
      id: "catering-party-tea-jug",
      name: "Party Tea Jug (1 Gallon / Serves 10–12)",
      category: "catering",
      price: 48.0,
      description: "Insulated 1-gallon dispenser of your favorite signature tea, accompanied by 12 cups, boba straws, ice bucket, and a dedicated 1-quart jar of freshly simmered warm boba pearls.",
      image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80",
      popular: false,
      badge: "Easy Party Pick",
      caffeine: "Medium",
      calories: "Serves 10–12",
      available: true,
      customizable: false
    }
  ] as MenuItem[]
};

export const ADDRESS_DATABASE: DeliveryAddress[] = [
  { full: "7724 Olson Mem Hwy, Golden Valley, MN 55427, United States", street: "7724 Olson Mem Hwy", city: "Golden Valley, MN 55427", valid: true, estTime: "10–15 min", distance: "0.0 mi" }
];
