# 🍿 Milky Movies — App Mobile

<p align="center"><i>Seu catálogo de filmes estilo Netflix, feito com React Native, integrando trailers via YouTube e cheio de funcionalidades premium.</i></p>

---

## 🎓 Projeto Integrador

**Milky Movies** é um app desenvolvido como **projeto integrador para conclusão do curso de Análise e Desenvolvimento de Sistemas**, unindo conhecimentos em:

- Front-end mobile com React Native
- Consumo de APIs REST seguras
- Interface moderna e responsiva
- Autenticação e controle de planos
- Integração com backend completo em NestJS

---

## 🎬 Sobre o Projeto

O **Milky Movies** é um aplicativo estilo **Netflix**, que permite ao usuário explorar filmes, assistir trailers, criar múltiplos perfis, selecionar planos e gerenciar formas de pagamento.

> ❗ Por ser um projeto educacional, **o app exibe apenas trailers dos filmes via YouTube**, não possuindo licença para exibir conteúdo completo.

---

### 🔑 Funcionalidades

- 🔐 **Login** e **cadastro** de usuários
- 👤 Criação e edição de **perfil do usuário**
- 💳 Cadastro, edição e troca de **cartões de crédito**
- 💸 Escolha e alteração de **planos**
- 🧾 Adição de **outras formas de pagamento**
- ❤️ Marcar e ver **filmes favoritos**
- 🔍 **Pesquisar filmes** por nome
- 🎥 Visualizar **trailers** integrados via YouTube
- 👥 Gerenciamento de **múltiplos perfis** por plano:
  - **1 perfil** → Plano básico
  - **3 perfis** → Plano padrão
  - **5 perfis** → Plano premium

> A experiência do app é visualmente inspirada no **layout da Netflix**, com organização por categorias, miniaturas com gradientes, rolagens horizontais e interface escura.

---

## ⚙️ Tecnologias Utilizadas

### 📱 Mobile

- **React Native** — Framework para desenvolvimento mobile
- **Expo** — Ambiente de build e desenvolvimento
- **React Navigation** — Navegação entre telas
- **NativeWind** — Tailwind CSS para React Native
- **Axios** — Cliente HTTP para consumo de API
- **React Native Progress** — Indicadores visuais
- **React Native Heroicons** — Ícones modernos
- **Expo Linear Gradient** — Efeitos visuais com gradientes
- **Lodash** — Utilitários para manipulação de dados

## 🌐 Por que usamos o ngrok?

O **ngrok** permite criar um **túnel seguro da sua máquina local para a internet**, gerando uma URL pública (HTTPS).

Isso é necessário porque o app mobile precisa acessar o **backend rodando localmente (localhost)**, e dispositivos móveis **não conseguem se conectar diretamente ao `localhost` do computador**.

> ✅ Com o ngrok, conseguimos **expor localmente a API NestJS** com uma URL estável, segura e acessível pelo celular ou emulador, mesmo que o backend esteja rodando localmente.

---

## 🔗 Integração com Backend

O app consome uma **API REST própria**, desenvolvida com:

- ⚙️ **NestJS** — Estrutura principal do backend
- 🛢️ **PostgreSQL** — Banco de dados relacional
- 🔄 **Prisma** — ORM moderno e eficiente
- 🔐 **JWT** — Autenticação com tokens
- 🛡️ **SGAR** — Controle de acesso por rotas e perfis

> 📁 Repositório do backend:  
[**Milky Movies API (NestJS)**](https://github.com/pfvlare/Backend-movies)


---

## 🔧 Variáveis de Ambiente (`.env`)

Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:

```env
API_BASE_URL=https://seu-endereco-ngrok.ngrok.io


