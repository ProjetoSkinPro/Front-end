import React from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { SkinItem, RarityOption } from '../types';

interface SkinModalProps {
  visible: boolean;
  onClose: () => void;
  skin: SkinItem | null;
  isEditing: boolean;
  onSave?: () => void;
  onInputChange?: (field: keyof SkinItem, value: string) => void;
  rarityOptions: RarityOption[];
}

const SkinModal = ({
  visible,
  onClose,
  skin,
  isEditing,
  onSave,
  onInputChange,
  rarityOptions
}: SkinModalProps) => {
  // Função para obter a cor com base na raridade
  const getRarityColor = (rarityValue: string): string => {
    const option = rarityOptions.find(opt => opt.value.toLowerCase() === rarityValue.toLowerCase());
    return option ? option.color : '#FFFFFF'; // Default to white if not found
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
                source={{ uri: skin.imgUrl || skin.image }}
                style={styles.skinImage}
                contentFit="cover"
              />
            </View>
            
            {/* Campos de edição ou visualização */}
            {isEditing ? (
              // Modo de edição
              <View style={styles.formContainer}>
                <Text style={styles.label}>Nome:</Text>
                <TextInput
                  style={styles.input}
                  value={skin.nome || skin.name}
                  onChangeText={(text) => onInputChange?.('nome', text)}
                  placeholder="Nome da skin"
                  placeholderTextColor="#888"
                />
                
                <Text style={styles.label}>Jogo:</Text>
                <TextInput
                  style={styles.input}
                  value={skin.jogoNome || skin.game}
                  onChangeText={(text) => onInputChange?.('jogoNome', text)}
                  placeholder="Nome do jogo"
                  placeholderTextColor="#888"
                />
                
                <Text style={styles.label}>Raridade:</Text>
                <TextInput
                  style={styles.input}
                  value={skin.raridade || skin.rarity}
                  onChangeText={(text) => onInputChange?.('raridade', text)}
                  placeholder="Raridade"
                  placeholderTextColor="#888"
                />
                
                <Text style={styles.label}>Categoria:</Text>
                <TextInput
                  style={styles.input}
                  value={skin.categoria}
                  onChangeText={(text) => onInputChange?.('categoria', text)}
                  placeholder="Categoria"
                  placeholderTextColor="#888"
                />
                
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
                
                <Text style={styles.label}>URL da Imagem:</Text>
                <TextInput
                  style={styles.input}
                  value={skin.imgUrl || skin.image}
                  onChangeText={(text) => onInputChange?.('imgUrl', text)}
                  placeholder="URL da imagem"
                  placeholderTextColor="#888"
                />
                
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
    padding: 10,
    marginBottom: 15,
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
