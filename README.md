# Presença App

App mobile de registro de presença escolar via QR Code, desenvolvido com React Native e Expo. O professor gera um QR Code para a aula e os alunos escaneiam para registrar presença — tudo salvo em tempo real no Firebase.

## Funcionalidades

**Professor**
- Gera QR Code para uma aula com validade de 2 horas
- Encerra a sessão a qualquer momento
- Visualiza relatório de presença por aula

**Aluno**
- Cadastro com nome e matrícula
- Escaneia o QR Code para registrar presença
- Não é possível registrar duas vezes na mesma sessão

## Tecnologias

- [Expo](https://expo.dev) + [Expo Router](https://docs.expo.dev/router/introduction/) (file-based routing)
- [React Native](https://reactnative.dev/)
- [Firebase Firestore](https://firebase.google.com/docs/firestore) (banco de dados em tempo real)
- TypeScript

## Configuração

### 1. Instale as dependências

```bash
npm install
```

### 2. Configure as variáveis de ambiente

Copie o arquivo de exemplo e preencha com as suas chaves do Firebase:

```bash
cp .env.example .env
```

As chaves estão disponíveis no [Firebase Console](https://console.firebase.google.com) em **Configurações do projeto → Seus aplicativos**.

### 3. Rode o app

```bash
npx expo start
```

Escolha a plataforma no terminal:

| Tecla | Plataforma |
|-------|-----------|
| `a` | Android (emulador ou dispositivo) |
| `i` | iOS (simulador — somente macOS) |
| `w` | Navegador web |

## Estrutura do projeto

```
src/
├── app/            # Telas (Expo Router)
│   ├── professor.tsx
│   └── explore.tsx
├── config/
│   └── firebase.ts # Inicialização do Firebase (lê do .env)
├── services/
│   └── sessions.ts # Lógica de criação e encerramento de sessões
├── theme/          # Cores, espaçamento e tipografia
│   ├── colors.ts
│   ├── spacing.ts
│   └── typography.ts
├── components/     # Componentes reutilizáveis
└── hooks/
    └── use-theme.ts
```

## Requisitos detalhados

Consulte [REQUIREMENTS.md](./REQUIREMENTS.md) para a especificação completa das funcionalidades.
