import { apiClient } from "~/lib/api";
import {
  mockListProducts,
  mockCreateProduct,
  mockUpdateProduct,
  mockGetProductPriceHistory,
} from "./__mocks__/shop.mock";
import type { Product, ProductSource } from "./shop";

const USE_MOCKS = import.meta.env.VITE_USE_MOCK_STORE === "true";

// Re-export Product / ProductSource so consumers only import from products.ts.
export type { Product, ProductSource } from "./shop";

export interface ProductPriceHistoryEntry {
  id: string;
  product_id: string;
  selling_price: number;
  changed_at: string;
}

export interface CreateProductPayload {
  name: string;
  source: ProductSource;
  selling_price: number;
  active?: boolean;
}

export type UpdateProductPayload = Partial<CreateProductPayload>;

export async function listProducts(): Promise<Product[]> {
  if (USE_MOCKS) return mockListProducts();
  const res = await apiClient<any>("/products");
  return Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
}

export async function createProduct(payload: CreateProductPayload): Promise<Product> {
  if (USE_MOCKS) return mockCreateProduct(payload);
  const res = await apiClient<any>("/products", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

export async function updateProduct(id: string, payload: UpdateProductPayload): Promise<Product> {
  if (USE_MOCKS) return mockUpdateProduct(id, payload);
  const res = await apiClient<any>(`/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

export async function getProductPriceHistory(productId: string): Promise<ProductPriceHistoryEntry[]> {
  if (USE_MOCKS) return mockGetProductPriceHistory(productId);
  const res = await apiClient<any>(`/products/${productId}/price-history`);
  return Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
}
