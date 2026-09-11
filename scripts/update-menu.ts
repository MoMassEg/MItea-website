import { loadEnvConfig } from '@next/env';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

loadEnvConfig(process.cwd());

export interface NewMenuItem {
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

export const NEW_CATEGORIES = [
  { id: "all", name: "Most Popular", icon: "flame" },
  { id: "milk-tea", name: "Milk Tea", icon: "coffee" },
  { id: "fruit-tea", name: "Fresh Fruit Tea", icon: "citrus" },
  { id: "tea", name: "Tea Series", icon: "leaf" },
  { id: "latte", name: "Latte Series", icon: "coffee" },
  { id: "signature", name: "Signature Series", icon: "sparkles" },
  { id: "brown-sugar", name: "Brown Sugar Series", icon: "flame" },
  { id: "chizu", name: "Chizu Series", icon: "droplets" },
  { id: "energy", name: "Energy Series", icon: "zap" },
  { id: "no-caffeine", name: "No Caffeine Series", icon: "droplets" },
  { id: "smoothies", name: "Smoothie Series", icon: "sparkles" },
  { id: "mochi-dough", name: "Mochi Dough", icon: "cake" },
  { id: "korean-egg-drop", name: "Korean Egg Drop", icon: "utensils" },
  { id: "banh-mi", name: "Vietnamese Banh Mi", icon: "utensils" },
  { id: "soft-drinks", name: "Soft Drinks", icon: "droplets" },
  { id: "catering", name: "Catering & Events", icon: "sparkles" }
];

export const NEW_ITEMS: NewMenuItem[] = [
  // --- MOST POPULAR & MILK TEA ---
  {
    id: "coconut-milk-tea",
    name: "Coconut Milk Tea",
    category: "milk-tea",
    price: 5.50,
    description: "Made with our freshly brewed loose leaf black tea. Nutty and creamy. **Pictured Brown Sugar Konjac Jelly Not Included**",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/RY7D5GZCS4FR6SVAWAC3EHGS.jpeg?width=1280&dpr=1",
    popular: true,
    badge: "Popular",
    caffeine: "Medium",
    calories: "280 kcal",
    available: true,
    customizable: true
  },
  {
    id: "pure-honey-jasmine-green-tea",
    name: "Pure Honey Jasmine Green Tea",
    category: "tea",
    price: 5.30,
    description: "Freshly brewed premium-grade Jasmine green tea sweetened with pure honey. **Pictured stir-fried brown sugar boba not included**",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/AT6GQ6KSIOCIARJUQH4WO6RR.jpeg?width=1280&dpr=1",
    popular: true,
    badge: "Popular",
    caffeine: "Medium",
    calories: "180 kcal",
    available: true,
    customizable: true
  },
  {
    id: "jasmine-milk-tea",
    name: "Jasmine Milk Tea",
    category: "milk-tea",
    price: 5.45,
    description: "Made with our freshly brewed premium-grade Jasmine green tea. Floral and silky. **Pictured Stir-Fried Brown Sugar Boba Not Included**",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/QUIQMLWBCS3QMRUXU7Q6PHJG.jpeg?width=1280&dpr=1",
    popular: true,
    badge: "Best Seller",
    caffeine: "Medium",
    calories: "290 kcal",
    available: true,
    customizable: true
  },
  {
    id: "gangnam-double-cheese-slider",
    name: "Gangnam Double Cheese SLIDER",
    category: "korean-egg-drop",
    price: 6.70,
    description: "Double Cheddar Cheese, MOMO Signature Soft Scrambled Eggs & MOMO Sauce **Contains milk, eggs, wheat, soy**",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/XCXQS7KU42WVGY26YAQARKQG.png?width=1280&dpr=1",
    popular: true,
    badge: "Popular",
    caffeine: "None",
    calories: "420 kcal",
    available: true,
    customizable: false
  },

  // --- MOCHI DOUGH ---
  {
    id: "mochi-donuts-box-3",
    name: "🍩 Box of 3 Mochi Donuts - U PICK FLAVORS",
    category: "mochi-dough",
    price: 8.50,
    description: "Your Choice of 3 Mochi Donuts! Allergens: Milk, eggs, wheat and soy",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/63VU2FQBG4ZJF5CU3ZGQB6RX.jpeg?width=1280&dpr=1",
    popular: false,
    badge: "Housemade",
    caffeine: "None",
    calories: "680 kcal",
    available: true,
    customizable: false
  },
  {
    id: "mochi-donuts-box-6",
    name: "🍩 Box of 6 - U PICK FLAVORS",
    category: "mochi-dough",
    price: 15.75,
    description: "Enjoy a box of 6 Mochi Donuts - You choose the flavors! Allergens: Milk, eggs, wheat and soy",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/J7ZH4CZYLPC4SBVUEY7GJB7L.jpeg?width=1280&dpr=1",
    popular: false,
    badge: "Party Favorite",
    caffeine: "None",
    calories: "1360 kcal",
    available: true,
    customizable: false
  },
  {
    id: "mochi-donuts-box-12",
    name: "🍩 Box of 12 Donuts - U PICK FLAVORS",
    category: "mochi-dough",
    price: 29.50,
    description: "Box of 12 Delicious Mochi Donuts Allergens: Milk, eggs, wheat and soy",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/L4P4ASE6J7UDZJP5JNFIQLPP.jpeg?width=1280&dpr=1",
    popular: false,
    badge: "Family Pack",
    caffeine: "None",
    calories: "2720 kcal",
    available: true,
    customizable: false
  },
  {
    id: "single-mochi-donut",
    name: "🍩 Single Mochi Donut",
    category: "mochi-dough",
    price: 3.00,
    description: "Allergens: Milk, eggs, wheat and soy **Unable to Select Reserve Donuts**",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/45Q2EKU2DR4AG4554ZYBU7AS.png?width=1280&dpr=1",
    popular: false,
    badge: "",
    caffeine: "None",
    calories: "230 kcal",
    available: true,
    customizable: false
  },

  // --- LATTE SERIES ---
  {
    id: "strawberry-matcha-latte",
    name: "Strawberry Matcha Latte",
    category: "latte",
    price: 7.50,
    description: "Housemade strawberry jam with our premium matcha latte **Contains milk**",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/CJRHW2H5R3VMWVZZDPR4QJSV.jpeg?width=1280&dpr=1",
    popular: false,
    badge: "New Drink Alert",
    caffeine: "Medium",
    calories: "320 kcal",
    available: true,
    customizable: true
  },
  {
    id: "matcha-latte",
    name: "Matcha Latte",
    category: "latte",
    price: 6.10,
    description: "Premium Ceremonial Grade Matcha paired with extra rich milk for the best tasting Matcha latte. **Recommended at 75% Sweetness. Pictured Stir-Fried Brown Sugar Boba not included** **Contains milk**",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/ECDULCDVQH6VL6G5VM7GH3T4.png?width=1280&dpr=1",
    popular: false,
    badge: "Ceremonial",
    caffeine: "Medium",
    calories: "310 kcal",
    available: true,
    customizable: true
  },
  {
    id: "thai-tea-latte",
    name: "THAI Tea Latte",
    category: "latte",
    price: 6.25,
    description: "Authentic THAI Tea brewed from loose-leaf tea using our hour-long brewing process. Topped with evaporated milk and our creamy house-made Chizu (sweet cream). **Pictured Stir-Fried Boba not Included** **Contains milk**",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/5JQFCGCF7JSQVO4MF7YJLIUO.jpeg?width=1280&dpr=1",
    popular: false,
    badge: "Authentic",
    caffeine: "High",
    calories: "350 kcal",
    available: true,
    customizable: true
  },
  {
    id: "hot-matcha-latte",
    name: "HOT MATCHA LATTE",
    category: "latte",
    price: 4.00,
    description: "A decadent blend of ceremonial Japanese matcha, perfectly balanced with creamy milk, creating a smooth and velvety hot beverage. Default size is 8oz",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/FE5CWVKT57HBSNZV7QPWZXDF.jpeg?width=1280&dpr=1",
    popular: false,
    badge: "Hot Beverage",
    caffeine: "Medium",
    calories: "240 kcal",
    available: true,
    customizable: true
  },

  // --- ENERGY SERIES ---
  {
    id: "blue-raspberry-infusion",
    name: "Blue Raspberry Infusion",
    category: "energy",
    price: 9.00,
    description: "A vibrant blend of tangy blue raspberry and the invigorating energy of Red Bull, delivering a refreshing and sweet burst of flavor with every sip.",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/MEQJDLMVB44YOGG4KHRYNZYH.jpeg?width=1280&dpr=1",
    popular: false,
    badge: "Red Bull Energy",
    caffeine: "High",
    calories: "190 kcal",
    available: true,
    customizable: false
  },
  {
    id: "strawberry-infusion",
    name: "Strawberry Infusion",
    category: "energy",
    price: 9.00,
    description: "Bright, juicy strawberry swirled into a crisp Red Bull® infusion, then topped with tangy lemonade for the perfect sweet-and-tart pick-me-up.",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/6YENOOON5WH27FHTT2TRIAAB.jpeg?width=1280&dpr=1",
    popular: false,
    badge: "Red Bull Energy",
    caffeine: "High",
    calories: "210 kcal",
    available: true,
    customizable: false
  },
  {
    id: "caramel-apple-infusion",
    name: "Caramel Apple Infusion",
    category: "energy",
    price: 10.00,
    description: "Bright, juicy strawberry swirled into a crisp Red Bull® infusion, then topped with tangy lemonade for the perfect sweet-and-tart pick-me-up.",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/GRPXKBN3X3NMZ2ZMZX7QB3DF.jpeg?width=1280&dpr=1",
    popular: false,
    badge: "Red Bull Energy",
    caffeine: "High",
    calories: "220 kcal",
    available: true,
    customizable: false
  },

  // --- SMOOTHIE SERIES ---
  {
    id: "strawberry-smoothie",
    name: "Strawberry Smoothie",
    category: "smoothies",
    price: 8.00,
    description: "A refreshing blend made with our homemade strawberry jam and homemade sweet milk. Creamy, fruity, and perfectly balanced.",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/BYN2TH3VZZSUUS3I7ACPBJBD.jpeg?width=1280&dpr=1",
    popular: false,
    badge: "New Drink Alert",
    caffeine: "None",
    calories: "360 kcal",
    available: true,
    customizable: false
  },
  {
    id: "mango-smoothie",
    name: "Mango Smoothie",
    category: "smoothies",
    price: 8.00,
    description: "A refreshing and creamy blend of ripe, juicy mangoes and smooth, perfectly balanced with a hint of natural sweetness. Served chilled, it’s tropical sunshine in a cup — rich, fruity, and irresistibly smooth.",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/NBNMZYQYIPXVNGILOJZIFMMN.jpeg?width=1280&dpr=1",
    popular: false,
    badge: "Tropical",
    caffeine: "None",
    calories: "340 kcal",
    available: true,
    customizable: false
  },
  {
    id: "coconut-smoothie",
    name: "Coconut Smoothie",
    category: "smoothies",
    price: 7.50,
    description: "A refreshing blend of fragrant coconut milk and sweet cream, blended icy and smooth for a tropical oasis in every sip.",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/XJ4PE7DJPXTPFJWFPWQQU3TA.jpeg?width=1280&dpr=1",
    popular: false,
    badge: "Creamy",
    caffeine: "None",
    calories: "370 kcal",
    available: true,
    customizable: false
  },
  {
    id: "taro-tornado",
    name: "Taro Torndao",
    category: "smoothies",
    price: 8.00,
    description: "A smooth and creamy blend of fresh taro, delivering a rich and slightly sweet flavor in every sip.",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/P4MFRE2NKIUGDX35SOSK64SH.jpeg?width=1280&dpr=1",
    popular: false,
    badge: "Rich & Creamy",
    caffeine: "None",
    calories: "390 kcal",
    available: true,
    customizable: false
  },

  // --- NO CAFFEINE SERIES ---
  {
    id: "hot-chocolate",
    name: "HOT CHOCOLATE",
    category: "no-caffeine",
    price: 3.75,
    description: "A decadent blend of rich chocolate, perfectly balanced with creamy milk, creating a smooth and velvety hot beverage. Default size is 8oz",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/ITMMAHIAZAYC3ALYQA4SGCOQ.jpeg?width=1280&dpr=1",
    popular: false,
    badge: "Hot Beverage",
    caffeine: "Low",
    calories: "280 kcal",
    available: true,
    customizable: true
  },
  {
    id: "black-sesame-latte",
    name: "Black Sesame Latte",
    category: "no-caffeine",
    price: 5.90,
    description: "Pure Organic Roasted Black Sesame with our extra Rich Milk **Pictured Stir-Fried Brown Sugar Boba Not Included** **Contains milk** **Contains sesame** **Contains no caffeine**",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/TNZFJV2PQGEJJVKQRCAEWY6G.png?width=1280&dpr=1",
    popular: false,
    badge: "Caffeine-Free",
    caffeine: "None",
    calories: "340 kcal",
    available: true,
    customizable: true
  },
  {
    id: "chizu-taro-latte",
    name: "Chizu Taro Latte",
    category: "chizu",
    price: 6.40,
    description: "Your favorite taro latte with our housemade sweet cream. **Contains milk** **Contains no caffeine**",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/OWVUDWTBGQSDWB747M5YGSPY.jpeg?width=1280&dpr=1",
    popular: false,
    badge: "Cheese Cream",
    caffeine: "None",
    calories: "380 kcal",
    available: true,
    customizable: true
  },
  {
    id: "mango-milk",
    name: "Mango Milk",
    category: "no-caffeine",
    price: 7.25,
    description: "Bottom filled with our homemade mango jam and then filled with sweetened milk",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/ZMHAAW2C2AV5KXC26T5NKYA4.jpeg?width=1280&dpr=1",
    popular: false,
    badge: "Fresh Fruit",
    caffeine: "None",
    calories: "320 kcal",
    available: true,
    customizable: true
  },
  {
    id: "mung-bean-pandan-latte",
    name: "Mung Bean Pandan Latte",
    category: "no-caffeine",
    price: 6.70,
    description: "Slow cooked Mung bean and Pandan leaves with extra rich milk, topped with a splash of our house-made Chizu. **Pictured Stir Fried Boba Not Included** **Contains milk** **Contains no caffeine**",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/TMWIG2KA4KOB6F4SI3J46UTD.png?width=1280&dpr=1",
    popular: false,
    badge: "House Special",
    caffeine: "None",
    calories: "350 kcal",
    available: true,
    customizable: true
  },
  {
    id: "mung-bean-with-glass-jelly",
    name: "Mung bean with glass jelly",
    category: "no-caffeine",
    price: 7.50,
    description: "A well-loved Vietnamese favorite, this mung bean drink is blended until creamy and lightly sweet, then served with silky cubes of grass jelly. Refreshing, nourishing, and full of traditional flavor — a popular style enjoyed across Vietnam.",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/ZJG3CKPSORZOCZQWLJ227MZE.jpeg?width=1280&dpr=1",
    popular: false,
    badge: "Traditional",
    caffeine: "None",
    calories: "330 kcal",
    available: true,
    customizable: true
  },
  {
    id: "strawberry-milk",
    name: "Strawberry Milk",
    category: "no-caffeine",
    price: 7.00,
    description: "Bottom filled with our homemade strawberry jam and then filled with our sweetened milk",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/MRUOBQIXZ6EN4PH3C6N4HT5G.jpeg?width=1280&dpr=1",
    popular: false,
    badge: "Housemade Jam",
    caffeine: "None",
    calories: "310 kcal",
    available: true,
    customizable: true
  },
  {
    id: "taro-latte",
    name: "Taro Latte",
    category: "no-caffeine",
    price: 5.90,
    description: "Caffeine-free and Vitamin C rich Taro over barista grade Straus Family organic extra rich milk. **Pictured Stir-Fried Brown Sugar Boba Not Included** **Contains milk** **Contains no caffeine**",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/Y5KKXYF5PTV646QBJ265UR6S.png?width=1280&dpr=1",
    popular: false,
    badge: "Caffeine-Free",
    caffeine: "None",
    calories: "310 kcal",
    available: true,
    customizable: true
  },
  {
    id: "winter-melon-milk-tea",
    name: "Winter Melon Milk Tea",
    category: "milk-tea",
    price: 5.50,
    description: "Made with the traditional Chinese melon, known for its light caramel flavor. Tastes like sweet and salty kettle corn! **Sweetness Level can not be adjusted** **Pictured Brown Sugar Konjac Jelly Not Included** **Contains no caffeine**",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/IR2YSHDJZX5ZLHGDDMFFGXX3.png?width=1280&dpr=1",
    popular: false,
    badge: "Caffeine-Free",
    caffeine: "None",
    calories: "290 kcal",
    available: true,
    customizable: true
  },
  {
    id: "lemonade",
    name: "Lemonade",
    category: "no-caffeine",
    price: 5.00,
    description: "Classic refreshing lemonade made with freshly squeezed lemons",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/5WXZZRRP4WOGZJEEQSXKV6R3.png?width=1280&dpr=1",
    popular: false,
    badge: "Fresh",
    caffeine: "None",
    calories: "150 kcal",
    available: true,
    customizable: true
  },
  {
    id: "strawberry-lemonade",
    name: "Strawberry Lemonade",
    category: "no-caffeine",
    price: 5.80,
    description: "Lemonade with strawberry flavoring",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/3R6UPG3Z5IONV7F52KTYC67Z.png?width=1280&dpr=1",
    popular: false,
    badge: "Refreshing",
    caffeine: "None",
    calories: "180 kcal",
    available: true,
    customizable: true
  },
  {
    id: "blue-raspberry-lemonade",
    name: "Blue Raspberry Lemonade",
    category: "no-caffeine",
    price: 5.80,
    description: "Lemonade with blue raspberry flavoring",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/MEQJDLMVB44YOGG4KHRYNZYH.jpeg?width=1280&dpr=1",
    popular: false,
    badge: "Vibrant",
    caffeine: "None",
    calories: "180 kcal",
    available: true,
    customizable: true
  },

  // --- SIGNATURE SERIES ---
  {
    id: "signature-tri-color",
    name: "The Signature Tri-Color",
    category: "signature",
    price: 6.80,
    description: "***BOBA INCLUDED*** We start by adding a spoon of our warm stir-fried brown sugar boba, add a layer of slow cooked Mung bean and Pandan leaves mixed with extra rich milk, followed by a layer of taro latte, and finally topping off the drink with our house made sweet cream. **INCLUDES STIR FRIED BOBA!!** **Sweetness Level Can Not Be Adjusted** **Contains milk**",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/ZS3JLI7U55XYIDC3FNMH5BOI.jpeg?width=1280&dpr=1",
    popular: true,
    badge: "Signature",
    caffeine: "None",
    calories: "450 kcal",
    available: true,
    customizable: true
  },
  {
    id: "signature-milk-tea",
    name: "The Signature Milk Tea",
    category: "signature",
    price: 6.80,
    description: "***BOBA INCLUDED*** We generously coat the cup with house-made brown sugar syrup, spoon in our warm stir-fried brown sugar boba, fill with our caffeine-rich black milk tea, top with our house-made sweet cream, then brulee'd brown sugar. **INCLUDES STIR FRIED BOBA!!** **Sweetness Level Can Not Be Adjusted** **Contains milk**",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/7ANLZNR4ZVSCPRFD2WC4CL3Z.png?width=1280&dpr=1",
    popular: true,
    badge: "Signature",
    caffeine: "High",
    calories: "440 kcal",
    available: true,
    customizable: true
  },

  // --- BROWN SUGAR SERIES ---
  {
    id: "brown-sugar-matcha-latte",
    name: "Brown Sugar Matcha Latte",
    category: "brown-sugar",
    price: 6.30,
    description: "Our ceremonial-grade Matcha over Straus Family organic extra rich milk. Sweetened with our house-made brown sugar syrup. **Recommended at 50% Sweetness** **Pictured Stir-Fried Boba Not Included** **Contains milk**",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/PK2FOXZAELZQDCFSQQRLVDY3.jpeg?width=1280&dpr=1",
    popular: false,
    badge: "Brown Sugar",
    caffeine: "Medium",
    calories: "360 kcal",
    available: true,
    customizable: true
  },
  {
    id: "brown-sugar-cookies-cream",
    name: "Brown Sugar Cookies & Cream",
    category: "brown-sugar",
    price: 6.30,
    description: "Housemade brown sugar syrup coated cup with classic milk tea, sweet cream and crushed Oreo cookies. **with all of the components listed this is a very sweet drink (100% sweetness) therefore no additional sugar is allowed to be added.** **Pictured Stir-Fried boba not included** **Contains milk, wheat, soy**",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/36RFNP7DQRLO4VB4SRGSH2XL.png?width=1280&dpr=1",
    popular: false,
    badge: "Sweet Treat",
    caffeine: "Medium",
    calories: "460 kcal",
    available: true,
    customizable: true
  },
  {
    id: "brown-sugar-creme-brulee-milk-tea",
    name: "Brown Sugar Creme Brûlée Milk Tea",
    category: "brown-sugar",
    price: 5.90,
    description: "Generously coated with our housemade brown sugar syrup, then filled with our classic milk tea, topped off with our housemade sweet cream and brulee'd brown sugar. **Contains milk**",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/GI44CFH7U3HXCKBRR3RLGOFY.jpeg?width=1280&dpr=1",
    popular: false,
    badge: "Brûlée",
    caffeine: "Medium",
    calories: "420 kcal",
    available: true,
    customizable: true
  },
  {
    id: "brown-sugar-milk-tea",
    name: "Brown Sugar Milk Tea",
    category: "brown-sugar",
    price: 5.40,
    description: "Generously coated with our housemade brown sugar syrup and filled with caffeine-rich milk tea.**Pictured Stir-Fried Boba Not Included**",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/WSGONX7XNC45VDB3XIMZFCUI.jpeg?width=1280&dpr=1",
    popular: false,
    badge: "Classic",
    caffeine: "High",
    calories: "380 kcal",
    available: true,
    customizable: true
  },
  {
    id: "brown-sugar-roasted-oolong-milk-tea",
    name: "Brown Sugar Roasted Oolong Milk Tea",
    category: "brown-sugar",
    price: 5.80,
    description: "Generously coated with our housemade brown sugar syrup and filled with roasted oolong milk tea. **Pictured Brown Sugar Konjac Jelly Not Included**",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/EA7OHQZICOROOH7YBCZ4YS4I.jpeg?width=1280&dpr=1",
    popular: false,
    badge: "Roasted",
    caffeine: "Medium",
    calories: "370 kcal",
    available: true,
    customizable: true
  },

  // --- CHIZU SERIES ---
  {
    id: "chizu-strawberry-green-tea",
    name: "Chizu Strawberry Green Tea",
    category: "chizu",
    price: 7.30,
    description: "Fresh Hand-Mashed Strawberries with Premium Jasmine Green Tea and our Housemade Chizu (cheese Cream). **Sweetness level can not be adjusted due to the use of fresh sweet fruits** **Contains milk**",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/U47HL24GMK6UIMTGSTQ6DF2U.png?width=1280&dpr=1",
    popular: false,
    badge: "Cheese Foam",
    caffeine: "Medium",
    calories: "320 kcal",
    available: true,
    customizable: true
  },
  {
    id: "chizu-pink-pear-green-tea",
    name: "Chizu Pink Pear Green Tea",
    category: "chizu",
    price: 6.80,
    description: "Housemade sweet cream layered over a blend of our pink pear puree and premium-grade Jasmine green tea. **Sweetness Level can not be adjusted due to the use of fresh sweet fruits** **Contains milk**",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/QPIYBBI66QN5NY7FBDNKM2OJ.png?width=1280&dpr=1",
    popular: false,
    badge: "Cheese Foam",
    caffeine: "Medium",
    calories: "310 kcal",
    available: true,
    customizable: true
  },
  {
    id: "chizu-pineapple-green-tea",
    name: "Chizu Pineapple Green Tea",
    category: "chizu",
    price: 6.80,
    description: "Housemade cheese cream layered over a blend of our pineapple puree and premium-grade Jasmine green tea. **Sweetness Level can not be adjusted due to the use of fresh sweet fruits** **Contains milk**",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/TF2IFWBLXJGMUPILAJOQLVNH.png?width=1280&dpr=1",
    popular: false,
    badge: "Cheese Foam",
    caffeine: "Medium",
    calories: "310 kcal",
    available: true,
    customizable: true
  },
  {
    id: "chizu-matcha-latte",
    name: "Chizu Matcha Latte",
    category: "chizu",
    price: 6.60,
    description: "Housemade cheese cream over our ceremonial-grade Matcha and Straus Family organic extra rich milk. **Contains milk**",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/VN5UFLAALRDMTD3LQTUKJEKL.jpeg?width=1280&dpr=1",
    popular: false,
    badge: "Ceremonial",
    caffeine: "Medium",
    calories: "370 kcal",
    available: true,
    customizable: true
  },
  {
    id: "thai-tea-creme-brulee",
    name: "Thai Tea Creme Brulee",
    category: "chizu",
    price: 6.60,
    description: "Authentic THAI Tea brewed from loose-leaf tea using our hour-long brewing process. Topped with our creamy house-made Chizu (sweet cream) and Taiwanese brown sugar then perfectly Brulee'd. **Pictured Stir-Fried Boba not Included** **Contains milk**",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/N54YB6C4XJKAJ2IJBORM7IEC.jpeg?width=1280&dpr=1",
    popular: false,
    badge: "Brûlée",
    caffeine: "High",
    calories: "410 kcal",
    available: true,
    customizable: true
  },
  {
    id: "chizu-milk-tea",
    name: "Chizu Milk Tea",
    category: "chizu",
    price: 5.70,
    description: "Housemade cheese cream over our classic milk tea. **Contains milk**",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/2AZCTQX6XAHVZDEBVZHW4GK3.jpeg?width=1280&dpr=1",
    popular: false,
    badge: "Cheese Foam",
    caffeine: "High",
    calories: "360 kcal",
    available: true,
    customizable: true
  },
  {
    id: "chizu-kungfu-black-tea",
    name: "Chizu KungFu Black Tea",
    category: "chizu",
    price: 5.70,
    description: "Our caffeine-rich loose leaf black tea topped with our housemade cheese cream. Perfectly sweet and savory. **Recommended at 50% Sweetness** **Contains milk**",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/IEY2YH425N6UTLJOIKIYUPJA.png?width=1280&dpr=1",
    popular: false,
    badge: "Cheese Foam",
    caffeine: "High",
    calories: "290 kcal",
    available: true,
    customizable: true
  },
  {
    id: "chizu-strawberry-pineapple-green-tea",
    name: "Chizu Strawberry Pineapple Green Tea",
    category: "chizu",
    price: 7.80,
    description: "Housemade cheese cream layered over a blend of our fresh strawberry puree, pineapple puree, and premium-grade Jasmine green tea. **Sweetness Level can not be adjusted due to the use of fresh sweet fruits** **Contains milk**",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/OAH7TUZZV5WLYITFY3LEMBAI.jpeg?width=1280&dpr=1",
    popular: false,
    badge: "Cheese Foam",
    caffeine: "Medium",
    calories: "340 kcal",
    available: true,
    customizable: true
  },
  {
    id: "chizu-mango-green-tea",
    name: "Chizu Mango Green Tea",
    category: "chizu",
    price: 7.55,
    description: "Fresh Hand-Mashed Mango with Premium Jasmine Green Tea and our Housemade Chizu (cheese Cream). **Sweetness level can not be adjusted due to the use of fresh sweet fruits** **Contains milk**",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/7HBXK6WN6KRO4UJBREVJ6YPC.png?width=1280&dpr=1",
    popular: false,
    badge: "Cheese Foam",
    caffeine: "Medium",
    calories: "330 kcal",
    available: true,
    customizable: true
  },

  // --- FRESH FRUIT TEA ---
  {
    id: "supreme-mango-green-tea",
    name: "Supreme Mango Green Tea",
    category: "fruit-tea",
    price: 7.05,
    description: "A blend of fresh housemade mango puree and our freshly brewed premium-grade Jasmine green tea. **Sweetness Level can not be adjusted due to the use of fresh sweet fruits** **Pictured Passionfruit Popping Boba Not Included**",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/PUNTAUZPDR4QMY7Z4CZKL2VS.jpeg?width=1280&dpr=1",
    popular: false,
    badge: "Fresh Fruit",
    caffeine: "Medium",
    calories: "240 kcal",
    available: true,
    customizable: true
  },
  {
    id: "supreme-strawberry-pineapple-green-tea",
    name: "Supreme Strawberry Pineapple Green Tea",
    category: "fruit-tea",
    price: 7.25,
    description: "Fresh, Hand-Mashed Strawberries, and pineapple puree with our loose leaf brewed Jasmine Green Tea **Sweetness Level can not be adjusted due to the use of real, sweet fruits** **Pictured Passion Fruit Popping Boba Not Included**",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/OAH7TUZZV5WLYITFY3LEMBAI.jpeg?width=1280&dpr=1",
    popular: false,
    badge: "Fresh Fruit",
    caffeine: "Medium",
    calories: "250 kcal",
    available: true,
    customizable: true
  },
  {
    id: "supreme-pink-pear-green-tea",
    name: "Supreme Pink Pear Green Tea",
    category: "fruit-tea",
    price: 6.25,
    description: "Pink Pear puree and our freshly brewed premium-grade Jasmine green tea. **Sweetness Level can not be adjusted due to the use of fresh sweet fruits**",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/SLRTN4QZBOY6XQ6J5KDSYJOW.png?width=1280&dpr=1",
    popular: false,
    badge: "Real Fruit",
    caffeine: "Medium",
    calories: "220 kcal",
    available: true,
    customizable: true
  },
  {
    id: "supreme-pineapple-green-tea",
    name: "Supreme Pineapple Green Tea",
    category: "fruit-tea",
    price: 6.20,
    description: "Real Pineapple puree and our freshly brewed premium-grade Jasmine green tea. **Sweetness Level can not be adjusted due to the use of fresh sweet fruits**",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/5WXZZRRP4WOGZJEEQSXKV6R3.png?width=1280&dpr=1",
    popular: false,
    badge: "Real Fruit",
    caffeine: "Medium",
    calories: "210 kcal",
    available: true,
    customizable: true
  },
  {
    id: "supreme-strawberry-green-tea",
    name: "Supreme Strawberry Green Tea",
    category: "fruit-tea",
    price: 6.80,
    description: "A blend of fresh housemade Strawberry puree and our freshly brewed premium-grade Jasmine green tea. **Sweetness Level can not be adjusted due to the use of fresh sweet fruits** **Pictured Passionfruit Popping Boba Not Included**",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/3R6UPG3Z5IONV7F52KTYC67Z.png?width=1280&dpr=1",
    popular: false,
    badge: "Real Fruit",
    caffeine: "Medium",
    calories: "230 kcal",
    available: true,
    customizable: true
  },
  {
    id: "tropical-green-tea",
    name: "Tropical Green Tea",
    category: "fruit-tea",
    price: 7.00,
    description: "***Ice quantity cannot be adjusted*** **Sweetness Level Can Not Be Adjusted**",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/VTCECXLA3S7DG4YAEV5J3FY4.jpeg?width=1280&dpr=1",
    popular: false,
    badge: "Tropical",
    caffeine: "Medium",
    calories: "230 kcal",
    available: true,
    customizable: true
  },
  {
    id: "strawberry-mango",
    name: "Strawberry Mango",
    category: "fruit-tea",
    price: 8.25,
    description: "***Ice quantity cannot be adjusted*** **Sweetness Level Can Not Be Adjusted**",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/VTCECXLA3S7DG4YAEV5J3FY4.jpeg?width=1280&dpr=1",
    popular: false,
    badge: "Dual Fruit",
    caffeine: "Medium",
    calories: "260 kcal",
    available: true,
    customizable: true
  },

  // --- MILK TEA (ADDITIONAL) ---
  {
    id: "classic-milk-tea",
    name: "Classic Milk Tea",
    category: "milk-tea",
    price: 5.35,
    description: "Caffeine-rich milk tea made with our freshly brewed loose leaf black tea. **Pictured Stir-Fried Boba not included**",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/XNFHYWFETIEL6A6HO3EJMKDV.jpeg?width=1280&dpr=1",
    popular: false,
    badge: "Signature Base",
    caffeine: "High",
    calories: "280 kcal",
    available: true,
    customizable: true
  },
  {
    id: "roasted-oolong-milk-tea",
    name: "Roasted Oolong Milk Tea",
    category: "milk-tea",
    price: 5.50,
    description: "Made with our freshly brewed premium-grade roasted oolong loose leaf tea. Nutty and aromatic. **Pictured Brown Sugar Konjac Jelly Not Included**",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/5YXPQ4FGRQDVIRPN5RCKVVTH.jpeg?width=1280&dpr=1",
    popular: false,
    badge: "Roasted",
    caffeine: "Medium",
    calories: "270 kcal",
    available: true,
    customizable: true
  },
  {
    id: "hazelnut-milk-tea",
    name: "Hazelnut Milk Tea",
    category: "milk-tea",
    price: 5.50,
    description: "Made with our freshly brewed loose leaf black tea. Nutty and creamy. **Pictured Brown Sugar Konjac Jelly Not Included**",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/RY7D5GZCS4FR6SVAWAC3EHGS.jpeg?width=1280&dpr=1",
    popular: false,
    badge: "Nutty",
    caffeine: "High",
    calories: "300 kcal",
    available: true,
    customizable: true
  },

  // --- TEA SERIES (ADDITIONAL) ---
  {
    id: "kungfu-black-tea",
    name: "KungFu Black Tea",
    category: "tea",
    price: 5.00,
    description: "Freshly brewed caffeine-rich loose leaf black tea. **Pictured brown sugar konjac jelly not included**",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/EOCGKE76B5PUJLBQ25HJLHP2.jpeg?width=1280&dpr=1",
    popular: false,
    badge: "Pure Tea",
    caffeine: "High",
    calories: "100 kcal",
    available: true,
    customizable: true
  },
  {
    id: "jasmine-green-tea",
    name: "Jasmine Green Tea",
    category: "tea",
    price: 5.00,
    description: "Freshly brewed premium-grade Jasmine green tea. **Pictured passionfruit popping boba not included**",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/ZAOCQNJSA4V6SVKGELPCNIQU.jpeg?width=1280&dpr=1",
    popular: false,
    badge: "Pure Tea",
    caffeine: "Medium",
    calories: "90 kcal",
    available: true,
    customizable: true
  },

  // --- SOFT DRINKS ---
  {
    id: "coke",
    name: "Coke",
    category: "soft-drinks",
    price: 1.50,
    description: "12 fl oz can",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/CRWNEYCNM27NWHGDJSGWTRF5.jpeg?width=1280&dpr=1",
    popular: false,
    badge: "Can",
    caffeine: "Low",
    calories: "140 kcal",
    available: true,
    customizable: false
  },
  {
    id: "diet-coke",
    name: "Diet Coke",
    category: "soft-drinks",
    price: 1.50,
    description: "12 fl oz can",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/AWNGFA4TT4W6QSHRQDDS3BQK.jpeg?width=1280&dpr=1",
    popular: false,
    badge: "Zero Sugar",
    caffeine: "Low",
    calories: "0 kcal",
    available: true,
    customizable: false
  },
  {
    id: "sprite",
    name: "Sprite",
    category: "soft-drinks",
    price: 1.50,
    description: "12 fl oz can",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/7P3M7KLNKZGUKNNGCCXQK53K.jpeg?width=1280&dpr=1",
    popular: false,
    badge: "Caffeine-Free",
    caffeine: "None",
    calories: "140 kcal",
    available: true,
    customizable: false
  },
  {
    id: "dasani-water",
    name: "Dasani Water",
    category: "soft-drinks",
    price: 1.25,
    description: "16.9 fl oz bottle",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/S42PVFQZZMFWSHUNUEFS46AF.jpeg?width=1280&dpr=1",
    popular: false,
    badge: "Bottle",
    caffeine: "None",
    calories: "0 kcal",
    available: true,
    customizable: false
  },
  {
    id: "red-bull",
    name: "Red Bull®",
    category: "soft-drinks",
    price: 3.00,
    description: "8.4 fl oz can",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/ZH2DMMQCKW6VBZQI3MTOWKZQ.jpeg?width=1280&dpr=1",
    popular: false,
    badge: "Energy Can",
    caffeine: "High",
    calories: "110 kcal",
    available: true,
    customizable: false
  },

  // --- KOREAN EGG DROP SANDWICHES & SLIDERS ---
  {
    id: "beef-bulgogi-slider",
    name: "Beef Bulgogi SLIDER",
    category: "korean-egg-drop",
    price: 7.70,
    description: "Marinated Beef, MOMO Signature Soft Scrambled Eggs, Cheddar Cheese & MOMO Sauce **Contains milk, eggs, wheat, soy**",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/NGRVN4DLSKX34F3VCBEF5HIR.png?width=1280&dpr=1",
    popular: false,
    badge: "Slider",
    caffeine: "None",
    calories: "480 kcal",
    available: true,
    customizable: false
  },
  {
    id: "beef-bulgogi-sandwich",
    name: "BEEF BULGOGI SANDWICH",
    category: "korean-egg-drop",
    price: 11.65,
    description: "Marinated Beef, MOMO Signature Soft Scrambled Eggs, Cheddar Cheese, MOMO Sauce & Nori Flakes **Contains milk, eggs, wheat, soy**",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/NE6OSY4QOZLSQLV4R7SA66FX.png?width=1280&dpr=1",
    popular: false,
    badge: "Full Size",
    caffeine: "None",
    calories: "680 kcal",
    available: true,
    customizable: false
  },
  {
    id: "gangnam-double-cheese-sandwich",
    name: "GANGNAM DOUBLE CHEESE SANDWICH",
    category: "korean-egg-drop",
    price: 9.90,
    description: "Double Cheddar Cheese, MOMO Signature Soft Scrambled Eggs & MOMO Sauce **Contains milk, eggs, wheat, soy**",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/5BP3JYAPEZVZN7OCLISORXBU.png?width=1280&dpr=1",
    popular: false,
    badge: "Full Size",
    caffeine: "None",
    calories: "590 kcal",
    available: true,
    customizable: false
  },
  {
    id: "gwangju-bacon-sandwich",
    name: "GWANGJU BACON SANDWICH",
    category: "korean-egg-drop",
    price: 10.25,
    description: "Thick Cut Bacon, MOMO Signature Soft Scrambled Eggs, Cheddar Cheese & MOMO Sauce **Contains milk, eggs, wheat, soy**",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/MKLETGNAIMN6XN3F3PEN5EW7.png?width=1280&dpr=1",
    popular: false,
    badge: "Full Size",
    caffeine: "None",
    calories: "640 kcal",
    available: true,
    customizable: false
  },
  {
    id: "jeju-ham-avocado-sandwich",
    name: "JEJU HAM & AVOCADO SANDWICH",
    category: "korean-egg-drop",
    price: 10.25,
    description: "Premium Ham, Fresh Avocado, MOMO Signature Soft Scrambled Eggs, Cheddar Cheese & MOMO Sauce **Contains milk, eggs, wheat, soy**",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/K2ADBIJ36FPD4NQITZGSEECL.png?width=1280&dpr=1",
    popular: false,
    badge: "Full Size",
    caffeine: "None",
    calories: "620 kcal",
    available: true,
    customizable: false
  },
  {
    id: "seoul-spam-sandwich",
    name: "SEOUL SPAM SANDWICH",
    category: "korean-egg-drop",
    price: 10.25,
    description: "Spam, Nori, MOMO Signature Soft Scrambled Eggs, Cheddar Cheese, MOMO Sauce & Nori Flakes **Contains milk, eggs, wheat, soy**",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/FQEE7UIA7ECUGI7K3HXQ5DKK.png?width=1280&dpr=1",
    popular: false,
    badge: "Full Size",
    caffeine: "None",
    calories: "650 kcal",
    available: true,
    customizable: false
  },
  {
    id: "spicy-pork-sandwich",
    name: "SPICY PORK SANDWICH",
    category: "korean-egg-drop",
    price: 10.90,
    description: "Spicy Korean Pork, MOMO Signature Soft Scrambled Eggs, Cheddar Cheese & MOMO Sauce **Contains milk, eggs, wheat, soy**",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/XH2ESUBN6XBP47BMS5VMDQ3F.png?width=1280&dpr=1",
    popular: false,
    badge: "Spicy",
    caffeine: "None",
    calories: "660 kcal",
    available: true,
    customizable: false
  },
  {
    id: "gwangju-bacon-slider",
    name: "Gwangju Bacon SLIDER",
    category: "korean-egg-drop",
    price: 7.25,
    description: "Thick Cut Bacon, MOMO Signature Soft Scrambled Eggs, Cheddar Cheese & MOMO Sauce **Contains milk, eggs, wheat, soy**",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/VZYHQ57SAZRGJAQMNX22SMLN.png?width=1280&dpr=1",
    popular: false,
    badge: "Slider",
    caffeine: "None",
    calories: "460 kcal",
    available: true,
    customizable: false
  },
  {
    id: "jeju-ham-avocado-slider",
    name: "Jeju Ham & Avocado SLIDER",
    category: "korean-egg-drop",
    price: 7.25,
    description: "Premium Ham, Fresh Avocado, MOMO Signature Soft Scrambled Eggs, Cheddar Cheese & MOMO Sauce **Contains milk, eggs, wheat, soy**",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/IDCGEFSOKOQQEOH4OKWIXLLT.png?width=1280&dpr=1",
    popular: false,
    badge: "Slider",
    caffeine: "None",
    calories: "450 kcal",
    available: true,
    customizable: false
  },
  {
    id: "seoul-spam-slider",
    name: "Seoul Spam SLIDER",
    category: "korean-egg-drop",
    price: 7.25,
    description: "Spam, Nori, MOMO Signature Soft Scrambled Eggs, Cheddar Cheese & MOMO Sauce **Contains milk, eggs, wheat, soy**",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/TZFEWLKXA4EQOW2JQ32CZ6RD.png?width=1280&dpr=1",
    popular: false,
    badge: "Slider",
    caffeine: "None",
    calories: "470 kcal",
    available: true,
    customizable: false
  },
  {
    id: "spicy-pork-slider",
    name: "Spicy Pork SLIDER",
    category: "korean-egg-drop",
    price: 7.70,
    description: "Spicy Korean Pork, MOMO Signature Soft Scrambled Eggs, Cheddar Cheese & MOMO Sauce **Contains milk, eggs, wheat, soy**",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/XFTWKVQJU5ESL25WWIM7YOUH.png?width=1280&dpr=1",
    popular: false,
    badge: "Spicy Slider",
    caffeine: "None",
    calories: "480 kcal",
    available: true,
    customizable: false
  },

  // --- VIETNAMESE BANH MI ---
  {
    id: "vietnamese-banh-mi-garlic-chicken",
    name: "Garlic Chicken Banh Mi",
    category: "banh-mi",
    price: 8.00,
    description: "A fresh, crusty baguette loaded with juicy, garlic-marinated chicken, crisp pickled carrots and daikon, fresh cilantro, and rich homemade mayonnaise. Bursting with savory garlic flavor and balanced with tangy, refreshing pickles for the perfect bite.",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/5OUFV6D6I6KKFLQ73OW2SIV7.jpeg?width=1280&dpr=1",
    popular: false,
    badge: "Vietnamese",
    caffeine: "None",
    calories: "550 kcal",
    available: true,
    customizable: false
  },
  {
    id: "vietnamese-banh-mi-beef",
    name: "Beef Banh Mi",
    category: "banh-mi",
    price: 9.50,
    description: "Tender slices of premium beef, marinated and griddled to perfection, served in a warm, crusty French baguette. Finished with our homemade sate sauce, pickled carrots and daikon, fresh cilantro, and a touch of creamy house-made mayonnaise. A rich and flavorful take on the classic banh mi.",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/5OUFV6D6I6KKFLQ73OW2SIV7.jpeg?width=1280&dpr=1",
    popular: false,
    badge: "Vietnamese",
    caffeine: "None",
    calories: "620 kcal",
    available: true,
    customizable: false
  },
  {
    id: "vietnamese-banh-mi-pork",
    name: "Pork Banh Mi",
    category: "banh-mi",
    price: 8.00,
    description: "A Vietnamese-style sandwich made with a fresh, crusty baguette filled with tender, marinated pork, crisp pickled carrots and daikon, fresh cilantro, and rich homemade mayonnaise. Balanced with savory and tangy flavors for a delicious, satisfying bite.",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/7THQI3WHBTW7MDG5NDFHKZJV.jpeg?width=1280&dpr=1",
    popular: false,
    badge: "Vietnamese",
    caffeine: "None",
    calories: "580 kcal",
    available: true,
    customizable: false
  },
  {
    id: "vietnamese-banh-mi-traditional-cold-ham",
    name: "Traditional Cold Ham Banh Mi",
    category: "banh-mi",
    price: 8.00,
    description: "A traditional Vietnamese cold ham banh mi in a crispy French baguette with pate, homemade mayo, pickled vegetables, and cilantro. CONTAINS PORK!",
    image: "https://152864630.cdn6.editmysite.com/uploads/1/5/2/8/152864630/5OUFV6D6I6KKFLQ73OW2SIV7.jpeg?width=1280&dpr=1",
    popular: false,
    badge: "Vietnamese",
    caffeine: "None",
    calories: "540 kcal",
    available: true,
    customizable: false
  }
];

async function updateDatabase() {
  console.log('🚀 Updating MiTea Menu in Supabase Database...');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase credentials in .env.local');
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // 1. Delete dependent order items and orders to prevent foreign key issues
  console.log('🗑️  Clearing test order items and orders...');
  await supabase.from('order_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // 2. Remove all old products from menu_items
  console.log('🗑️  Removing all existing products from menu_items...');
  const { error: delError } = await supabase
    .from('menu_items')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (delError) {
    console.error('Failed to delete old menu items:', delError);
    throw delError;
  }
  console.log('✅ All old menu items removed!');

  // 3. Upsert new categories
  console.log(`📦 Upserting ${NEW_CATEGORIES.length} categories...`);
  const categoryRecords = NEW_CATEGORIES.map((cat, idx) => ({
    slug: cat.id,
    name: cat.name,
    icon: cat.icon,
    display_order: idx,
  }));

  const { data: insertedCategories, error: catError } = await supabase
    .from('categories')
    .upsert(categoryRecords, { onConflict: 'slug' })
    .select('id, slug');

  if (catError) throw new Error(`Category upsert error: ${catError.message}`);

  const categoryMap = new Map<string, string>();
  insertedCategories?.forEach((cat) => {
    categoryMap.set(cat.slug, cat.id);
  });

  // 4. Insert all new menu items (ALL AVAILABLE / IN STOCK)
  console.log(`📦 Inserting ${NEW_ITEMS.length} new menu items (All in stock)...`);
  const itemRows = NEW_ITEMS.map((item, idx) => {
    const categoryId = categoryMap.get(item.category);
    if (!categoryId) {
      throw new Error(`Category ${item.category} not found for item ${item.name}`);
    }

    return {
      slug: item.id,
      category_id: categoryId,
      name: item.name,
      price: item.price,
      description: item.description,
      image_url: item.image,
      is_popular: item.popular,
      badge: item.badge || null,
      caffeine: item.caffeine || null,
      calories: item.calories || null,
      is_available: true, // ALL IN STOCK as requested!
      is_customizable: item.customizable,
      display_order: idx,
    };
  });

  const { data: insertedItems, error: itemError } = await supabase
    .from('menu_items')
    .insert(itemRows)
    .select('id, slug, name, is_available');

  if (itemError) {
    console.error('Failed to insert new menu items:', itemError);
    throw itemError;
  }

  console.log(`🎉 Successfully inserted ${insertedItems?.length} products into Supabase! All in stock.`);
}

updateDatabase().catch((err) => {
  console.error('Error during menu update:', err);
  process.exit(1);
});
