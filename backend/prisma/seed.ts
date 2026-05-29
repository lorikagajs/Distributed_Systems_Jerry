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
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&h=200&fit=crop',
    bannerUrl:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200',
    categories: ['Laptops', 'Phones', 'Accessories'],
    products: [
      {
        name: 'Pro Laptop 15"',
        description:
          '15-inch display, 16GB RAM, 512GB SSD. Built for developers and creators who need speed on the go.',
        price: 1299.99,
        stock: 25,
        category: 'Laptops',
        imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
      },
      {
        name: 'UltraBook Air 13"',
        description:
          'Feather-light chassis, all-day battery, and a vibrant Retina-class screen for travel-friendly productivity.',
        price: 999.0,
        stock: 30,
        category: 'Laptops',
        imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',
      },
      {
        name: 'Creator Workstation 17"',
        description:
          '17-inch 4K panel, 32GB RAM, RTX graphics — built for video editors and 3D artists.',
        price: 1899.99,
        stock: 12,
        category: 'Laptops',
        imageUrl: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800',
      },
      {
        name: 'Student Chromebook 14"',
        description:
          'Lightweight everyday laptop with all-day battery and a crisp full HD display.',
        price: 449.99,
        stock: 45,
        category: 'Laptops',
        imageUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800',
      },
      {
        name: 'Galaxy Ultra Phone',
        description:
          '200MP camera, 120Hz AMOLED display, and 5G connectivity in a premium glass-and-metal body.',
        price: 899.0,
        stock: 40,
        category: 'Phones',
        imageUrl:
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
      },
      {
        name: 'Pixel Compact',
        description:
          'Pure Android experience, exceptional computational photography, and one-handed ergonomics.',
        price: 649.99,
        stock: 55,
        category: 'Phones',
        imageUrl:
          'https://images.unsplash.com/photo-1598327666105-d7ce1f2b2c8b?w=800',
      },
      {
        name: 'Studio Wireless Earbuds',
        description:
          'Active noise cancellation, spatial audio, and 32 hours total battery with the charging case.',
        price: 149.99,
        stock: 100,
        category: 'Accessories',
        imageUrl:
          'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800',
      },
      {
        name: 'Mechanical RGB Keyboard',
        description:
          'Hot-swappable switches, per-key RGB, and USB-C — ideal for gaming sessions and long typing days.',
        price: 89.99,
        stock: 60,
        category: 'Accessories',
        imageUrl:
          'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800',
      },
      {
        name: 'Fold Pro Phone',
        description:
          'Foldable AMOLED display, multitasking modes, and flagship performance in a pocketable form.',
        price: 1199.0,
        stock: 20,
        category: 'Phones',
        imageUrl: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800',
      },
      {
        name: 'Budget Smart 5G',
        description:
          'Large battery, 90Hz screen, and dual cameras — everyday connectivity without the flagship price.',
        price: 299.99,
        stock: 70,
        category: 'Phones',
        imageUrl: 'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=800',
      },
      {
        name: 'USB-C Hub 7-in-1',
        description:
          'HDMI, SD card reader, and pass-through charging for laptops and tablets on the go.',
        price: 49.99,
        stock: 85,
        category: 'Accessories',
        imageUrl: 'https://images.unsplash.com/photo-1628198751554-b5ab58ffdf8e?w=800',
      },
      {
        name: '4K Webcam Pro',
        description:
          'Auto-focus lens, dual microphones, and privacy shutter for crisp video calls and streams.',
        price: 79.99,
        stock: 55,
        category: 'Accessories',
        imageUrl: 'https://images.unsplash.com/photo-1521742468307-2c13d7c50a10?w=800',
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
      'https://images.unsplash.com/photo-1441984904996-e0b6a778b4ad?w=1200',
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
          'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
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
          'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800',
      },
      {
        name: 'Wool Blend Trench Coat',
        description:
          'Double-breasted silhouette, satin lining, and water-repellent treatment for transitional weather.',
        price: 189.0,
        stock: 22,
        category: 'Women',
        imageUrl:
          'https://images.unsplash.com/photo-1539533018447-63fcce2678a3?w=800',
      },
      {
        name: 'Leather Crossbody Bag',
        description:
          'Full-grain leather, adjustable strap, and RFID-blocking pocket for cards on the go.',
        price: 119.0,
        stock: 28,
        category: 'Accessories',
        imageUrl:
          'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800',
      },
      {
        name: 'Polarized Aviator Sunglasses',
        description:
          'UV400 lenses, lightweight metal frame, and a timeless shape that suits most face types.',
        price: 45.0,
        stock: 75,
        category: 'Accessories',
        imageUrl:
          'https://images.unsplash.com/photo-1572635196233-159ce42f4b1d?w=800',
      },
      {
        name: 'Merino Crew Sweater',
        description:
          'Soft merino wool, ribbed cuffs, and a relaxed fit for layering through cooler months.',
        price: 69.99,
        stock: 40,
        category: 'Men',
        imageUrl: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800',
      },
      {
        name: 'Performance Running Tee',
        description:
          'Moisture-wicking fabric with reflective details for early-morning and evening runs.',
        price: 34.99,
        stock: 60,
        category: 'Men',
        imageUrl: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800',
      },
      {
        name: 'High-Rise Wide Leg Jeans',
        description:
          'Vintage wash denim with a flattering high rise and relaxed wide leg silhouette.',
        price: 64.99,
        stock: 44,
        category: 'Women',
        imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800',
      },
      {
        name: 'Silk Blend Blouse',
        description:
          'Draped neckline and lightweight silk blend — office-ready or evening out.',
        price: 49.99,
        stock: 38,
        category: 'Women',
        imageUrl: 'https://images.unsplash.com/photo-1548624149-f7b3e0c032d8?w=800',
      },
      {
        name: 'Canvas Belt Bag',
        description:
          'Hands-free crossbody with multiple zip pockets and adjustable webbing strap.',
        price: 39.0,
        stock: 55,
        category: 'Accessories',
        imageUrl: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800',
      },
      {
        name: 'Wool Fedora Hat',
        description:
          'Structured brim and grosgrain band — finishes casual and smart-casual looks.',
        price: 55.0,
        stock: 30,
        category: 'Accessories',
        imageUrl: 'https://images.unsplash.com/photo-1534215754734-18e55d13e346?w=800',
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
          'https://images.unsplash.com/photo-1603199506018-7ad0b9a531f6?w=800',
      },
      {
        name: 'Cast Iron Dutch Oven',
        description:
          '5.5-quart enameled pot for bread, stews, and slow roasts — oven-safe to 500°F.',
        price: 89.99,
        stock: 32,
        category: 'Kitchen',
        imageUrl:
          'https://images.unsplash.com/photo-1584990347499-4e6b909e66b3?w=800',
      },
      {
        name: 'Minimal Arc Table Lamp',
        description:
          'Warm 2700K LED, dimmable touch base, and a linen shade that softens light in bedrooms and offices.',
        price: 42.5,
        stock: 70,
        category: 'Decor',
        imageUrl:
          'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800',
      },
      {
        name: 'Handwoven Wall Tapestry',
        description:
          'Cotton blend in earth tones — adds texture above sofas or beds without framing required.',
        price: 38.0,
        stock: 40,
        category: 'Decor',
        imageUrl:
          'https://images.unsplash.com/photo-1615529328331-f8917597711f?w=800',
      },
      {
        name: 'Velvet Lounge Chair',
        description:
          'Solid oak legs, high-density foam, and stain-resistant velvet upholstery in forest green.',
        price: 249.0,
        stock: 15,
        category: 'Furniture',
        imageUrl:
          'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
      },
      {
        name: 'Extendable Dining Table',
        description:
          'Seats six standard, eight extended — scratch-resistant top and a natural oak veneer finish.',
        price: 449.0,
        stock: 10,
        category: 'Furniture',
        imageUrl:
          'https://images.unsplash.com/photo-1617806112203-93e934b86a0a?w=800',
      },
      {
        name: 'Stainless Knife Set (6pc)',
        description:
          'Full-tang blades with ergonomic handles and a wooden block for countertop storage.',
        price: 79.99,
        stock: 28,
        category: 'Kitchen',
        imageUrl: 'https://images.unsplash.com/photo-1593113630400-ea4288922497?w=800',
      },
      {
        name: 'Glass Food Storage Set',
        description:
          'Oven-safe glass containers with snap lids — meal prep and leftovers made easy.',
        price: 44.99,
        stock: 50,
        category: 'Kitchen',
        imageUrl: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=800',
      },
      {
        name: 'Scented Candle Trio',
        description:
          'Soy wax candles in cedar, linen, and bergamot — 45-hour burn time each.',
        price: 32.0,
        stock: 65,
        category: 'Decor',
        imageUrl: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800',
      },
      {
        name: 'Ceramic Planter Set',
        description:
          'Three matte-finish planters with drainage trays for indoor greenery.',
        price: 28.5,
        stock: 48,
        category: 'Decor',
        imageUrl: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800',
      },
      {
        name: 'Oak Side Table',
        description:
          'Compact bedside or sofa table with a lower shelf for books and remotes.',
        price: 129.0,
        stock: 18,
        category: 'Furniture',
        imageUrl: 'https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=800',
      },
      {
        name: 'Bookshelf Ladder 5-Tier',
        description:
          'Leaning bookshelf in white oak veneer — ideal for living rooms and home offices.',
        price: 179.0,
        stock: 14,
        category: 'Furniture',
        imageUrl: 'https://images.unsplash.com/photo-1594620302200-9a7b2241a43c?w=800',
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
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
      },
      {
        name: 'Trail Grip Runners',
        description:
          'Aggressive lug outsole, rock plate, and waterproof membrane for muddy paths and wet roots.',
        price: 149.99,
        stock: 38,
        category: 'Running',
        imageUrl:
          'https://images.unsplash.com/photo-1606107557192-0be2ac7a8f2a?w=800',
      },
      {
        name: 'Pro Yoga Mat 6mm',
        description:
          'Non-slip natural rubber, alignment guides, and a carrying strap — studio or home practice ready.',
        price: 39.99,
        stock: 80,
        category: 'Training',
        imageUrl:
          'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800',
      },
      {
        name: 'Adjustable Kettlebell Set',
        description:
          'Dial from 8–32 kg in one unit — saves space and supports strength circuits and HIIT.',
        price: 199.0,
        stock: 25,
        category: 'Training',
        imageUrl:
          'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800',
      },
      {
        name: 'Summit Hiking Backpack 40L',
        description:
          'Ventilated back panel, rain cover included, and multiple access points for multi-day treks.',
        price: 89.0,
        stock: 30,
        category: 'Outdoor',
        imageUrl:
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
      },
      {
        name: 'Insulated Hydration Pack',
        description:
          '2L bladder, tube insulation for hot days, and chest pockets for gels and a phone on the trail.',
        price: 59.99,
        stock: 42,
        category: 'Outdoor',
        imageUrl:
          'https://images.unsplash.com/photo-1622260614153-5326d63f1f29?w=800',
      },
      {
        name: 'Marathon Racing Flats',
        description:
          'Carbon plate and featherweight upper tuned for race day speed on the road.',
        price: 179.99,
        stock: 32,
        category: 'Running',
        imageUrl: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800',
      },
      {
        name: 'Recovery Slide Sandals',
        description:
          'Plush footbed and supportive strap — post-workout comfort for tired feet.',
        price: 39.99,
        stock: 60,
        category: 'Running',
        imageUrl: 'https://images.unsplash.com/photo-1603808033192-082d6f74b30d?w=800',
      },
      {
        name: 'Resistance Band Set',
        description:
          'Five latex bands with door anchor and carry pouch for home strength training.',
        price: 24.99,
        stock: 90,
        category: 'Training',
        imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800',
      },
      {
        name: 'Foam Roller Pro',
        description:
          'High-density foam with textured zones for muscle recovery and mobility work.',
        price: 29.99,
        stock: 55,
        category: 'Training',
        imageUrl: 'https://images.unsplash.com/photo-1600881333168-2ef49b341f30?w=800',
      },
      {
        name: 'Camping Headlamp',
        description:
          'USB rechargeable, red night mode, and IPX4 water resistance for trails.',
        price: 34.0,
        stock: 48,
        category: 'Outdoor',
        imageUrl: 'https://images.unsplash.com/photo-1508873535684-277a3cbcc4e8?w=800',
      },
      {
        name: 'Trekking Poles (Pair)',
        description:
          'Lightweight aluminum with cork grips and quick-lock adjustment for hikers.',
        price: 49.99,
        stock: 36,
        category: 'Outdoor',
        imageUrl: 'https://images.unsplash.com/photo-1533240332313-0db49b439ad3?w=800',
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
          'https://images.unsplash.com/photo-1603046891705-3b0a6f7e0c8f?w=800',
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
          'https://images.unsplash.com/photo-1515823064-6117568612-9a0c5b3c0f0e?w=800',
      },
      {
        name: 'Artisan Chocolate Gift Box',
        description:
          'Twelve handcrafted truffles — dark, milk, and sea-salt caramel in a reusable ribboned box.',
        price: 34.99,
        stock: 40,
        category: 'Gifts',
        imageUrl:
          'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=800',
      },
      {
        name: 'Gourmet Spice Collection',
        description:
          'Six small-batch blends in glass jars — includes za\'atar, vadouvan, and smoked paprika with recipe cards.',
        price: 42.0,
        stock: 35,
        category: 'Gifts',
        imageUrl:
          'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800',
      },
      {
        name: 'Truffle Infused Honey',
        description:
          'Wildflower honey with black truffle — drizzle over cheese, pizza, or roasted vegetables.',
        price: 22.0,
        stock: 40,
        category: 'Pantry',
        imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800',
      },
      {
        name: 'Sourdough Bread Mix',
        description:
          'Stone-ground flour blend with starter instructions for bakery-style loaves at home.',
        price: 12.5,
        stock: 75,
        category: 'Pantry',
        imageUrl: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=800',
      },
      {
        name: 'Sparkling Elderflower',
        description:
          'Botanical sparkling water with elderflower — zero alcohol, 750ml bottle.',
        price: 8.99,
        stock: 100,
        category: 'Beverages',
        imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800',
      },
      {
        name: 'Cold Brew Concentrate',
        description:
          'Slow-steeped coffee concentrate — makes 12 iced coffees when diluted.',
        price: 14.99,
        stock: 55,
        category: 'Beverages',
        imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=800',
      },
      {
        name: 'Gourmet Nut Gift Tin',
        description:
          'Roasted almonds, cashews, and pistachios with sea salt — reusable gift tin.',
        price: 29.99,
        stock: 42,
        category: 'Gifts',
        imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800',
      },
      {
        name: 'Artisan Jam Trio',
        description:
          'Strawberry basil, fig, and apricot preserves in glass jars with ribbon set.',
        price: 26.0,
        stock: 38,
        category: 'Gifts',
        imageUrl: 'https://images.unsplash.com/photo-1538332576228-eb5b43a6985a?w=800',
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