import { SkinItem, ImageInfo } from '../types';
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

// Função auxiliar para criar FormData a partir de um objeto SkinItem
const createSkinFormData = (skin: SkinItem): FormData => {
  const formData = new FormData();
  
  // Adiciona campos básicos
  formData.append('nome', skin.nome);
  formData.append('jogoId', skin.jogoId);
  formData.append('categoria', skin.categoria);
  // Converte a raridade para maiúsculas para corresponder ao enum do backend
  formData.append('raridade', skin.raridade.toUpperCase());
  formData.append('descricao', skin.descricao);
  
  // Adiciona a imagem se for um arquivo
  if (skin.image) {
    if (typeof skin.image === 'string') {
      formData.append('imagemUrl', skin.image);
    } else if (skin.image.uri) {
      // Verifica se está no ambiente web ou mobile
      if (typeof window !== 'undefined' && 'FormData' in window) {
        // Ambiente web - cria um FormData padrão do navegador
        const webFormData = new FormData();
        webFormData.append('nome', skin.nome);
        webFormData.append('jogoId', skin.jogoId);
        webFormData.append('categoria', skin.categoria);
        webFormData.append('raridade', skin.raridade);
        webFormData.append('descricao', skin.descricao);
        
        // Se for uma URL, adiciona como string
        if (skin.image.uri.startsWith('http')) {
          webFormData.append('imagemUrl', skin.image.uri);
        } else {
          // Se for um arquivo local, faz o upload do arquivo
          const image = skin.image as ImageInfo; // Fazemos type assertion aqui
          fetch(image.uri)
            .then(response => response.blob())
            .then(blob => {
              const file = new File([blob], image.name || 'image.jpg', { 
                type: image.type || 'image/jpeg' 
              });
              webFormData.append('imagem', file);
            });
        }
        return webFormData;
      } else {
        // Ambiente mobile - usa o FormData do React Native
        // @ts-ignore - React Native FormData type
        formData.append('imagem', {
          uri: skin.image.uri,
          name: skin.image.name || 'image.jpg',
          type: skin.image.type || 'image/jpeg',
        });
      }
    }
  }
  
  return formData;
};

// Função para criar uma nova skin na API
export const createSkin = async (newSkin: SkinItem): Promise<boolean> => {
  try {
    const formData = createSkinFormData(newSkin);
    
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CREATE}`, {
      method: 'POST',
      // Não definir o Content-Type manualmente, o navegador irá definir automaticamente
      // com o boundary correto para o FormData
      headers: {
        'Accept': 'application/json',
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro na resposta da API:', errorText);
      throw new Error(`Erro ao criar skin: ${response.status} - ${errorText}`);
    }
    
    return true;
  } catch (error) {
    console.error('Falha ao criar skin na API:', error);
    throw error; // Re-throw para que o chamador possa lidar com o erro
  }
};

// Função para atualizar uma skin na API
export const updateSkin = async (updatedSkin: SkinItem): Promise<boolean> => {
  try {
    if (!updatedSkin.id) {
      throw new Error('ID da skin não fornecido para atualização');
    }
    
    const formData = createSkinFormData(updatedSkin);
    
    // Inclui o ID na URL seguindo o padrão RESTful: /item/update/{id}
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.UPDATE}/${updatedSkin.id}`, {
      method: 'PUT',
      // Não definir o Content-Type manualmente, o navegador irá definir automaticamente
      // com o boundary correto para o FormData
      headers: {
        'Accept': 'application/json',
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro na resposta da API:', errorText);
      throw new Error(`Erro ao atualizar skin: ${response.status} - ${errorText}`);
    }
    
    return true;
  } catch (error) {
    console.error('Falha ao atualizar skin na API:', error);
    throw error; // Re-throw para que o chamador possa lidar com o erro
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
