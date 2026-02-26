import { apiClient } from "~/lib/api";

export interface Ingredient {
  id?: string;
  name: string;
  unit: string;
  description?: string;
  min_quantity: number;
}

export const createIngredient = async (data: Omit<Ingredient, 'id'>) => {
  return await apiClient("/inventory/ingredients", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const updateIngredient = async (id: string, data: Partial<Omit<Ingredient, 'id'>>) => {
  return await apiClient(`/inventory/ingredients/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export const listIngredients = async (branchId?: string) => {
    let url = "/inventory/ingredients";
    if (branchId) {
        url += `?branch_id=${branchId}`;
    }
    return await apiClient(url);
}
