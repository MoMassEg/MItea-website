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
  notes?: string;
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
    {
        "id": "all",
        "name": "Most Popular",
        "icon": "flame",
        "count": 6
    },
    {
        "id": "milk-tea",
        "name": "Milk Tea",
        "icon": "coffee",
        "count": 6
    },
    {
        "id": "fruit-tea",
        "name": "Fresh Fruit Tea",
        "icon": "citrus",
        "count": 7
    },
    {
        "id": "tea",
        "name": "Tea Series",
        "icon": "leaf",
        "count": 3
    },
    {
        "id": "latte",
        "name": "Latte Series",
        "icon": "coffee",
        "count": 4
    },
    {
        "id": "signature",
        "name": "Signature Series",
        "icon": "sparkles",
        "count": 2
    },
    {
        "id": "brown-sugar",
        "name": "Brown Sugar Series",
        "icon": "flame",
        "count": 5
    },
    {
        "id": "chizu",
        "name": "Chizu Series",
        "icon": "droplets",
        "count": 10
    },
    {
        "id": "energy",
        "name": "Energy Series",
        "icon": "zap",
        "count": 3
    },
    {
        "id": "no-caffeine",
        "name": "No Caffeine Series",
        "icon": "droplets",
        "count": 10
    },
    {
        "id": "smoothies",
        "name": "Smoothie Series",
        "icon": "sparkles",
        "count": 4
    },
    {
        "id": "mochi-dough",
        "name": "Mochi Dough",
        "icon": "cake",
        "count": 4
    },
    {
        "id": "korean-egg-drop",
        "name": "Korean Egg Drop",
        "icon": "utensils",
        "count": 12
    },
    {
        "id": "banh-mi",
        "name": "Vietnamese Banh Mi",
        "icon": "utensils",
        "count": 4
    },
    {
        "id": "soft-drinks",
        "name": "Soft Drinks",
        "icon": "droplets",
        "count": 5
    },
    {
        "id": "catering",
        "name": "Catering & Events",
        "icon": "sparkles",
        "count": 0
    }
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
    {
        "id": "coconut-milk-tea",
        "name": "Coconut Milk Tea",
        "category": "milk-tea",
        "price": 5.5,
        "description": "Made with our freshly brewed loose leaf black tea. Nutty and creamy. **Pictured Brown Sugar Konjac Jelly Not Included**",
        "image": "/images/menu/coconut-milk-tea.jpeg",
        "popular": true,
        "badge": "Popular",
        "caffeine": "Medium",
        "calories": "280 kcal",
        "available": true,
        "customizable": true
    },
    {
        "id": "pure-honey-jasmine-green-tea",
        "name": "Pure Honey Jasmine Green Tea",
        "category": "tea",
        "price": 5.3,
        "description": "Freshly brewed premium-grade Jasmine green tea sweetened with pure honey. **Pictured stir-fried brown sugar boba not included**",
        "image": "/images/menu/pure-honey-jasmine-green-tea.jpeg",
        "popular": true,
        "badge": "Popular",
        "caffeine": "Medium",
        "calories": "180 kcal",
        "available": true,
        "customizable": true
    },
    {
        "id": "jasmine-milk-tea",
        "name": "Jasmine Milk Tea",
        "category": "milk-tea",
        "price": 5.45,
        "description": "Made with our freshly brewed premium-grade Jasmine green tea. Floral and silky. **Pictured Stir-Fried Brown Sugar Boba Not Included**",
        "image": "/images/menu/jasmine-milk-tea.jpeg",
        "popular": true,
        "badge": "Best Seller",
        "caffeine": "Medium",
        "calories": "290 kcal",
        "available": true,
        "customizable": true
    },
    {
        "id": "gangnam-double-cheese-slider",
        "name": "Gangnam Double Cheese SLIDER",
        "category": "korean-egg-drop",
        "price": 6.7,
        "description": "Double Cheddar Cheese, MOMO Signature Soft Scrambled Eggs & MOMO Sauce **Contains milk, eggs, wheat, soy**",
        "image": "/images/menu/gangnam-double-cheese-slider.png",
        "popular": true,
        "badge": "Popular",
        "caffeine": "None",
        "calories": "420 kcal",
        "available": true,
        "customizable": false
    },
    {
        "id": "mochi-donuts-box-3",
        "name": "🍩 Box of 3 Mochi Donuts - U PICK FLAVORS",
        "category": "mochi-dough",
        "price": 8.5,
        "description": "Your Choice of 3 Mochi Donuts! Allergens: Milk, eggs, wheat and soy",
        "image": "/images/menu/mochi-donuts-box-3.jpeg",
        "popular": false,
        "badge": "Housemade",
        "caffeine": "None",
        "calories": "680 kcal",
        "available": true,
        "customizable": false
    },
    {
        "id": "mochi-donuts-box-6",
        "name": "🍩 Box of 6 - U PICK FLAVORS",
        "category": "mochi-dough",
        "price": 15.75,
        "description": "Enjoy a box of 6 Mochi Donuts - You choose the flavors! Allergens: Milk, eggs, wheat and soy",
        "image": "/images/menu/mochi-donuts-box-6.jpeg",
        "popular": false,
        "badge": "Party Favorite",
        "caffeine": "None",
        "calories": "1360 kcal",
        "available": true,
        "customizable": false
    },
    {
        "id": "mochi-donuts-box-12",
        "name": "🍩 Box of 12 Donuts - U PICK FLAVORS",
        "category": "mochi-dough",
        "price": 29.5,
        "description": "Box of 12 Delicious Mochi Donuts Allergens: Milk, eggs, wheat and soy",
        "image": "/images/menu/mochi-donuts-box-12.jpeg",
        "popular": false,
        "badge": "Family Pack",
        "caffeine": "None",
        "calories": "2720 kcal",
        "available": true,
        "customizable": false
    },
    {
        "id": "single-mochi-donut",
        "name": "🍩 Single Mochi Donut",
        "category": "mochi-dough",
        "price": 3,
        "description": "Allergens: Milk, eggs, wheat and soy **Unable to Select Reserve Donuts**",
        "image": "/images/menu/single-mochi-donut.png",
        "popular": false,
        "badge": "",
        "caffeine": "None",
        "calories": "230 kcal",
        "available": true,
        "customizable": false
    },
    {
        "id": "strawberry-matcha-latte",
        "name": "Strawberry Matcha Latte",
        "category": "latte",
        "price": 7.5,
        "description": "Housemade strawberry jam with our premium matcha latte **Contains milk**",
        "image": "/images/menu/strawberry-matcha-latte.jpeg",
        "popular": false,
        "badge": "New Drink Alert",
        "caffeine": "Medium",
        "calories": "320 kcal",
        "available": true,
        "customizable": true
    },
    {
        "id": "matcha-latte",
        "name": "Matcha Latte",
        "category": "latte",
        "price": 6.1,
        "description": "Premium Ceremonial Grade Matcha paired with extra rich milk for the best tasting Matcha latte. **Recommended at 75% Sweetness. Pictured Stir-Fried Brown Sugar Boba not included** **Contains milk**",
        "image": "/images/menu/matcha-latte.png",
        "popular": false,
        "badge": "Ceremonial",
        "caffeine": "Medium",
        "calories": "310 kcal",
        "available": true,
        "customizable": true
    },
    {
        "id": "thai-tea-latte",
        "name": "THAI Tea Latte",
        "category": "latte",
        "price": 6.25,
        "description": "Authentic THAI Tea brewed from loose-leaf tea using our hour-long brewing process. Topped with evaporated milk and our creamy house-made Chizu (sweet cream). **Pictured Stir-Fried Boba not Included** **Contains milk**",
        "image": "/images/menu/thai-tea-latte.jpeg",
        "popular": false,
        "badge": "Authentic",
        "caffeine": "High",
        "calories": "350 kcal",
        "available": true,
        "customizable": true
    },
    {
        "id": "hot-matcha-latte",
        "name": "HOT MATCHA LATTE",
        "category": "latte",
        "price": 4,
        "description": "A decadent blend of ceremonial Japanese matcha, perfectly balanced with creamy milk, creating a smooth and velvety hot beverage. Default size is 8oz",
        "image": "/images/menu/hot-matcha-latte.jpeg",
        "popular": false,
        "badge": "Hot Beverage",
        "caffeine": "Medium",
        "calories": "240 kcal",
        "available": true,
        "customizable": true
    },
    {
        "id": "blue-raspberry-infusion",
        "name": "Blue Raspberry Infusion",
        "category": "energy",
        "price": 9,
        "description": "A vibrant blend of tangy blue raspberry and the invigorating energy of Red Bull, delivering a refreshing and sweet burst of flavor with every sip.",
        "image": "/images/menu/blue-raspberry-infusion.jpeg",
        "popular": false,
        "badge": "Red Bull Energy",
        "caffeine": "High",
        "calories": "190 kcal",
        "available": true,
        "customizable": false
    },
    {
        "id": "strawberry-infusion",
        "name": "Strawberry Infusion",
        "category": "energy",
        "price": 9,
        "description": "Bright, juicy strawberry swirled into a crisp Red Bull® infusion, then topped with tangy lemonade for the perfect sweet-and-tart pick-me-up.",
        "image": "/images/menu/strawberry-infusion.jpeg",
        "popular": false,
        "badge": "Red Bull Energy",
        "caffeine": "High",
        "calories": "210 kcal",
        "available": true,
        "customizable": false
    },
    {
        "id": "caramel-apple-infusion",
        "name": "Caramel Apple Infusion",
        "category": "energy",
        "price": 10,
        "description": "Bright, juicy strawberry swirled into a crisp Red Bull® infusion, then topped with tangy lemonade for the perfect sweet-and-tart pick-me-up.",
        "image": "/images/menu/caramel-apple-infusion.jpeg",
        "popular": false,
        "badge": "Red Bull Energy",
        "caffeine": "High",
        "calories": "220 kcal",
        "available": true,
        "customizable": false
    },
    {
        "id": "strawberry-smoothie",
        "name": "Strawberry Smoothie",
        "category": "smoothies",
        "price": 8,
        "description": "A refreshing blend made with our homemade strawberry jam and homemade sweet milk. Creamy, fruity, and perfectly balanced.",
        "image": "/images/menu/strawberry-smoothie.jpeg",
        "popular": false,
        "badge": "New Drink Alert",
        "caffeine": "None",
        "calories": "360 kcal",
        "available": true,
        "customizable": false
    },
    {
        "id": "mango-smoothie",
        "name": "Mango Smoothie",
        "category": "smoothies",
        "price": 8,
        "description": "A refreshing and creamy blend of ripe, juicy mangoes and smooth, perfectly balanced with a hint of natural sweetness. Served chilled, it’s tropical sunshine in a cup — rich, fruity, and irresistibly smooth.",
        "image": "/images/menu/mango-smoothie.jpeg",
        "popular": false,
        "badge": "Tropical",
        "caffeine": "None",
        "calories": "340 kcal",
        "available": true,
        "customizable": false
    },
    {
        "id": "coconut-smoothie",
        "name": "Coconut Smoothie",
        "category": "smoothies",
        "price": 7.5,
        "description": "A refreshing blend of fragrant coconut milk and sweet cream, blended icy and smooth for a tropical oasis in every sip.",
        "image": "/images/menu/coconut-smoothie.jpeg",
        "popular": false,
        "badge": "Creamy",
        "caffeine": "None",
        "calories": "370 kcal",
        "available": true,
        "customizable": false
    },
    {
        "id": "taro-tornado",
        "name": "Taro Torndao",
        "category": "smoothies",
        "price": 8,
        "description": "A smooth and creamy blend of fresh taro, delivering a rich and slightly sweet flavor in every sip.",
        "image": "/images/menu/taro-tornado.jpeg",
        "popular": false,
        "badge": "Rich & Creamy",
        "caffeine": "None",
        "calories": "390 kcal",
        "available": true,
        "customizable": false
    },
    {
        "id": "hot-chocolate",
        "name": "HOT CHOCOLATE",
        "category": "no-caffeine",
        "price": 3.75,
        "description": "A decadent blend of rich chocolate, perfectly balanced with creamy milk, creating a smooth and velvety hot beverage. Default size is 8oz",
        "image": "/images/menu/hot-chocolate.jpeg",
        "popular": false,
        "badge": "Hot Beverage",
        "caffeine": "Low",
        "calories": "280 kcal",
        "available": true,
        "customizable": true
    },
    {
        "id": "black-sesame-latte",
        "name": "Black Sesame Latte",
        "category": "no-caffeine",
        "price": 5.9,
        "description": "Pure Organic Roasted Black Sesame with our extra Rich Milk **Pictured Stir-Fried Brown Sugar Boba Not Included** **Contains milk** **Contains sesame** **Contains no caffeine**",
        "image": "/images/menu/black-sesame-latte.png",
        "popular": false,
        "badge": "Caffeine-Free",
        "caffeine": "None",
        "calories": "340 kcal",
        "available": true,
        "customizable": true
    },
    {
        "id": "chizu-taro-latte-no-caffeine",
        "name": "Chizu Taro Latte",
        "category": "no-caffeine",
        "price": 7.25,
        "description": "Your favorite taro latte with our housemade sweet cream. **Contains milk** **Contains no caffeine**",
        "image": "/images/menu/chizu-taro-latte.jpeg",
        "popular": false,
        "badge": "Caffeine-Free",
        "caffeine": "None",
        "calories": "380 kcal",
        "available": true,
        "customizable": true
    },
    {
        "id": "chizu-taro-latte",
        "name": "Chizu Taro Latte",
        "category": "chizu",
        "price": 6.4,
        "description": "Your favorite taro latte with our housemade sweet cream. **Contains milk** **Contains no caffeine**",
        "image": "/images/menu/chizu-taro-latte.jpeg",
        "popular": false,
        "badge": "Cheese Cream",
        "caffeine": "None",
        "calories": "380 kcal",
        "available": true,
        "customizable": true
    },
    {
        "id": "mango-milk",
        "name": "Mango Milk",
        "category": "no-caffeine",
        "price": 7.25,
        "description": "Bottom filled with our homemade mango jam and then filled with sweetened milk",
        "image": "/images/menu/mango-milk.jpeg",
        "popular": false,
        "badge": "Fresh Fruit",
        "caffeine": "None",
        "calories": "320 kcal",
        "available": true,
        "customizable": true
    },
    {
        "id": "mung-bean-pandan-latte",
        "name": "Mung Bean Pandan Latte",
        "category": "no-caffeine",
        "price": 6.7,
        "description": "Slow cooked Mung bean and Pandan leaves with extra rich milk, topped with a splash of our house-made Chizu. **Pictured Stir Fried Boba Not Included** **Contains milk** **Contains no caffeine**",
        "image": "/images/menu/mung-bean-pandan-latte.png",
        "popular": false,
        "badge": "House Special",
        "caffeine": "None",
        "calories": "350 kcal",
        "available": true,
        "customizable": true
    },
    {
        "id": "mung-bean-with-glass-jelly",
        "name": "Mung bean with glass jelly",
        "category": "no-caffeine",
        "price": 7.5,
        "description": "A well-loved Vietnamese favorite, this mung bean drink is blended until creamy and lightly sweet, then served with silky cubes of grass jelly. Refreshing, nourishing, and full of traditional flavor — a popular style enjoyed across Vietnam.",
        "image": "/images/menu/mung-bean-with-glass-jelly.jpeg",
        "popular": false,
        "badge": "Traditional",
        "caffeine": "None",
        "calories": "330 kcal",
        "available": true,
        "customizable": true
    },
    {
        "id": "strawberry-milk",
        "name": "Strawberry Milk",
        "category": "no-caffeine",
        "price": 7,
        "description": "Bottom filled with our homemade strawberry jam and then filled with our sweetened milk",
        "image": "/images/menu/strawberry-milk.jpeg",
        "popular": false,
        "badge": "Housemade Jam",
        "caffeine": "None",
        "calories": "310 kcal",
        "available": true,
        "customizable": true
    },
    {
        "id": "taro-latte",
        "name": "Taro Latte",
        "category": "no-caffeine",
        "price": 5.9,
        "description": "Caffeine-free and Vitamin C rich Taro over barista grade Straus Family organic extra rich milk. **Pictured Stir-Fried Brown Sugar Boba Not Included** **Contains milk** **Contains no caffeine**",
        "image": "/images/menu/taro-latte.png",
        "popular": false,
        "badge": "Caffeine-Free",
        "caffeine": "None",
        "calories": "310 kcal",
        "available": true,
        "customizable": true
    },
    {
        "id": "winter-melon-milk-tea",
        "name": "Winter Melon Milk Tea",
        "category": "milk-tea",
        "price": 5.5,
        "description": "Made with the traditional Chinese melon, known for its light caramel flavor. Tastes like sweet and salty kettle corn! **Sweetness Level can not be adjusted** **Pictured Brown Sugar Konjac Jelly Not Included** **Contains no caffeine**",
        "image": "/images/menu/winter-melon-milk-tea.png",
        "popular": false,
        "badge": "Caffeine-Free",
        "caffeine": "None",
        "calories": "290 kcal",
        "available": true,
        "customizable": true
    },
    {
        "id": "lemonade",
        "name": "Lemonade",
        "category": "no-caffeine",
        "price": 5,
        "description": "Classic refreshing lemonade made with freshly squeezed lemons",
        "image": "/images/menu/lemonade.png",
        "popular": false,
        "badge": "Fresh",
        "caffeine": "None",
        "calories": "150 kcal",
        "available": true,
        "customizable": true
    },
    {
        "id": "strawberry-lemonade",
        "name": "Strawberry Lemonade",
        "category": "no-caffeine",
        "price": 5.8,
        "description": "Lemonade with strawberry flavoring",
        "image": "/images/menu/strawberry-lemonade.png",
        "popular": false,
        "badge": "Refreshing",
        "caffeine": "None",
        "calories": "180 kcal",
        "available": true,
        "customizable": true
    },
    {
        "id": "blue-raspberry-lemonade",
        "name": "Blue Raspberry Lemonade",
        "category": "no-caffeine",
        "price": 5.8,
        "description": "Lemonade with blue raspberry flavoring",
        "image": "/images/menu/blue-raspberry-infusion.jpeg",
        "popular": false,
        "badge": "Vibrant",
        "caffeine": "None",
        "calories": "180 kcal",
        "available": true,
        "customizable": true
    },
    {
        "id": "signature-tri-color",
        "name": "The Signature Tri-Color",
        "category": "signature",
        "price": 6.8,
        "description": "***BOBA INCLUDED*** We start by adding a spoon of our warm stir-fried brown sugar boba, add a layer of slow cooked Mung bean and Pandan leaves mixed with extra rich milk, followed by a layer of taro latte, and finally topping off the drink with our house made sweet cream. **INCLUDES STIR FRIED BOBA!!** **Sweetness Level Can Not Be Adjusted** **Contains milk**",
        "image": "/images/menu/signature-tri-color.jpeg",
        "popular": true,
        "badge": "Signature",
        "caffeine": "None",
        "calories": "450 kcal",
        "available": true,
        "customizable": true
    },
    {
        "id": "signature-milk-tea",
        "name": "The Signature Milk Tea",
        "category": "signature",
        "price": 6.8,
        "description": "***BOBA INCLUDED*** We generously coat the cup with house-made brown sugar syrup, spoon in our warm stir-fried brown sugar boba, fill with our caffeine-rich black milk tea, top with our house-made sweet cream, then brulee'd brown sugar. **INCLUDES STIR FRIED BOBA!!** **Sweetness Level Can Not Be Adjusted** **Contains milk**",
        "image": "/images/menu/signature-milk-tea.png",
        "popular": true,
        "badge": "Signature",
        "caffeine": "High",
        "calories": "440 kcal",
        "available": true,
        "customizable": true
    },
    {
        "id": "brown-sugar-matcha-latte",
        "name": "Brown Sugar Matcha Latte",
        "category": "brown-sugar",
        "price": 6.3,
        "description": "Our ceremonial-grade Matcha over Straus Family organic extra rich milk. Sweetened with our house-made brown sugar syrup. **Recommended at 50% Sweetness** **Pictured Stir-Fried Boba Not Included** **Contains milk**",
        "image": "/images/menu/brown-sugar-matcha-latte.jpeg",
        "popular": false,
        "badge": "Brown Sugar",
        "caffeine": "Medium",
        "calories": "360 kcal",
        "available": true,
        "customizable": true
    },
    {
        "id": "brown-sugar-cookies-cream",
        "name": "Brown Sugar Cookies & Cream",
        "category": "brown-sugar",
        "price": 6.3,
        "description": "Housemade brown sugar syrup coated cup with classic milk tea, sweet cream and crushed Oreo cookies. **with all of the components listed this is a very sweet drink (100% sweetness) therefore no additional sugar is allowed to be added.** **Pictured Stir-Fried boba not included** **Contains milk, wheat, soy**",
        "image": "/images/menu/brown-sugar-cookies-cream.png",
        "popular": false,
        "badge": "Sweet Treat",
        "caffeine": "Medium",
        "calories": "460 kcal",
        "available": true,
        "customizable": true
    },
    {
        "id": "brown-sugar-creme-brulee-milk-tea",
        "name": "Brown Sugar Creme Brûlée Milk Tea",
        "category": "brown-sugar",
        "price": 5.9,
        "description": "Generously coated with our housemade brown sugar syrup, then filled with our classic milk tea, topped off with our housemade sweet cream and brulee'd brown sugar. **Contains milk**",
        "image": "/images/menu/brown-sugar-creme-brulee-milk-tea.jpeg",
        "popular": false,
        "badge": "Brûlée",
        "caffeine": "Medium",
        "calories": "420 kcal",
        "available": true,
        "customizable": true
    },
    {
        "id": "brown-sugar-milk-tea",
        "name": "Brown Sugar Milk Tea",
        "category": "brown-sugar",
        "price": 5.4,
        "description": "Generously coated with our housemade brown sugar syrup and filled with caffeine-rich milk tea.**Pictured Stir-Fried Boba Not Included**",
        "image": "/images/menu/brown-sugar-milk-tea.jpeg",
        "popular": false,
        "badge": "Classic",
        "caffeine": "High",
        "calories": "380 kcal",
        "available": true,
        "customizable": true
    },
    {
        "id": "brown-sugar-roasted-oolong-milk-tea",
        "name": "Brown Sugar Roasted Oolong Milk Tea",
        "category": "brown-sugar",
        "price": 5.8,
        "description": "Generously coated with our housemade brown sugar syrup and filled with roasted oolong milk tea. **Pictured Brown Sugar Konjac Jelly Not Included**",
        "image": "/images/menu/brown-sugar-roasted-oolong-milk-tea.jpeg",
        "popular": false,
        "badge": "Roasted",
        "caffeine": "Medium",
        "calories": "370 kcal",
        "available": true,
        "customizable": true
    },
    {
        "id": "chizu-strawberry-green-tea",
        "name": "Chizu Strawberry Green Tea",
        "category": "chizu",
        "price": 7.3,
        "description": "Fresh Hand-Mashed Strawberries with Premium Jasmine Green Tea and our Housemade Chizu (cheese Cream). **Sweetness level can not be adjusted due to the use of fresh sweet fruits** **Contains milk**",
        "image": "/images/menu/chizu-strawberry-green-tea.png",
        "popular": false,
        "badge": "Cheese Foam",
        "caffeine": "Medium",
        "calories": "320 kcal",
        "available": true,
        "customizable": true
    },
    {
        "id": "chizu-pink-pear-green-tea",
        "name": "Chizu Pink Pear Green Tea",
        "category": "chizu",
        "price": 6.8,
        "description": "Housemade sweet cream layered over a blend of our pink pear puree and premium-grade Jasmine green tea. **Sweetness Level can not be adjusted due to the use of fresh sweet fruits** **Contains milk**",
        "image": "/images/menu/chizu-pink-pear-green-tea.png",
        "popular": false,
        "badge": "Cheese Foam",
        "caffeine": "Medium",
        "calories": "310 kcal",
        "available": true,
        "customizable": true
    },
    {
        "id": "chizu-pineapple-green-tea",
        "name": "Chizu Pineapple Green Tea",
        "category": "chizu",
        "price": 6.8,
        "description": "Housemade cheese cream layered over a blend of our pineapple puree and premium-grade Jasmine green tea. **Sweetness Level can not be adjusted due to the use of fresh sweet fruits** **Contains milk**",
        "image": "/images/menu/chizu-pineapple-green-tea.png",
        "popular": false,
        "badge": "Cheese Foam",
        "caffeine": "Medium",
        "calories": "310 kcal",
        "available": true,
        "customizable": true
    },
    {
        "id": "chizu-matcha-latte",
        "name": "Chizu Matcha Latte",
        "category": "chizu",
        "price": 6.6,
        "description": "Housemade cheese cream over our ceremonial-grade Matcha and Straus Family organic extra rich milk. **Contains milk**",
        "image": "/images/menu/chizu-matcha-latte.jpeg",
        "popular": false,
        "badge": "Ceremonial",
        "caffeine": "Medium",
        "calories": "370 kcal",
        "available": true,
        "customizable": true
    },
    {
        "id": "thai-tea-creme-brulee",
        "name": "Thai Tea Creme Brulee",
        "category": "chizu",
        "price": 6.6,
        "description": "Authentic THAI Tea brewed from loose-leaf tea using our hour-long brewing process. Topped with our creamy house-made Chizu (sweet cream) and Taiwanese brown sugar then perfectly Brulee'd. **Pictured Stir-Fried Boba not Included** **Contains milk**",
        "image": "/images/menu/thai-tea-creme-brulee.jpeg",
        "popular": false,
        "badge": "Brûlée",
        "caffeine": "High",
        "calories": "410 kcal",
        "available": true,
        "customizable": true
    },
    {
        "id": "chizu-milk-tea",
        "name": "Chizu Milk Tea",
        "category": "chizu",
        "price": 5.7,
        "description": "Housemade cheese cream over our classic milk tea. **Contains milk**",
        "image": "/images/menu/chizu-milk-tea.jpeg",
        "popular": false,
        "badge": "Cheese Foam",
        "caffeine": "High",
        "calories": "360 kcal",
        "available": true,
        "customizable": true
    },
    {
        "id": "chizu-kungfu-black-tea",
        "name": "Chizu KungFu Black Tea",
        "category": "chizu",
        "price": 5.7,
        "description": "Our caffeine-rich loose leaf black tea topped with our housemade cheese cream. Perfectly sweet and savory. **Recommended at 50% Sweetness** **Contains milk**",
        "image": "/images/menu/chizu-kungfu-black-tea.png",
        "popular": false,
        "badge": "Cheese Foam",
        "caffeine": "High",
        "calories": "290 kcal",
        "available": true,
        "customizable": true
    },
    {
        "id": "chizu-strawberry-pineapple-green-tea",
        "name": "Chizu Strawberry Pineapple Green Tea",
        "category": "chizu",
        "price": 7.8,
        "description": "Housemade cheese cream layered over a blend of our fresh strawberry puree, pineapple puree, and premium-grade Jasmine green tea. **Sweetness Level can not be adjusted due to the use of fresh sweet fruits** **Contains milk**",
        "image": "/images/menu/chizu-strawberry-pineapple-green-tea.jpeg",
        "popular": false,
        "badge": "Cheese Foam",
        "caffeine": "Medium",
        "calories": "340 kcal",
        "available": true,
        "customizable": true
    },
    {
        "id": "chizu-mango-green-tea",
        "name": "Chizu Mango Green Tea",
        "category": "chizu",
        "price": 7.55,
        "description": "Fresh Hand-Mashed Mango with Premium Jasmine Green Tea and our Housemade Chizu (cheese Cream). **Sweetness level can not be adjusted due to the use of fresh sweet fruits** **Contains milk**",
        "image": "/images/menu/chizu-mango-green-tea.png",
        "popular": false,
        "badge": "Cheese Foam",
        "caffeine": "Medium",
        "calories": "330 kcal",
        "available": true,
        "customizable": true
    },
    {
        "id": "supreme-mango-green-tea",
        "name": "Supreme Mango Green Tea",
        "category": "fruit-tea",
        "price": 7.05,
        "description": "A blend of fresh housemade mango puree and our freshly brewed premium-grade Jasmine green tea. **Sweetness Level can not be adjusted due to the use of fresh sweet fruits** **Pictured Passionfruit Popping Boba Not Included**",
        "image": "/images/menu/supreme-mango-green-tea.jpeg",
        "popular": false,
        "badge": "Fresh Fruit",
        "caffeine": "Medium",
        "calories": "240 kcal",
        "available": true,
        "customizable": true
    },
    {
        "id": "supreme-strawberry-pineapple-green-tea",
        "name": "Supreme Strawberry Pineapple Green Tea",
        "category": "fruit-tea",
        "price": 7.25,
        "description": "Fresh, Hand-Mashed Strawberries, and pineapple puree with our loose leaf brewed Jasmine Green Tea **Sweetness Level can not be adjusted due to the use of real, sweet fruits** **Pictured Passion Fruit Popping Boba Not Included**",
        "image": "/images/menu/chizu-strawberry-pineapple-green-tea.jpeg",
        "popular": false,
        "badge": "Fresh Fruit",
        "caffeine": "Medium",
        "calories": "250 kcal",
        "available": true,
        "customizable": true
    },
    {
        "id": "supreme-pink-pear-green-tea",
        "name": "Supreme Pink Pear Green Tea",
        "category": "fruit-tea",
        "price": 6.25,
        "description": "Pink Pear puree and our freshly brewed premium-grade Jasmine green tea. **Sweetness Level can not be adjusted due to the use of fresh sweet fruits**",
        "image": "/images/menu/supreme-pink-pear-green-tea.png",
        "popular": false,
        "badge": "Real Fruit",
        "caffeine": "Medium",
        "calories": "220 kcal",
        "available": true,
        "customizable": true
    },
    {
        "id": "supreme-pineapple-green-tea",
        "name": "Supreme Pineapple Green Tea",
        "category": "fruit-tea",
        "price": 6.2,
        "description": "Real Pineapple puree and our freshly brewed premium-grade Jasmine green tea. **Sweetness Level can not be adjusted due to the use of fresh sweet fruits**",
        "image": "/images/menu/lemonade.png",
        "popular": false,
        "badge": "Real Fruit",
        "caffeine": "Medium",
        "calories": "210 kcal",
        "available": true,
        "customizable": true
    },
    {
        "id": "supreme-strawberry-green-tea",
        "name": "Supreme Strawberry Green Tea",
        "category": "fruit-tea",
        "price": 6.8,
        "description": "A blend of fresh housemade Strawberry puree and our freshly brewed premium-grade Jasmine green tea. **Sweetness Level can not be adjusted due to the use of fresh sweet fruits** **Pictured Passionfruit Popping Boba Not Included**",
        "image": "/images/menu/strawberry-lemonade.png",
        "popular": false,
        "badge": "Real Fruit",
        "caffeine": "Medium",
        "calories": "230 kcal",
        "available": true,
        "customizable": true
    },
    {
        "id": "tropical-green-tea",
        "name": "Tropical Green Tea",
        "category": "fruit-tea",
        "price": 7,
        "description": "***Ice quantity cannot be adjusted*** **Sweetness Level Can Not Be Adjusted**",
        "image": "/images/menu/tropical-green-tea.jpeg",
        "popular": false,
        "badge": "Tropical",
        "caffeine": "Medium",
        "calories": "230 kcal",
        "available": true,
        "customizable": true
    },
    {
        "id": "strawberry-mango",
        "name": "Strawberry Mango",
        "category": "fruit-tea",
        "price": 7.25,
        "description": "***Ice quantity cannot be adjusted*** **Sweetness Level Can Not Be Adjusted**",
        "image": "/images/menu/tropical-green-tea.jpeg",
        "popular": false,
        "badge": "Dual Fruit",
        "caffeine": "Medium",
        "calories": "260 kcal",
        "available": true,
        "customizable": true
    },
    {
        "id": "classic-milk-tea",
        "name": "Classic Milk Tea",
        "category": "milk-tea",
        "price": 5.35,
        "description": "Caffeine-rich milk tea made with our freshly brewed loose leaf black tea. **Pictured Stir-Fried Boba not included**",
        "image": "/images/menu/classic-milk-tea.jpeg",
        "popular": false,
        "badge": "Signature Base",
        "caffeine": "High",
        "calories": "280 kcal",
        "available": true,
        "customizable": true
    },
    {
        "id": "roasted-oolong-milk-tea",
        "name": "Roasted Oolong Milk Tea",
        "category": "milk-tea",
        "price": 5.5,
        "description": "Made with our freshly brewed premium-grade roasted oolong loose leaf tea. Nutty and aromatic. **Pictured Brown Sugar Konjac Jelly Not Included**",
        "image": "/images/menu/roasted-oolong-milk-tea.jpeg",
        "popular": false,
        "badge": "Roasted",
        "caffeine": "Medium",
        "calories": "270 kcal",
        "available": true,
        "customizable": true
    },
    {
        "id": "hazelnut-milk-tea",
        "name": "Hazelnut Milk Tea",
        "category": "milk-tea",
        "price": 5.5,
        "description": "Made with our freshly brewed loose leaf black tea. Nutty and creamy. **Pictured Brown Sugar Konjac Jelly Not Included**",
        "image": "/images/menu/coconut-milk-tea.jpeg",
        "popular": false,
        "badge": "Nutty",
        "caffeine": "High",
        "calories": "300 kcal",
        "available": true,
        "customizable": true
    },
    {
        "id": "kungfu-black-tea",
        "name": "KungFu Black Tea",
        "category": "tea",
        "price": 5,
        "description": "Freshly brewed caffeine-rich loose leaf black tea. **Pictured brown sugar konjac jelly not included**",
        "image": "/images/menu/kungfu-black-tea.jpeg",
        "popular": false,
        "badge": "Pure Tea",
        "caffeine": "High",
        "calories": "100 kcal",
        "available": true,
        "customizable": true
    },
    {
        "id": "jasmine-green-tea",
        "name": "Jasmine Green Tea",
        "category": "tea",
        "price": 5,
        "description": "Freshly brewed premium-grade Jasmine green tea. **Pictured passionfruit popping boba not included**",
        "image": "/images/menu/jasmine-green-tea.jpeg",
        "popular": false,
        "badge": "Pure Tea",
        "caffeine": "Medium",
        "calories": "90 kcal",
        "available": true,
        "customizable": true
    },
    {
        "id": "coke",
        "name": "Coke",
        "category": "soft-drinks",
        "price": 1.5,
        "description": "12 fl oz can",
        "image": "/images/menu/coke.jpeg",
        "popular": false,
        "badge": "Can",
        "caffeine": "Low",
        "calories": "140 kcal",
        "available": true,
        "customizable": false
    },
    {
        "id": "diet-coke",
        "name": "Diet Coke",
        "category": "soft-drinks",
        "price": 1.5,
        "description": "12 fl oz can",
        "image": "/images/menu/diet-coke.jpeg",
        "popular": false,
        "badge": "Zero Sugar",
        "caffeine": "Low",
        "calories": "0 kcal",
        "available": true,
        "customizable": false
    },
    {
        "id": "sprite",
        "name": "Sprite",
        "category": "soft-drinks",
        "price": 1.5,
        "description": "12 fl oz can",
        "image": "/images/menu/sprite.jpeg",
        "popular": false,
        "badge": "Caffeine-Free",
        "caffeine": "None",
        "calories": "140 kcal",
        "available": true,
        "customizable": false
    },
    {
        "id": "dasani-water",
        "name": "Dasani Water",
        "category": "soft-drinks",
        "price": 1.25,
        "description": "16.9 fl oz bottle",
        "image": "/images/menu/dasani-water.jpeg",
        "popular": false,
        "badge": "Bottle",
        "caffeine": "None",
        "calories": "0 kcal",
        "available": true,
        "customizable": false
    },
    {
        "id": "red-bull",
        "name": "Red Bull®",
        "category": "soft-drinks",
        "price": 3,
        "description": "8.4 fl oz can",
        "image": "/images/menu/red-bull.jpeg",
        "popular": false,
        "badge": "Energy Can",
        "caffeine": "High",
        "calories": "110 kcal",
        "available": true,
        "customizable": false
    },
    {
        "id": "beef-bulgogi-slider",
        "name": "Beef Bulgogi SLIDER",
        "category": "korean-egg-drop",
        "price": 7.7,
        "description": "Marinated Beef, MOMO Signature Soft Scrambled Eggs, Cheddar Cheese & MOMO Sauce **Contains milk, eggs, wheat, soy**",
        "image": "/images/menu/beef-bulgogi-slider.png",
        "popular": false,
        "badge": "Slider",
        "caffeine": "None",
        "calories": "480 kcal",
        "available": true,
        "customizable": false
    },
    {
        "id": "beef-bulgogi-sandwich",
        "name": "BEEF BULGOGI SANDWICH",
        "category": "korean-egg-drop",
        "price": 11.65,
        "description": "Marinated Beef, MOMO Signature Soft Scrambled Eggs, Cheddar Cheese, MOMO Sauce & Nori Flakes **Contains milk, eggs, wheat, soy**",
        "image": "/images/menu/beef-bulgogi-sandwich.png",
        "popular": false,
        "badge": "Full Size",
        "caffeine": "None",
        "calories": "680 kcal",
        "available": true,
        "customizable": false
    },
    {
        "id": "gangnam-double-cheese-sandwich",
        "name": "GANGNAM DOUBLE CHEESE SANDWICH",
        "category": "korean-egg-drop",
        "price": 9.9,
        "description": "Double Cheddar Cheese, MOMO Signature Soft Scrambled Eggs & MOMO Sauce **Contains milk, eggs, wheat, soy**",
        "image": "/images/menu/gangnam-double-cheese-sandwich.png",
        "popular": false,
        "badge": "Full Size",
        "caffeine": "None",
        "calories": "590 kcal",
        "available": true,
        "customizable": false
    },
    {
        "id": "gwangju-bacon-sandwich",
        "name": "GWANGJU BACON SANDWICH",
        "category": "korean-egg-drop",
        "price": 10.25,
        "description": "Thick Cut Bacon, MOMO Signature Soft Scrambled Eggs, Cheddar Cheese & MOMO Sauce **Contains milk, eggs, wheat, soy**",
        "image": "/images/menu/gwangju-bacon-sandwich.png",
        "popular": false,
        "badge": "Full Size",
        "caffeine": "None",
        "calories": "640 kcal",
        "available": true,
        "customizable": false
    },
    {
        "id": "jeju-ham-avocado-sandwich",
        "name": "JEJU HAM & AVOCADO SANDWICH",
        "category": "korean-egg-drop",
        "price": 10.25,
        "description": "Premium Ham, Fresh Avocado, MOMO Signature Soft Scrambled Eggs, Cheddar Cheese & MOMO Sauce **Contains milk, eggs, wheat, soy**",
        "image": "/images/menu/jeju-ham-avocado-sandwich.png",
        "popular": false,
        "badge": "Full Size",
        "caffeine": "None",
        "calories": "620 kcal",
        "available": true,
        "customizable": false
    },
    {
        "id": "seoul-spam-sandwich",
        "name": "SEOUL SPAM SANDWICH",
        "category": "korean-egg-drop",
        "price": 10.25,
        "description": "Spam, Nori, MOMO Signature Soft Scrambled Eggs, Cheddar Cheese, MOMO Sauce & Nori Flakes **Contains milk, eggs, wheat, soy**",
        "image": "/images/menu/seoul-spam-sandwich.png",
        "popular": false,
        "badge": "Full Size",
        "caffeine": "None",
        "calories": "650 kcal",
        "available": true,
        "customizable": false
    },
    {
        "id": "spicy-pork-sandwich",
        "name": "SPICY PORK SANDWICH",
        "category": "korean-egg-drop",
        "price": 10.9,
        "description": "Spicy Korean Pork, MOMO Signature Soft Scrambled Eggs, Cheddar Cheese & MOMO Sauce **Contains milk, eggs, wheat, soy**",
        "image": "/images/menu/spicy-pork-sandwich.png",
        "popular": false,
        "badge": "Spicy",
        "caffeine": "None",
        "calories": "660 kcal",
        "available": true,
        "customizable": false
    },
    {
        "id": "gwangju-bacon-slider",
        "name": "Gwangju Bacon SLIDER",
        "category": "korean-egg-drop",
        "price": 7.25,
        "description": "Thick Cut Bacon, MOMO Signature Soft Scrambled Eggs, Cheddar Cheese & MOMO Sauce **Contains milk, eggs, wheat, soy**",
        "image": "/images/menu/gwangju-bacon-slider.png",
        "popular": false,
        "badge": "Slider",
        "caffeine": "None",
        "calories": "460 kcal",
        "available": true,
        "customizable": false
    },
    {
        "id": "jeju-ham-avocado-slider",
        "name": "Jeju Ham & Avocado SLIDER",
        "category": "korean-egg-drop",
        "price": 7.25,
        "description": "Premium Ham, Fresh Avocado, MOMO Signature Soft Scrambled Eggs, Cheddar Cheese & MOMO Sauce **Contains milk, eggs, wheat, soy**",
        "image": "/images/menu/jeju-ham-avocado-slider.png",
        "popular": false,
        "badge": "Slider",
        "caffeine": "None",
        "calories": "450 kcal",
        "available": true,
        "customizable": false
    },
    {
        "id": "seoul-spam-slider",
        "name": "Seoul Spam SLIDER",
        "category": "korean-egg-drop",
        "price": 7.25,
        "description": "Spam, Nori, MOMO Signature Soft Scrambled Eggs, Cheddar Cheese & MOMO Sauce **Contains milk, eggs, wheat, soy**",
        "image": "/images/menu/seoul-spam-slider.png",
        "popular": false,
        "badge": "Slider",
        "caffeine": "None",
        "calories": "470 kcal",
        "available": true,
        "customizable": false
    },
    {
        "id": "spicy-pork-slider",
        "name": "Spicy Pork SLIDER",
        "category": "korean-egg-drop",
        "price": 7.7,
        "description": "Spicy Korean Pork, MOMO Signature Soft Scrambled Eggs, Cheddar Cheese & MOMO Sauce **Contains milk, eggs, wheat, soy**",
        "image": "/images/menu/spicy-pork-slider.png",
        "popular": false,
        "badge": "Spicy Slider",
        "caffeine": "None",
        "calories": "480 kcal",
        "available": true,
        "customizable": false
    },
    {
        "id": "vietnamese-banh-mi-garlic-chicken",
        "name": "Garlic Chicken Banh Mi",
        "category": "banh-mi",
        "price": 8,
        "description": "A fresh, crusty baguette loaded with juicy, garlic-marinated chicken, crisp pickled carrots and daikon, fresh cilantro, and rich homemade mayonnaise. Bursting with savory garlic flavor and balanced with tangy, refreshing pickles for the perfect bite.",
        "image": "/images/menu/vietnamese-banh-mi-garlic-chicken.jpeg",
        "popular": false,
        "badge": "Vietnamese",
        "caffeine": "None",
        "calories": "550 kcal",
        "available": true,
        "customizable": false
    },
    {
        "id": "vietnamese-banh-mi-beef",
        "name": "Beef Banh Mi",
        "category": "banh-mi",
        "price": 9.5,
        "description": "Tender slices of premium beef, marinated and griddled to perfection, served in a warm, crusty French baguette. Finished with our homemade sate sauce, pickled carrots and daikon, fresh cilantro, and a touch of creamy house-made mayonnaise. A rich and flavorful take on the classic banh mi.",
        "image": "/images/menu/vietnamese-banh-mi-garlic-chicken.jpeg",
        "popular": false,
        "badge": "Vietnamese",
        "caffeine": "None",
        "calories": "620 kcal",
        "available": true,
        "customizable": false
    },
    {
        "id": "vietnamese-banh-mi-pork",
        "name": "Pork Banh Mi",
        "category": "banh-mi",
        "price": 8,
        "description": "A Vietnamese-style sandwich made with a fresh, crusty baguette filled with tender, marinated pork, crisp pickled carrots and daikon, fresh cilantro, and rich homemade mayonnaise. Balanced with savory and tangy flavors for a delicious, satisfying bite.",
        "image": "/images/menu/vietnamese-banh-mi-pork.jpeg",
        "popular": false,
        "badge": "Vietnamese",
        "caffeine": "None",
        "calories": "580 kcal",
        "available": true,
        "customizable": false
    },
    {
        "id": "vietnamese-banh-mi-traditional-cold-ham",
        "name": "Traditional Cold Ham Banh Mi",
        "category": "banh-mi",
        "price": 8,
        "description": "A traditional Vietnamese cold ham banh mi in a crispy French baguette with pate, homemade mayo, pickled vegetables, and cilantro. CONTAINS PORK!",
        "image": "/images/menu/vietnamese-banh-mi-garlic-chicken.jpeg",
        "popular": false,
        "badge": "Vietnamese",
        "caffeine": "None",
        "calories": "540 kcal",
        "available": true,
        "customizable": false
    }
] as MenuItem[]
};

export const ADDRESS_DATABASE: DeliveryAddress[] = [
  { full: "7724 Olson Mem Hwy, Golden Valley, MN 55427, United States", street: "7724 Olson Mem Hwy", city: "Golden Valley, MN 55427", valid: true, estTime: "10–15 min", distance: "0.0 mi" }
];

