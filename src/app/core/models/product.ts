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
  sizes: string;
  colors: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string | null;
  images: ProductImage[];
}
