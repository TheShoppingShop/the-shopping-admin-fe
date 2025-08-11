import axios, { AxiosError, AxiosInstance } from "axios";
import { API_BASE } from "@/constants";

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
});

export type ApiError = AxiosError<{ message?: string } | string>;

api.interceptors.response.use(
  (res) => res,
  (error: ApiError) => {
    const msg =
      (typeof error.response?.data === "string"
        ? error.response?.data
        : (error.response?.data as any)?.message) || error.message || "Request failed";
    return Promise.reject(new Error(msg));
  }
);

export const http = {
  get: async <T>(url: string, params?: any) => {
    const { data } = await api.get<T>(url, { params });
    return data;
  },
  post: async <T>(url: string, body?: any, config?: any) => {
    const { data } = await api.post<T>(url, body, config);
    return data;
  },
  put: async <T>(url: string, body?: any, config?: any) => {
    const { data } = await api.put<T>(url, body, config);
    return data;
  },
  delete: async <T>(url: string) => {
    const { data } = await api.delete<T>(url);
    return data;
  },
};
