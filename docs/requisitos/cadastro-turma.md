**História de Usuário Completa**

**Cadastro de Turmas — Pertency**

**Épico**

**Configurações operacionais da escola especializada**

**História principal**

**Como Administrador do Pertency,**  
quero cadastrar turmas com informações essenciais, vinculadas ao ano letivo, oferta, organização da oferta, turno, estrutura curricular, professores e estudantes,  
para que a escola especializada organize sua rotina pedagógica de forma funcional, sem excesso de campos, respeitando as especificidades da Educação Infantil, Ensino Fundamental e EJA Fase I.

**1. Fundamentação nos cadernos**

Os cadernos indicam que a escola especializada não trabalha apenas com Ensino Fundamental. A organização contempla **Educação Infantil, Ensino Fundamental Anos Iniciais/Ciclo Contínuo e EJA Fase I**. 

Também indicam que a Educação Infantil deve considerar **interações e brincadeiras**, os **direitos de aprendizagem** e os **campos de experiências**. 

Para a EJA Fase I, os cadernos apontam a necessidade de articular áreas do conhecimento, currículo funcional e unidades ocupacionais, com foco em autonomia, participação social, vida prática e independência. 

O Volume I também orienta que a organização pedagógica da escola especializada envolve PPP, PPC, PTD, PAI, avaliação processual, matriz curricular e documentos escolares, por isso a turma precisa alimentar esses módulos sem virar um cadastro burocrático. 

**2. Objetivo funcional da tela**

O **Cadastro de Turmas** deve permitir que a escola configure suas turmas de forma simples, mas suficiente para alimentar:

* Cadastro de Estudantes; 

* Cadastro de Usuários; 

* PAI; 

* Planejamento; 

* Registros; 

* Frequência; 

* Relatórios; 

* Documentos escolares; 

* Histórico da turma. 

A regra principal é:

**A oferta selecionada define a estrutura curricular da turma.**

Portanto, o sistema não deve tratar **componente curricular** como campo universal.

**3. Perfis e permissões**

| Perfil | Permissão no Cadastro de Turmas |
| :---- | :---- |
| Administrador | Criar, editar, inativar, encerrar e consultar turmas |
| Direção | Visualizar turmas, estudantes e professores vinculados |
| Coordenação Pedagógica | Visualizar e acompanhar organização pedagógica da turma |
| Secretaria | Consultar turmas para matrícula e vínculo escolar do estudante |
| Professor | Visualizar apenas turmas às quais estiver vinculado |

**Regra de permissão**

Para o MVP, a recomendação é:

**Somente o Administrador cria e edita turmas.**

Direção, Coordenação e Secretaria visualizam conforme sua função. Professor visualiza apenas suas turmas vinculadas.

**4. Estrutura da tela**

A tela deve conter os seguintes blocos:

1. **Identificação da turma** 

2. **Oferta e organização** 

3. **Estrutura curricular da turma** 

4. **Professores vinculados** 

5. **Estudantes vinculados** 

6. **Observações e status** 

**5. Bloco 1 — Identificação da turma**

**Objetivo do bloco**

Registrar as informações mínimas necessárias para identificar e organizar a turma dentro da escola e do ano letivo.

**Campos**

| Campo | Tipo | Obrigatório | Origem | Objetivo | Regra |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Ano letivo | Lista suspensa | Sim | Configurações → Ano letivo | Vincular a turma ao ano escolar | Exibir apenas anos ativos ou planejados |
| Nome da turma | Texto | Sim | Preenchimento manual | Identificar a turma no sistema | Não permitir duplicidade no mesmo ano, oferta e turno |
| Turno | Lista suspensa | Sim | Configurações → Turnos | Indicar o período de funcionamento | Exibir apenas turnos ativos |
| Capacidade de estudantes | Número | Sim ou opcional | Preenchimento manual | Apoiar organização da quantidade de estudantes | Usar como alerta, não como bloqueio automático |
| Status da turma | Lista suspensa | Sim | Sistema | Controlar disponibilidade da turma | Opções: Ativa, Inativa, Encerrada |

**Campos removidos desta tela**

| Campo removido | Motivo |
| :---- | :---- |
| Código interno | Não é essencial para a rotina do MVP |
| Modalidade | Sempre será Educação Especial, pode ficar automática |
| Sala/ambiente | Não é essencial para o fluxo principal da turma |

**Regra específica**

O número de estudantes por turma deve respeitar atos normativos vigentes, portanto a capacidade deve funcionar como apoio de gestão, não como bloqueio automático rígido no MVP. 

**6. Bloco 2 — Oferta e organização**

**Objetivo do bloco**

Definir qual oferta educacional a turma atende, para que o sistema carregue a estrutura pedagógica correta.

**Campos**

| Campo | Tipo | Obrigatório | Origem | Objetivo | Regra |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Oferta | Lista suspensa | Sim | Configurações → Ofertas e etapas | Definir se a turma é Educação Infantil, Ensino Fundamental ou EJA | Controla os campos do bloco 3 |
| Organização da oferta | Lista dinâmica | Sim | Configuração da oferta | Detalhar a organização interna | Muda conforme a oferta |
| Matriz curricular vinculada | Lista suspensa | Sim | Configurações curriculares | Vincular a turma à matriz correta | Deve ser compatível com a oferta |

**Opções por oferta**

| Oferta | Organização da oferta |
| :---- | :---- |
| Educação Infantil | Estimulação Essencial, Pré-Escolar |
| Ensino Fundamental | 1º Ciclo, 2º Ciclo |
| EJA Fase I | Etapa única ou Fase I |

**Regras**

1. A oferta é obrigatória. 

2. A organização da oferta é obrigatória. 

3. A matriz curricular vinculada é obrigatória. 

4. A organização deve ser compatível com a oferta selecionada. 

5. Ao alterar a oferta, o sistema deve recarregar automaticamente a estrutura curricular. 

6. Se a turma já tiver estudantes, professores, PAI, planejamentos ou registros, a alteração da oferta deve ser bloqueada ou exigir justificativa de usuário autorizado. 

**7. Bloco 3 — Estrutura curricular da turma**

Este bloco é dinâmico. Ele muda conforme a oferta selecionada.

---

**7.1 Quando a oferta for Educação Infantil**

**Objetivo**

Configurar a turma com base na organização própria da Educação Infantil: campos de experiências, direitos de aprendizagem e eixos estruturantes.

**Campos**

| Campo | Tipo | Obrigatório | Origem | Objetivo | Regra |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Campos de experiências | Seleção múltipla | Sim | Matriz curricular da Educação Infantil | Organizar o planejamento da turma | Exibir os cinco campos |
| Direitos de aprendizagem | Seleção múltipla | Sim | Matriz curricular da Educação Infantil | Relacionar a turma aos direitos da etapa | Permitir seleção múltipla |
| Eixos estruturantes | Lista ou automático | Sim | Sistema | Registrar a base da Educação Infantil | Valor principal: Interações e Brincadeiras |
| Objetivo geral da turma | Texto longo | Não | Manual | Registrar foco pedagógico geral | Não substituir PAI individual |

**Campos de experiências**

* O eu, o outro e o nós; 

* Corpo, gestos e movimentos; 

* Escuta, fala, pensamento e imaginação; 

* Traços, sons, cores e formas; 

* Espaços, tempos, quantidades, relações e transformações. 

**Direitos de aprendizagem**

* Conviver; 

* Brincar; 

* Participar; 

* Explorar; 

* Expressar; 

* Conhecer-se. 

**Regras para Educação Infantil**

1. Não exibir componentes curriculares. 

2. Não exibir áreas do conhecimento. 

3. Não exibir unidades ocupacionais. 

4. Professor pode ser vinculado à turma inteira. 

5. Planejamento deve usar campos de experiências, direitos de aprendizagem, interações e brincadeiras. 

6. Registros devem ser qualitativos, funcionais e relacionados ao desenvolvimento. 

---

**7.2 Quando a oferta for Ensino Fundamental**

**Objetivo**

Configurar a turma do Ensino Fundamental com base em ciclo, etapa, áreas do conhecimento e componentes curriculares.

**Campos**

| Campo | Tipo | Obrigatório | Origem | Objetivo | Regra |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Ciclo | Lista suspensa | Sim | Configuração da oferta | Definir 1º ou 2º ciclo | Obrigatório para Ensino Fundamental |
| Etapa do ciclo | Lista suspensa | Sim ou conforme escola | Configuração da oferta | Detalhar a etapa/ano da turma | Deve ser compatível com o ciclo |
| Áreas do conhecimento | Seleção múltipla | Sim | Matriz curricular | Organizar os componentes | Carregar componentes vinculados |
| Componentes curriculares | Seleção múltipla | Sim | Matriz curricular | Definir o que será trabalhado na turma | Obrigatório para Ensino Fundamental |

**Áreas e componentes sugeridos**

| Área do conhecimento | Componentes curriculares |
| :---- | :---- |
| Linguagens | Língua Portuguesa, Arte, Educação Física |
| Matemática | Matemática |
| Ciências da Natureza | Ciências |
| Ciências Humanas | História, Geografia |
| Ensino Religioso | Ensino Religioso, se a escola utilizar |

**Regras para Ensino Fundamental**

1. Exibir áreas do conhecimento. 

2. Exibir componentes curriculares. 

3. Componentes curriculares são obrigatórios. 

4. Não exibir campos de experiências. 

5. Não exibir direitos de aprendizagem. 

6. Não exibir unidades ocupacionais. 

7. O professor pode ser vinculado por componente curricular. 

8. Planejamento deve usar área, componente, habilidade, objetivo individualizado, adaptação e registro. 

---

**7.3 Quando a oferta for EJA Fase I**

**Objetivo**

Configurar a turma da EJA considerando currículo formal, currículo funcional, áreas do conhecimento, unidades ocupacionais e eixos funcionais.

**Campos**

| Campo | Tipo | Obrigatório | Origem | Objetivo | Regra |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Áreas do conhecimento | Seleção múltipla | Sim | Matriz curricular da EJA | Organizar currículo formal | Permitir mais de uma área |
| Unidades ocupacionais | Seleção múltipla | Sim | Matriz da EJA | Articular currículo funcional | Obrigatório para EJA |
| Eixos funcionais | Seleção múltipla | Sim | Configuração funcional | Organizar vida prática, autonomia e participação | Obrigatório para EJA |
| Componentes curriculares opcionais | Seleção múltipla | Não | Matriz da EJA | Complementar a organização, se a escola quiser | Não pode ser obrigatório |

**Áreas do conhecimento**

* Linguagens; 

* Matemática; 

* Ciências da Natureza; 

* Ciências Humanas. 

**Unidades ocupacionais**

* Unidade Ocupacional de Produção; 

* Unidade Ocupacional de Formação Inicial. 

**Eixos funcionais sugeridos**

| Eixo funcional | Objetivo |
| :---- | :---- |
| Comunicação funcional | Desenvolver expressão de necessidades, compreensão e interação |
| Leitura e escrita funcional | Trabalhar leitura social, listas, bilhetes, nomes e documentos simples |
| Matemática funcional | Trabalhar dinheiro, tempo, quantidade, medidas e compras |
| Autonomia e vida diária | Desenvolver organização pessoal, higiene, alimentação e rotina |
| Vida em comunidade | Favorecer circulação social, regras e participação comunitária |
| Mundo do trabalho | Desenvolver responsabilidade, sequência de tarefas, cooperação e produção |
| Segurança e autocuidado | Trabalhar prevenção de riscos, cuidado pessoal e pedido de ajuda |

**Regras para EJA**

1. Exibir áreas do conhecimento. 

2. Exibir unidades ocupacionais. 

3. Exibir eixos funcionais. 

4. Componentes curriculares são opcionais. 

5. Não exibir campos de experiências. 

6. Não exibir direitos de aprendizagem. 

7. Não exigir ciclo. 

8. Organização da oferta deve ser Fase I ou Etapa única. 

9. Planejamento deve articular currículo formal e funcional. 

10. Registros devem permitir evidências de autonomia, participação, aprendizagem e vida prática. 

**8. Bloco 4 — Professores vinculados**

**Objetivo**

Permitir que a escola visualize e vincule professores à turma de forma simples, sem transformar a tela em cadastro de RH.

**Campos**

| Campo | Tipo | Obrigatório | Origem | Objetivo | Regra |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Nome do professor | Lista/automático | Sim | Cadastro de Usuários | Identificar o profissional vinculado | Exibir apenas usuários ativos com função docente |
| Função/Escopo de atuação | Texto ou lista | Sim | Cadastro de Usuários \+ estrutura da turma | Informar atuação do professor na turma | Deve respeitar a oferta |
| Status do vínculo | Lista | Sim | Sistema | Indicar se o professor está ativo naquela turma | Ativo ou Inativo |

**Campos que não devem aparecer**

| Campo removido | Motivo |
| :---- | :---- |
| Regime de trabalho | Dado de RH, não essencial para turma |
| Tipo de vínculo | Pode deixar burocrático no MVP |
| Carga horária semanal | Não é essencial para a finalidade da turma |
| Ações em excesso | Polui a tela e não é prioridade |

**Regras**

1. Apenas professores ativos podem ser vinculados. 

2. Professor inativo não deve aparecer para novo vínculo. 

3. Educação Infantil pode usar escopo **Turma inteira**. 

4. Ensino Fundamental usa escopo por componente curricular. 

5. EJA usa escopo por área, unidade ocupacional ou eixo funcional. 

6. Remover professor não deve apagar registros históricos. 

7. Professor só acessa dados da turma conforme seu vínculo. 

**9. Bloco 5 — Estudantes vinculados**

**Objetivo**

Permitir a visualização rápida dos estudantes vinculados à turma, sem expor informações sensíveis ou desnecessárias.

**Campos**

| Campo | Tipo | Origem | Objetivo | Regra |
| :---- | :---- | :---- | :---- | :---- |
| Nome do estudante | Automático | Cadastro de Estudante | Identificar estudante | Apenas estudantes vinculados à turma |
| Idade | Automático | Data de nascimento do estudante | Apoiar conferência da faixa etária | Mostrar idade, não mostrar data de nascimento |
| Situação | Automático | Cadastro de Estudante | Indicar se está ativo, transferido ou desligado | Deve refletir status atual |
| Visualizar | Ícone | Sistema | Abrir cadastro do estudante | Não exibir ações de edição/exclusão na tabela |

**Campos que não devem aparecer**

| Campo removido | Motivo |
| :---- | :---- |
| Data de nascimento | Informação detalhada, não necessária na tabela |
| Responsável | Informação familiar, deve ficar no Cadastro de Estudante |
| Nível de suporte | Informação sensível, deve ficar em avaliação, PAI ou condição do estudante |
| Ações de edição/exclusão | Evitar poluição e risco de alteração indevida |

**Regras**

1. Apenas estudantes ativos podem ser vinculados à turma. 

2. Estudante em análise de ingresso não pode ser vinculado. 

3. Estudante não elegível não pode ser vinculado. 

4. A turma deve ser compatível com a oferta atual do estudante. 

5. Estudantes transferidos ou desligados podem permanecer no histórico. 

6. A tabela deve mostrar apenas: nome, idade, situação e ícone de visualização. 

7. A inclusão formal do estudante deve ocorrer preferencialmente pelo Cadastro de Estudante, em Dados escolares. 

**10. Bloco 6 — Observações e status**

**Objetivo**

Registrar informações gerais da turma e controlar seu ciclo de vida de forma padronizada.

**Campos**

| Campo | Tipo | Obrigatório | Origem | Objetivo | Regra |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Observações gerais | Texto longo | Não | Manual | Registrar informações gerais da turma | Não substituir registro pedagógico individual |
| Status da turma | Lista suspensa | Sim | Sistema | Controlar disponibilidade | Deve existir apenas um status da turma |
| Data de início | Data | Sim | Manual ou calendário escolar | Registrar início da turma | Deve estar dentro do ano letivo |
| Data de término prevista | Data | Não ou conforme regra da escola | Manual ou calendário escolar | Apoiar planejamento do ano letivo | Deve ser posterior à data de início |

**Regras**

1. O item 6 deve ser igual em Educação Infantil, Ensino Fundamental e EJA. 

2. Deve existir apenas um campo **Status da turma**. 

3. O status não deve aparecer duplicado em outros blocos. 

4. Status possíveis: 

   * Ativa; 

   * Inativa; 

   * Encerrada. 

5. Turma ativa aparece para vínculos, planejamento e registros. 

6. Turma inativa não aparece para novos vínculos. 

7. Turma encerrada fica disponível apenas para histórico. 

8. Observações gerais não substituem registros individuais dos estudantes. 

9. Data de início deve estar dentro do ano letivo. 

10. Data de término prevista deve ser posterior à data de início. 

**11. Regras de integração**

**Com Cadastro de Escola**

| Regra |
| :---- |
| Toda turma pertence a uma escola |
| A escola define o contexto institucional |
| A turma não altera dados institucionais da escola |

**Com Ano Letivo**

| Regra |
| :---- |
| Toda turma pertence a um ano letivo |
| Ano letivo inativo ou encerrado não deve permitir nova turma ativa |
| Datas da turma devem estar dentro do ano letivo |

**Com Ofertas e Etapas**

| Regra |
| :---- |
| A oferta define a estrutura curricular |
| A organização da oferta deve ser compatível com a oferta |
| Oferta inativa não aparece em novas turmas |

**Com Usuários**

| Regra |
| :---- |
| Professores vinculados vêm do Cadastro de Usuários |
| Apenas usuários ativos podem ser vinculados |
| O escopo do professor depende da oferta da turma |

**Com Estudantes**

| Regra |
| :---- |
| Estudante ativo pode ser vinculado |
| Estudante em análise de ingresso não pode ser vinculado |
| Estudante não elegível não pode ser vinculado |
| Oferta atual do estudante deve ser compatível com a turma |

**Com PAI, Planejamento e Registros**

| Regra |
| :---- |
| PAI deve respeitar a estrutura da oferta |
| Planejamento deve carregar campos conforme a turma |
| Registro pedagógico deve respeitar a estrutura curricular da turma |
| Professor só registra no escopo em que está vinculado |

**12. Critérios de aceite para QA**

**CT01 — Criar turma com dados essenciais**

**Dado** que o Administrador acessa o Cadastro de Turma,  
**quando** preencher ano letivo, nome da turma, turno, capacidade, status, oferta, organização e matriz curricular,  
**então** o sistema deve permitir salvar a turma.

**CT02 — Bloquear turma sem ano letivo**

**Dado** que o campo Ano letivo está vazio,  
**quando** o Administrador clicar em Salvar turma,  
**então** o sistema deve impedir o salvamento e destacar o campo obrigatório.

**CT03 — Bloquear turma sem oferta**

**Dado** que o campo Oferta está vazio,  
**quando** o Administrador tentar salvar,  
**então** o sistema deve impedir o salvamento e solicitar a seleção da oferta.

**CT04 — Carregar estrutura de Educação Infantil**

**Dado** que a oferta selecionada é Educação Infantil,  
**quando** o sistema carregar o bloco Estrutura curricular,  
**então** deve exibir campos de experiências, direitos de aprendizagem, eixos estruturantes e objetivo geral da turma.

**CT05 — Não exibir componentes na Educação Infantil**

**Dado** que a oferta selecionada é Educação Infantil,  
**quando** o bloco Estrutura curricular for exibido,  
**então** o sistema não deve exibir componentes curriculares.

**CT06 — Carregar estrutura de Ensino Fundamental**

**Dado** que a oferta selecionada é Ensino Fundamental,  
**quando** o bloco Estrutura curricular for exibido,  
**então** o sistema deve exibir ciclo, etapa do ciclo, áreas do conhecimento e componentes curriculares.

**CT07 — Componentes obrigatórios no Ensino Fundamental**

**Dado** que a turma é de Ensino Fundamental,  
**quando** o Administrador tentar salvar sem selecionar componentes curriculares,  
**então** o sistema deve impedir o salvamento.

**CT08 — Carregar estrutura da EJA**

**Dado** que a oferta selecionada é EJA Fase I,  
**quando** o bloco Estrutura curricular for exibido,  
**então** o sistema deve exibir áreas do conhecimento, unidades ocupacionais, eixos funcionais e componentes opcionais.

**CT09 — Componentes opcionais na EJA**

**Dado** que a turma é de EJA Fase I,  
**quando** o Administrador não selecionar componentes curriculares opcionais,  
**então** o sistema deve permitir salvar a turma, desde que áreas, unidades ocupacionais e eixos funcionais estejam preenchidos.

**CT10 — Padronizar estudantes vinculados**

**Dado** que a turma possui estudantes vinculados,  
**quando** a tabela for exibida,  
**então** deve mostrar apenas nome do estudante, idade, situação e ícone de visualização.

**CT11 — Não exibir data de nascimento**

**Dado** que a tabela de estudantes vinculados está aberta,  
**quando** o usuário visualizar a turma,  
**então** o sistema não deve exibir data de nascimento.

**CT12 — Não exibir responsável**

**Dado** que a tabela de estudantes vinculados está aberta,  
**quando** o usuário visualizar a turma,  
**então** o sistema não deve exibir responsável pelo estudante.

**CT13 — Não exibir nível de suporte**

**Dado** que a tabela de estudantes vinculados está aberta,  
**quando** o usuário visualizar a turma,  
**então** o sistema não deve exibir nível de suporte.

**CT14 — Padronizar professores vinculados**

**Dado** que a turma possui professores vinculados,  
**quando** a tabela for exibida,  
**então** deve mostrar apenas nome do professor, função/escopo de atuação e status do vínculo.

**CT15 — Não exibir dados de RH do professor**

**Dado** que a tabela de professores vinculados está aberta,  
**quando** o usuário visualizar a turma,  
**então** o sistema não deve exibir regime de trabalho, tipo de vínculo ou carga horária semanal.

**CT16 — Item 6 padronizado**

**Dado** que o usuário acessa o bloco Observações e status,  
**quando** a tela for exibida,  
**então** deve apresentar observações gerais, status da turma, data de início e data de término prevista.

**CT17 — Status único**

**Dado** que a tela de Cadastro de Turma está aberta,  
**quando** o usuário visualizar os campos da tela,  
**então** deve existir apenas um campo chamado Status da turma.

**CT18 — Bloquear turma incompatível com estudante**

**Dado** que o estudante possui oferta atual Educação Infantil,  
**quando** o usuário tentar vinculá-lo a uma turma de Ensino Fundamental,  
**então** o sistema deve bloquear ou não listar essa turma.

**CT19 — Bloquear estudante em análise**

**Dado** que o estudante está com situação Em análise de ingresso,  
**quando** o usuário tentar vinculá-lo a uma turma,  
**então** o sistema deve impedir o vínculo.

**CT20 — Histórico preservado**

**Dado** que a turma possui estudantes, professores, PAI, planejamento ou registros,  
**quando** o usuário tentar excluir a turma,  
**então** o sistema deve bloquear a exclusão e permitir apenas inativar ou encerrar.

**13. Fora do escopo do MVP**

Não incluir no Cadastro de Turmas:

* código interno; 

* modalidade como campo visível; 

* sala/ambiente; 

* data de nascimento do estudante; 

* responsável do estudante; 

* nível de suporte na tabela da turma; 

* regime de trabalho do professor; 

* tipo de vínculo do professor; 

* carga horária semanal; 

* ações excessivas nas tabelas; 

* financeiro; 

* transporte detalhado; 

* merenda; 

* prontuário clínico; 

* evolução terapêutica; 

* folha de pagamento; 

* avaliação de desempenho docente; 

* diário de classe completo; 

* integração automática com SERE. 

**14. Definição de pronto, DoD**

A funcionalidade será considerada pronta quando:

1. O Administrador conseguir criar turma com os campos essenciais. 

2. A tela carregar estrutura curricular dinâmica conforme a oferta. 

3. Educação Infantil não exibir componentes curriculares. 

4. Ensino Fundamental exigir componentes curriculares. 

5. EJA permitir componentes apenas como opcionais. 

6. O bloco de estudantes mostrar somente nome, idade, situação e visualizar. 

7. O bloco de professores mostrar somente nome, função/escopo e status. 

8. Existir apenas um status da turma. 

9. O item 6 estiver padronizado em todas as ofertas. 

10. A turma alimentar corretamente Estudantes, Usuários, PAI, Planejamento, Registros e Relatórios. 

**15. História consolidada para desenvolvimento**

**Como Administrador do Pertency, quero cadastrar turmas com ano letivo, nome, turno, capacidade, status, oferta, organização, matriz curricular, professores e estudantes vinculados, para que a escola especializada organize sua rotina pedagógica de forma simples, funcional e coerente com Educação Infantil, Ensino Fundamental e EJA Fase I, sem excesso de campos e respeitando a estrutura curricular própria de cada oferta.**
