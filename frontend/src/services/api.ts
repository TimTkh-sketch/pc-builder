import axios from "axios";
import type { Component, ComponentList, Category, Build, BuildDetail } from "../types";

const api = axios.create({ baseURL: "/api" });

export const componentApi = {
  list: (params?: {
    category?: string;
    search?: string;
    min_price?: number;
    max_price?: number;
    build_ids?: string;
    manufacturer?: string;
  }) => api.get<ComponentList[]>("/components/", { params }).then((r) => r.data),

  get: (id: number) =>
    api.get<Component>(`/components/${id}`).then((r) => r.data),

  categories: () =>
    api.get<Category[]>("/components/categories/list").then((r) => r.data),

  manufacturers: (category?: string) =>
    api.get<string[]>("/components/manufacturers/list", { params: { category } }).then((r) => r.data),
};

export interface SuggestionsResponse {
  hints: Record<string, import("../types").ComponentList[]>;
  messages: string[];
  missing_slots: string[];
}

export const suggestionsApi = {
  get: (componentIds: number[]) =>
    api
      .get<SuggestionsResponse>("/suggestions/", {
        params: { component_ids: componentIds.join(",") },
      })
      .then((r) => r.data),
};

export const buildApi = {
  list: (params?: { preset?: boolean; purpose?: string }) =>
    api.get<Build[]>("/builds/", { params }).then((r) => r.data),

  get: (id: number) => api.get<BuildDetail>(`/builds/${id}`).then((r) => r.data),

  create: (data: { name: string; description?: string; author?: string; component_ids?: number[] }) =>
    api.post<Build>("/builds/", data).then((r) => r.data),

  delete: (id: number) => api.delete(`/builds/${id}`),

  addComponent: (buildId: number, componentId: number) =>
    api.post<BuildDetail>(`/builds/${buildId}/components/${componentId}`).then((r) => r.data),

  removeComponent: (buildId: number, componentId: number) =>
    api.delete<BuildDetail>(`/builds/${buildId}/components/${componentId}`).then((r) => r.data),
};
