# Requisitos do App de Presença

## Visão Geral

Aplicativo mobile (React Native / Expo) para registro de presença em sala de aula via QR Code, com dois perfis de usuário: **Professor** e **Aluno**.

---

## Perfil: Professor

### Turmas
- Visualizar lista de alunos cadastrados na turma
- Visualizar relatório de presença por aula e por aluno

### Geração de Presença
- Gerar QR Code para registrar presença de uma aula
- O QR Code tem validade de **2 horas** a partir da geração
- Ao expirar, o professor pode gerar um novo QR Code
- A sessão de presença é salva no Firebase com: `teacherId`, `createdAt`, `expiresAt`, `date`, `active`

---

## Perfil: Aluno

### Cadastro
- No primeiro acesso, o aluno informa:
  - **Nome completo**
  - **Matrícula**
- Dados salvos localmente e/ou no Firebase

### Registro de Presença
- Abre a câmera para escanear o QR Code exibido pelo professor
- Ao escanear um QR Code válido (não expirado):
  - Registra a presença do aluno no Firebase
  - Vincula `sessionId` + `studentId` (matrícula) + `name` + `timestamp`
- Se o QR Code estiver expirado, exibe mensagem de erro
- Não permite registrar presença duas vezes na mesma sessão

---

## Regras de Negócio

| Regra | Detalhe |
|-------|---------|
| Validade do QR Code | 2 horas a partir da criação |
| Presença duplicada | Um aluno não pode registrar presença mais de uma vez por sessão |
| Sessão ativa | Apenas uma sessão ativa por professor por vez (a mais recente) |

---

## Estrutura Firebase (Firestore)

### Coleção `sessions`
```
sessions/{sessionId}
  teacherId: string
  createdAt: Timestamp
  expiresAt: Timestamp   // createdAt + 2h
  date: string           // "YYYY-MM-DD"
  active: boolean
```

### Coleção `attendances`
```
attendances/{attendanceId}
  sessionId: string
  studentId: string      // matrícula
  studentName: string
  registeredAt: Timestamp
```

### Coleção `students` (futuro)
```
students/{studentId}
  name: string
  matricula: string
  enrolledAt: Timestamp
```

---

## Telas

| Tela | Perfil | Descrição |
|------|--------|-----------|
| Professor — QR Code | Professor | Gera e exibe QR Code da aula atual |
| Professor — Relatório | Professor | Lista de presenças por sessão/aluno |
| Aluno — Cadastro | Aluno | Nome e matrícula (primeiro acesso) |
| Aluno — Escanear | Aluno | Câmera para leitura do QR Code |
