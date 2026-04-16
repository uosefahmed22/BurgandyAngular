export interface ProductImage {
  id: number;
  imageUrl: string;
  displayOrder: number;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  categoryId: number;
  categoryName: string;
  sizes: string; // comma-separated string like "S,M,L"
  colors: string; // comma-separated string like "أسود,أحمر"
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string | null;
  images: ProductImage[]; // array of objects, NOT strings

  // Discount fields (from API)
  discountPercentage: number | null;
  discountEndDate: string | null;
  hasActiveDiscount: boolean;
  salePrice: number;
  discountRemainingDays: number | null;
}

export interface ProductQueryParams {
  categoryId?: number;
  isAvailable?: boolean;
  sort?: string;
  pageIndex?: number;
  pageSize?: number;
}
