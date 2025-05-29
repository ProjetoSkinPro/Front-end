import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { SkinItem } from '../types';
import { getSkins, createSkin, updateSkin, deleteSkin } from '../services/skinService';

// Dados padrão caso a API falhe
const DEFAULT_SKINS_DATA: SkinItem[] = [];

export const useSkins = () => {
  const [skins, setSkins] = useState<SkinItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estado para controle de modais
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  
  // Estado para item selecionado e edição
  const [selectedItem, setSelectedItem] = useState<SkinItem | null>(null);
  const [skinToEdit, setSkinToEdit] = useState<SkinItem | null>(null);
  
  // Carrega as skins da API
  const fetchSkins = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getSkins();
      setSkins(data);
    } catch (error) {
      console.error('Falha ao carregar skins da API:', error);
      setError('Não foi possível carregar as skins. Usando dados padrão.');
      setSkins(DEFAULT_SKINS_DATA); // Usa dados padrão em caso de erro
      Alert.alert('Erro', 'Não foi possível carregar as skins do servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  // Função para abrir o modal de edição com os dados da skin
  const handleEditPress = (item: SkinItem) => {
    setSkinToEdit(item);
    setEditModalVisible(true);
    setViewModalVisible(false); // Fecha o modal de visualização ao abrir o modal de edição
  };

  // Função para lidar com mudanças no formulário de edição
  const handleEditSkinInputChange = (field: keyof SkinItem, value: string) => {
    if (skinToEdit) {
      setSkinToEdit(prev => {
        if (!prev) return null;
        const updated = { ...prev, [field]: value };
        if (field === 'name') {
          updated.title = value; // Mantém o título sincronizado com o nome
        }
        return updated;
      });
    }
  };

  // Função para salvar a skin editada
  const handleUpdateSkin = async () => {
    if (!skinToEdit) return;
    
    try {
      setIsLoading(true);
      
      // Tenta atualizar a skin via API
      await updateSkin(skinToEdit);
      
      // Se chegou aqui, a atualização foi bem-sucedida
      setEditModalVisible(false);
      setSkinToEdit(null);
      
      // Mostra alerta de sucesso
      Alert.alert(
        'Sucesso!',
        'Skin atualizada com sucesso.',
        [{ text: 'OK' }]
      );
      
      // Recarrega a lista
      await fetchSkins();
    } catch (error) {
      console.error('Erro ao atualizar skin:', error);
      
      // Mostra mensagem de erro mais detalhada
      const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro ao atualizar a skin.';
      Alert.alert(
        'Erro',
        errorMessage,
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Função para excluir uma skin
  const handleDeletePress = (id: string) => {
    console.log('Tentando excluir skin com ID:', id);
    
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir esta skin?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              // Encontra a skin para usar o nome na confirmação
              const skinToDelete = skins.find(skin => skin.id === id);
              
              // Tenta deletar via API
              await deleteSkin(id);
              
              // Se chegou aqui, a exclusão foi bem-sucedida
              // Fecha todos os modais
              setViewModalVisible(false);
              setEditModalVisible(false);
              
              // Reinicia os itens selecionados
              setSelectedItem(null);
              setSkinToEdit(null);
              
              // Mostra alerta de sucesso
              Alert.alert(
                'Sucesso!',
                `Skin "${skinToDelete?.nome || 'Selecionada'}" excluída com sucesso.`,
                [{ text: 'OK' }]
              );
              
              // Recarrega a lista
              await fetchSkins();
            } catch (error) {
              console.error('Erro ao excluir skin:', error);
              
              // Mostra mensagem de erro mais detalhada
              const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro ao excluir a skin.';
              Alert.alert(
                'Erro',
                errorMessage,
                [{ text: 'OK' }]
              );
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  // Inicializa o hook carregando os dados
  useEffect(() => {
    fetchSkins();
  }, []);

  return {
    skins,
    isLoading,
    error,
    viewModalVisible,
    setViewModalVisible,
    editModalVisible,
    setEditModalVisible,
    addModalVisible,
    setAddModalVisible,
    selectedItem,
    setSelectedItem,
    skinToEdit,
    setSkinToEdit,
    fetchSkins,
    handleEditPress,
    handleEditSkinInputChange,
    handleUpdateSkin,
    handleDeletePress
  };
};
