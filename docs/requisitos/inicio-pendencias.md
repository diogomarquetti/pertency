# Pertency: planejar a homepage de pendências (Início)

## Como trabalhar

Esta tarefa é **só de planejamento**. Não escreva código nem migrations até eu aprovar o plano.

1. Leia o `CLAUDE.md`, o `ARCHITECTURE.md` e o protótipo `pertency-inicio.html` (coloquei em `/docs/prototipos/`). O protótipo é a referência visual e de comportamento.
2. Leia o código e o schema do Supabase dos módulos que geram pendências: **Cadastro de Estudante** (Dados pessoais, Avaliação de Ingresso, Documentos, Dados escolares, Condição do estudante), **Cadastro de Turma**, **Usuários**, **Escola** e **Mantenedora**, incluindo as políticas de RLS e a configuração central de ofertas.
3. Me devolva o plano no formato da seção "Entrega do plano" e espere meu OK.

Regras gerais (as mesmas do projeto):
- Use apenas os tokens do design system e os componentes de `/components/ui`. A única exceção são os tokens de status da seção 6, que devem ser criados no design system, não soltos no componente.
- Siga o shell atual: sidebar navy, header com breadcrumb, sino e avatar.
- Toda regra marcada **[PROVISÓRIO]** fica centralizada (constante ou tabela de configuração), com o comentário `// PROVISÓRIO: validar com P.O`.
- Terminologia: "escolas especializadas" (não "APAE"), "PAI" (não "PEI"), "Pedagogo(a)" no lugar de "Coordenação Pedagógica".

---

## 1. A ideia

A homepage não é um dashboard de números. Ela responde a uma pergunta: **o que exige a minha ação hoje?**

O Pertency deve trabalhar pelo usuário: olhar o estado dos cadastros, encontrar o que está parado ou incompleto e entregar a próxima ação, com um link que abre a tela já no ponto certo. Os cadastros são a infraestrutura; a homepage é a primeira camada de serviço em cima deles.

Esta é a **primeira entrega funcional e testável**, com o cliente piloto. Ela cobre só os cadastros que já existem. PAI e relatórios vêm depois e devem entrar como **novos tipos de pendência**, sem refazer a homepage. Por isso, a decisão de arquitetura mais importante deste plano é o conceito genérico de pendência (seção 2).

---

## 2. Conceito central: pendência

Uma pendência é um item derivado do estado dos dados. Proposta de formato (adapte ao código):

| Campo | Descrição |
|---|---|
| `tipo` | Identificador do tipo (ex.: `avaliacao_parada`) |
| `origem` | Estudante, Avaliação de Ingresso, Documentos, Turma, Usuários, Configuração |
| `entidade_id` | Registro que gerou a pendência (estudante, turma, usuário…) |
| `titulo` / `sujeito` / `descricao` | Ex.: "Avaliação parada" · "Luiza Ferreira" · "Em andamento há 14 dias. Falta a contribuição de Educação Física e o parecer da equipe." |
| `desde` | Data a partir da qual a condição existe (base para "há 14 dias") |
| `severidade` | `atrasada`, `atencao` ou `normal` (seção 4) |
| `resolve` | Perfil(is) ou usuário que resolve |
| `acompanha` | Perfis que veem a pendência para acompanhar |
| `regra` | Texto da regra que gerou a pendência, exibido em "Por que estou vendo isto?" |
| `provisorio` | Se o prazo da regra ainda é provisório |
| `destino` | Rota que abre a tela no ponto de resolver |
| `acao` | Texto do botão (ex.: "Abrir avaliação") |

Pontos que quero que você avalie e justifique no plano:

- **Calcular na leitura ou persistir?** Minha hipótese é calcular na leitura (view ou função RPC no Supabase, ou consultas em `/lib/pendencias`), porque a pendência é consequência do estado e some sozinha quando o estado muda. Não queremos uma tabela que precise ser sincronizada. Se houver motivo para persistir, explique.
- **Registro de tipos.** Cada tipo de pendência deve ser declarado num único lugar (ex.: `/lib/pendencias/tipos/*.ts`), com a consulta, quem resolve, quem acompanha, a regra e o prazo. Adicionar um tipo novo (ex.: PAI vencido) deve ser só criar um arquivo novo nesse registro.
- **Desempenho.** A homepage deve buscar tudo numa chamada (ou poucas), não uma consulta por item.
- **Escopo:** sempre filtrado pela **escola ativa**.

---

## 3. Resolver ou acompanhar

A homepage tem dois blocos:

- **Para você resolver**: pendências que o perfil logado **tem permissão de resolver**.
- **Acompanhar**: pendências que dependem de outra pessoa, mas que o perfil precisa ver. Cada item mostra "Quem resolve: <perfil>".

Regra: uma pendência só aparece em "resolver" se o perfil tem permissão de escrita na ação de destino, **de acordo com a RLS atual**. Exemplo: hoje só `administrador` grava em turmas, então "componente sem professor" é "resolver" para o Administrador e "acompanhar" para o Pedagogo(a). Verifique isso contra as políticas reais e aponte divergências entre o catálogo abaixo e a RLS.

Verifique também se um usuário pode ter mais de um perfil. Se puder, a homepage mostra a união, sem duplicar itens.

---

## 4. Severidade e ordenação

| Severidade | Quando | Exibição |
|---|---|---|
| `atrasada` | Passou do prazo da regra | Selo "Atrasada" + ícone em cor de perigo |
| `atencao` | Ação esperada, ainda dentro do prazo, ou regra sem prazo que bloqueia outro processo | Selo "Atenção" + ícone em cor de alerta |
| `normal` | Ação esperada sem urgência | Sem selo, ícone na cor da marca |

Ordenação em "resolver": severidade (atrasada → atenção → normal) e depois o mais antigo primeiro. Os prazos ficam centralizados e são **[PROVISÓRIO]**.

---

## 5. Catálogo de pendências da primeira entrega

Para **cada linha**, diga no plano: **viável com o schema atual**, **precisa de campo ou tabela nova** (qual) ou **sugiro adiar** (por quê).

| # | Tipo | Condição | Resolve | Acompanha | Prazo [PROVISÓRIO] | Destino |
|---|---|---|---|---|---|---|
| 1 | `dados_pessoais_incompletos` | Estudante "Em análise de ingresso" com campos obrigatórios de Dados pessoais vazios | Secretaria | Direção | Atrasada após 7 dias | Cadastro de Estudante › Dados pessoais |
| 2 | `avaliacao_nao_iniciada` | Dados pessoais salvos e Avaliação de Ingresso não iniciada | Pedagogo(a) | Direção | Atenção após 3 dias | Avaliação de Ingresso |
| 3 | `avaliacao_parada` | Avaliação "Em andamento" sem conclusão | Pedagogo(a) | Direção | Atrasada após 10 dias | Avaliação de Ingresso |
| 4 | `contribuicao_pendente` | Usuário está na equipe responsável e ainda não contribuiu | O próprio usuário (professor ou profissional) | Pedagogo(a) | Atenção | Avaliação de Ingresso |
| 5 | `parecer_pendente` | Todas as contribuições registradas e parecer de elegibilidade vazio | Pedagogo(a) | — | Normal | Avaliação › Análise integrada |
| 6 | `ciencia_familia_pendente` | Parecer concluído sem ciência da família | Pedagogo(a) | Direção | Atenção | Avaliação › Recomendação de elegibilidade |
| 7 | `matricula_pendente` | Parecer elegível e Dados escolares incompletos | Secretaria | Pedagogo(a), Direção | Atenção após 5 dias | Cadastro de Estudante › Dados escolares |
| 8 | `documentos_pendentes` | Estudantes ativos com documento obrigatório "Pendente". **Agrupar num item só** ("4 estudantes") | Secretaria | — | Normal | Estudantes, filtrado por documentos pendentes |
| 9 | `turma_organizacao_legada` | Turma com organização da oferta fora da configuração central | Administrador | Direção | Atenção | Turmas, filtrado por organização a revisar |
| 10 | `componente_sem_professor` | Componente da matriz da turma sem professor vinculado | Administrador | Pedagogo(a) | Atenção após 5 dias | Turma › Professores vinculados |
| 11 | `usuario_sem_escola` | Usuário ativo sem escola vinculada | Administrador | — | Normal | Usuários › Editar usuário |
| 12 | `cadastro_institucional_incompleto` | Campo obrigatório vazio em Escola ou Mantenedora | Administrador | — | Normal | Configurações › Escola ou Mantenedora |
| 13 | `vaga_disputada` | Estudantes elegíveis pretendendo a mesma turma, com menos vagas do que pedidos | Direção | Secretaria | Atenção | Turma › Estudantes vinculados |

Sobre o item 4: confirme se a Avaliação de Ingresso registra contribuição por membro da equipe. Se não registra, diga o que seria necessário.

Sobre o item 13: hoje a avaliação guarda a **oferta/organização pretendida**, não uma turma. Avalie se dá para calcular com isso (oferta + turno) ou se é melhor adiar.

---

## 6. Interface

Siga o protótipo `pertency-inicio.html`. Resumo:

**Topo da página**
- Saudação ("Bom dia, Carla") e linha de resumo: data + "Você tem 4 pendências para resolver, 1 atrasada." Sem pendências: "Nada depende de você hoje."
- O ponto vermelho do sino aparece quando há pendência para resolver. **O sino ainda não abre nada nesta entrega.**

**Coluna principal**
- Card **Para você resolver**: lista de pendências. Cada item tem ícone por origem (Lucide), título · sujeito, selo de severidade, descrição, linha de meta (origem · estado · "há X dias"), o link **"Por que estou vendo isto?"** (expande o texto da regra, com a marca "PROVISÓRIO · validar prazo com P.O" quando for o caso) e um **botão secundário** com a ação. Todos os botões são secundários, inclusive nos itens atrasados.
- Card **Acompanhar**: mesmo formato, ícone neutro, "Quem resolve: <perfil>" e botão secundário "Ver".
- Estados vazios positivos nos dois cards ("Nenhuma pendência sua hoje" / "Nada em andamento com outras pessoas").

**Coluna lateral (por perfil)**

| Perfil | Painel |
|---|---|
| Secretaria | Fila de ingresso |
| Pedagogo(a) | Fila de ingresso |
| Direção | Fila de ingresso + Ocupação das turmas |
| Professor(a) | Sua turma: alertas para a rotina |
| Administrador | Configuração da escola |

- **Fila de ingresso**: estudantes em ingresso agrupados por etapa (Dados pessoais → Avaliação de Ingresso → Parecer → Matrícula), cada um com o tempo na etapa e destaque quando atrasado. Rodapé com os não elegíveis do mês.
- **Ocupação das turmas**: barra de vagas ocupadas por turma ativa; destaque quando chegar a 90% ou mais **[PROVISÓRIO]**.
- **Sua turma**: turmas em que o professor está vinculado, com os **Alertas para a equipe** e as informações de rotina da aba Condição do estudante de cada estudante ativo. Só texto funcional; nada clínico (sem CID, sem diagnóstico). Rodapé com quantos estudantes não têm alertas.
- **Configuração da escola**: checklist de Escola, Mantenedora, Ofertas e códigos SERE, Turmas e Usuários, com o estado de cada um.

**Outros pontos**
- Sem seções numeradas ("1. Título"); a numeração é para cadastros, que têm sequência de preenchimento.
- Sem atalhos nesta entrega.
- Sem cartões de totais no topo.
- Layout responsivo: em telas estreitas, a coluna lateral vai para baixo da principal.

**Tokens de status (lacuna do design system)**
O design system não tem cores de status. Proponha a inclusão em `tokens.json` → `tokens.css` → Tailwind, com `$status: draft`. Valores usados no protótipo como ponto de partida:

| Token | Valor |
|---|---|
| `--danger` / `--danger-tint` | `#B42318` / `#FEF3F2` |
| `--warn` / `--warn-tint` | `#B54708` / `#FFFAEB` |
| `--warn-bar` | `#F79009` |
| `--ok` / `--ok-tint` | `#067647` / `#ECFDF3` |

**Não implementar** a faixa de protótipo do HTML (seletor de perfil e "Simular dia sem pendências"). Ela existia só para demonstração.

---

## 7. Dados de teste

Para a entrega ser testável com o P.O, proponha um **seed de desenvolvimento** que gere pelo menos um caso de cada tipo de pendência viável, com os perfis Administrador, Direção, Secretaria, Pedagogo(a) e Professor(a). O cenário do protótipo pode servir de base (Escola Especializada Caminhos, turma EF 2º Ciclo A · Tarde, estudantes Luiza Ferreira, Helena Costa etc.). O seed não pode rodar em produção.

---

## Fora do escopo

- Pendências de PAI, planejamento, registros e relatórios (entram depois, como novos tipos).
- Notificações por e-mail, push ou WhatsApp, e o painel do sino.
- Resumo semanal da Direção.
- Dispensar, adiar ou atribuir pendências manualmente.
- Resolver pendência direto na homepage (o botão sempre leva à tela de origem).
- Atalhos e cartões de totais.
- Qualquer uso de IA.

---

## Entrega do plano

Me devolva, nesta ordem:

1. **Auditoria do catálogo**: a tabela da seção 5 com uma coluna nova "Viabilidade" (viável / precisa de campo novo / adiar) e uma linha de justificativa por item.
2. **Divergências de permissão**: onde o "Resolve" do catálogo não bate com a RLS atual.
3. **Arquitetura proposta**: calcular na leitura ou persistir, onde fica o registro de tipos, como a homepage busca os dados, e como um tipo novo será adicionado no futuro.
4. **Arquivos e migrations**: o que será criado ou alterado (componentes, rotas, funções, views, tokens).
5. **Plano do seed** de desenvolvimento.
6. **Ordem de implementação** sugerida, em passos pequenos e testáveis.
7. **Perguntas abertas** para mim ou para o P.O.
