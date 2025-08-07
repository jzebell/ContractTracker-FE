import api from './api';
import { LCAT, CreateLCAT, BatchUpdateRates } from '../types/LCAT.types';

export const lcatService = {
  getAll: async (): Promise<LCAT[]> => {
    const response = await api.get('/api/lcat');
    return response.data;
  },

  getById: async (id: string): Promise<LCAT> => {
    const response = await api.get(`/api/lcat/${id}`);
    return response.data;
  },

  create: async (data: CreateLCAT): Promise<LCAT> => {
    const response = await api.post('/api/lcat', data);
    return response.data;
  },

  batchUpdateRates: async (data: BatchUpdateRates): Promise<void> => {
    await api.post('/api/lcat/batch-update-rates', data);
  }
};