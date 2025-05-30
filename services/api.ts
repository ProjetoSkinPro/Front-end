import axios from 'axios';
import API_CONFIG from '../config/api';

// Função para verificar se o servidor está disponível
const checkServerAvailability = async (baseURL: string) => {
  try {
    // Realiza uma requisição HEAD para verificar a disponibilidade
    await axios.head(baseURL, { timeout: 3000 });
    return true;
  } catch (error) {
    console.warn('Servidor API parece estar indisponível:', error);
    return false;
  }
};

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  // Removendo o Content-Type padrão para permitir que o navegador defina automaticamente
  // com o boundary correto para requisições multipart/form-data
  headers: {
    'Accept': 'application/json',
  },
  // Adicionando timeout para evitar requisições pendentes por muito tempo
  timeout: 10000, // 10 segundos
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

// Contador de tentativas para cada requisição
const retryMap = new Map();

// Número máximo de tentativas
const MAX_RETRY_ATTEMPTS = 2;

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => {
    // Resetar contador de tentativas quando a requisição for bem-sucedida
    const url = response.config.url || '';
    retryMap.delete(url);
    return response;
  },
  async (error) => {
    const config = error.config;
    
    // Se não tem configuração ou já excedeu o número máximo de tentativas, rejeita
    if (!config || !config.url) {
      console.error('API Error (sem config):', error.message);
      return Promise.reject(error);
    }
    
    // Pega o contador atual de tentativas
    const currentRetryCount = retryMap.get(config.url) || 0;
    
    console.error('API Error:', {
      message: error.message,
      response: error.response ? {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
      } : 'No response',
      config: {
        url: config.url,
        method: config.method,
        data: config.data,
        headers: config.headers,
      },
      retryCount: currentRetryCount,
    });
    
    // Verifica se deve tentar novamente
    if (currentRetryCount < MAX_RETRY_ATTEMPTS) {
      // Se for um erro de rede (como Network Error), verifica disponibilidade do servidor
      if (error.message === 'Network Error') {
        const isServerAvailable = await checkServerAvailability(API_CONFIG.BASE_URL);
        if (!isServerAvailable) {
          return Promise.reject(new Error('Servidor indisponível. Verifique sua conexão ou tente novamente mais tarde.'));
        }
      }
      
      // Incrementa o contador de tentativas
      retryMap.set(config.url, currentRetryCount + 1);
      
      // Aguarda antes de tentar novamente (backoff exponencial)
      const delayMs = 1000 * Math.pow(2, currentRetryCount);
      console.log(`Tentando novamente em ${delayMs}ms (tentativa ${currentRetryCount + 1}/${MAX_RETRY_ATTEMPTS})`);
      
      await new Promise(resolve => setTimeout(resolve, delayMs));
      
      // Faz a nova tentativa
      return api(config);
    }
    
    // Se já tentou o máximo de vezes, rejeita com uma mensagem mais clara
    if (error.message === 'Network Error') {
      return Promise.reject(new Error('Falha na conexão com o servidor após múltiplas tentativas. Verifique sua conexão ou se o servidor está disponível.'));
    }
    
    return Promise.reject(error);
  }
);

export default api;
