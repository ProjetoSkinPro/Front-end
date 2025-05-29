import React, { useState } from 'react';
// @ts-ignore
import { Modal, View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
// @ts-ignore
import { Image } from 'expo-image';
// @ts-ignore
import * as ImagePicker from 'expo-image-picker';
import { Jogo } from '../services/jogoService';

// Interface para o objeto de arquivo do React Native
interface ReactNativeImageFile {
  uri: string;
  name?: string;
  type?: string;
}

// Interface para o jogo conforme usado neste componente, sem estender a original
interface JogoExtended {
  id?: string;
  nome: string;
  logo?: string | File | ReactNativeImageFile | any; // any para compatibilidade
  imagem?: string | ReactNativeImageFile | any; // any para compatibilidade
  bg?: File | string | ReactNativeImageFile | any; // any para compatibilidade
}

interface JogoModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (formData: FormData) => Promise<void>;
  jogos: Jogo[];
  jogo?: JogoExtended | null;
}

const JogoModal: React.FC<JogoModalProps> = ({ visible, onClose, onSave, jogos, jogo }) => {
  const [nome, setNome] = useState('');
  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [imagemUri, setImagemUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const modoEdicao = !!jogo;
  
  // Atualizar o formulário quando o jogo prop mudar
  React.useEffect(() => {
    if (jogo) {
      setNome(jogo.nome || '');
      // Verificar o tipo de logo e tratar adequadamente
      if (jogo.logo) {
        // Se for uma string (URI), usar diretamente
        if (typeof jogo.logo === 'string') {
          setLogoUri(jogo.logo);
        } else {
          // Se for um objeto File/Blob, converter para string se possível
          console.log('Logo do jogo é um objeto, não uma string URI');
          // Se tivermos uma URL ou uri disponível no objeto (React Native)
          if (typeof jogo.logo === 'object' && 'uri' in jogo.logo && typeof jogo.logo.uri === 'string') {
            setLogoUri(jogo.logo.uri);
          } else {
            setLogoUri(null);
          }
        }
      } else {
        setLogoUri(null);
      }
      
      // Tratamento similar para imagem
      if (jogo.imagem) {
        if (typeof jogo.imagem === 'string') {
          setImagemUri(jogo.imagem);
        } else if (typeof jogo.imagem === 'object' && 
                   'uri' in jogo.imagem && 
                   typeof jogo.imagem.uri === 'string') {
          setImagemUri(jogo.imagem.uri);
        } else {
          setImagemUri(null);
        }
      } else {
        setImagemUri(null);
      }
    } else {
      resetForm();
    }
  }, [jogo]);

  const resetForm = () => {
    setNome('');
    setLogoUri(null);
    setImagemUri(null);
  };

  const pickLogo = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Precisamos de permissão para acessar sua galeria');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        // @ts-ignore - Usando string diretamente para evitar erros de tipo
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setLogoUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erro ao selecionar logo:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a logo');
    }
  };

  const pickImagem = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Precisamos de permissão para acessar sua galeria');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        // @ts-ignore - Usando string diretamente para evitar erros de tipo
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [16, 9],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImagemUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem');
    }
  };

  // Interface para o objeto de arquivo do React Native
  interface ReactNativeFile {
    uri: string;
    name: string;
    type: string;
  }

  // Função auxiliar para obter um File/Blob a partir de uma URI
  const getFileFromImageUri = async (uri: string): Promise<File | Blob | ReactNativeFile | null> => {
    try {
      if (!uri) return null;
      
      const filename = uri.split('/').pop() || 'image.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      
      // Verifica se é uma URI de arquivo local (React Native)
      if (uri.startsWith('file://') || uri.startsWith('content://')) {
        // Para React Native, retorna um objeto compatível com FormData
        return {
          uri,
          name: filename,
          type: type
        };
      }
      
      // Para ambiente web
      try {
        const response = await fetch(uri);
        if (!response.ok) throw new Error('Failed to fetch image');
        
        const blob = await response.blob();
        
        // Tenta criar um File se o construtor estiver disponível
        if (typeof File !== 'undefined') {
          return new File([blob], filename, { type });
        }
        
        // Fallback para Blob
        return blob;
      } catch (error) {
        console.error('Error processing image:', error);
        throw error;
      }
    } catch (err) {
      console.error('Erro ao processar imagem:', err);
      return null;
    }
  };

  const handleSave = async () => {
    if (!nome) {
      Alert.alert('Campo obrigatório', 'Por favor, preencha o nome do jogo');
      return;
    }

    // Se estiver em modo de edição, não exigir seleção de imagens
    if (!modoEdicao && (!logoUri || !imagemUri)) {
      Alert.alert('Imagens obrigatórias', 'Por favor, selecione uma logo e uma imagem para o jogo');
      return;
    }

    try {
      setIsLoading(true);
      
      // Criar FormData
      const formData = new FormData();
      formData.append('nome', nome);
      
      // Se estiver editando, incluir o ID
      if (modoEdicao && jogo?.id) {
        formData.append('id', jogo.id);
      }
      
      // Processar e adicionar o arquivo de logo
      if (logoUri) {
        console.log('Processando logo:', logoUri);
        const logoFile = await getFileFromImageUri(logoUri);
        
        if (logoFile) {
          // Log detalhado baseado no tipo do arquivo
          if ('uri' in logoFile) {
            console.log('Logo processada (React Native):', {
              fileType: 'ReactNativeFile',
              fileName: logoFile.name,
              fileUri: logoFile.uri
            });
            formData.append('logo', logoFile as any);
          } else if (logoFile instanceof File) {
            console.log('Logo processada (File):', {
              fileType: 'File',
              fileName: logoFile.name,
              fileSize: logoFile.size
            });
            formData.append('logo', logoFile);
          } else if (logoFile instanceof Blob) {
            console.log('Logo processada (Blob):', {
              fileType: 'Blob',
              fileSize: logoFile.size
            });
            formData.append('logo', logoFile);
          }
        }
      }
      
      // Processar e adicionar o arquivo de imagem de fundo
      if (imagemUri) {
        console.log('Processando imagem de fundo:', imagemUri);
        const imagemFile = await getFileFromImageUri(imagemUri);
        
        if (imagemFile) {
          // Log detalhado baseado no tipo do arquivo
          if ('uri' in imagemFile) {
            console.log('Imagem processada (React Native):', {
              fileType: 'ReactNativeFile',
              fileName: imagemFile.name,
              fileUri: imagemFile.uri
            });
            formData.append('imagem', imagemFile as any);
          } else if (imagemFile instanceof File) {
            console.log('Imagem processada (File):', {
              fileType: 'File',
              fileName: imagemFile.name,
              fileSize: imagemFile.size
            });
            formData.append('imagem', imagemFile);
          } else if (imagemFile instanceof Blob) {
            console.log('Imagem processada (Blob):', {
              fileType: 'Blob',
              fileSize: imagemFile.size
            });
            formData.append('imagem', imagemFile);
          }
        }
      }
      
      console.log('Enviando formulário de jogo:', {
        nome,
        temLogo: !!logoUri,
        temImagem: !!imagemUri,
        modoEdicao,
        id: jogo?.id
      });
      
      await onSave(formData);
      resetForm();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar jogo:', {
        error,
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined
      });
      Alert.alert('Erro', 'Não foi possível salvar o jogo. Verifique o console para mais detalhes.');
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
            <Text style={styles.modalTitle}>{modoEdicao ? 'Editar Jogo' : 'Novo Jogo'}</Text>
            
            <Text style={styles.label}>Nome do Jogo</Text>
            <TextInput
              style={styles.input}
              value={nome}
              onChangeText={setNome}
              placeholder="Nome do jogo"
            />
            
            <Text style={styles.label}>Logo</Text>
            <TouchableOpacity 
              style={styles.imageButton}
              onPress={pickLogo}
            >
              <Text style={styles.imageButtonText}>
                {logoUri ? 'Alterar Logo' : 'Selecionar Logo'}
              </Text>
            </TouchableOpacity>
            
            {logoUri && (
              <Image 
                source={{ uri: logoUri }} 
                style={styles.logoPreview} 
                contentFit="contain"
              />
            )}
            
            <Text style={styles.label}>Imagem do Jogo</Text>
            <TouchableOpacity 
              style={styles.imageButton}
              onPress={pickImagem}
            >
              <Text style={styles.imageButtonText}>
                {imagemUri ? 'Alterar Imagem' : 'Selecionar Imagem'}
              </Text>
            </TouchableOpacity>
            
            {imagemUri && (
              <Image 
                source={{ uri: imagemUri }} 
                style={styles.imagePreview} 
                contentFit="cover"
              />
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
  logoPreview: {
    width: 100,
    height: 100,
    marginTop: 10,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    marginTop: 10,
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 12,
    marginBottom: 15,
  },
  dropdownContainer: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginTop: -10,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ccc',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#666',
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

export default JogoModal;
