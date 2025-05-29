import axios from 'axios';
import API_CONFIG from '../config/api';

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  // Removendo o Content-Type padrão para permitir que o navegador defina automaticamente
  // com o boundary correto para requisições multipart/form-data
  headers: {
    'Accept': 'application/json',
  },
});

// Interceptor para adicionar headers dinamicamente com base no tipo de requisição
api.interceptors.request.use(
  async (config) => {
    // Se for uma requisição multipart/form-data
    if (config.data instanceof FormData) {
      // Remove o Content-Type para permitir que o navegador defina automaticamente
      // com o boundary correto
      if (config.headers) {
        // Garante que o Content-Type seja removido
        delete config.headers['Content-Type'];
        
        // Para React Native, precisamos garantir que o FormData seja processado corretamente
        if (typeof FormData === 'function' && config.data instanceof FormData) {
          // Se for React Native, não precisamos fazer nada especial, o FormData já está pronto
          // Apenas para garantir que não estamos modificando os dados desnecessariamente
          config.transformRequest = (data, headers) => {
            if (data instanceof FormData) {
              return data;
            }
            return data;
          };
        }
      }
    } else if (config.data && typeof config.data === 'object') {
      // Para outros tipos de dados, define como application/json
      if (config.headers) {
        config.headers['Content-Type'] = 'application/json';
      }
    }
    
    // Adiciona um timestamp para evitar cache
    if (config.params) {
      config.params = {
        ...config.params,
        _t: Date.now(),
      };
    } else {
      config.params = { _t: Date.now() };
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', {
      message: error.message,
      response: error.response ? {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
      } : 'No response',
      config: {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data,
        headers: error.config?.headers,
      },
    });
    
    return Promise.reject(error);
  }
);

export default api;
