**História do Módulo Cadastro de Estudante**

**1\. Visão geral do módulo**

O **Cadastro de Estudante** é o ponto de entrada do estudante no Pertency.

Ele não deve ser tratado apenas como uma ficha cadastral. Ele representa o início do processo institucional de ingresso na escola especializada, reunindo dados pessoais, responsáveis, situação do estudante, Avaliação de Ingresso, documentos, dados escolares, condição funcional e regras que liberam ou bloqueiam etapas posteriores, como matrícula ativa, turma, PAI, planejamento e registros pedagógicos. 

A regra principal é: **todo estudante existe como cadastro**, mas sua situação define o que pode ou não ser feito no sistema.

**2\. Situações possíveis do estudante**

O campo **Situação do estudante** deve aparecer já na primeira aba, em **Dados pessoais**, porque ele controla o fluxo do cadastro.

| Situação | Significado | Comportamento no sistema |
| :---- | :---- | :---- |
| Em análise de ingresso | Estudante cadastrado, aguardando avaliação ou parecer | Libera inicialmente apenas Dados pessoais |
| Ativo | Estudante elegível, matriculado e vinculado à escola | Libera documentos, dados escolares, condição, PAI e registros |
| Não elegível | Avaliação concluiu que não é público da escola especializada | Mantém cadastro, avaliação, parecer e encaminhamento, mas bloqueia PAI |
| Transferido | Estudante saiu por transferência | Mantém histórico para consulta |
| Desligado | Vínculo encerrado por outro motivo | Mantém histórico |
| Inativo | Cadastro arquivado ou sem movimentação ativa | Mantém dados para consulta |

Não usar o termo **pré-cadastro** na interface. A tela deve se chamar sempre **Cadastro de Estudante**. A situação inicial pode ser **Em análise de ingresso**, conforme a regra definida para o produto. 

**3\. Fluxo real da escola no sistema**

A rotina deve ser representada assim:

Família procura a escola

↓

Direção realiza acolhimento inicial

↓

Secretaria cria o Cadastro de Estudante

↓

Situação inicial: Em análise de ingresso

↓

Sistema libera somente a aba Dados pessoais

↓

Secretaria salva os dados pessoais

↓

Equipe pedagógica realiza a Avaliação de Ingresso

↓

Equipe emite parecer

↓

Se elegível: estudante passa para Ativo

↓

Secretaria conclui dados escolares, documentos e matrícula

↓

Sistema libera PAI, planejamento, registros e relatórios

Se não elegível:

↓

Sistema registra parecer, encaminhamento e ciência da família

↓

Não libera turma ativa, PAI, planejamento nem registros pedagógicos

Esse fluxo acompanha a rotina que você descreveu e respeita a lógica de que a Avaliação de Ingresso é a etapa decisória antes da efetivação do estudante como ativo. 

**4\. Ordem recomendada das abas**

A tela do estudante deve conter as abas nesta ordem:

| Ordem | Aba | Função principal |
| :---- | :---- | :---- |
| 1 | Dados pessoais | Abrir o cadastro e registrar informações básicas |
| 2 | Avaliação de Ingresso | Registrar o processo avaliativo e o parecer |
| 3 | Documentos | Controlar documentos entregues, pendentes e gerados |
| 4 | Dados escolares | Registrar matrícula, turma, turno, etapa e transporte |
| 5 | Condição do estudante | Registrar informações funcionais para rotina escolar |

A aba **Avaliação de Ingresso** deve vir logo após **Dados pessoais**, porque é ela que define a continuidade do processo. A aba **Dados escolares** só deve ser concluída quando o estudante for considerado elegível ou ativo. 

**5\. Regras de liberação das abas**

| Situação | Abas liberadas | Regras |
| :---- | :---- | :---- |
| Em análise de ingresso | Inicialmente apenas Dados pessoais | Não exige turma, matrícula interna, PAI, planejamento ou registros |
| Em análise de ingresso, após salvar dados pessoais | Dados pessoais \+ Avaliação de Ingresso | Equipe pedagógica pode iniciar avaliação |
| Ativo | Todas as abas | Exige dados escolares completos e libera fluxo pedagógico |
| Não elegível | Dados pessoais \+ Avaliação de Ingresso \+ Documentos/Parecer | Bloqueia turma ativa, PAI, planejamento e registros |
| Transferido, Desligado ou Inativo | Consulta histórica conforme permissão | Bloqueia alterações sensíveis |

Essa regra é essencial para evitar que a secretaria preencha turma, matrícula e dados escolares antes do parecer. 

**6\. Aba 1: Dados pessoais**

**Objetivo**

Registrar as informações básicas do estudante e da família para iniciar o processo de ingresso.

Quando a situação for **Em análise de ingresso**, esta será a única aba liberada inicialmente.

**Bloco 1: Identificação**

| Campo | Tipo | Obrigatório | Regra |
| :---- | :---- | :---- | :---- |
| Nome completo | Texto | Sim | Identificação oficial do estudante |
| Nome social | Texto | Não | Usar quando aplicável |
| Situação do estudante | Lista | Sim | Controla liberação das abas |
| Data de nascimento | Data | Sim | Base para cálculo automático da idade |
| Idade | Automático | Sim | Não editável |
| Sexo | Lista | Conforme regra | Feminino, Masculino, Outro, Não informado |
| Cor/raça | Lista | Conforme regra | Conforme padrão da escola |
| Nacionalidade | Texto/lista | Sim | Informação cadastral |
| Naturalidade | Texto | Sim | Cidade/UF de nascimento |
| CPF | Máscara CPF | Conforme regra | Pode ser obrigatório conforme idade/documentação |
| RG | Texto | Não | Quando disponível |
| Certidão de nascimento | Texto | Conforme regra | Registro da certidão |
| Foto do estudante | Upload | Não | Identificação visual |

O campo **Situação do estudante** deve estar no topo da aba. Quando selecionado como **Em análise de ingresso**, o sistema deve exibir um aviso:

Estudante em análise de ingresso. Preencha os dados pessoais necessários para iniciar a Avaliação de Ingresso. As demais abas serão liberadas conforme andamento do processo.

**Bloco 2: Endereço**

| Campo | Tipo | Obrigatório |
| :---- | :---- | :---- |
| Logradouro | Texto | Sim |
| Número | Texto | Sim |
| Complemento | Texto | Não |
| Bairro | Texto | Sim |
| CEP | Máscara CEP | Sim |
| Município | Texto/lista | Sim |
| UF | Lista | Sim |

**Bloco 3: Responsáveis e contatos**

| Campo | Tipo | Obrigatório | Regra |
| :---- | :---- | :---- | :---- |
| Responsável principal | Texto | Sim | Pessoa de referência |
| Parentesco | Lista/texto | Sim | Mãe, pai, avó, tutor, outro |
| Telefone principal | Telefone | Sim | Contato prioritário |
| Segundo responsável | Texto | Não | Quando houver |
| Parentesco do segundo responsável | Lista/texto | Não | Quando houver |
| Telefone do segundo responsável | Telefone | Não | Quando houver |
| Filiação | Texto | Sim | Conforme documentação |
| Quem pode retirar o estudante | Texto múltiplo | Recomendado | Permitir mais de uma pessoa |
| Contato de emergência | Texto/telefone | Recomendado | Usado em situações urgentes |

Esses dados serão usados pela secretaria, direção e equipe pedagógica. 

**7\. Aba 2: Avaliação de Ingresso**

**Objetivo**

Registrar o processo avaliativo que define se o estudante é elegível ou não para matrícula na **Escola de Educação Básica, Modalidade Educação Especial**.

Essa aba é o centro do fluxo inicial. O formulário de avaliação inicia com escola, município, equipe responsável, nome do estudante, data de nascimento, idade, etapa/série pretendida e data da avaliação. Depois avança para histórico escolar, família, contexto sociocultural e análise pedagógica. 

**Bloco 1: Identificação da avaliação**

| Campo | Tipo | Preenchimento |
| :---- | :---- | :---- |
| Escola | Automático | Escola logada |
| Município | Automático | Município da escola |
| Equipe responsável | Seleção de usuários | Coordenação, professores e equipe definida |
| Nome do estudante | Automático | Vem de Dados pessoais |
| Data de nascimento | Automático | Vem de Dados pessoais |
| Idade | Automático | Calculada |
| Etapa/série pretendida | Lista | Obrigatória |
| Data(s) da avaliação | Data múltipla | Obrigatória |
| Status da avaliação | Lista | Não iniciada, Em andamento, Concluída, Reaberta |

**Bloco 2: Informações iniciais e histórico escolar**

| Campo | Tipo | O que registrar |
| :---- | :---- | :---- |
| Breve histórico escolar | Texto longo | trajetória escolar, mudanças de escola, frequência, participação, estratégias já utilizadas, relatórios anteriores |
| Informações relevantes da família | Texto longo | rotina, comunicação, autonomia, interações, expectativas e apoios já utilizados |
| Contexto sociocultural | Texto longo | ambiente, recursos disponíveis, condições socioeconômicas e interações comunitárias |

**Bloco 3: Análise pedagógica por dimensões**

**Habilidades conceituais**

Registrar:

* atenção; 

* memória; 

* raciocínio; 

* leitura; 

* escrita; 

* interpretação; 

* noções matemáticas; 

* compreensão oral; 

* expressão oral; 

* solução de problemas; 

* desenvolvimento psicomotor; 

* coordenação fina; 

* coordenação grossa; 

* lateralidade; 

* organização espacial; 

* evidências observáveis; 

* exemplos concretos. 

**Habilidades sociais**

Registrar:

* interação com pares; 

* interação com adultos; 

* resposta a regras; 

* resposta a combinados; 

* resolução de situações sociais; 

* iniciativa; 

* autoestima; 

* responsabilidade; 

* barreiras observadas; 

* facilitadores. 

**Habilidades práticas**

Registrar:

* autocuidado; 

* alimentação; 

* higiene; 

* vestuário; 

* organização de materiais; 

* cumprimento de rotinas; 

* mobilidade; 

* segurança; 

* uso funcional de objetos; 

* autonomia em tarefas simples; 

* autonomia em tarefas complexas; 

* situações em que necessita apoio. 

O formulário orienta registrar habilidades conceituais, sociais e práticas, incluindo exemplos concretos e evidências observáveis. 

**Bloco 4: Dimensão da participação**

Registrar participação em:

* atividades individuais; 

* atividades coletivas; 

* propostas dirigidas; 

* propostas livres; 

* brincadeiras; 

* jogos; 

* atividades motoras; 

* interações sociais; 

* interações comunicativas; 

* interesses; 

* preferências; 

* barreiras; 

* condições favorecedoras. 

O formulário prevê análise da participação do estudante em atividades individuais, coletivas, brincadeiras, jogos, atividades motoras e interações. 

**Bloco 5: Dimensão do contexto**

Registrar:

* contexto escolar; 

* contexto familiar; 

* contexto comunitário; 

* elementos que impactam positivamente o desenvolvimento; 

* elementos que impactam negativamente o desenvolvimento. 

**Bloco 6: Necessidades educacionais específicas**

Registrar necessidades de:

* comunicação; 

* mediação pedagógica contínua; 

* apoio em autocuidado; 

* estruturação de ambiente; 

* organização; 

* permanência nas atividades; 

* adaptações curriculares significativas; 

* outras necessidades relevantes. 

Essas necessidades aparecem como itens próprios no formulário de Avaliação de Ingresso. 

**Bloco 7: Níveis de apoio requeridos**

| Campo | Opções |
| :---- | :---- |
| Nível de apoio requerido | Intermitente, Limitado, Extensivo, Pervasivo |
| Áreas de apoio | Acadêmica, Comunicacional, Motora, Social, Comportamental, Autonomia e vida diária |

O formulário prevê os níveis intermitente, limitado, extensivo e pervasivo, além das áreas em que os apoios são requeridos. 

**Bloco 8: Análise integrada e parecer da equipe**

Campos:

* síntese conclusiva; 

* perfil de desenvolvimento; 

* potencialidades; 

* dificuldades funcionais; 

* implicações pedagógicas; 

* justificativa para necessidade de apoio intensivo e contínuo, quando aplicável. 

**Bloco 9: Recomendação de elegibilidade**

| Campo | Tipo | Regra |
| :---- | :---- | :---- |
| Parecer de elegibilidade | Lista | Elegível ou Não elegível |
| Justificativa da decisão | Texto longo | Obrigatória |
| Encaminhamento recomendado | Lista/texto | Efetivar matrícula, rede regular com apoios, orientar família, complementação documental, outro |
| Ciência da família | Sim/Não | Com data, responsável ciente e observações |

O formulário prevê expressamente a possibilidade de o estudante ser elegível para matrícula na escola especializada ou não elegível, com recomendação de atendimento na modalidade regular com apoios e serviços de Educação Especial. 

**Bloco 10: Orientações iniciais para o PAI**

Registrar:

* estratégias de comunicação; 

* formas de mediação; 

* adaptações de acesso; 

* recursos pedagógicos; 

* recursos tecnológicos; 

* organização do ambiente; 

* estratégias comportamentais; 

* prioridades de aprendizagem; 

* atividades recomendadas para rotina escolar. 

Essas orientações são previstas no formulário como base inicial para elaboração do PAI. 

**Bloco 11: Assinaturas**

Campos:

* coordenador(a) pedagógico(a); 

* professor(a) regente; 

* professor(a) de Arte; 

* professor(a) de Educação Física; 

* data da assinatura; 

* aceite ou assinatura digital, se previsto. 

**8\. Aba 3: Documentos**

**Objetivo**

Controlar os documentos entregues pela família e os documentos produzidos pela escola.

**Checklist documental**

| Documento | Status | Anexo | Observação |
| :---- | :---- | :---- | :---- |
| Certidão/RG/CPF | Entregue/Pendente/Não se aplica | Upload | Documento pessoal |
| Comprovante de endereço | Entregue/Pendente/Não se aplica | Upload | Comprovação familiar |
| Carteira de vacinação ou declaração vacinal | Entregue/Pendente/Não se aplica | Upload | Documento de rotina escolar |
| Histórico escolar ou declaração | Entregue/Pendente/Não se aplica | Upload | Origem escolar |
| Guia de transferência | Entregue/Pendente/Não se aplica | Upload | Quando houver |
| Laudo | Entregue/Pendente/Não se aplica | Upload | Não substitui avaliação pedagógica |
| Avaliação de Ingresso | Gerado pelo sistema | PDF | Gerado após conclusão da avaliação |
| Relatório anterior | Entregue/Pendente/Não se aplica | Upload | Quando houver |
| Outros documentos | Entregue/Pendente/Não se aplica | Upload | Livre |

Para cada documento, prever:

* nome do documento; 

* status; 

* campo de anexo; 

* data de envio; 

* responsável pela conferência; 

* ações: visualizar, baixar, substituir, excluir, conforme permissão. 

Regras importantes:

* a Avaliação de Ingresso pode gerar um PDF automaticamente; 

* laudo pode ser anexado, mas não substitui avaliação pedagógica; 

* documentos pendentes não devem impedir a Avaliação de Ingresso, salvo regra da escola; 

* documentos obrigatórios para matrícula ativa podem ser definidos nas configurações. 

Essas regras seguem o escopo definido para a aba Documentos no material de produto. 

**9\. Aba 4: Dados escolares**

**Objetivo**

Registrar os dados escolares e de matrícula do estudante.

Essa aba **não deve ser exigida enquanto o estudante estiver somente em análise de ingresso**. Ela será concluída quando o estudante for considerado elegível ou ativo. 

**Bloco 1: Vínculo escolar**

| Campo | Tipo | Obrigatório quando ativo |
| :---- | :---- | :---- |
| Data de ingresso | Data | Sim |
| Data de matrícula efetiva | Data | Sim |
| Situação do estudante | Lista | Sim |
| Forma de ingresso | Lista | Sim |
| Tipo de matrícula | Lista | Sim |
| Etapa/ciclo pretendido | Lista | Sim |
| Etapa/ciclo atual | Lista | Sim |
| Turno | Lista | Sim |
| Turma | Lista | Sim |
| Matrícula interna | Texto | Sim |
| Utiliza transporte escolar? | Sim/Não | Sim |

**Campo: Utiliza transporte escolar?**

Regra do MVP:

* tipo: Sim/Não; 

* obrigatório quando o estudante estiver ativo; 

* não incluir rota, motorista, veículo ou horário; 

* módulo de transporte completo fica fora do MVP. 

Essa decisão já está prevista no escopo do módulo: registrar apenas se utiliza transporte escolar, sem criar módulo de transporte completo. 

**Bloco 2: Origem escolar**

Campos:

* rede de origem; 

* escola de origem; 

* histórico de transferência. 

**Bloco 3: Encerramento, quando aplicável**

Campos:

* data de transferência/desligamento; 

* motivo da transferência/desligamento. 

**Bloco 4: Observações escolares**

Campo:

* observações gerais sobre o vínculo escolar. 

**10\. Aba 5: Condição do estudante**

**Objetivo**

Registrar informações funcionais importantes para a rotina escolar, sem transformar o sistema em prontuário clínico. 

**Bloco 1: Condições e elegibilidade**

| Campo | Tipo | Regra |
| :---- | :---- | :---- |
| Tipo de deficiência/condição | Lista | Permitir múltiplas condições |
| Data do diagnóstico | Data | Quando houver |
| Possui laudo? | Sim/Não | Vinculado à documentação |
| CID | Texto | Opcional |
| Observações | Texto | Funcional e objetiva |
| Ações | Editar/excluir | Conforme permissão |

Exemplos de condições:

* Transtorno do Espectro Autista; 

* Deficiência Intelectual; 

* Deficiência física; 

* Deficiência múltipla; 

* Deficiência visual; 

* Deficiência auditiva; 

* Transtorno específico de aprendizagem; 

* outra condição. 

**Bloco 2: Informações importantes para rotina escolar**

Campos:

* meio de comunicação predominante; 

* comunicação alternativa utilizada; 

* necessita apoio para alimentação? 

* necessita apoio para higiene? 

* necessita apoio para locomoção? 

* alergias/restrições; 

* usa medicação? 

* observações gerais. 

**Bloco 3: Alertas para a equipe**

Campos:

* situações que exigem atenção; 

* orientações rápidas para rotina escolar; 

* estratégias de prevenção; 

* estratégias de acolhimento; 

* observações sobre segurança e bem-estar. 

Regras:

* não registrar condutas clínicas detalhadas; 

* não substituir documentos de saúde; 

* alertas devem ser funcionais, objetivos e úteis para o dia a dia. 

**11\. Permissões por perfil**

| Perfil | Permissões |
| :---- | :---- |
| Secretaria | Cria estudante, edita Dados pessoais, edita Documentos, conclui Dados escolares após parecer elegível |
| Direção | Visualiza todo o cadastro, acompanha status, registra observações institucionais, pode validar decisão final se a escola definir |
| Coordenação pedagógica | Acessa Dados pessoais, preenche Avaliação de Ingresso, edita Condição do estudante, registra parecer e encaminhamento |
| Professores da equipe avaliadora | Acessam estudantes em avaliação, contribuem na avaliação, registram observações e validam participação |
| Professor regente/professores da turma | Visualizam estudantes ativos vinculados à turma, dados funcionais e orientações relevantes |
| Administrador | Acesso completo, configura permissões, acessa histórico e auditoria |

As permissões devem proteger o parecer pedagógico, impedindo que a secretaria altere decisões técnicas da equipe pedagógica. 

**12\. Regras de negócio principais**

1. Todo estudante deve possuir situação. 

2. A situação inicial padrão pode ser **Em análise de ingresso**. 

3. Enquanto estiver em análise de ingresso, somente a aba **Dados pessoais** fica liberada inicialmente. 

4. Após salvar Dados pessoais, a aba **Avaliação de Ingresso** pode ser liberada para a equipe pedagógica. 

5. A Avaliação de Ingresso deve gerar parecer. 

6. Parecer elegível permite alteração da situação para **Ativo**. 

7. Parecer não elegível altera ou sugere alteração para **Não elegível**. 

8. Estudante não elegível não gera PAI. 

9. Estudante não elegível não deve ser vinculado a turma ativa. 

10. Estudante ativo exige dados escolares completos. 

11. Estudante ativo pode gerar PAI. 

12. Estudante ativo pode ter planejamento, registros e relatórios. 

13. A aba Condição do estudante deve conter informações funcionais, não prontuário clínico. 

14. Alteração de situação deve gerar histórico. 

15. Alteração de parecer deve registrar responsável, data e justificativa. 

16. Documentos devem permitir status **Entregue**, **Pendente** e **Não se aplica**. 

17. O campo transporte escolar deve ser Sim/Não no MVP. 

18. Dados de rota, motorista e veículo ficam fora do MVP. 

19. A Avaliação de Ingresso pode gerar documento PDF. 

20. O cadastro deve manter histórico mesmo quando o estudante for não elegível, transferido, desligado ou inativo. 

Essas regras consolidam o comportamento esperado do módulo. 

**13\. Critérios de aceite**

**Critério 1: criação em análise de ingresso**

**Dado** que a secretaria está criando um novo estudante,  
**quando** selecionar a situação **Em análise de ingresso**,  
**então** o sistema deve liberar inicialmente somente a aba **Dados pessoais**.

**Critério 2: liberação da avaliação**

**Dado** que o estudante está em análise de ingresso,  
**quando** os dados pessoais obrigatórios forem preenchidos e salvos,  
**então** o sistema deve permitir iniciar a aba **Avaliação de Ingresso**.

**Critério 3: parecer elegível**

**Dado** que a Avaliação de Ingresso foi concluída com parecer elegível,  
**quando** a coordenação registrar o parecer,  
**então** o sistema deve permitir alterar a situação do estudante para **Ativo**.

**Critério 4: exigência de dados escolares**

**Dado** que o estudante foi marcado como **Ativo**,  
**quando** a secretaria acessar **Dados escolares**,  
**então** o sistema deve exigir turma, etapa/ciclo atual, turno, matrícula interna e transporte escolar.

**Critério 5: parecer não elegível**

**Dado** que a Avaliação de Ingresso foi concluída como **Não elegível**,  
**quando** o parecer for salvo,  
**então** o sistema deve bloquear PAI, turma ativa, planejamento e registros pedagógicos.

**Critério 6: documentos**

**Dado** que o estudante possui documentos pendentes,  
**quando** a secretaria acessar a aba **Documentos**,  
**então** o sistema deve exibir os status **Entregue**, **Pendente** e **Não se aplica** para cada documento.

**Critério 7: transporte escolar**

**Dado** que o estudante utiliza transporte escolar,  
**quando** a secretaria marcar **Sim** no campo transporte escolar,  
**então** o sistema deve registrar essa informação sem exigir rota, motorista, veículo ou horário no MVP.

**14\. Observações para UX/UI**

Na tela do estudante, exibir sempre:

* nome do estudante; 

* situação atual; 

* data da última atualização; 

* responsável pela última alteração; 

* botão salvar; 

* botão cancelar; 

* histórico de situação. 

Quando o estudante estiver **Em análise de ingresso**, mostrar alerta no topo:

Este estudante está em análise de ingresso. Preencha os dados pessoais necessários para iniciar a Avaliação de Ingresso. As demais abas serão liberadas conforme o parecer da equipe pedagógica.

Abas bloqueadas devem aparecer desabilitadas, com tooltip:

Esta aba será liberada após conclusão da Avaliação de Ingresso ou alteração da situação do estudante.

**15\. Fora do MVP**

Não incluir neste momento:

* módulo completo de transporte; 

* rota, motorista, veículo e horário; 

* prontuário clínico; 

* financeiro; 

* integração externa; 

* app da família; 

* assinatura digital avançada obrigatória; 

* integração SERE/LRCO; 

* módulo de saúde; 

* prescrição ou controle clínico de medicação. 

**Conclusão funcional**

O **Cadastro de Estudante** do Pertency deve ser construído como um fluxo de decisão, não apenas como uma ficha.

A situação **Em análise de ingresso** permite abrir o cadastro com segurança, usando apenas os dados pessoais. A **Avaliação de Ingresso** determina se o estudante será **Ativo** ou **Não elegível**. Somente depois do parecer elegível o sistema deve liberar a conclusão dos dados escolares, vínculo com turma, PAI, planejamento e registros pedagógicos.

