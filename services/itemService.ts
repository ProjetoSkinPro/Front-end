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
    throw new Error(`Falha ao buscar itens: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const createItem = async (formData: FormData) => {
  try {
    const response = await api.post(ENDPOINTS.CREATE, formData);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar item:', error);
    throw new Error(`Falha ao criar item: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const updateItem = async (id: string, formData: FormData) => {
  try {
    // Usar o Content-Type certo para o FormData
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    };
    
    // Log simples para acompanhamento
    console.log(`Atualizando item com ID: ${id}`);
    
    const response = await api.put(`${ENDPOINTS.UPDATE}/${id}`, formData, config);
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar item:', error);
    throw new Error(`Falha ao atualizar item: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const deleteItem = async (id: string) => {
  try {
    const response = await api.delete(`${ENDPOINTS.DELETE}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao deletar item:', error);
    throw new Error(`Falha ao deletar item: ${error instanceof Error ? error.message : String(error)}`);
  }
};
