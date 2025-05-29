// Definição de tipos para toda a aplicação

export interface SkinItem {
  id: string;
  nome: string;
  jogoId: string;
  jogoNome?: string;
  raridade: string;
  categoria: string;
  descricao: string;
  imgUrl: string;
  borderColor?: string;
  title?: string; // Para compatibilidade com código existente
  name?: string;  // Para compatibilidade com código existente
  game?: string;  // Para compatibilidade com código existente
  rarity?: string; // Para compatibilidade com código existente
  price?: string;  // Para compatibilidade com código existente
  image?: string;  // Para compatibilidade com código existente
  description?: string; // Para compatibilidade com código existente
}

export type RarityOption = {
  value: string;
  label: string;
  color: string;
};

export interface FormData {
  nome: string;
  jogo: string;
  raridade: string;
  preco: string;
  descricao: string;
  imagem: string;
}
