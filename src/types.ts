export type ProductCategory =
  | 'all'
  | 'classic-boxes'
  | 'premium-boxes'
  | 'house-cookies'
  | 'mini-house-boxes'
  | 'decadent-cookies'
  | 'mini-decadent-boxes'
  | 'melting-moments'
  | 'biscoff-millionaires'
  | 'lamingtons'
  | 'sunday-cinnamon-rolls'
  | 'cookie-pie'
  | 'dot-cakes'
  | 'edible-cookie-dough'
  | 'stuffed-cookies'
  | 'mzansi-heritage'
  | 'bundles'
  | 'custom-message'
  | 'brownies';

export interface Product {
  id: string;
  name: string;
  tagline: string;
  description: string;
  price: number; // in ZAR R
  originalPrice?: number;
  image: string;
  category:
    | 'classic-boxes'
    | 'premium-boxes'
    | 'house-cookies'
    | 'mini-house-boxes'
    | 'decadent-cookies'
    | 'mini-decadent-boxes'
    | 'melting-moments'
    | 'biscoff-millionaires'
    | 'lamingtons'
    | 'sunday-cinnamon-rolls'
    | 'cookie-pie'
    | 'dot-cakes'
    | 'edible-cookie-dough'
    | 'stuffed-cookies'
    | 'mzansi-heritage'
    | 'bundles'
    | 'custom-message'
    | 'brownies';
  dietary: string[];
  memeBadge?: string;
  badgeColor?: string;
  inStock: boolean;
  stockCount: number;
  weightGrams?: number;
  isCustomizable?: boolean;
  customPlaceholder?: string;
  rating: number;
  reviewCount: number;
  ingredientsSnippet?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  customMessage?: string;
  boxRibbon?: 'hot-pink' | 'lavender' | 'leopard';
}

export type DeliveryMethod = 'pudo' | 'courier' | 'pickup';

export type PaymentMethod = 'snapscan' | 'instant-eft' | 'card' | 'cash';

export type OrderStatus =
  | 'received'
  | 'baking'
  | 'boxed'
  | 'dispatched'
  | 'delivered';

export interface Order {
  id: string;
  createdAt: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  delivery: {
    method: DeliveryMethod;
    cost: number;
    address: string;
    suburb: string;
    city: string;
    postalCode: string;
    notes?: string;
    pudoLockerLocation?: string;
  };
  items: {
    productId: string;
    name: string;
    quantity: number;
    price: number;
    customMessage?: string;
    image: string;
  }[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  promoCode?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: 'paid' | 'pending';
  status: OrderStatus;
  statusUpdated: string;
  notes?: string;
}

export interface MemeItem {
  id: string;
  title: string;
  caption: string;
  image: string;
  likes: number;
  author: string;
  tag: string;
  vibeCookieRecommendation?: string;
}

export interface BakerStats {
  totalRevenue: number;
  ordersCount: number;
  totalCookiesBaked: number;
  activeOrders: number;
  lowStockItems: number;
}

export interface BakeryLocationSettings {
  kitchenName: string;
  address: string;
  suburb: string;
  city: string;
  province: string;
  postalCode: string;
  pickupHours: string;
  pickupInstructions: string;
  localDeliveryZoneName: string;
  localDeliveryCoverage: string;
  localDeliveryFee: number;
  pudoLockerLocationDefault: string;
  phone: string;
  whatsappNumber: string;
  nationwideComingSoon: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  address?: string;
  suburb?: string;
  city?: string;
  postalCode?: string;
  deliveryNotes?: string;
  favoriteBiscuits?: string[];
}
