import api from './api';
import API_CONFIG from '../config/api';

export interface Item {
  id?: string;
  nome: string;
  descricao: string;
  jogoId: string;
  categoria: string;
  image?: File;
  raridade: string;
}

// Usando os endpoints da configuração centralizada
const ENDPOINTS = API_CONFIG.ENDPOINTS.ITEMS;

export const getItems = async () => {
  try {
    const response = await api.get(ENDPOINTS.LIST);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar itens:', error);
    throw error;
  }
};

export const createItem = async (formData: FormData) => {
  try {
    const response = await api.post(ENDPOINTS.CREATE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao criar item:', error);
    throw error;
  }
};

export const updateItem = async (id: string, formData: FormData) => {
  try {
    const response = await api.put(`${ENDPOINTS.UPDATE}/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar item:', error);
    throw error;
  }
};

export const deleteItem = async (id: string) => {
  try {
    await api.delete(`${ENDPOINTS.DELETE}/${id}`);
  } catch (error) {
    console.error('Erro ao deletar item:', error);
    throw error;
  }
};
