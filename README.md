# **Gerenciador de Tarefas Bacanudo**

Uma aplicação web simples, moderna e totalmente responsiva para gerenciamento e acompanhamento de tarefas diárias com prazos.
Patrocinado por: Babau do Pandeiro Corporation ©

## Funcionalidades Implementadas
### CRUD Completo de Tarefas
  - Cadastrar: Adição de novas tarefas com título e prazo limite opcional (data e horário).
  - Listar: Exibição organizada com indicação clara do status e prazos.
  - Editar: Edição inline rápida para ajustar título, data e hora da tarefa.
  - Concluir: Marcar/desmarcar tarefas com alteração visual e contador dinâmico.
  - Excluir: Remoção individual e limpeza em lote das tarefas concluídas.

### Prazos & Notificações Visuais
- Identificação automática de tarefas Atrasadas, Com vencimento hoje e Futuras.
- Destaques visuais por meio de badges coloridas com base na data limite definida.

### Filtros e Ordenação
- Filtragem por estado: Todas, Pendentes e Concluídas.
- Ordenação por Data de Criação (mais recentes) ou Data de Entrega / Prazo.

### Persistência de Dados (localStorage)
- Salvamento automático das tarefas e preferências do usuário diretamente no navegador.

### Acessibilidade e Usabilidade
- Suporte a Modo Escuro / Modo Claro com detecção das preferências do sistema.
- Feedback imediato das ações do usuário via notificações no estilo Toast.
- Design totalmente responsivo adaptado para celulares, tablets e desktops.

## Tecnologias Utilizadas
 A aplicação foi desenvolvida respeitando a restrição do uso exclusivo de tecnologias nativas (sem frameworks ou bibliotecas auxiliares como React, Vue, Bootstrap ou Tailwind):
- HTML5 Semântico: Estruturação limpa com uso correto de tags (header, main, footer, section, form, etc.).
- CSS3 Puro: Custom Properties (Variáveis CSS) para fácil alteração de temas.
- CSS Grid e Flexbox para layouts responsivos.
- Keyframes para animações de entrada e saída.
- JavaScript Vanilla (ES6+): Manipulação direta da DOM, manipulação do localStorage, gestão de eventos e funções auxiliares sem dependências externas.
- Font Awesome & Google Fonts (Inter): Ícones vetoriais e tipografia moderna.

## Como Executar a Aplicação Localmente

Como a aplicação é estática e escrita em código nativo, não requer instalação de dependências ou servidores Node.js. 
Para abrir o arquivo no seu navegador basta dar um duplo clique no arquivo index.html ou abri-lo usando extensões como o Live Server do VS Code.

## Decisões de Implementação

### Estrutura Modular em 3 Arquivos
A separação rigorosa entre a marcação (index.html), o estilo (style.css) e o comportamento (script.js) garante um código limpo, de fácil manutenção e legível.

### Gerenciamento de Estado Simplificado
Toda a aplicação é orientada por um array centralizado de objetos (tasks). Sempre que o estado muda (uma tarefa é criada, concluída ou excluída), o localStorage é sincronizado e a interface passa por uma rerenderização dinâmica.

### Tratamento de Segurança contra XSS
Utilizou-se uma função de sanitização (escapeHtml) para prevenir injeção de código malicioso nos títulos das tarefas cadastrados pelo usuário.

### Experiência do Usuário (UX):
A inclusão de data e horário limite com badges informativas (Atrasada, Hoje, etc.) resolve o problema comum de esquecimento de prazos, entregando uma ferramenta funcional e prática.
