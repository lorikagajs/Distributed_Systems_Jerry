import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const BCRYPT_ROUNDS = 10;
const ADMIN_PASSWORD = 'Admin123!';
const CUSTOMER_PASSWORD = 'Customer123!';

type ProductSeed = {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string;
  images?: string[];
  rating?: number;
};

type TenantSeed = {
  name: string;
  slug: string;
  email: string;
  primaryColor: string;
  secondaryColor: string;
  bannerUrl: string;
  storeName: string;
  storeDescription: string;
  categories: string[];
  products: ProductSeed[];
};

const img = (photoId: string) =>
  `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=900&q=80`;

const tenantSeeds: TenantSeed[] = [
  {
    name: 'Tech Store',
    slug: 'tech-store',
    email: 'admin@tech-store.local',
    primaryColor: '#4f46e5',
    secondaryColor: '#7c3aed',
    bannerUrl: img('photo-1498049794561-7780e7231661'),
    storeName: 'Tech Store',
    storeDescription: 'Best electronics deals',
    categories: [
      'Laptops',
      'Phones',
      'Audio',
      'Accessories',
      'Gaming',
      'Wearables',
    ],
    products: [
      {
        name: 'JerryBook Pro 14',
        description: 'Compact aluminum laptop with a sharp 14-inch display.',
        price: 1299,
        stock: 12,
        category: 'Laptops',
        imageUrl: img('photo-1496181133206-80ce9b88a853'),
        rating: 5,
      },
      {
        name: 'JerryBook Air 13',
        description: 'Light everyday laptop with all-day battery life.',
        price: 999,
        stock: 18,
        category: 'Laptops',
        imageUrl: img('photo-1517336714731-489689fd1ca8'),
        rating: 4,
      },
      {
        name: 'Creator Laptop 16',
        description: 'Large-screen workstation for design and development.',
        price: 1899,
        stock: 7,
        category: 'Laptops',
        imageUrl: img('photo-1498050108023-c5249f4df085'),
        rating: 5,
      },
      {
        name: 'Nova X Smartphone',
        description: 'Fast 5G phone with an edge-to-edge OLED display.',
        price: 849,
        stock: 24,
        category: 'Phones',
        imageUrl: img('photo-1511707171634-5f897ff02aa9'),
        rating: 4,
      },
      {
        name: 'PixelEdge 8',
        description: 'Pocket-friendly phone with a pro-grade camera system.',
        price: 699,
        stock: 20,
        category: 'Phones',
        imageUrl: img('photo-1598327105666-5b89351aff97'),
        rating: 5,
      },
      {
        name: 'Fold Mini',
        description: 'Foldable smartphone built for multitasking on the go.',
        price: 1199,
        stock: 8,
        category: 'Phones',
        imageUrl: img('photo-1592750475338-74b7b21085ab'),
        rating: 4,
      },
      {
        name: 'Pulse ANC Headphones',
        description: 'Wireless headphones with active noise cancellation.',
        price: 229,
        stock: 30,
        category: 'Audio',
        imageUrl: img('photo-1505740420928-5e560c06d30e'),
        rating: 5,
      },
      {
        name: 'Pocket Bluetooth Speaker',
        description: 'Water-resistant portable speaker with punchy bass.',
        price: 79,
        stock: 34,
        category: 'Audio',
        imageUrl: img('photo-1608043152269-423dbba4e7e1'),
        rating: 4,
      },
      {
        name: 'Studio USB Microphone',
        description: 'Plug-and-play microphone for calls, streams, and podcasts.',
        price: 119,
        stock: 16,
        category: 'Audio',
        imageUrl: img('photo-1590602847861-f357a9332bbc'),
        rating: 5,
      },
      {
        name: 'Mechanical Keyboard',
        description: 'Hot-swappable keyboard with tactile switches.',
        price: 139,
        stock: 22,
        category: 'Accessories',
        imageUrl: img('photo-1587829741301-dc798b83add3'),
        rating: 5,
      },
      {
        name: 'Wireless Charging Pad',
        description: 'Slim fast charger for phones and earbuds.',
        price: 39,
        stock: 45,
        category: 'Accessories',
        imageUrl: img('photo-1586953208448-b95a79798f07'),
        rating: 4,
      },
      {
        name: 'USB-C Pro Hub',
        description: 'Seven-port hub with HDMI, card reader, and power delivery.',
        price: 69,
        stock: 28,
        category: 'Accessories',
        imageUrl: img('photo-1625842268584-8f3296236761'),
        rating: 4,
      },
      {
        name: 'Carbon Gaming Mouse',
        description: 'Lightweight gaming mouse with precise optical tracking.',
        price: 59,
        stock: 26,
        category: 'Gaming',
        imageUrl: img('photo-1527814050087-3793815479db'),
        rating: 4,
      },
      {
        name: '27-inch QHD Gaming Monitor',
        description: 'Fast 165Hz monitor for smooth competitive play.',
        price: 349,
        stock: 10,
        category: 'Gaming',
        imageUrl: img('photo-1593305841991-05c297ba4575'),
        rating: 5,
      },
      {
        name: 'Active Smartwatch',
        description: 'Fitness tracking, notifications, and sleep insights.',
        price: 199,
        stock: 25,
        category: 'Wearables',
        imageUrl: img('photo-1523275335684-37898b6baf30'),
        rating: 4,
      },
      {
        name: 'Fitness Band',
        description: 'Lightweight activity tracker with heart-rate monitoring.',
        price: 79,
        stock: 38,
        category: 'Wearables',
        imageUrl: img('photo-1575311373937-040b8e1fd5b6'),
        rating: 4,
      },
    ],
  },
  {
    name: 'Fashion Hub',
    slug: 'fashion-hub',
    email: 'admin@fashion-hub.local',
    primaryColor: '#db2777',
    secondaryColor: '#9d174d',
    bannerUrl: img('photo-1489987707025-afc232f7ea0f'),
    storeName: 'Fashion Hub',
    storeDescription: 'Trendy clothing and accessories',
    categories: ['Women', 'Men', 'Shoes', 'Bags', 'Accessories'],
    products: [
      {
        name: 'Satin Midi Dress',
        description: 'Elegant midi dress with a soft satin finish.',
        price: 89,
        stock: 17,
        category: 'Women',
        imageUrl: img('photo-1539008835657-9e8e9680c956'),
        rating: 5,
      },
      {
        name: 'Everyday Denim Jacket',
        description: 'Classic denim layer with a relaxed modern fit.',
        price: 74,
        stock: 21,
        category: 'Women',
        imageUrl: img('photo-1543076447-215ad9ba6923'),
        rating: 4,
      },
      {
        name: 'Ribbed Knit Top',
        description: 'Soft ribbed knit for easy daily styling.',
        price: 38,
        stock: 29,
        category: 'Women',
        imageUrl: img('photo-1521572163474-6864f9cf17ab'),
        rating: 4,
      },
      {
        name: 'Oxford Shirt',
        description: 'Crisp cotton shirt for workdays and weekends.',
        price: 49,
        stock: 30,
        category: 'Men',
        imageUrl: img('photo-1602810318383-e386cc2a3ccf'),
        rating: 5,
      },
      {
        name: 'Slim Chino Pants',
        description: 'Stretch cotton chinos with a clean tapered cut.',
        price: 59,
        stock: 25,
        category: 'Men',
        imageUrl: img('photo-1473966968600-fa801b869a1a'),
        rating: 4,
      },
      {
        name: 'Urban Bomber Jacket',
        description: 'Lightweight bomber jacket with utility pockets.',
        price: 95,
        stock: 13,
        category: 'Men',
        imageUrl: img('photo-1556821840-3a63f95609a7'),
        rating: 5,
      },
      {
        name: 'Leather Trainers',
        description: 'Minimal low-top trainers with a cushioned sole.',
        price: 110,
        stock: 19,
        category: 'Shoes',
        imageUrl: img('photo-1542291026-7eec264c27ff'),
        rating: 5,
      },
      {
        name: 'Chelsea Boots',
        description: 'Polished leather boots for smart casual outfits.',
        price: 145,
        stock: 12,
        category: 'Shoes',
        imageUrl: img('photo-1608256246200-53e8b47babc1'),
        rating: 4,
      },
      {
        name: 'Lifestyle Sneakers',
        description: 'Comfort sneakers for everyday wear.',
        price: 84,
        stock: 27,
        category: 'Shoes',
        imageUrl: img('photo-1608231387042-66d1773070a5'),
        rating: 4,
      },
      {
        name: 'City Tote Bag',
        description: 'Structured tote with room for a laptop and essentials.',
        price: 69,
        stock: 18,
        category: 'Bags',
        imageUrl: img('photo-1590874103328-eac38a683ce7'),
        rating: 5,
      },
      {
        name: 'Crossbody Sling',
        description: 'Compact crossbody bag with adjustable strap.',
        price: 42,
        stock: 31,
        category: 'Bags',
        imageUrl: img('photo-1594223274512-ad4803739b7c'),
        rating: 4,
      },
      {
        name: 'Travel Duffel',
        description: 'Durable weekend bag with a wide main compartment.',
        price: 88,
        stock: 16,
        category: 'Bags',
        imageUrl: img('photo-1553062407-98eeb64c6a62'),
        rating: 4,
      },
      {
        name: 'Minimal Watch',
        description: 'Slim analog watch with a clean dial.',
        price: 129,
        stock: 14,
        category: 'Accessories',
        imageUrl: img('photo-1523275335684-37898b6baf30'),
        rating: 5,
      },
      {
        name: 'Wool Scarf',
        description: 'Warm woven scarf for cold-weather layering.',
        price: 34,
        stock: 36,
        category: 'Accessories',
        imageUrl: img('photo-1520903920243-00d872a2d1c9'),
        rating: 4,
      },
      {
        name: 'Leather Belt',
        description: 'Full-grain leather belt with matte metal hardware.',
        price: 39,
        stock: 33,
        category: 'Accessories',
        imageUrl: img('photo-1624222247344-550fb60583dc'),
        rating: 4,
      },
      {
        name: 'Classic Sunglasses',
        description: 'UV-protected sunglasses with a timeless frame.',
        price: 55,
        stock: 22,
        category: 'Accessories',
        imageUrl: img('photo-1511499767150-a48a237f0083'),
        rating: 5,
      },
    ],
  },
  {
    name: 'Home Goods',
    slug: 'home-goods',
    email: 'admin@home-goods.local',
    primaryColor: '#059669',
    secondaryColor: '#047857',
    bannerUrl: img('photo-1556911220-bff31c812dba'),
    storeName: 'Home & Living',
    storeDescription: 'Everything for your home',
    categories: [
      'Kitchen',
      'Furniture',
      'Lighting',
      'Decor',
      'Bedding',
      'Appliances',
    ],
    products: [
      {
        name: 'Ceramic Dinner Set',
        description: 'Sixteen-piece dinnerware set in a warm matte glaze.',
        price: 96,
        stock: 18,
        category: 'Kitchen',
        imageUrl: img('photo-1516594798947-e65505dbb29d'),
        rating: 5,
      },
      {
        name: 'Stainless Cookware Set',
        description: 'Five-piece stainless steel cookware set.',
        price: 189,
        stock: 12,
        category: 'Kitchen',
        imageUrl: img('photo-1556911220-bff31c812dba'),
        rating: 4,
      },
      {
        name: 'Espresso Maker',
        description: 'Compact espresso machine with milk frother.',
        price: 249,
        stock: 9,
        category: 'Kitchen',
        imageUrl: img('photo-1495474472287-4d71bcdd2085'),
        rating: 5,
      },
      {
        name: 'Oak Coffee Table',
        description: 'Solid oak table with a low-profile silhouette.',
        price: 299,
        stock: 8,
        category: 'Furniture',
        imageUrl: img('photo-1532372320572-cda25653a26d'),
        rating: 4,
      },
      {
        name: 'Modular Fabric Sofa',
        description: 'Comfortable modular sofa with washable covers.',
        price: 899,
        stock: 5,
        category: 'Furniture',
        imageUrl: img('photo-1555041469-a586c61ea9bc'),
        rating: 5,
      },
      {
        name: 'Ergonomic Home Chair',
        description: 'Supportive chair for working comfortably from home.',
        price: 219,
        stock: 14,
        category: 'Furniture',
        imageUrl: img('photo-1580480055273-228ff5388ef8'),
        rating: 4,
      },
      {
        name: 'Arc Floor Lamp',
        description: 'Statement floor lamp with an adjustable arc arm.',
        price: 159,
        stock: 11,
        category: 'Lighting',
        imageUrl: img('photo-1507473885765-e6ed057f782c'),
        rating: 5,
      },
      {
        name: 'Bedside Table Lamp',
        description: 'Soft warm lamp for bedrooms and reading corners.',
        price: 49,
        stock: 25,
        category: 'Lighting',
        imageUrl: img('photo-1513506003901-1e6a229e2d15'),
        rating: 4,
      },
      {
        name: 'LED Desk Light',
        description: 'Dimmable desk light with adjustable color temperature.',
        price: 64,
        stock: 20,
        category: 'Lighting',
        imageUrl: img('photo-1534073828943-f801091bb18c'),
        rating: 4,
      },
      {
        name: 'Woven Basket Set',
        description: 'Set of three storage baskets for tidy shelves.',
        price: 44,
        stock: 27,
        category: 'Decor',
        imageUrl: img('photo-1524758631624-e2822e304c36'),
        rating: 5,
      },
      {
        name: 'Framed Wall Art',
        description: 'Neutral abstract print in a slim wood frame.',
        price: 79,
        stock: 19,
        category: 'Decor',
        imageUrl: img('photo-1513519245088-0e12902e5a38'),
        rating: 4,
      },
      {
        name: 'Indoor Planter',
        description: 'Ceramic planter with a raised wooden stand.',
        price: 58,
        stock: 23,
        category: 'Decor',
        imageUrl: img('photo-1485955900006-10f4d324d411'),
        rating: 5,
      },
      {
        name: 'Cotton Duvet Set',
        description: 'Breathable cotton bedding set with pillow shams.',
        price: 119,
        stock: 15,
        category: 'Bedding',
        imageUrl: img('photo-1505693416388-ac5ce068fe85'),
        rating: 5,
      },
      {
        name: 'Memory Foam Pillow',
        description: 'Supportive pillow with a cooling cover.',
        price: 55,
        stock: 32,
        category: 'Bedding',
        imageUrl: img('photo-1584100936595-c0654b55a2e2'),
        rating: 4,
      },
      {
        name: 'Air Purifier',
        description: 'Quiet purifier for bedrooms and living rooms.',
        price: 199,
        stock: 13,
        category: 'Appliances',
        imageUrl: img('photo-1558618666-fcd25c85cd64'),
        rating: 5,
      },
      {
        name: 'Robot Vacuum',
        description: 'Smart vacuum with app scheduling and room mapping.',
        price: 329,
        stock: 10,
        category: 'Appliances',
        imageUrl: img('photo-1589003077984-894e133dabab'),
        rating: 4,
      },
    ],
  },
  {
    name: 'Sports World',
    slug: 'sports-world',
    email: 'admin@sports-world.local',
    primaryColor: '#d97706',
    secondaryColor: '#b45309',
    bannerUrl: img('photo-1517649763962-0c623066013b'),
    storeName: 'Sports World',
    storeDescription: 'Gear up for every sport',
    categories: [
      'Fitness',
      'Running',
      'Outdoor',
      'Team Sports',
      'Cycling',
      'Recovery',
    ],
    products: [
      {
        name: 'Adjustable Dumbbells',
        description: 'Space-saving dumbbell pair for strength training.',
        price: 229,
        stock: 12,
        category: 'Fitness',
        imageUrl: img('photo-1534438327276-14e5300c3a48'),
        rating: 5,
      },
      {
        name: 'Resistance Band Kit',
        description: 'Five-band set with handles and door anchor.',
        price: 34,
        stock: 40,
        category: 'Fitness',
        imageUrl: img('photo-1598289431512-b97b0917affc'),
        rating: 4,
      },
      {
        name: 'Yoga Mat',
        description: 'Non-slip mat with extra cushioning for daily practice.',
        price: 45,
        stock: 35,
        category: 'Fitness',
        imageUrl: img('photo-1599901860904-13e6a4a9788b'),
        rating: 5,
      },
      {
        name: 'Performance Running Shoes',
        description: 'Responsive running shoes for road training.',
        price: 135,
        stock: 22,
        category: 'Running',
        imageUrl: img('photo-1542291026-7eec264c27ff'),
        rating: 5,
      },
      {
        name: 'Lightweight Running Jacket',
        description: 'Packable windbreaker with reflective details.',
        price: 89,
        stock: 18,
        category: 'Running',
        imageUrl: img('photo-1551698618-1dfe5d97d256'),
        rating: 4,
      },
      {
        name: 'Hydration Belt',
        description: 'Low-bounce belt with two bottles and phone pocket.',
        price: 39,
        stock: 31,
        category: 'Running',
        imageUrl: img('photo-1552674605-db6ffd4facb5'),
        rating: 4,
      },
      {
        name: 'Hiking Backpack',
        description: 'Thirty-liter pack with breathable back support.',
        price: 119,
        stock: 17,
        category: 'Outdoor',
        imageUrl: img('photo-1553062407-98eeb64c6a62'),
        rating: 5,
      },
      {
        name: 'Waterproof Trail Jacket',
        description: 'Light shell jacket for rain and wind protection.',
        price: 149,
        stock: 14,
        category: 'Outdoor',
        imageUrl: img('photo-1547949003-9792a18a2601'),
        rating: 4,
      },
      {
        name: 'Camping Lantern',
        description: 'Rechargeable lantern with warm and bright modes.',
        price: 49,
        stock: 28,
        category: 'Outdoor',
        imageUrl: img('photo-1504280390367-361c6d9f38f4'),
        rating: 5,
      },
      {
        name: 'Match Soccer Ball',
        description: 'Durable match ball with a textured outer shell.',
        price: 38,
        stock: 36,
        category: 'Team Sports',
        imageUrl: img('photo-1579952363873-27f3bade9f55'),
        rating: 5,
      },
      {
        name: 'Basketball Pro Grip',
        description: 'Indoor/outdoor basketball with deep channel grip.',
        price: 42,
        stock: 30,
        category: 'Team Sports',
        imageUrl: img('photo-1519861531473-9200262188bf'),
        rating: 4,
      },
      {
        name: 'Training Cones Set',
        description: 'Twenty-piece cone set for drills and practice.',
        price: 24,
        stock: 44,
        category: 'Team Sports',
        imageUrl: img('photo-1526232761682-d26e03ac148e'),
        rating: 4,
      },
      {
        name: 'Road Bike Helmet',
        description: 'Ventilated helmet with an adjustable fit system.',
        price: 79,
        stock: 20,
        category: 'Cycling',
        imageUrl: img('photo-1558611848-73f7eb4001a1'),
        rating: 5,
      },
      {
        name: 'Insulated Bike Bottle',
        description: 'Leakproof cycling bottle that keeps drinks cool.',
        price: 18,
        stock: 50,
        category: 'Cycling',
        imageUrl: img('photo-1485965120184-e220f721d03e'),
        rating: 4,
      },
      {
        name: 'Cycling Gloves',
        description: 'Padded gloves with breathable mesh panels.',
        price: 29,
        stock: 33,
        category: 'Cycling',
        imageUrl: img('photo-1532298229144-0ec0c57515c7'),
        rating: 4,
      },
      {
        name: 'Foam Roller',
        description: 'Firm recovery roller for mobility work.',
        price: 32,
        stock: 37,
        category: 'Recovery',
        imageUrl: img('photo-1605296867304-46d5465a13f1'),
        rating: 5,
      },
    ],
  },
];

async function upsertTenant(seed: TenantSeed) {
  return prisma.tenant.upsert({
    where: { slug: seed.slug },
    update: {
      name: seed.name,
      email: seed.email,
      primaryColor: seed.primaryColor,
      secondaryColor: seed.secondaryColor,
      bannerUrl: seed.bannerUrl,
      storeName: seed.storeName,
      storeDescription: seed.storeDescription,
      isActive: true,
    },
    create: {
      name: seed.name,
      slug: seed.slug,
      email: seed.email,
      primaryColor: seed.primaryColor,
      secondaryColor: seed.secondaryColor,
      bannerUrl: seed.bannerUrl,
      storeName: seed.storeName,
      storeDescription: seed.storeDescription,
    },
  });
}

async function upsertUsers(tenantId: number, slug: string) {
  const adminPassword = await bcrypt.hash(ADMIN_PASSWORD, BCRYPT_ROUNDS);
  const customerPassword = await bcrypt.hash(CUSTOMER_PASSWORD, BCRYPT_ROUNDS);
  const users = [
    {
      email: `admin@${slug}.local`,
      password: adminPassword,
      role: UserRole.ADMIN,
    },
    {
      email: `customer@${slug}.local`,
      password: customerPassword,
      role: UserRole.CUSTOMER,
    },
    {
      email: `demo@${slug}.local`,
      password: customerPassword,
      role: UserRole.CUSTOMER,
    },
  ];

  const createdUsers: { id: number; role: UserRole }[] = [];

  for (const user of users) {
    createdUsers.push(
      await prisma.user.upsert({
        where: {
          tenantId_email: {
            tenantId,
            email: user.email,
          },
        },
        update: {
          password: user.password,
          role: user.role,
        },
        create: {
          tenantId,
          email: user.email,
          password: user.password,
          role: user.role,
        },
      }),
    );
  }

  return createdUsers;
}

async function upsertCategories(tenantId: number, categoryNames: string[]) {
  const categories = new Map<string, number>();

  for (const name of categoryNames) {
    const category = await prisma.category.upsert({
      where: {
        tenantId_name: {
          tenantId,
          name,
        },
      },
      update: { name },
      create: { tenantId, name },
    });

    categories.set(name, category.id);
  }

  return categories;
}

async function upsertProduct(
  tenantId: number,
  categoryId: number,
  seed: ProductSeed,
) {
  const existingProduct = await prisma.product.findFirst({
    where: {
      tenantId,
      name: seed.name,
    },
  });

  const productData = {
    name: seed.name,
    description: seed.description,
    price: seed.price,
    stock: seed.stock,
    categoryId,
    tenantId,
    imageUrl: seed.imageUrl,
  };

  const product = existingProduct
    ? await prisma.product.update({
        where: { id: existingProduct.id },
        data: productData,
      })
    : await prisma.product.create({ data: productData });

  const imageUrls = Array.from(new Set([seed.imageUrl, ...(seed.images ?? [])]));
  await prisma.productImage.deleteMany({ where: { productId: product.id } });
  await prisma.productImage.createMany({
    data: imageUrls.map((url) => ({ productId: product.id, url })),
  });

  return product;
}

async function upsertProductReview(
  tenantId: number,
  productId: number,
  userId: number,
  rating: number,
) {
  await prisma.review.upsert({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
    update: {
      rating,
      comment: 'Seed review for storefront demo data.',
      tenantId,
    },
    create: {
      tenantId,
      productId,
      userId,
      rating,
      comment: 'Seed review for storefront demo data.',
    },
  });
}

async function main() {
  for (const seed of tenantSeeds) {
    const tenant = await upsertTenant(seed);
    const users = await upsertUsers(tenant.id, seed.slug);
    const reviewUsers = users.filter((user) => user.role === UserRole.CUSTOMER);
    const categories = await upsertCategories(tenant.id, seed.categories);

    let productCount = 0;

    for (const productSeed of seed.products) {
      const categoryId = categories.get(productSeed.category);

      if (!categoryId) {
        throw new Error(
          `Missing category "${productSeed.category}" for ${seed.slug}`,
        );
      }

      const product = await upsertProduct(tenant.id, categoryId, productSeed);
      productCount += 1;

      if (productSeed.rating && reviewUsers.length > 0) {
        const reviewUser = reviewUsers[productCount % reviewUsers.length];
        await upsertProductReview(
          tenant.id,
          product.id,
          reviewUser.id,
          productSeed.rating,
        );
      }
    }

    console.log(
      `Seeded ${seed.slug}: ${seed.categories.length} categories, ${productCount} products, ${users.length} users`,
    );
  }

  console.log(`Admin password: ${ADMIN_PASSWORD}`);
  console.log(`Customer password: ${CUSTOMER_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
