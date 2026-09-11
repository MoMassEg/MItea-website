import * as fs from 'fs';
import * as path from 'path';
import { NEW_CATEGORIES, NEW_ITEMS } from './update-menu';

function run() {
  console.log('Syncing menu-data.ts with new categories and products...');

  // Calculate counts for each category
  const categoriesWithCounts = NEW_CATEGORIES.map(cat => {
    let count = 0;
    if (cat.id === 'all') {
      count = NEW_ITEMS.filter(i => i.popular).length;
    } else {
      count = NEW_ITEMS.filter(i => i.category === cat.id).length;
    }
    return {
      id: cat.id,
      name: cat.name,
      icon: cat.icon,
      count
    };
  });

  const menuDataTsContent = `export interface Category {
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

  categories: ${JSON.stringify(categoriesWithCounts, null, 4)} as Category[],

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

  items: ${JSON.stringify(NEW_ITEMS, null, 4)} as MenuItem[]
};
`;

  const targetPath = path.join(process.cwd(), 'src', 'data', 'menu-data.ts');
  fs.writeFileSync(targetPath, menuDataTsContent, 'utf8');
  console.log(`✅ Successfully updated ${targetPath} with ${NEW_ITEMS.length} items!`);
}

run();
