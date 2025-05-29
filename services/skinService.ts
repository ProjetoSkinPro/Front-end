import { SkinItem } from '../types';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

// Função para buscar todas as skins da API
export const getSkins = async (): Promise<SkinItem[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.LIST}`);
    if (!response.ok) {
      throw new Error(`Erro ao buscar skins: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Falha ao carregar skins da API:', error);
    throw error;
  }
};

// Função para criar uma nova skin na API
export const createSkin = async (newSkin: SkinItem): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CREATE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newSkin),
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao criar skin: ${response.status}`);
    }
    
    return true;
  } catch (error) {
    console.error('Falha ao criar skin na API:', error);
    return false;
  }
};

// Função para atualizar uma skin na API
export const updateSkin = async (updatedSkin: SkinItem): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.UPDATE}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedSkin),
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao atualizar skin: ${response.status}`);
    }
    
    return true;
  } catch (error) {
    console.error('Falha ao atualizar skin na API:', error);
    return false;
  }
};

// Função para deletar uma skin na API
export const deleteSkin = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.DELETE}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }), // Envia apenas o ID para deletar
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao deletar skin: ${response.status}`);
    }
    
    return true;
  } catch (error) {
    console.error('Falha ao deletar skin na API:', error);
    return false;
  }
};
