# ScoreMaster - Gerenciador de Pontuação para Jogos de Mesa

Um Progressive Web App (PWA) moderno e elegante para gerenciar pontuações de jogos de mesa, construído com React, TypeScript e Tailwind CSS.

## Funcionalidades

### Gerenciamento de Partidas
- Suporte para múltiplos jogos: Skyjo, Take 6, UNO, Catan e modo genérico
- Sistema agnóstico de regras baseado em configurações
- Ranking dinâmico com animações suaves
- Entrada rápida de pontuação com feedback visual
- Indicadores de líder e lanterna

### Jogadores
- Criação de jogadores com avatares personalizados
- Sistema de cores para identificação rápida
- Salvamento automático de jogadores favoritos
- Gerenciamento de múltiplos jogadores por partida

### Histórico e Torneios
- Histórico completo de partidas finalizadas
- Visualização detalhada de resultados
- Sistema de torneios para competições de múltiplas partidas
- Estatísticas por jogador

### Compartilhamento
- Geração de imagem do pódio final
- Compartilhamento direto para redes sociais
- Download de resultados

### PWA Features
- Instalável na home screen do celular
- Funciona offline com LocalStorage
- Design mobile-first e responsivo
- Dark mode nativo
- Performance otimizada

## Tech Stack

- **React 19** - Framework UI
- **TypeScript** - Type safety
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Estilização moderna
- **Framer Motion** - Animações fluidas
- **Lucide React** - Ícones elegantes
- **html2canvas** - Geração de imagens
- **vite-plugin-pwa** - Progressive Web App

## Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── GameCard.tsx    # Card de seleção de jogo
│   ├── PlayerRow.tsx   # Linha de jogador com pontuação
│   └── PlayerSelector.tsx # Seletor de jogadores
├── screens/            # Telas principais
│   ├── Dashboard.tsx   # Tela inicial
│   ├── GameSetup.tsx   # Configuração da partida
│   ├── ActiveGame.tsx  # Jogo em andamento
│   ├── Podium.tsx      # Pódio de vencedores
│   ├── History.tsx     # Histórico de partidas
│   └── Tournaments.tsx # Gerenciamento de torneios
├── context/           # Estado global
│   └── GameContext.tsx # Context API
├── config/            # Configurações
│   └── games.ts       # Definições dos jogos
├── types/             # TypeScript types
│   └── index.ts       # Tipos centralizados
├── App.tsx            # Componente principal
└── main.tsx           # Entry point
```

## Arquitetura

### GameEngine (Sistema Agnóstico)
O app usa um sistema de configuração que permite adicionar novos jogos facilmente:

```typescript
interface GameConfig {
  id: string;
  name: string;
  themeColor: string;
  victoryCondition: 'lowest_score' | 'highest_score' | 'target_score';
  winningScore?: number;
  allowNegative: boolean;
  roundBased: boolean;
}
```

### Gerenciamento de Estado
- **Context API** para estado global
- **LocalStorage** para persistência offline
- Sincronização automática entre sessões

### Design Principles
- Mobile-first e touch-friendly
- Animações suaves e feedback visual
- Cores temáticas por jogo
- Hierarquia visual clara

## Instalação

```bash
npm install
```

## Desenvolvimento

```bash
npm run dev
```

Acesse http://localhost:5173

## Build para Produção

```bash
npm run build
```

## Deploy

O app pode ser deployado em qualquer serviço de hospedagem estática:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

## Como Usar

1. **Selecione um Jogo**: Escolha entre os jogos disponíveis no dashboard
2. **Configure Jogadores**: Adicione jogadores novos ou selecione favoritos
3. **Inicie a Partida**: Comece a jogar e insira as pontuações
4. **Acompanhe o Ranking**: Veja o ranking atualizar dinamicamente
5. **Finalize e Compartilhe**: Veja o pódio e compartilhe o resultado

## Próximas Funcionalidades

- Estatísticas avançadas por jogador
- Gráficos de progressão
- Sistema de conquistas
- Multiplayer online com sincronização
- Mais jogos pré-configurados
- Temas personalizáveis

## Licença

MIT

---

Desenvolvido com React, TypeScript e muito carinho.
