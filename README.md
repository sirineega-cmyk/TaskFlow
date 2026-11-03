# TaskFlow — Gerenciador de Tarefas Web

O **TaskFlow** é uma aplicação web para cadastrar, organizar e acompanhar tarefas pessoais em um quadro Kanban. O projeto foi desenvolvido com HTML, CSS e JavaScript puro, utilizando o `localStorage` do navegador para persistir os dados.

## Funcionalidades

- Dashboard com total de tarefas, tarefas a fazer, em andamento e concluídas.
- Cadastro de tarefas com título, descrição, prioridade e prazo.
- Edição e exclusão de tarefas.
- Quadro Kanban com três colunas: A Fazer, Em Andamento e Concluídas.
- Alteração do status diretamente no cartão.
- Pesquisa pelo título.
- Filtros por prioridade e status, que podem ser combinados.
- Opção para limpar os filtros.
- Salvamento automático no `localStorage`.
- Interface responsiva para computadores, tablets e celulares.
- Identificação visual de tarefas atrasadas.

## Tecnologias

- HTML5
- CSS3
- JavaScript puro (Vanilla JavaScript)
- localStorage

Não é necessário instalar frameworks, bibliotecas, banco de dados ou servidor.

## Como executar

1. Baixe ou clone este repositório.
2. Abra a pasta do projeto.
3. Abra o arquivo `index.html` em um navegador atualizado (Google Chrome, Microsoft Edge ou Firefox).
4. Pronto! A aplicação será executada localmente.

Também é possível abrir a pasta no Visual Studio Code e utilizar a opção **Open with Live Server**, caso essa extensão já esteja instalada. Ela não é obrigatória.

## Armazenamento dos dados

As tarefas são armazenadas no `localStorage` do navegador. Portanto, os dados permanecem salvos no mesmo navegador e dispositivo após atualizar ou fechar a página. Os dados não são sincronizados entre dispositivos ou navegadores.

Para apagar os dados de demonstração, exclua as tarefas pela própria interface. Os dados também podem ser removidos nas ferramentas de desenvolvedor do navegador, em Application/Armazenamento > Local Storage.

## Estrutura do projeto

```text
TaskFlow/
├── index.html
├── style.css
├── script.js
└── README.md
```

- `index.html`: estrutura e conteúdo da página.
- `style.css`: aparência, layout e responsividade.
- `script.js`: cadastro, edição, exclusão, filtros, atualização da interface e persistência local.

## Integrantes

- Nome: **[Preencha com seu nome]**
- Turma: **[Preencha com sua turma]**

---

Projeto desenvolvido para fins educacionais.


## Identidade visual

O TaskFlow utiliza uma identidade minimalista e elegante, com tons off-white, grafite e verde-sálvia. A interface oferece modo claro e escuro, com a preferência salva no navegador.
