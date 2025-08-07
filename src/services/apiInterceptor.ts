// src/services/apiInterceptor.ts

import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

interface InterceptorCallbacks {
  onRequest?: (config: AxiosRequestConfig) => void;
  onResponse?: (response: AxiosResponse) => void;
  onError?: (error: AxiosError) => void;
}

export const setupApiInterceptors = (callbacks: InterceptorCallbacks) => {
  // Request interceptor
  const requestInterceptor = axios.interceptors.request.use(
    (config) => {
      if (callbacks.onRequest) {
        callbacks.onRequest(config);
      }
      return config;
    },
    (error) => {
      if (callbacks.onError) {
        callbacks.onError(error);
      }
      return Promise.reject(error);
    }
  );

  // Response interceptor
  const responseInterceptor = axios.interceptors.response.use(
    (response) => {
      if (callbacks.onResponse) {
        callbacks.onResponse(response);
      }
      return response;
    },
    (error) => {
      if (callbacks.onError) {
        callbacks.onError(error);
      }
      return Promise.reject(error);
    }
  );

  // Return cleanup function
  return () => {
    axios.interceptors.request.eject(requestInterceptor);
    axios.interceptors.response.eject(responseInterceptor);
  };
};