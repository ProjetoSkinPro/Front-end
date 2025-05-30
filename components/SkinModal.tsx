import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { rarityOptions as defaultRarityOptions } from '../constants/rarityOptions';
import { RarityOption, SkinItem } from '../types';

type ImageInfo = {
  uri: string;
  type?: string;
  name?: string;
};

type InputValue = string | ImagePicker.ImagePickerAsset | null;

interface SkinModalProps {
  visible: boolean;
  onClose: () => void;
  skin: SkinItem | null;
  isEditing: boolean;
  onSave?: () => void;
  onInputChange?: (field: keyof SkinItem, value: InputValue) => void;
  rarityOptions: RarityOption[];
  jogos?: Array<{ id: string; nome: string }>;
}

const SkinModal = ({
  visible,
  onClose,
  skin,
  isEditing,
  onSave,
  onInputChange,
  rarityOptions = defaultRarityOptions,
  jogos = []
}: SkinModalProps & { jogos?: Array<{ id: string; nome: string }> }) => {
  // Estados para controlar a visibilidade dos dropdowns
  const [showRarityDropdown, setShowRarityDropdown] = useState(false);
  const [showGameDropdown, setShowGameDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // Opções de categoria
  const categoryOptions = [
    { value: 'SKIN', label: 'Skin' },
    { value: 'ITEM', label: 'Item' },
  ];

  // Função para obter a cor com base na raridade
  const getRarityColor = (rarityValue: string): string => {
    const option = rarityOptions.find(opt => opt.value.toLowerCase() === rarityValue?.toLowerCase());
    return option ? option.color : '#FFFFFF'; // Default to white if not found
  };

  // Função para formatar o valor da raridade para exibição
  const formatRarityLabel = (rarityValue: string): string => {
    const option = rarityOptions.find(opt => opt.value.toLowerCase() === rarityValue?.toLowerCase());
    return option ? option.label : 'Selecione a raridade';
  };

  if (!skin) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <ScrollView style={styles.scrollView}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            
            {/* Imagem da skin */}
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: typeof skin.imgUrl === 'string' ? skin.imgUrl : 
                         typeof skin.image === 'string' ? skin.image : 
                         skin.image?.uri || '' }}
                style={styles.skinImage}
                contentFit="cover"
                onError={(e) => console.log('Erro ao carregar imagem:', e)}
              />
            </View>
            
            {/* Campos de edição ou visualização */}
            {isEditing ? (
              // Modo de edição
              <View style={styles.formContainer}>
                <Text style={styles.label}>Nome:</Text>
                <TextInput
                  style={styles.input}
                  value={skin.nome || skin.name || ''}
                  onChangeText={(text) => onInputChange?.('nome', text)}
                  placeholder="Nome da skin"
                  placeholderTextColor="#888"
                />
                
                <Text style={styles.label}>Jogo:</Text>
                <TouchableOpacity 
                  style={styles.dropdownSelector}
                  onPress={() => {
                    setShowGameDropdown(!showGameDropdown);
                    setShowRarityDropdown(false);
                    setShowCategoryDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownSelectorText}>
                    {jogos.find(j => j.id === skin.jogoId)?.nome || 'Selecione o jogo'}
                  </Text>
                </TouchableOpacity>
                {showGameDropdown && (
                  <View style={styles.dropdownList}>
                    {jogos.map((jogo) => (
                      <TouchableOpacity
                        key={jogo.id}
                        style={styles.dropdownItem}
                        onPress={() => {
                          onInputChange?.('jogoId', jogo.id);
                          onInputChange?.('jogoNome', jogo.nome);
                          setShowGameDropdown(false);
                        }}
                      >
                        <Text style={styles.dropdownItemText}>{jogo.nome}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
                
                <Text style={styles.label}>Raridade:</Text>
                <TouchableOpacity 
                  style={styles.dropdownSelector}
                  onPress={() => {
                    setShowRarityDropdown(!showRarityDropdown);
                    setShowGameDropdown(false);
                    setShowCategoryDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownSelectorText}>
                    {formatRarityLabel(skin.raridade || skin.rarity || '')}
                  </Text>
                </TouchableOpacity>
                {showRarityDropdown && (
                  <View style={styles.dropdownList}>
                    {rarityOptions.map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.dropdownItem,
                          { borderLeftColor: option.color, borderLeftWidth: 3 }
                        ]}
                        onPress={() => {
                          onInputChange?.('raridade', option.value);
                          setShowRarityDropdown(false);
                        }}
                      >
                        <Text style={[styles.dropdownItemText, { color: option.color }]}>
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
                
                <Text style={styles.label}>Categoria:</Text>
                <TouchableOpacity 
                  style={styles.dropdownSelector}
                  onPress={() => {
                    setShowCategoryDropdown(!showCategoryDropdown);
                    setShowGameDropdown(false);
                    setShowRarityDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownSelectorText}>
                    {skin.categoria || 'Selecione a categoria'}
                  </Text>
                </TouchableOpacity>
                {showCategoryDropdown && (
                  <View style={styles.dropdownList}>
                    {categoryOptions.map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        style={styles.dropdownItem}
                        onPress={() => {
                          onInputChange?.('categoria', option.value);
                          setShowCategoryDropdown(false);
                        }}
                      >
                        <Text style={styles.dropdownItemText}>{option.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
                
                <Text style={styles.label}>Descrição:</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={skin.descricao || skin.description}
                  onChangeText={(text) => onInputChange?.('descricao', text)}
                  placeholder="Descrição da skin"
                  placeholderTextColor="#888"
                  multiline
                  numberOfLines={4}
                />
                
                <Text style={styles.label}>Imagem:</Text>
                <TouchableOpacity 
                  style={styles.uploadButton}
                  onPress={async () => {
                    try {
                      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                      if (status !== 'granted') {
                        Alert.alert('Permissão necessária', 'Precisamos de permissão para acessar a galeria de imagens.');
                        return;
                      }

                      const result = await ImagePicker.launchImageLibraryAsync({
                        mediaTypes: "images",
                        allowsEditing: true,
                        aspect: [4, 3],
                        quality: 1,
                      });

                      if (!result.canceled) {
                        onInputChange?.('image', result.assets[0]);
                      }
                    } catch (error) {
                      console.error('Erro ao selecionar imagem:', error);
                      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
                    }
                  }}
                >
                  <Text style={styles.uploadButtonText}>
                    {skin.image ? 'Alterar Imagem' : 'Selecionar Imagem'}
                  </Text>
                </TouchableOpacity>
                {skin.image && (
                  <Image
                    source={{ uri: typeof skin.image === 'string' ? skin.image : (skin.image as any).uri || '' }}
                    style={styles.previewImage}
                    contentFit="cover"
                  />
                )}
                
                <TouchableOpacity style={styles.saveButton} onPress={onSave}>
                  <Text style={styles.saveButtonText}>Salvar Alterações</Text>
                </TouchableOpacity>
              </View>
            ) : (
              // Modo de visualização
              <View style={styles.detailsContainer}>
                <Text style={styles.title}>{skin.nome || skin.name}</Text>
                <Text style={styles.game}>{skin.jogoNome || skin.game}</Text>
                <Text style={[styles.rarity, { color: getRarityColor(skin.raridade || skin.rarity || '') }]}>
                  {skin.raridade || skin.rarity}
                </Text>
                <Text style={styles.category}>{skin.categoria}</Text>
                <Text style={styles.description}>{skin.descricao || skin.description}</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  dropdownSelector: {
    backgroundColor: '#333',
    borderRadius: 5,
    padding: 12,
    marginBottom: 15,
  },
  dropdownSelectorText: {
    color: 'white',
    fontSize: 16,
  },
  dropdownList: {
    backgroundColor: '#222',
    borderRadius: 5,
    marginTop: -10,
    marginBottom: 15,
    maxHeight: 200,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#444',
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  dropdownItemText: {
    color: 'white',
    fontSize: 16,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalView: {
    width: '90%',
    height: '80%',
    backgroundColor: '#121212',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  scrollView: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    zIndex: 1,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 15,
  },
  skinImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  detailsContainer: {
    marginTop: 20,
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  game: {
    fontSize: 18,
    color: '#CCC',
    marginBottom: 5,
  },
  rarity: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  category: {
    fontSize: 16,
    color: '#AAA',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: 'white',
    lineHeight: 20,
  },
  formContainer: {
    marginTop: 20,
  },
  label: {
    fontSize: 16,
    color: 'white',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#333',
    color: 'white',
    borderRadius: 5,
    padding: 12,
    marginBottom: 15,
  },
  uploadButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 15,
  },
  uploadButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 5,
    marginTop: 10,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SkinModal;
