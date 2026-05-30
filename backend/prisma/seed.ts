import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const BCRYPT_ROUNDS = 10;
const DEMO_PASSWORD = 'Password123!';
const ADMIN_LOGIN = 'admin';
const ADMIN_PASSWORD = 'adminadmin';

/** Stable product images (picsum seeds avoid broken Unsplash links). */
function productImage(tenantSlug: string, key: string): string {
  const seed = `${tenantSlug}-${key}`.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  return `https://picsum.photos/seed/${seed}/800/800`;
}

type SeedProduct = {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string;
};

type SeedTenant = {
  name: string;
  slug: string;
  email: string;
  storeName: string;
  storeDescription: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  bannerUrl: string;
  categories: string[];
  products: SeedProduct[];
};

const sampleTenants: SeedTenant[] = [
  {
    name: 'Tech Store',
    slug: 'tech-store',
    email: 'admin@tech-store.local',
    storeName: 'Tech Store',
    storeDescription:
      'Cutting-edge laptops, phones, and accessories for work and play.',
    primaryColor: '#4f46e5',
    secondaryColor: '#7c3aed',
    logoUrl:
      'https://images.unsplash.com/photo-1491933382434-500287f9b54b?w=200&h=200&fit=crop',
    bannerUrl:
      'https://images.unsplash.com/photo-1491933382434-500287f9b54b?w=1200',
    categories: ['Laptops', 'Phones', 'Accessories'],
    products: [
      {
        name: 'Pro Laptop 15"',
        description:
          '15-inch display, 16GB RAM, 512GB SSD. Built for developers and creators who need speed on the go.',
        price: 1299.99,
        stock: 25,
        category: 'Laptops',
        imageUrl: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800',
      },
      {
        name: 'UltraBook Air 13"',
        description:
          'Feather-light chassis, all-day battery, and a vibrant Retina-class screen for travel-friendly productivity.',
        price: 999.0,
        stock: 30,
        category: 'Laptops',
        imageUrl: 'https://images.unsplash.com/photo-1625766763788-95dcce9bf5ac?w=800',
      },
      {
        name: 'Asus Gaming 17"',
        description:
          '17-inch 4K panel, 32GB RAM, RTX graphics — built for video editors and 3D artists.',
        price: 1899.99,
        stock: 12,
        category: 'Laptops',
        imageUrl: 'https://images.unsplash.com/photo-1630794180018-433d915c34ac?w=800',
      },
      {
        name: 'Student Chromebook 14"',
        description:
          'Lightweight everyday laptop with all-day battery and a crisp full HD display.',
        price: 449.99,
        stock: 45,
        category: 'Laptops',
        imageUrl: 'https://images.unsplash.com/photo-1616499452581-cc7f8e3dd3c9?w=800',
      },
      {
        name: 'Galaxy Ultra Phone',
        description:
          '200MP camera, 120Hz AMOLED display, and 5G connectivity in a premium glass-and-metal body.',
        price: 899.0,
        stock: 40,
        category: 'Phones',
        imageUrl:
          'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800',
      },
      {
        name: 'Xiaomi Android',
        description:
          'Pure Android experience, exceptional computational photography, and one-handed ergonomics.',
        price: 649.99,
        stock: 55,
        category: 'Phones',
        imageUrl:
          'https://images.unsplash.com/photo-1701696255815-14a98bc1afcd?w=800',
      },
      {
        name: 'Studio Wireless Earbuds',
        description:
          'Active noise cancellation, spatial audio, and 32 hours total battery with the charging case.',
        price: 149.99,
        stock: 100,
        category: 'Accessories',
        imageUrl:
          'https://plus.unsplash.com/premium_photo-1678099940967-73fe30680949?w=800',
      },
      {
        name: 'Mechanical RGB Keyboard',
        description:
          'Hot-swappable switches, per-key RGB, and USB-C — ideal for gaming sessions and long typing days.',
        price: 89.99,
        stock: 60,
        category: 'Accessories',
        imageUrl:
          'https://images.unsplash.com/photo-1595044426077-d36d9236d54a?w=800',
      },
      {
        name: 'Fold Pro Phone',
        description:
          'Foldable AMOLED display, multitasking modes, and flagship performance in a pocketable form.',
        price: 1199.0,
        stock: 20,
        category: 'Phones',
        imageUrl: 'https://images.unsplash.com/photo-1592813630413-1124aa567638?w=800',
      },
      {
        name: 'Budget Smart 5G',
        description:
          'Large battery, 90Hz screen, and dual cameras — everyday connectivity without the flagship price.',
        price: 299.99,
        stock: 70,
        category: 'Phones',
        imageUrl: 'https://images.unsplash.com/photo-1653629213421-83a13907003f?w=800',
      },
      {
        name: 'USB-C Hub 7-in-1',
        description:
          'HDMI, SD card reader, and pass-through charging for laptops and tablets on the go.',
        price: 49.99,
        stock: 85,
        category: 'Accessories',
        imageUrl: 'https://images.unsplash.com/photo-1760376789487-994070337c76?w=800',
      },
      {
        name: '4K Webcam Pro',
        description:
          'Auto-focus lens, dual microphones, and privacy shutter for crisp video calls and streams.',
        price: 79.99,
        stock: 55,
        category: 'Accessories',
        imageUrl: 'https://images.unsplash.com/photo-1623949556303-b0d17d198863?w=800',
      },
    ],
  },
  {
    name: 'Fashion Hub',
    slug: 'fashion-hub',
    email: 'admin@fashion-hub.local',
    storeName: 'Fashion Hub',
    storeDescription:
      'Curated styles for every season — from streetwear to evening looks.',
    primaryColor: '#db2777',
    secondaryColor: '#9d174d',
    logoUrl:
      'https://images.unsplash.com/photo-1445205170230-053b83016050?w=200&h=200&fit=crop',
    bannerUrl:
      'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200',
    categories: ['Men', 'Women', 'Accessories'],
    products: [
      {
        name: 'Classic Denim Jacket',
        description:
          'Medium-wash denim with brass buttons and a relaxed fit — layers perfectly over tees and hoodies.',
        price: 79.99,
        stock: 35,
        category: 'Men',
        imageUrl:
          'https://images.unsplash.com/photo-1577660002965-04865592fc60?w=800',
      },
      {
        name: 'Slim Chino Trousers',
        description:
          'Stretch cotton blend in navy, tailored taper, and wrinkle-resistant finish for office or weekend.',
        price: 54.99,
        stock: 48,
        category: 'Men',
        imageUrl:
          'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800',
      },
      {
        name: 'Summer Floral Midi Dress',
        description:
          'Breathable viscose with a cinched waist and flutter sleeves — made for brunches and vacations.',
        price: 59.99,
        stock: 50,
        category: 'Women',
        imageUrl:
          'https://images.unsplash.com/photo-1511130558090-00af810c21b1?w=800',
      },
      {
        name: 'Wool Blend Trench Coat',
        description:
          'Double-breasted silhouette, satin lining, and water-repellent treatment for transitional weather.',
        price: 189.0,
        stock: 22,
        category: 'Women',
        imageUrl:
          'https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=800',
      },
      {
        name: 'Leather Crossbody Bag',
        description:
          'Full-grain leather, adjustable strap, and RFID-blocking pocket for cards on the go.',
        price: 119.0,
        stock: 28,
        category: 'Accessories',
        imageUrl:
          'https://images.unsplash.com/photo-1718622795525-2295971921ba?w=800',
      },
      {
        name: 'Polarized Aviator Sunglasses',
        description:
          'UV400 lenses, lightweight metal frame, and a timeless shape that suits most face types.',
        price: 45.0,
        stock: 75,
        category: 'Accessories',
        imageUrl:
          'https://images.unsplash.com/photo-1567473810954-507d59716c25?w=800',
      },
      {
        name: 'Merino Crew Sweater',
        description:
          'Soft merino wool, ribbed cuffs, and a relaxed fit for layering through cooler months.',
        price: 69.99,
        stock: 40,
        category: 'Men',
        imageUrl: 'https://images.unsplash.com/photo-1604573824419-289a9a10672c?w=800',
      },
      {
        name: 'Performance Running Tee',
        description:
          'Moisture-wicking fabric with reflective details for early-morning and evening runs.',
        price: 34.99,
        stock: 60,
        category: 'Men',
        imageUrl: 'https://images.unsplash.com/photo-1623285512357-ff3b9a7579ea?w=800',
      },
      {
        name: 'High-Rise Wide Leg Jeans',
        description:
          'Vintage wash denim with a flattering high rise and relaxed wide leg silhouette.',
        price: 64.99,
        stock: 44,
        category: 'Women',
        imageUrl: 'https://images.unsplash.com/photo-1616956455145-7c40e34a1c2a?w=800',
      },
      {
        name: 'Silk Blend Blouse',
        description:
          'Draped neckline and lightweight silk blend — office-ready or evening out.',
        price: 49.99,
        stock: 38,
        category: 'Women',
        imageUrl: 'https://images.unsplash.com/photo-1772855436877-3fe7489f4199?w=800',
      },
      {
        name: 'Canvas Belt Bag',
        description:
          'Hands-free crossbody with multiple zip pockets and adjustable webbing strap.',
        price: 39.0,
        stock: 55,
        category: 'Accessories',
        imageUrl: 'https://images.unsplash.com/photo-1707320184416-1f8bd31a4299?w=800',
      },
      {
        name: 'Wool Fedora Hat',
        description:
          'Structured brim and grosgrain band — finishes casual and smart-casual looks.',
        price: 55.0,
        stock: 30,
        category: 'Accessories',
        imageUrl: 'https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?w=800',
      },
    ],
  },
  {
    name: 'Home Goods',
    slug: 'home-goods',
    email: 'admin@home-goods.local',
    storeName: 'Home & Living',
    storeDescription:
      'Thoughtful pieces for kitchens, living spaces, and cozy corners.',
    primaryColor: '#059669',
    secondaryColor: '#047857',
    logoUrl:
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200&h=200&fit=crop',
    bannerUrl:
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200',
    categories: ['Kitchen', 'Decor', 'Furniture'],
    products: [
      {
        name: 'Ceramic Dinner Set (12pc)',
        description:
          'Microwave-safe stoneware in matte sage — includes dinner plates, bowls, and mugs for four.',
        price: 64.99,
        stock: 45,
        category: 'Kitchen',
        imageUrl:
          'https://images.unsplash.com/photo-1631008789162-950869f41805?w=800',
      },
      {
        name: 'Cast Iron Dutch Oven',
        description:
          '5.5-quart enameled pot for bread, stews, and slow roasts — oven-safe to 500°F.',
        price: 89.99,
        stock: 32,
        category: 'Kitchen',
        imageUrl:
          'https://images.unsplash.com/photo-1677274207889-8466cc7e2198?w=800',
      },
      {
        name: 'Minimal Arc Table Lamp',
        description:
          'Warm 2700K LED, dimmable touch base, and a linen shade that softens light in bedrooms and offices.',
        price: 42.5,
        stock: 70,
        category: 'Decor',
        imageUrl:
          'https://images.unsplash.com/photo-1620812067822-899be8a6a9a7?w=800',
      },
      {
        name: 'Handwoven Wall Tapestry',
        description:
          'Cotton blend in earth tones — adds texture above sofas or beds without framing required.',
        price: 38.0,
        stock: 40,
        category: 'Decor',
        imageUrl:
          'https://images.unsplash.com/photo-1580661485007-c7d629416f73?w=800',
      },
      {
        name: 'Velvet Lounge Chair',
        description:
          'Solid oak legs, high-density foam, and stain-resistant velvet upholstery in forest green.',
        price: 249.0,
        stock: 15,
        category: 'Furniture',
        imageUrl:
          'https://images.unsplash.com/photo-1713441649678-b08feb0e4da6?w=800',
      },
      {
        name: 'Extendable Dining Table',
        description:
          'Seats six standard, eight extended — scratch-resistant top and a natural oak veneer finish.',
        price: 449.0,
        stock: 10,
        category: 'Furniture',
        imageUrl:
          'https://images.unsplash.com/photo-1758977403826-01e2c8a3f68f?w=800',
      },
      {
        name: 'Stainless Knife Set (6pc)',
        description:
          'Full-tang blades with ergonomic handles and a wooden block for countertop storage.',
        price: 79.99,
        stock: 28,
        category: 'Kitchen',
        imageUrl: 'https://images.unsplash.com/photo-1577398628388-516477602b3b?w=800',
      },
      {
        name: 'Glass Food Storage Set',
        description:
          'Oven-safe glass containers with snap lids — meal prep and leftovers made easy.',
        price: 44.99,
        stock: 50,
        category: 'Kitchen',
        imageUrl: 'https://images.unsplash.com/photo-1681146375786-07ca2c058ce1?w=800',
      },
      {
        name: 'Scented Candle Trio',
        description:
          'Soy wax candles in cedar, linen, and bergamot — 45-hour burn time each.',
        price: 32.0,
        stock: 65,
        category: 'Decor',
        imageUrl: 'https://images.unsplash.com/photo-1603905179139-db12ab535ca9?w=800',
      },
      {
        name: 'Ceramic Planter Set',
        description:
          'Three matte-finish planters with drainage trays for indoor greenery.',
        price: 28.5,
        stock: 48,
        category: 'Decor',
        imageUrl: 'https://images.unsplash.com/photo-1701270631258-ca1a2edbd9c5?w=800',
      },
      {
        name: 'Oak Table',
        description:
          'Compact sofa table with a lower shelf for books and remotes.',
        price: 129.0,
        stock: 18,
        category: 'Furniture',
        imageUrl: 'https://images.unsplash.com/photo-1557784415-3bdc60b1c02b?w=800',
      },
      {
        name: 'Bookshelf Ladder 5-Tier',
        description:
          'Leaning bookshelf in black matte — ideal for living rooms and home offices.',
        price: 179.0,
        stock: 14,
        category: 'Furniture',
        imageUrl: 'https://images.unsplash.com/photo-1535905557558-afc4877a26fc?w=800',
      },
    ],
  },
  {
    name: 'Sports World',
    slug: 'sports-world',
    email: 'admin@sports-world.local',
    storeName: 'Sports World',
    storeDescription:
      'Performance gear for runners, gym-goers, and outdoor adventurers.',
    primaryColor: '#d97706',
    secondaryColor: '#b45309',
    logoUrl:
      'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=200&h=200&fit=crop',
    bannerUrl:
      'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200',
    categories: ['Running', 'Training', 'Outdoor'],
    products: [
      {
        name: 'Velocity Running Shoes',
        description:
          'Responsive foam midsole, breathable mesh upper, and reflective accents for dawn or dusk miles.',
        price: 129.99,
        stock: 55,
        category: 'Running',
        imageUrl:
          'https://images.unsplash.com/photo-1778617845293-d4ef3912a07e?w=800',
      },
      {
        name: 'Trail Grip Runners',
        description:
          'Aggressive lug outsole, rock plate, and waterproof membrane for muddy paths and wet roots.',
        price: 149.99,
        stock: 38,
        category: 'Running',
        imageUrl:
          'https://images.unsplash.com/photo-1761942028415-8e2a768592c9?w=800',
      },
      {
        name: 'Pro Yoga Mat 6mm',
        description:
          'Non-slip natural rubber, alignment guides, and a carrying strap — studio or home practice ready.',
        price: 39.99,
        stock: 80,
        category: 'Training',
        imageUrl:
          'https://images.unsplash.com/photo-1637157216470-d92cd2edb2e8?w=800',
      },
      {
        name: 'Adjustable Kettlebell Set',
        description:
          'Dial from 8–32 kg in one unit — saves space and supports strength circuits and HIIT.',
        price: 199.0,
        stock: 25,
        category: 'Training',
        imageUrl:
          'https://images.unsplash.com/photo-1632077804406-188472f1a810?w=800',
      },
      {
        name: 'Summit Hiking Backpack 40L',
        description:
          'Ventilated back panel, rain cover included, and multiple access points for multi-day treks.',
        price: 89.0,
        stock: 30,
        category: 'Outdoor',
        imageUrl:
          'https://images.unsplash.com/photo-1611322469983-a1566bc25fa9?w=800',
      },
      {
        name: 'Insulated Hydration Pack',
        description:
          '2L bladder, tube insulation for hot days, and chest pockets for gels and a phone on the trail.',
        price: 59.99,
        stock: 42,
        category: 'Outdoor',
        imageUrl:
          'https://images.unsplash.com/photo-1621786875634-d3e2fa4101f7?w=800',
      },
      {
        name: 'Marathon Racing Flats',
        description:
          'Carbon plate and featherweight upper tuned for race day speed on the road.',
        price: 179.99,
        stock: 32,
        category: 'Running',
        imageUrl: 'https://images.unsplash.com/photo-1547941126-3d5322b218b0?w=800',
      },
      {
        name: 'Recovery Slide Sandals',
        description:
          'Plush footbed and supportive strap — post-workout comfort for tired feet.',
        price: 39.99,
        stock: 60,
        category: 'Running',
        imageUrl: 'https://images.unsplash.com/photo-1633281651728-b7f0bd1f3eaa?w=800',
      },
      {
        name: 'Resistance Band Set',
        description:
          'Five latex bands with door anchor and carry pouch for home strength training.',
        price: 24.99,
        stock: 90,
        category: 'Training',
        imageUrl: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800',
      },
      {
        name: 'Foam Roller Pro',
        description:
          'High-density foam with textured zones for muscle recovery and mobility work.',
        price: 29.99,
        stock: 55,
        category: 'Training',
        imageUrl: 'https://images.unsplash.com/photo-1591741535585-9c4f52b3f13f?w=800',
      },
      {
        name: 'Camping Headlamp',
        description:
          'USB rechargeable, red night mode, and IPX4 water resistance for trails.',
        price: 34.0,
        stock: 48,
        category: 'Outdoor',
        imageUrl: 'https://images.unsplash.com/photo-1630275383125-2ecfa5f431d5?w=800',
      },
      {
        name: 'Trekking Poles (Pair)',
        description:
          'Lightweight aluminum with cork grips and quick-lock adjustment for hikers.',
        price: 49.99,
        stock: 36,
        category: 'Outdoor',
        imageUrl: 'https://images.unsplash.com/photo-1776006534692-2c35e298732a?w=800',
      },
    ],
  },
  {
    name: 'Gourmet Pantry',
    slug: 'gourmet-pantry',
    email: 'admin@gourmet-pantry.local',
    storeName: 'Gourmet Pantry',
    storeDescription:
      'Artisan foods, specialty ingredients, and gifts for food lovers.',
    primaryColor: '#b45309',
    secondaryColor: '#78350f',
    logoUrl:
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200&h=200&fit=crop',
    bannerUrl:
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200',
    categories: ['Pantry', 'Beverages', 'Gifts'],
    products: [
      {
        name: 'Extra Virgin Olive Oil 500ml',
        description:
          'Cold-pressed from single-estate Koroneiki olives — peppery finish ideal for salads and finishing dishes.',
        price: 18.99,
        stock: 90,
        category: 'Pantry',
        imageUrl:
          'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800',
      },
      {
        name: 'Aged Balsamic Vinegar',
        description:
          '12-year Modena DOP with syrupy sweetness — drizzle over strawberries, parmesan, or grilled vegetables.',
        price: 24.5,
        stock: 65,
        category: 'Pantry',
        imageUrl:
          'https://images.unsplash.com/photo-1499126167718-c87f5c1387e8?w=800',
      },
      {
        name: 'Single-Origin Coffee Beans',
        description:
          'Ethiopian Yirgacheffe, medium roast — notes of bergamot and jasmine, 340g whole bean.',
        price: 16.99,
        stock: 120,
        category: 'Beverages',
        imageUrl:
          'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800',
      },
      {
        name: 'Ceremonial Matcha Tin',
        description:
          'Stone-ground Uji matcha for whisked tea or lattes — vibrant color and umami-rich flavor.',
        price: 28.0,
        stock: 50,
        category: 'Beverages',
        imageUrl:
          'https://images.unsplash.com/photo-1565117711038-1e0a80eed005?w=800',
      },
      {
        name: 'Artisan Chocolate Gift Box',
        description:
          'Twelve handcrafted truffles — dark, milk, and sea-salt caramel in a reusable ribboned box.',
        price: 34.99,
        stock: 40,
        category: 'Gifts',
        imageUrl:
          'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=800',
      },
      {
        name: 'Gourmet Spice Collection',
        description:
          'Six small-batch blends in glass jars — includes za\'atar, vadouvan, and smoked paprika with recipe cards.',
        price: 42.0,
        stock: 35,
        category: 'Gifts',
        imageUrl:
          'https://images.unsplash.com/photo-1591272216626-b09e38519371?w=800',
      },
      {
        name: 'Truffle Infused Honey',
        description:
          'Wildflower honey with black truffle — drizzle over cheese, pizza, or roasted vegetables.',
        price: 22.0,
        stock: 40,
        category: 'Pantry',
        imageUrl: 'https://images.unsplash.com/photo-1654515722385-c684c5331c04?w=800',
      },
      {
        name: 'Sourdough Bread Mix',
        description:
          'Stone-ground flour blend with starter instructions for bakery-style loaves at home.',
        price: 12.5,
        stock: 75,
        category: 'Pantry',
        imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800',
      },
      {
        name: 'Sparkling Elderflower',
        description:
          'Botanical sparkling water with elderflower — zero alcohol, 750ml bottle.',
        price: 8.99,
        stock: 100,
        category: 'Beverages',
        imageUrl: 'https://images.unsplash.com/photo-1588184069951-e8a1c47be70f?w=800',
      },
      {
        name: 'Cold Brew Concentrate',
        description:
          'Slow-steeped coffee concentrate — makes 12 iced coffees when diluted.',
        price: 14.99,
        stock: 55,
        category: 'Beverages',
        imageUrl: 'https://images.unsplash.com/photo-1591260201798-e714889b17f3?w=800',
      },
      {
        name: 'Gourmet Nut Gift Tin',
        description:
          'Roasted almonds, cashews, and pistachios with sea salt — reusable gift tin.',
        price: 29.99,
        stock: 42,
        category: 'Gifts',
        imageUrl: 'https://images.unsplash.com/photo-1769255484646-16988ad5552d?w=800',
      },
      {
        name: 'Artisan Jam Trio',
        description:
          'Strawberry basil, fig, and apricot preserves in glass jars with ribbon set.',
        price: 26.0,
        stock: 38,
        category: 'Gifts',
        imageUrl: 'https://images.unsplash.com/photo-1618680705029-96d0af7e24ca?w=800',
      },
    ],
  },
];

function validateTenantProducts(tenant: SeedTenant) {
  const counts = new Map<string, number>();
  for (const product of tenant.products) {
    counts.set(product.category, (counts.get(product.category) ?? 0) + 1);
  }
  for (const category of tenant.categories) {
    const count = counts.get(category) ?? 0;
    if (count < 2) {
      throw new Error(
        `Tenant "${tenant.slug}" category "${category}" has ${count} product(s); need at least 2.`,
      );
    }
  }
}

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, BCRYPT_ROUNDS);
  const adminPasswordHash = await bcrypt.hash(ADMIN_PASSWORD, BCRYPT_ROUNDS);

  console.log('\n--- Seeding database (5 shops) ---\n');

  for (const tenantData of sampleTenants) {
    validateTenantProducts(tenantData);

    const tenant = await prisma.tenant.upsert({
      where: { slug: tenantData.slug },
      update: {
        name: tenantData.name,
        email: tenantData.email,
        primaryColor: tenantData.primaryColor,
        secondaryColor: tenantData.secondaryColor,
        storeName: tenantData.storeName,
        storeDescription: tenantData.storeDescription,
        logoUrl: tenantData.logoUrl,
        bannerUrl: tenantData.bannerUrl,
        isActive: true,
      },
      create: {
        name: tenantData.name,
        slug: tenantData.slug,
        email: tenantData.email,
        primaryColor: tenantData.primaryColor,
        secondaryColor: tenantData.secondaryColor,
        storeName: tenantData.storeName,
        storeDescription: tenantData.storeDescription,
        logoUrl: tenantData.logoUrl,
        bannerUrl: tenantData.bannerUrl,
        isActive: true,
      },
    });

    const categoryMap = new Map<string, number>();
    for (const categoryName of tenantData.categories) {
      const category = await prisma.category.upsert({
        where: {
          tenantId_name: { tenantId: tenant.id, name: categoryName },
        },
        update: {},
        create: { name: categoryName, tenantId: tenant.id },
      });
      categoryMap.set(categoryName, category.id);
    }

    for (const product of tenantData.products) {
      const categoryId = categoryMap.get(product.category);
      if (!categoryId) continue;

      const imageKey = product.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      const imageUrl =
        product.imageUrl.includes('picsum.photos') ||
          product.imageUrl.includes('unsplash.com')
          ? product.imageUrl
          : productImage(tenantData.slug, imageKey);

      const existing = await prisma.product.findFirst({
        where: { tenantId: tenant.id, name: product.name },
      });

      if (existing) {
        await prisma.product.update({
          where: { id: existing.id },
          data: {
            description: product.description,
            price: product.price,
            stock: product.stock,
            categoryId,
            imageUrl,
          },
        });
        await prisma.productImage.deleteMany({
          where: { productId: existing.id },
        });
        await prisma.productImage.create({
          data: {
            productId: existing.id,
            url: imageUrl,
            publicId: '',
            isPrimary: true,
          },
        });
      } else {
        await prisma.product.create({
          data: {
            name: product.name,
            description: product.description,
            price: product.price,
            stock: product.stock,
            categoryId,
            tenantId: tenant.id,
            imageUrl,
            images: {
              create: { url: imageUrl, publicId: '', isPrimary: true },
            },
          },
        });
      }
    }

    const customerEmail = `customer@${tenantData.slug}.local`;
    await prisma.user.upsert({
      where: {
        tenantId_email: { tenantId: tenant.id, email: customerEmail },
      },
      update: {
        name: 'Demo Customer',
        password: passwordHash,
        role: UserRole.CUSTOMER,
      },
      create: {
        email: customerEmail,
        name: 'Demo Customer',
        password: passwordHash,
        tenantId: tenant.id,
        role: UserRole.CUSTOMER,
      },
    });

    const existingAdmin = await prisma.user.findFirst({
      where: { tenantId: tenant.id, role: UserRole.ADMIN },
    });

    if (existingAdmin) {
      await prisma.user.update({
        where: { id: existingAdmin.id },
        data: {
          email: ADMIN_LOGIN,
          name: 'Store Admin',
          password: adminPasswordHash,
          role: UserRole.ADMIN,
        },
      });
    } else {
      await prisma.user.create({
        data: {
          email: ADMIN_LOGIN,
          name: 'Store Admin',
          password: adminPasswordHash,
          tenantId: tenant.id,
          role: UserRole.ADMIN,
        },
      });
    }

    const productCount = tenantData.products.length;
    console.log(`✓ ${tenantData.storeName} (${tenantData.slug})`);
    console.log(
      `    ${tenantData.categories.length} categories, ${productCount} products`,
    );
    console.log(`    Theme: ${tenantData.primaryColor} / ${tenantData.secondaryColor}`);
    console.log(`    Customer: ${customerEmail} / ${DEMO_PASSWORD}`);
    console.log(`    Admin:    ${ADMIN_LOGIN} / ${ADMIN_PASSWORD}`);
  }

  console.log('\n--- Seed complete: 5 shops ready ---\n');
}

for (const tenant of sampleTenants) {
  validateTenantProducts(tenant);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });