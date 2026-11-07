export interface ProductDTO {
  id: string;
  name: string;
  sku: string;
  barcode: string | null;
  price: number;
  costPrice: number;
  stock: number;
  minStock: number;
  unit: string;
  category: string;
  categoryId: string | null;
  imageUrl?: string | null;
  isActive: boolean;
}

export interface CategoryDTO {
  id: string;
  name: string;
  slug: string;
  productCount?: number;
}

export interface ProductFormData {
  name: string;
  sku: string;
  barcode: string;
  price: number;
  costPrice: number;
  stock: number;
  minStock: number;
  unit: string;
  categoryId: string;
  imageUrl?: string | null;
}

