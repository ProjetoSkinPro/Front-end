// Configuração central para API

// URL base da API
export const API_BASE_URL = 'https://skinpr0.azurewebsites.net/';

// Endpoints da API
export const API_ENDPOINTS = {
  // Endpoints para items/skins
  LIST: 'item/list',
  CREATE: 'item/create',
  UPDATE: 'item/update',
  DELETE: 'item/delete',
  
  // Endpoints para itens (original)
  ITEMS: {
    LIST: 'item/list',
    CREATE: 'item/create',
    UPDATE: 'item/update',
    DELETE: 'item/delete',
  },
  
  // Endpoints para jogos
  GAMES: {
    LIST: 'jogo/list',
    CREATE: 'jogo/create',
    UPDATE: 'jogo/update',
    DELETE: 'jogo/delete',
  }
};

// Configuração da API (legado)
const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  ENDPOINTS: API_ENDPOINTS
};

export default API_CONFIG;
