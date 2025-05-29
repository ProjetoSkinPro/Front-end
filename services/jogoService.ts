import api from './api';
import API_CONFIG from '../config/api';

export interface Jogo {
  id?: string;
  nome: string;
  logo?: File;
  bg?: File;
}

// Usando os endpoints da configuração centralizada
const ENDPOINTS = API_CONFIG.ENDPOINTS.GAMES;

export const getJogos = async () => {
  try {
    const response = await api.get(ENDPOINTS.LIST);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar jogos:', error);
    throw error;
  }
};

export const createJogo = async (formData: FormData) => {
  try {
    const response = await api.post(ENDPOINTS.CREATE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao criar jogo:', error);
    throw error;
  }
};

export const updateJogo = async (id: string, formData: FormData) => {
  try {
    const response = await api.put(`${ENDPOINTS.UPDATE}/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar jogo:', error);
    throw error;
  }
};

export const deleteJogo = async (id: string) => {
  try {
    await api.delete(`${ENDPOINTS.DELETE}/${id}`);
  } catch (error) {
    console.error('Erro ao deletar jogo:', error);
    throw error;
  }
};
