import { AddinModel } from "@/lib/models/addin.model";
import { CategoryModel } from "@/lib/models/category.model";
import { httpClient } from "../httpClient";

export async function getRegistryAddins(): Promise<AddinModel[]> {
  const { data } = await httpClient.get<AddinModel[]>("/registry/addins");
  return data;
}

export async function getRegistryCategories(): Promise<CategoryModel[]> {
  const { data } = await httpClient.get<CategoryModel[]>("/registry/categories");
  return data;
}
