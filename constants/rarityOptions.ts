import { RarityOption } from '../types';

// Opções de raridade para toda a aplicação
export const rarityOptions: RarityOption[] = [
  { value: 'comum', label: 'Comum', color: '#9E9E9E' },
  { value: 'incomum', label: 'Incomum', color: '#4CAF50' },
  { value: 'raro', label: 'Raro', color: '#2196F3' },
  { value: 'epico', label: 'Épico', color: '#9C27B0' },
  { value: 'lendario', label: 'Lendário', color: '#FFEB3B' },
  { value: 'mitico', label: 'Mítico', color: '#F44336' },
];

// Função para obter a cor da borda com base na raridade
export const getRarityColor = (rarity: string): string => {
  const option = rarityOptions.find(opt => opt.value.toLowerCase() === rarity.toLowerCase());
  return option ? option.color : '#FFFFFF'; // Default to white if not found
};
