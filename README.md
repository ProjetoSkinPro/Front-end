# SkinPro - Aplicativo de Gerenciamento de Skins e Jogos

## Visão Geral

O SkinPro é uma aplicação móvel desenvolvida com React Native e Expo que permite aos usuários gerenciar itens (skins) e jogos. A aplicação se conecta a uma API RESTful para realizar operações CRUD (Create, Read, Update, Delete) em itens e jogos, incluindo o upload de imagens.

## Tecnologias Utilizadas

- **Frontend**:
  - React Native / Expo (v53)
  - TypeScript
  - Expo Router (navegação baseada em arquivos)
  - Axios (requisições HTTP)
  - Expo Image Picker (seleção de imagens)
  - React Navigation

- **Backend**:
  - API RESTful (hospedada em `https://skinpr0.azurewebsites.net/`)
  - Endpoints para itens e jogos
  - Suporte para multipart/form-data (upload de imagens)

## Estrutura do Projeto

```
Front-end/
├── app/                    # Pasta principal de código da aplicação
│   ├── (tabs)/             # Rotas e telas da navegação por abas
│   │   ├── home.tsx        # Tela inicial do aplicativo
│   │   ├── explore.tsx     # Tela de exploração
│   │   └── _layout.tsx     # Layout compartilhado para abas
│   └── _layout.tsx         # Layout principal da aplicação
├── assets/                 # Imagens e recursos estáticos
├── components/             # Componentes reutilizáveis
├── config/                 # Configurações do projeto
│   └── api.ts              # Configuração de endpoints da API
├── constants/              # Constantes da aplicação
├── hooks/                  # Hooks personalizados
├── services/               # Serviços para comunicação com API
│   ├── api.ts              # Configuração do cliente Axios
│   ├── itemService.ts      # Serviços para gerenciamento de itens
│   ├── jogoService.ts      # Serviços para gerenciamento de jogos
│   └── skinService.ts      # Serviços adicionais para skins
└── types/                  # Definições de tipos TypeScript
```

## Instalação e Execução

1. **Pré-requisitos**:
   - Node.js (versão recomendada: 16+)
   - npm ou yarn
   - Expo CLI (`npm install -g expo-cli`)

2. **Instalação das dependências**:
   ```bash
   npm install
   ```

3. **Execução do aplicativo**:
   ```bash
   npx expo start
   ```

4. **Opções de execução**:
   - Pressione `a` para abrir no Android Emulator
   - Pressione `i` para abrir no iOS Simulator
   - Escaneie o QR code com o app Expo Go no seu dispositivo físico

## API e Endpoints

A aplicação se comunica com uma API RESTful localizada em `https://skinpr0.azurewebsites.net/`.

### Endpoints de Itens (Skins)

- **GET** `/item/list` - Lista todos os itens
- **POST** `/item/create` - Cria um novo item com imagem
- **PUT** `/item/update/{id}` - Atualiza um item existente com imagem opcional
- **DELETE** `/item/delete/{id}` - Remove um item

### Endpoints de Jogos

- **GET** `/jogo/list` - Lista todos os jogos
- **POST** `/jogo/create` - Cria um novo jogo com logo e imagem de fundo opcionais
- **PUT** `/jogo/update/{id}` - Atualiza um jogo existente com logo e imagem de fundo opcionais
- **DELETE** `/jogo/delete/{id}` - Remove um jogo

## Funcionalidades Principais

1. **Gerenciamento de Itens (Skins)**:
   - Visualização da lista de itens
   - Criação de novos itens com upload de imagem
   - Edição de itens existentes
   - Remoção de itens

2. **Gerenciamento de Jogos**:
   - Visualização da lista de jogos
   - Criação de novos jogos com upload de logo e imagem de fundo
   - Edição de jogos existentes
   - Remoção de jogos

3. **Upload de Imagens**:
   - Seleção de imagens da galeria
   - Upload de múltiplas imagens
   - Suporte para formulários multipart/form-data

## Serviços

### API Service

O serviço `api.ts` configura o cliente Axios para comunicação com a API, incluindo:

- Interceptors para tratamento de requisições e respostas
- Tratamento de erros com tentativas automáticas
- Configuração para upload de imagens via FormData
- Verificação de disponibilidade do servidor

### Item Service

O serviço `itemService.ts` fornece funções para:

- `getItems()`: Buscar todos os itens
- `createItem(formData)`: Criar um novo item com imagem
- `updateItem(id, formData)`: Atualizar um item existente
- `deleteItem(id)`: Remover um item

### Jogo Service

O serviço `jogoService.ts` fornece funções para:

- `getJogos()`: Buscar todos os jogos
- `createJogo(formData)`: Criar um novo jogo com imagens
- `updateJogo(id, formData)`: Atualizar um jogo existente
- `deleteJogo(id)`: Remover um jogo

## Tratamento de Erros

A aplicação implementa um sistema robusto de tratamento de erros:

- Tentativas automáticas para falhas de rede
- Backoff exponencial entre tentativas
- Verificação de disponibilidade do servidor
- Logs detalhados para depuração

## Contribuição

Para contribuir com o projeto:

1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a licença MIT.
