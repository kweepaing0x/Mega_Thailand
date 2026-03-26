export type UserRole = 'user' | 'business' | 'admin'
export type StockStatus = 'in_stock' | 'limited' | 'out_of_stock'
export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
export type SourcePlatform = 'shopee_th' | 'lazada_th' | '1688' | 'jd_central' | 'other'

export interface Profile {
  id: string
  role: UserRole
  display_name: string | null
  phone: string | null
  email: string | null
  avatar_url: string | null
  business_name: string | null
  business_bio: string | null
  telegram_username: string | null
  is_verified: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Video {
  id: string
  uploader_id: string
  title: string
  description: string | null
  video_url: string
  thumbnail_url: string | null
  is_published: boolean
  view_count: number
  created_at: string
  updated_at: string
  uploader?: Profile
  products?: Product[]
}

export interface Product {
  id: string
  video_id: string | null
  seller_id: string
  name: string
  description: string | null
  price_thb: number
  price_mmk?: number
  original_link: string | null
  source_platform: SourcePlatform
  stock_status: StockStatus
  estimated_days_min: number
  estimated_days_max: number
  image_urls: string[]
  is_active: boolean
  created_at: string
  seller?: Profile
}

export interface Order {
  id: string
  product_id: string
  seller_id: string
  buyer_id: string | null
  buyer_name: string
  buyer_phone: string
  delivery_address: string
  notes: string | null
  price_thb: number
  price_mmk: number
  exchange_rate_used: number
  quantity: number
  status: OrderStatus
  created_at: string
  product?: Product
  seller?: Profile
}

export interface Settings {
  id: number
  exchange_rate_thb_mmk: number
  verified_badge_label: string
  telegram_fallback: string | null
  rate_updated_at: string
  updated_at: string
}
