import React, { useState, useEffect } from 'react';
// Using @ts-ignore to bypass TypeScript errors for React Native Web components
// @ts-ignore
import { Modal, View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
// @ts-ignore
import { Image } from 'expo-image';
// @ts-ignore
import * as ImagePicker from 'expo-image-picker';
// Add .js extension to fix module resolution error or use @ts-ignore
// @ts-ignore
import { Item } from '../services/itemService';

interface ItemModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (formData: FormData) => Promise<void>;
  item?: Item | null;
  jogos: { id: string; nome: string }[];
  categorias: { id: string; nome: string }[];
  raridades: { id: string; nome: string }[];
  editando: boolean;
}

// Valores padrão dos enums
const DEFAULT_CATEGORIA = 'SKIN';
const DEFAULT_RARIDADE = 'LENDARIO';
const CATEGORIAS = ['SKIN', 'ITEM'];
const RARIDADES = ['COMUM', 'INCOMUM', 'RARO', 'EPICO', 'LENDARIO'];

const ItemModal: React.FC<ItemModalProps> = ({ visible, onClose, onSave, item, jogos, categorias, raridades, editando }) => {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState(DEFAULT_CATEGORIA);
  const [raridade, setRaridade] = useState(DEFAULT_RARIDADE);
  const [jogoId, setJogoId] = useState('');
  const [jogoDropdownVisible, setJogoDropdownVisible] = useState(false);
  const [raridadeDropdownVisible, setRaridadeDropdownVisible] = useState(false);
  const [categoriaDropdownVisible, setCategoriaDropdownVisible] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Usar as raridades e categorias fornecidas como props ou os valores padrão dos enums
  const raridadeOptions = raridades?.map(r => r.nome) || RARIDADES;
  const categoriaOptions = categorias?.map(c => c.nome) || CATEGORIAS;

  useEffect(() => {
    if (item) {
      // Preencher os campos quando estiver editando um item
      setNome(item.nome || '');
      setDescricao(item.descricao || '');
      setCategoria(item.categoria || 'SKIN'); // Padrão para SKIN
      setRaridade(item.raridade || 'LENDARIO'); // Padrão para LENDARIO
      setJogoId(item.jogoId || '');
      
      console.log('Editando item com jogoId:', item.jogoId);
      console.log('Jogos disponíveis:', jogos);
      
          // Se tivermos uma URL de imagem temporária, usá-la
      if (item.image) {
        if (typeof item.image === 'string') {
          setImageUri(item.image);
        } else if (typeof item.image === 'object' && 'uri' in item.image) {
          setImageUri((item.image as any).uri);
        }
      }
    } else {
      resetForm();
    }
  }, [item, visible, jogos]);

  const resetForm = () => {
    setNome('');
    setDescricao('');
    setCategoria(DEFAULT_CATEGORIA);
    setRaridade(DEFAULT_RARIDADE);
    setJogoId('');
    setImageUri(null);
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Precisamos de permissão para acessar sua galeria');
        return;
      }

      // @ts-ignore - Ignoring MediaTypeOptions TypeScript error
      const result = await ImagePicker.launchImageLibraryAsync({
        // @ts-ignore - Using string directly instead of enum to avoid TypeScript error
        mediaTypes: 'Images',
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem');
    }
  };

  // Função auxiliar para obter um File/Blob a partir de uma URI
  const getFileFromImageUri = async (uri: string): Promise<File | Blob | null> => {
    try {
      if (!uri) return null;
      
      const filename = uri.split('/').pop() || 'image.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      
      // Para ambiente web
      try {
        // Verifica se fetch está disponível de forma segura
        const canUseFetch = typeof window !== 'undefined' && 
                         typeof window.fetch === 'function';
        
        if (canUseFetch) {
          const response = await fetch(uri);
          if (!response.ok) throw new Error('Failed to fetch image');
          
          const blob = await response.blob();
          
          // Tenta criar um File se o construtor estiver disponível
          try {
            // @ts-ignore - File pode não estar disponível em todos os ambientes
            if (typeof File !== 'undefined') {
              return new File([blob], filename, { type });
            }
          } catch (e) {
            console.warn('File constructor not available, using Blob instead', e);
          }
          
          // Fallback para Blob
          return blob;
        }
      } catch (error) {
        console.error('Error processing image in web environment:', error);
        throw error;
      }
      
      // Para React Native
      return {
        uri,
        name: filename,
        type
      } as any;
    } catch (err) {
      console.error('Erro ao processar imagem:', err);
      return null;
    }
  };

  const handleSave = async () => {
    // Validação dos campos obrigatórios
    if (!nome || !descricao || !jogoId || !categoria || !raridade) {
      Alert.alert('Campos obrigatórios', 'Por favor, preencha todos os campos obrigatórios');
      return;
    }
    
    // Garantir que categoria e raridade tenham valores válidos
    const categoriaValida = CATEGORIAS.includes(categoria) ? categoria : DEFAULT_CATEGORIA;
    const raridadeValida = RARIDADES.includes(raridade) ? raridade : DEFAULT_RARIDADE;

    try {
      setIsLoading(true);
      
      // Criar FormData
      const formData = new FormData();
      formData.append('nome', nome);
      formData.append('descricao', descricao);
      formData.append('jogoId', jogoId);
      formData.append('categoria', categoriaValida);
      formData.append('raridade', raridadeValida);
      
      // Adicionar o arquivo de imagem apenas se houver uma nova imagem selecionada
      if (imageUri) {
        const imageFile = await getFileFromImageUri(imageUri);
        if (imageFile) {
          formData.append('image', imageFile);
        }
      }
      
      // Se estiver editando, adicionar o ID
      if (item && item.id) {
        formData.append('id', item.id);
      }
      
      console.log('Tentando enviar item com ' + (imageUri ? 'nova imagem' : 'mesma imagem'));
      
      await onSave(formData);
      resetForm();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar item:', error);
      Alert.alert('Erro', 'Não foi possível salvar o item');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <ScrollView>
            <Text style={styles.modalTitle}>{item ? 'Editar Item' : 'Novo Item'}</Text>
            
            <Text style={styles.label}>Nome</Text>
            <TextInput
              style={styles.input}
              value={nome}
              onChangeText={setNome}
              placeholder="Nome do item"
            />
            
            <Text style={styles.label}>Descrição</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={descricao}
              onChangeText={setDescricao}
              placeholder="Descrição do item"
              multiline
              numberOfLines={4}
            />
            
            <Text style={styles.label}>Categoria</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => {
                setCategoriaDropdownVisible(!categoriaDropdownVisible);
                // Fechar outros dropdowns
                setRaridadeDropdownVisible(false);
                setJogoDropdownVisible(false);
              }}
            >
              <Text style={!categoria ? styles.placeholderText : {}}>
                {categoria || 'Selecione a categoria'}
              </Text>
            </TouchableOpacity>
            
            {categoriaDropdownVisible && (
              <View style={styles.dropdownContainer}>
                {categoriaOptions.length > 0 ? (
                  categoriaOptions.map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.dropdownItem,
                        categoria === option && styles.selectedDropdownItem
                      ]}
                      onPress={() => {
                        setCategoria(option);
                        setCategoriaDropdownVisible(false);
                      }}
                    >
                      <Text style={categoria === option ? styles.selectedItemText : {}}>
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={[styles.dropdownItem, styles.placeholderText]}>
                    Nenhuma categoria disponível
                  </Text>
                )}
              </View>
            )}
            
            <Text style={styles.label}>Raridade</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => {
                setRaridadeDropdownVisible(!raridadeDropdownVisible);
                // Fechar outros dropdowns
                setCategoriaDropdownVisible(false);
                setJogoDropdownVisible(false);
              }}
            >
              <Text style={!raridade ? styles.placeholderText : {}}>
                {raridade || 'Selecione a raridade'}
              </Text>
            </TouchableOpacity>
            
            {raridadeDropdownVisible && (
              <View style={styles.dropdownContainer}>
                {raridadeOptions.length > 0 ? (
                  raridadeOptions.map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.dropdownItem,
                        raridade === option && styles.selectedDropdownItem
                      ]}
                      onPress={() => {
                        setRaridade(option);
                        setRaridadeDropdownVisible(false);
                      }}
                    >
                      <Text style={raridade === option ? styles.selectedItemText : {}}>
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={[styles.dropdownItem, styles.placeholderText]}>
                    Nenhuma raridade disponível
                  </Text>
                )}
              </View>
            )}
            
            <Text style={styles.label}>Jogo</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => {
                setJogoDropdownVisible(!jogoDropdownVisible);
                // Fechar outros dropdowns
                setCategoriaDropdownVisible(false);
                setRaridadeDropdownVisible(false);
              }}
            >
              <Text style={!jogoId ? styles.placeholderText : {}}>
                {jogos.find(j => j.id === jogoId)?.nome || 'Selecione o jogo'}
              </Text>
            </TouchableOpacity>
            
            {jogoDropdownVisible && (
              <View style={styles.dropdownContainer}>
                {jogos && jogos.length > 0 ? (
                  jogos.map((jogo) => (
                    <TouchableOpacity
                      key={jogo.id}
                      style={[
                        styles.dropdownItem,
                        jogoId === jogo.id && styles.selectedDropdownItem
                      ]}
                      onPress={() => {
                        setJogoId(jogo.id);
                        setJogoDropdownVisible(false);
                      }}
                    >
                      <Text style={jogoId === jogo.id ? styles.selectedItemText : {}}>
                        {jogo.nome}
                      </Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={[styles.dropdownItem, styles.placeholderText]}>
                    Nenhum jogo disponível
                  </Text>
                )}
              </View>
            )}
            
            <Text style={styles.label}>Imagem</Text>
            <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
              <Text style={styles.imageButtonText}>
                {imageUri ? 'Alterar Imagem' : 'Selecionar Imagem'}
              </Text>
            </TouchableOpacity>
            
            {imageUri && (
              <Image source={{ uri: imageUri }} style={styles.imagePreview} />
            )}
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.saveButton, isLoading && styles.disabledButton]} 
                onPress={handleSave}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>{isLoading ? 'Salvando...' : 'Salvar'}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 5,
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginBottom: 15,
    maxHeight: 150,
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedDropdownItem: {
    backgroundColor: '#f0f8ff',
  },
  selectedItemText: {
    fontWeight: 'bold',
    color: '#007AFF',
  },
  selectedText: {
    color: '#000',
  },
  placeholderText: {
    color: '#999',
  },
  imageButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 15,
  },
  imageButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 5,
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#FF3B30',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginRight: 5,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#34C759',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginLeft: 5,
  },
  disabledButton: {
    backgroundColor: '#aaa',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ItemModal;
