import React, { useState } from 'react';
// @ts-ignore
import { Modal, View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
// @ts-ignore
import { Image } from 'expo-image';
// @ts-ignore
import * as ImagePicker from 'expo-image-picker';

interface Jogo {
  id: string;
  nome: string;
  logo?: string;
  imagem?: string;
}

interface JogoModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (formData: FormData) => Promise<void>;
  jogos: Jogo[];
  jogo?: Jogo | null;
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
      setLogoUri(jogo.logo || null);
      setImagemUri(jogo.imagem || null);
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
        mediaTypes: 'Images',
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
        mediaTypes: 'Images',
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

  const handleSave = async () => {
    if (!nome || !logoUri || !imagemUri) {
      Alert.alert('Campos obrigatórios', 'Por favor, preencha o nome e selecione as imagens');
      return;
    }

    try {
      setIsLoading(true);
      
      // Criar FormData
      const formData = new FormData();
      formData.append('nome', nome);
      
      // Adicionar o arquivo de logo
      if (logoUri) {
        const logoFilename = logoUri.split('/').pop();
        const logoMatch = /\.(\w+)$/.exec(logoFilename || '');
        const logoType = logoMatch ? `image/${logoMatch[1]}` : 'image';
        
        formData.append('logo', {
          uri: logoUri,
          name: logoFilename,
          type: logoType,
        } as any);
      }
      
      // Adicionar o arquivo de imagem
      if (imagemUri) {
        const imagemFilename = imagemUri.split('/').pop();
        const imagemMatch = /\.(\w+)$/.exec(imagemFilename || '');
        const imagemType = imagemMatch ? `image/${imagemMatch[1]}` : 'image';
        
        formData.append('imagem', {
          uri: imagemUri,
          name: imagemFilename,
          type: imagemType,
        } as any);
      }
      
      await onSave(formData);
      resetForm();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar jogo:', error);
      Alert.alert('Erro', 'Não foi possível salvar o jogo');
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
