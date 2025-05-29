import React, { useState, useEffect } from 'react';
import { Alert, ActivityIndicator, StyleSheet, Text, TouchableOpacity, View, SafeAreaView, FlatList } from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { getItems, deleteItem, createItem, updateItem, Item } from '../../services/itemService';
import { getJogos, createJogo, Jogo } from '../../services/jogoService';
import ItemModal from '../../components/ItemModal';
import JogoModal from '../../components/JogoModal';
import SkinModal from '../../components/SkinModal';
import { useSkins } from '../../hooks/useSkins';
import { rarityOptions } from '../../constants/rarityOptions';
import { SkinItem } from '../../types';

export default function HomeScreen() {
  // Estados para itens e jogos do sistema existente
  const [jogos, setJogos] = useState<Jogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [itemModalVisible, setItemModalVisible] = useState(false);
  const [jogoModalVisible, setJogoModalVisible] = useState(false);
  const [selectedItemLegacy, setSelectedItemLegacy] = useState<Item | null>(null);
  const navigation = useNavigation();
  
  // Usar o hook personalizado para gerenciar skins
  const {
    skins: items,
    isLoading: skinsLoading,
    error: skinsError,
    viewModalVisible,
    setViewModalVisible,
    editModalVisible,
    setEditModalVisible,
    selectedItem,
    setSelectedItem,
    skinToEdit,
    setSkinToEdit,
    handleEditPress,
    handleEditSkinInputChange,
    handleUpdateSkin,
    handleDeletePress,
    fetchSkins
  } = useSkins();
  
  // Carregar dados quando o componente montar
  useEffect(() => {
    loadData();
  }, []);
  
  // Função para carregar dados
  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchSkins(), loadJogos()]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função para carregar jogos
  const loadJogos = async () => {
    try {
      const data = await getJogos();
      setJogos(data);
    } catch (error) {
      console.error('Erro ao carregar jogos:', error);
      Alert.alert('Erro', 'Não foi possível carregar os jogos.');
    }
  };
  
  // Função para salvar item
  const handleSaveItem = async (formData: FormData) => {
    try {
      if (selectedItemLegacy?.id) {
        await updateItem(selectedItemLegacy.id, formData);
        Alert.alert('Sucesso', 'Item atualizado com sucesso!');
      } else {
        await createItem(formData);
        Alert.alert('Sucesso', 'Item criado com sucesso!');
      }
      await fetchSkins();
      setItemModalVisible(false);
      setSelectedItemLegacy(null);
    } catch (error) {
      console.error('Erro ao salvar item:', error);
      Alert.alert('Erro', 'Não foi possível salvar o item.');
    }
  };
  
  // Função para salvar jogo
  const handleSaveJogo = async (formData: FormData) => {
    try {
      await createJogo(formData);
      Alert.alert('Sucesso', 'Jogo criado com sucesso!');
      await loadJogos();
      setJogoModalVisible(false);
    } catch (error) {
      console.error('Erro ao salvar jogo:', error);
      Alert.alert('Erro', 'Não foi possível salvar o jogo.');
    }
  };
  
  // Função para excluir item
  const handleDeleteItem = (id: string) => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir este item?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteItem(id);
              Alert.alert('Sucesso', 'Item excluído com sucesso!');
              await fetchSkins();
            } catch (error) {
              console.error('Erro ao excluir item:', error);
              Alert.alert('Erro', 'Não foi possível excluir o item.');
            }
          }
        }
      ]
    );
  };
  
  // Renderização dos itens na lista
  const renderItem = ({ item }: { item: SkinItem }) => {
    return (
      <TouchableOpacity
        style={[styles.cardContainer, { borderColor: item.borderColor }]}
        onPress={() => {
          // Abrir modal de visualização
          setSelectedItem(item);
          setViewModalVisible(true);
        }}
      >
        <View style={styles.cardImageContainer}>
          <Image
            source={{ uri: item.imgUrl }}
            style={styles.cardImage}
            contentFit="cover"
          />
          <View style={styles.cardActions}>
            <TouchableOpacity style={styles.actionButton} onPress={(e) => {
              e.stopPropagation();
              // Usar nossa nova função de editar skin
              handleEditPress(item);
            }}>
              <Text style={styles.actionIcon}>✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={(e) => {
              e.stopPropagation();
              // Usar nossa nova função de deletar skin
              handleDeletePress(item.id);
            }}>
              <Text style={styles.actionIcon}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.cardDetails}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.nome}</Text>
          <Text style={styles.cardSubtitle} numberOfLines={1}>{item.jogoNome}</Text>
          <Text style={[styles.cardRarity, { color: item.borderColor }]} numberOfLines={1}>{item.raridade}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {loading || skinsLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      ) : (
        <>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>SkinsPro</Text>
            <View style={styles.headerButtons}>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => setJogoModalVisible(true)}
              >
                <Text style={styles.buttonText}>+ Jogo</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => {
                  setSelectedItemLegacy(null);
                  setItemModalVisible(true);
                }}
              >
                <Text style={styles.buttonText}>+ Item</Text>
              </TouchableOpacity>
            </View>
          </View>

          <FlatList
            data={items}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.itemsContainer}
            columnWrapperStyle={styles.columnWrapper}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Nenhum item encontrado</Text>
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={() => {
                    setSelectedItemLegacy(null);
                    setItemModalVisible(true);
                  }}
                >
                  <Text style={styles.buttonText}>+ Adicionar Item</Text>
                </TouchableOpacity>
              </View>
            }
          />

          {/* Modal para visualização/edição de item legado */}
          <ItemModal
            visible={itemModalVisible}
            onClose={() => {
              setItemModalVisible(false);
              setSelectedItemLegacy(null);
            }}
            onSave={handleSaveItem}
            item={selectedItemLegacy}
            jogos={jogos.map(jogo => ({ id: jogo.id || '', nome: jogo.nome }))}
          />

          {/* Modal para adicionar jogo */}
          <JogoModal
            visible={jogoModalVisible}
            onClose={() => setJogoModalVisible(false)}
            onSave={handleSaveJogo}
          />
          
          {/* Modal para visualização de skin */}
          <SkinModal
            visible={viewModalVisible}
            onClose={() => setViewModalVisible(false)}
            skin={selectedItem}
            isEditing={false}
            rarityOptions={rarityOptions}
          />
          
          {/* Modal para edição de skin */}
          <SkinModal
            visible={editModalVisible}
            onClose={() => setEditModalVisible(false)}
            skin={skinToEdit}
            isEditing={true}
            onSave={handleUpdateSkin}
            onInputChange={handleEditSkinInputChange}
            rarityOptions={rarityOptions}
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#111',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
  },
  itemsContainer: {
    padding: 8,
    paddingBottom: 100,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    padding: 8,
  },
  cardContainer: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: '#1E1E1E',
    overflow: 'hidden',
  },
  cardImageContainer: {
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: 150,
  },
  cardActions: {
    position: 'absolute',
    top: 0,
    right: 0,
    flexDirection: 'row',
    padding: 5,
  },
  actionButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },
  actionIcon: {
    fontSize: 16,
  },
  cardDetails: {
    padding: 12,
  },
  cardTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardSubtitle: {
    color: '#CCC',
    fontSize: 14,
    marginBottom: 4,
  },
  cardRarity: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: 'white',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
});
