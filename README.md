# Financy Manager API

API de gerenciamento financeiro construída com Clean Architecture, Express, TypeScript e Prisma.

## 🏗️ Arquitetura

O projeto segue os princípios da Clean Architecture com as seguintes camadas:

- **Domain**: Entidades e interfaces de repositório
- **Application**: Use cases e regras de negócio
- **Infrastructure**: Implementações concretas (Prisma, Logger)
- **Presentation**: Controllers e middlewares

## 🚀 Tecnologias

- **Express**: Framework web
- **TypeScript**: Linguagem principal
- **Prisma**: ORM para banco de dados
- **TypeDI**: Injeção de dependência
- **Routing Controllers**: Decorators para controllers
- **Winston**: Sistema de logging
- **Mocha + Chai**: Testes
- **Clean Architecture**: Arquitetura limpa

## 📦 Instalação

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp env.example .env
```

4. Configure o banco de dados:
```bash
npm run prisma:generate
npm run prisma:migrate
```

## 🏃‍♂️ Executando o projeto

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm run build
npm start
```

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch
npm run test:watch
```

## 📋 Endpoints

### POST /users
Cria um novo usuário.

**Request Body:**
```json
{
  "email": "usuario@exemplo.com",
  "name": "Nome do Usuário",
  "password": "senha123"
}
```

**Response (201):**
```json
{
  "id": "user-id",
  "email": "usuario@exemplo.com",
  "name": "Nome do Usuário",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## 📁 Estrutura do Projeto

```
src/
├── domain/           # Entidades e interfaces
│   ├── entities/     # Entidades de domínio
│   ├── repositories/ # Interfaces de repositório
│   └── errors/       # Classes de erro customizadas
├── application/      # Use cases e regras de negócio
│   └── use-cases/   # Casos de uso
├── infrastructure/   # Implementações concretas
│   ├── database/    # Repositórios Prisma
│   ├── logger/      # Sistema de logging
│   └── di/          # Container de DI
└── presentation/     # Controllers e middlewares
    ├── controllers/  # Controllers da API
    └── middleware/   # Middlewares
```

## 🔧 Scripts Disponíveis

- `npm run dev`: Executa em modo desenvolvimento
- `npm run build`: Compila o projeto
- `npm start`: Executa em produção
- `npm test`: Executa os testes
- `npm run test:watch`: Executa testes em modo watch
- `npm run prisma:generate`: Gera o cliente Prisma
- `npm run prisma:migrate`: Executa migrações
- `npm run prisma:studio`: Abre o Prisma Studio
- `npm run lint`: Executa o linter
- `npm run lint:fix`: Corrige problemas do linter

## 📝 Logs

Os logs são salvos em:
- `logs/error.log`: Apenas erros
- `logs/combined.log`: Todos os logs

## 🔒 Segurança

- Helmet para headers de segurança
- Rate limiting (100 req/15min por IP)
- CORS configurado
- Validação de entrada
- Tratamento de erros centralizado

## 🚨 Sistema de Erros

O projeto utiliza um sistema de erros tipado e organizado:

### Classes de Erro Disponíveis:
- `BaseError`: Classe base para todos os erros
- `NotFoundError` (404): Recurso não encontrado
- `BadRequestError` (400): Requisição inválida
- `ConflictError` (409): Conflito de dados
- `UnauthorizedError` (401): Não autorizado
- `ForbiddenError` (403): Acesso proibido
- `ValidationError` (422): Dados inválidos

### Exemplo de Uso:
```typescript
// No use case
if (!user) {
  throw new NotFoundError('Usuário não encontrado');
}

if (!isValid) {
  throw new ValidationError('Dados inválidos');
}

if (userExists) {
  throw new ConflictError('Usuário já existe');
}
```

### Resposta de Erro:
```json
{
  "message": "Usuário não encontrado",
  "errorType": "NOT_FOUND",
  "statusCode": 404
}
``` 