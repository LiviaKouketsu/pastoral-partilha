# Prompt para o Stitch — Front-end da Pastoral da Partilha

> Copie o texto abaixo (tudo dentro do bloco) e cole no Stitch. Se o Stitch pedir
> uma tela por vez, mande a seção "Identidade visual" + "Layout geral" junto com
> cada tela.

---

Crie um **aplicativo web responsivo em português do Brasil** chamado **Pastoral da Partilha**, para uma pastoral de igreja que recebe doações de alimentos e produtos de higiene e monta cestas básicas para famílias carentes. O app é usado por voluntários (muitos mais velhos), então precisa ser **simples, acolhedor, com textos e botões grandes e fáceis de ler**.

## Identidade visual

- Inspirada na logo: um círculo azul-marinho escuro com o nome "Pastoral da Partilha" em branco e três figuras humanas estilizadas (de braços para cima, comemorando) nas cores laranja, verde e azul.
- **Cor primária (menu e cabeçalhos):** azul-marinho escuro `#13204A`.
- **Cores de destaque (das figuras da logo):** laranja `#EF6D2E`, verde `#5CB246`, azul `#1C9CD6`. Use-as em botões, selos, ícones e gráficos.
- **Fundo das páginas:** cinza bem claro `#F5F7FA`. Conteúdo em **cartões brancos com cantos arredondados e sombra suave**.
- **Tipografia:** uma sans-serif moderna e amigável (ex.: Poppins ou Inter). Títulos em negrito.
- Estilo geral: limpo, arejado, com ícones simples de linha. Acolhedor e otimista, combinando com uma pastoral.

## Layout geral

- **Menu lateral fixo à esquerda**, na cor azul-marinho `#13204A`, com a logo no topo e itens de navegação (ícone + texto):
  - Início
  - Recebimento
  - Montagem de cestas
  - Estoque
  - Famílias
  - Itens
- O item selecionado fica destacado com uma barra/fundo numa das cores de destaque.
- **Área principal à direita** com um cabeçalho (título da página + data atual) e o conteúdo organizado em cartões.
- No celular, o menu lateral vira um ícone de menu (hambúrguer) que abre por cima.

## Telas

### 1. Início (painel)
Visão geral em cartões:
- Total de **famílias ativas**.
- **Próxima distribuição**: data e quantas cestas são esperadas, por tipo (ex.: "Sexta: 10 cestas P, 4 M, 2 G").
- **Itens com estoque baixo** (lista curta, com alerta laranja/vermelho).
- Atalhos rápidos para "Recebimento" e "Montagem de cestas".

### 2. Recebimento (contabilizar alimentos)
Página para o dia em que chegam as doações.
- Seletor de **data** no topo.
- **Tabela de itens** (agrupados por Alimentos e Higiene), cada linha com nome, tamanho/embalagem e um **campo numérico para digitar a quantidade recebida**.
- Botão **"+ Adicionar item"** para quando vier algo fora da lista.
- Rodapé com o **total de itens contabilizados** e um botão grande **"Salvar recebimento"**.
- Mensagem de que o recebimento **entra automaticamente no estoque**.

### 3. Montagem de cestas
Página do dia de montar as cestas.
- Seletor de **data / distribuição** no topo.
- **Três cartões grandes, um para cada tipo de cesta (P, M, G)**, cada um com cor de destaque diferente. Em cada cartão:
  - Quantas cestas são **esperadas** (ex.: "10 esperadas" — vem do número de famílias que recebem aquele tipo).
  - Um **contador** para marcar quantas **foram montadas** (botões − e +, ou campo numérico).
  - Uma **barra de progresso** (montadas / esperadas).
- Aviso visível: **"Ao confirmar, os alimentos de cada cesta são descontados do estoque automaticamente."**
- Botão grande **"Confirmar montagem"**.

### 4. Estoque
- **Tabela de tudo em estoque**, com abas ou seções para **Alimentos** e **Higiene**.
- Colunas: item, tamanho/embalagem, quantidade atual.
- **Itens com estoque baixo destacados** (linha ou selo em laranja/vermelho).
- Barra de **busca** no topo.
- Texto explicando que o estoque **sobe no Recebimento e desce na Montagem de cestas, automaticamente**.

### 5. Famílias
- **Lista/tabela das famílias** que recebem cestas.
- Colunas: nome do responsável, nº de pessoas, **tipo de cesta (selo colorido P/M/G)**, telefone.
- Barra de **busca** e botão **"+ Nova família"** (abre um formulário em painel lateral ou modal: nome, telefone, endereço, nº de pessoas, tipo de cesta, observações).

### 6. Itens (cadastro de tipos)
- Formulário para **cadastrar um novo tipo de item** (alimento ou higiene): nome, categoria, tamanho/unidade.
- Um **interruptor "Vai na cesta?"** — porque às vezes chega algo (ex.: gelatina) que precisa ser **contabilizado no estoque, mas não entra na composição das cestas**. Quando desligado, o item aparece no estoque mas não é usado na montagem.
- Abaixo, a **lista dos itens já cadastrados**, com um selo indicando se vai na cesta ou não, e opção de editar.

Gere todas as telas seguindo essa identidade visual, em português do Brasil.
