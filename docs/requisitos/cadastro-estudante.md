**PERTENCY**

**História de Usuário e Especificação Funcional**  
**Módulo Cadastro de Estudante**

Especificação funcional inicial para Development, QA e Produto

| Documento | Versão | Status | Público-alvo |
| :---- | :---- | :---- | :---- |
| HU-EST-001 – Cadastro de Estudante | 1.0 | Especificação funcional para desenvolvimento | Developers, QA, Product Owner e equipe de negócio |

Base documental utilizada: Formulário para Avaliação de Ingresso; Caderno Of. II – Avaliação de Ingresso; Volume I – Organização Administrativa e Pedagógica das Escolas Especializadas; Caderno 4/PPC; decisões funcionais finais aprovadas durante o refinamento das telas do Pertency.

# **1\. Identificação da História**

| Item | Descrição |
| :---- | :---- |
| ID | HU-EST-001 |
| Título | Cadastro de Estudante |
| Módulo | Estudantes |
| Produto | Pertency |
| Prioridade | MVP essencial |
| Versão | 2.0 |
| Responsáveis funcionais | Product Owner / negócio / coordenação pedagógica |
| Público técnico | Developers, QA, Product Owner e equipe de negócio |

# **2\. Épico**

Gestão de estudantes, avaliação de ingresso, documentação, vínculo escolar e informações funcionais.

# **3\. História de Usuário Principal**

| Como Secretaria ou Coordenação Pedagógica da escola especializada, quero cadastrar o estudante em etapas organizadas, iniciando pelos dados pessoais e avançando para Avaliação de Ingresso, Documentos, Dados escolares e Condição do estudante, para que a escola acompanhe corretamente o processo de ingresso, matrícula, organização escolar e informações necessárias à rotina e ao acompanhamento pedagógico. |
| :---- |

# **4\. Objetivo de Negócio**

* Registrar o estudante em fluxo progressivo, aderente à rotina da escola especializada.  
* Evitar duplicidade, retrabalho e campos sem utilização posterior definida.  
* Manter rastreabilidade entre ingresso, elegibilidade, documentação, matrícula e trajetória escolar.  
* Reutilizar dados em PAI, Planejamento, Turmas, Frequência, Registros e Relatórios.  
* Preservar histórico anual e histórico de alterações relevantes.  
* Permitir que diferentes perfis contribuam no processo sem acessar ou alterar informações além de sua responsabilidade.

# **5\. Escopo do módulo**

O módulo cobre o cadastro inicial e a manutenção do estudante nas cinco abas definidas. Deve atender Educação Infantil, Ensino Fundamental e EJA Fase I, respeitando diferenças de organização. Não deve impor ciclo, etapa ou componente curricular quando a oferta não os utiliza.

| Incluído no escopo | Observação |
| :---- | :---- |
| Dados pessoais | Identificação, endereço e responsáveis. |
| Avaliação de Ingresso | Formulário padrão, contribuições complementares, elegibilidade e geração de PDF. |
| Documentos | Checklist dinâmico, anexos, pendências, conferência e documentos gerados pelo sistema. |
| Dados escolares | Vínculo efetivo, oferta atual, turma, matrícula, origem, encerramento e histórico anual. |
| Condição do estudante | Informações funcionais e alertas para rotina escolar, sem prontuário clínico. |

# **6\. Atores e Perfis envolvidos**

| Perfil | Papel no módulo |
| :---- | :---- |
| Administrador | Acesso integral ao módulo e às configurações necessárias; auditoria e suporte. |
| Direção | Consulta ampla, acompanhamento institucional, validações quando definidas pela escola e geração de relatórios autorizados. |
| Secretaria | Abertura do cadastro, Dados pessoais, Documentos, Dados escolares e acompanhamento de pendências. |
| Coordenação Pedagógica | Avaliação de Ingresso, elegibilidade, Condição do estudante, análise integrada e acompanhamento pedagógico. |
| Professor | Acesso restrito aos estudantes vinculados e às informações funcionais/pedagógicas necessárias ao trabalho. |
| Profissional complementar | Contribui somente nas áreas autorizadas da Avaliação de Ingresso e, quando permitido, visualiza sua própria contribuição. |

# **7\. Fluxo funcional completo**

| Etapa | Aba | Perfil principal | Pré-condição | Resultado |
| :---- | :---- | :---- | :---- | :---- |
| 1 | Dados pessoais | Secretaria | Novo cadastro | Estudante criado com situação inicial e dados mínimos; libera Avaliação de Ingresso. |
| 2 | Avaliação de Ingresso | Coordenação / equipe avaliadora | Dados pessoais mínimos salvos | Avaliação em andamento ou concluída; elegibilidade e orientações; libera continuidade conforme regra. |
| 3 | Documentos | Secretaria | Avaliação disponível para continuidade | Checklist documental e pendências organizadas. |
| 4 | Dados escolares | Secretaria / Coordenação | Parecer elegível e condição de matrícula | Vínculo escolar efetivado, turma e número de matrícula registrados. |
| 5 | Condição do estudante | Coordenação / equipe autorizada | Cadastro em fase de ativação ou já ativo | Informações funcionais e alertas disponíveis para os perfis autorizados. |

# **8\. Status do estudante**

| Status | Regra |
| :---- | :---- |
| Em análise de ingresso | Fluxo inicial; não exige turma nem vínculo escolar ativo. |
| Ativo | Matrícula efetivada; exige vínculo escolar atual compatível com a oferta. |
| Não elegível | Mantém avaliação, parecer, documentos e histórico; não permite turma ativa. |
| Transferido | Preserva histórico; exige dados de encerramento/transferência. |
| Desligado | Preserva histórico; exige data e motivo. |
| Inativo | Preserva histórico; não participa de novos lançamentos até reativação autorizada. |

# **9\. Regras de liberação das abas**

* Novo cadastro: apenas Dados pessoais fica disponível para edição; demais abas permanecem bloqueadas.  
* Após salvar os dados pessoais mínimos, Avaliação de Ingresso é liberada.  
* Documentos é liberada quando a Avaliação de Ingresso estiver disponível para continuidade.  
* Dados escolares somente poderá ser concluída quando houver parecer elegível e decisão de efetivação do vínculo.  
* Condição do estudante é liberada para os perfis autorizados após o cadastro avançar para vínculo escolar ou quando a coordenação precisar registrar informação funcional durante o processo.  
* Se a avaliação concluir Não elegível, Dados escolares não pode criar vínculo ativo, mas Documentos e histórico permanecem consultáveis.  
* Bloqueios devem exibir motivo claro e ação necessária para continuidade.

# **10\. Aba 1 – Dados pessoais**

## **10.1 História de usuário**

| Como Secretaria, quero registrar os dados pessoais, endereço, responsáveis e contatos do estudante, para identificar o estudante e liberar a Avaliação de Ingresso sem exigir informações que não terão uso posterior. |
| :---- |

## **10.2 Campos**

| Campo | Tipo | Obrigatório? | Editável? | Origem | Regra | Uso posterior |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| Nome completo | Texto | Sim | Sim | Usuário | Não permitir vazio; limitar tamanho; remover espaços excedentes. | Avaliação, Documentos, Dados escolares, relatórios, turmas. |
| Nome social | Texto | Não | Sim | Usuário | Exibir quando informado; não substituir o nome civil em documentos que exijam nome legal. | Listagens e identificação conforme regra institucional. |
| Situação do estudante | Lista | Sim | Condicional | Sistema/usuário autorizado | Novo cadastro inicia como Em análise de ingresso; mudanças posteriores seguem permissão e histórico. | Controle de fluxo e permissões. |
| Data de nascimento | Data | Sim | Sim | Usuário | Não aceitar data futura. | Cálculo da idade, validações de oferta, relatórios. |
| Idade | Calculado | Automático | Não | Sistema | Calcular a partir da data de nascimento e data corrente; recalcular automaticamente. | Avaliação, telas e relatórios. |
| Sexo | Lista | Sim | Sim | Configuração institucional | Lista padronizada pela escola. | Cadastro/relatórios. |
| Cor/raça | Lista | Conforme configuração | Sim | Configuração institucional | Lista padronizada; não usar texto livre quando parametrizada. | Cadastro/relatórios institucionais. |
| Nacionalidade | Lista/texto controlado | Sim | Sim | Usuário/configuração | Permitir nacionalidade estrangeira. | Cadastro/documentos. |
| Naturalidade | Texto/busca | Sim | Sim | Usuário | Município/UF ou equivalente conforme nacionalidade. | Cadastro/documentos. |
| CPF | Texto mascarado | Sim ou pendência autorizada | Sim | Usuário | Validar formato e dígitos; não duplicar CPF ativo sem regra de exceção. | Identificação e documentos. |
| Tipo de documento de identificação | Lista | Sim | Sim | Usuário | Opções mínimas: RG, Certidão de Nascimento, Certidão de Casamento. | Define campos condicionais. |
| Número do documento | Texto | Sim | Sim | Usuário | Obrigatório após selecionar o tipo; máscara conforme o tipo quando aplicável. | Identificação/documentos. |
| Órgão emissor/UF | Texto/lista | Condicional | Sim | Usuário | Exibir e exigir somente quando Tipo \= RG. | Identificação. |
| Foto do estudante | Upload de imagem | Não | Sim | Usuário | PNG/JPG; limite configurável; imagem opcional. | Identificação visual em listagens/turmas. |
| Logradouro | Texto | Sim | Sim | Usuário | Endereço residencial. | Cadastro e documentos. |
| Número | Texto | Sim | Sim | Usuário | Aceitar 's/n' quando permitido. | Cadastro. |
| Complemento | Texto | Não | Sim | Usuário | Opcional. | Cadastro. |
| Bairro | Texto | Sim | Sim | Usuário | Obrigatório quando aplicável. | Cadastro. |
| CEP | Texto mascarado | Sim | Sim | Usuário | Validar formato; preenchimento automático de endereço pode existir como melhoria sem ser dependência do MVP. | Cadastro. |
| Município | Busca/lista | Sim | Sim | Usuário | Preferir lista de municípios. | Cadastro/relatórios. |
| UF | Lista | Sim | Sim | Usuário | Lista de UFs. | Cadastro. |
| Responsável principal | Texto | Sim | Sim | Usuário | Pessoa prioritária para contato. | Comunicação e documentos. |
| Parentesco | Lista | Sim | Sim | Configuração | Lista parametrizável. | Cadastro. |
| Telefone principal | Texto mascarado | Sim | Sim | Usuário | Validar DDD e número. | Comunicação. |
| Segundo responsável | Texto | Não | Sim | Usuário | Opcional. | Comunicação. |
| Parentesco do segundo responsável | Lista | Condicional | Sim | Configuração | Exigir somente se segundo responsável informado. | Cadastro. |
| Telefone do segundo responsável | Texto mascarado | Condicional | Sim | Usuário | Exigir conforme regra da escola quando segundo responsável informado. | Comunicação. |
| Filiação — Mãe / Pai | Texto (2 campos) | Sim (ao menos um) | Sim | Usuário/Sistema | Registro dos nomes de filiação conforme documentação. Quando um responsável tem parentesco Mãe ou Pai, o sistema sugere o nome no campo correspondente; o usuário pode alterar (filiação e responsável legal não são necessariamente a mesma pessoa). | Documentos e cadastro. |
| Pessoas autorizadas a retirar o estudante | Seleção + lista | Sim (ao menos uma) | Sim | Usuário | Responsáveis já cadastrados aparecem como caixas de marcação (marcadas por padrão), sem redigitar nome. Outras pessoas: lista com Nome, Vínculo e Telefone, todos obrigatórios por linha. Inclusão, remoção e alteração de nome/vínculo ficam no histórico. | Rotina escolar e segurança. |
| Contato de emergência | Texto estruturado | Sim | Sim | Usuário | Nome \+ telefone; não deve ser igual obrigatoriamente ao responsável principal. | Segurança e rotina. |

## **10.3 Regras de negócio e interface**

* Não manter na tela principal os campos livro, folha, termo e data de emissão da certidão.  
* Se Tipo de documento \= RG, exibir Número do documento e Órgão emissor/UF.  
* Se Tipo de documento \= Certidão de Nascimento ou Certidão de Casamento, não exibir Órgão emissor/UF.  
* Dados documentais que exigirem anexo devem ser tratados na aba Documentos.  
* A idade é somente leitura.  
* Salvar rascunho deve permitir dados incompletos; avançar de aba exige mínimos definidos.  
* Alterações de CPF, documento de identificação e situação do estudante devem gerar auditoria.

# **11\. Aba 2 – Avaliação de Ingresso**

## **11.1 História de usuário**

| Como Coordenação Pedagógica ou integrante autorizado da equipe avaliadora, quero registrar a Avaliação de Ingresso do estudante de forma colaborativa, mantendo o formulário padrão como núcleo e permitindo contribuições complementares, para definir necessidades de apoio, elegibilidade e orientações iniciais para o percurso pedagógico. |
| :---- |

## **11.2 Estrutura do formulário padrão**

| Bloco | Campo | Tipo | Obrigatório? | Origem | Regra |
| :---- | :---- | :---- | :---- | :---- | :---- |
| 1\. Identificação | Escola | Automático | Sim | Escola logada | Somente leitura. |
| 1\. Identificação | Município | Automático | Sim | Cadastro da escola | Somente leitura. |
| 1\. Identificação | Equipe responsável | Seleção múltipla | Sim | Usuários autorizados | Permitir mais de um participante. |
| 1\. Identificação | Nome do estudante | Automático | Sim | Dados pessoais | Somente leitura. |
| 1\. Identificação | Data de nascimento | Automático | Sim | Dados pessoais | Somente leitura. |
| 1\. Identificação | Idade | Automático | Sim | Dados pessoais | Somente leitura. |
| 1\. Identificação | Oferta pretendida | Lista | Sim | Ofertas ativas | Não exige turma. |
| 1\. Identificação | Organização pretendida | Lista filtrada | Sim | Configuração da oferta | Filtrada pela oferta. |
| 1\. Identificação | Data de início | Data | Sim | Usuário | Não pode ser posterior ao término. |
| 1\. Identificação | Data de término | Data | Condicional | Usuário | Obrigatória para concluir avaliação. |
| 1\. Identificação | Status da avaliação | Lista controlada | Sim | Sistema/usuário autorizado | Não iniciada, Em andamento, Concluída, Reaberta. |
| 2\. Histórico | Breve histórico escolar | Texto longo | Sim | Equipe | Trajetória, frequência, participação, estratégias e atendimentos educacionais. |
| 2\. Histórico | Informações relevantes da família | Texto longo | Sim | Equipe | Rotina, comunicação, autonomia, interações, expectativas e apoios. |
| 2\. Histórico | Contexto sociocultural | Texto longo | Sim | Equipe | Aspectos ambientais, recursos, condições sociais e interações comunitárias. |
| 3\. Dimensões | Habilidades conceituais | Texto longo | Sim | Equipe | Atenção, memória, raciocínio, leitura, escrita, matemática, linguagem e evidências. |
| 3\. Dimensões | Habilidades sociais | Texto longo | Sim | Equipe | Interação, regras, situações sociais, iniciativa, autoestima e responsabilidade. |
| 3\. Dimensões | Habilidades práticas | Texto longo | Sim | Equipe | Autocuidado, rotina, organização, mobilidade, segurança, uso funcional e autonomia. |
| 4\. Participação | Participação do estudante | Texto longo | Sim | Equipe | Atividades individuais/coletivas, dirigidas/livres, jogos, motoras, interações, interesses, preferências, barreiras e facilitadores. |
| 5\. Contexto | Contexto escolar | Texto longo | Sim | Equipe | Estrutura, rotinas e apoios existentes. |
| 5\. Contexto | Contexto familiar | Texto longo | Sim | Equipe | Práticas educativas e apoio à aprendizagem. |
| 5\. Contexto | Contexto comunitário | Texto longo | Sim | Equipe | Acessos, interações e atividades. |
| 5\. Contexto | Fatores facilitadores | Texto longo | Não | Equipe | Elementos que favorecem desenvolvimento e participação. |
| 5\. Contexto | Barreiras identificadas | Texto longo | Não | Equipe | Elementos que dificultam aprendizagem, participação e permanência. |
| 6\. Necessidades | Necessidades educacionais específicas | Texto longo | Sim | Equipe | Comunicação, mediação, autocuidado, ambiente, organização, permanência, adaptações e outras. |
| 7\. Apoios | Nível de apoio requerido | Seleção | Sim | Equipe | Intermitente, Limitado, Extensivo ou Pervasivo. |
| 7\. Apoios | Áreas de apoio | Seleção múltipla | Sim | Equipe | Acadêmica, Comunicacional, Motora, Social, Comportamental, Autonomia e vida diária. |
| 9\. Análise integrada | Análise integrada da equipe | Texto longo | Sim | Equipe | Síntese baseada em evidências; potencialidades, dificuldades funcionais e implicações pedagógicas. |
| 10\. Elegibilidade | Elegibilidade | Escolha única | Sim | Equipe autorizada | Elegível ou Não elegível. |
| 10\. Elegibilidade | Justificativa | Texto longo | Sim | Equipe autorizada | Baseada no conjunto de evidências. |
| 10\. Elegibilidade | Encaminhamento recomendado | Lista/texto controlado | Sim | Equipe autorizada | Efetivar matrícula, rede regular com apoios, orientar família, solicitar complementação ou outro. |
| 11\. PAI | Orientações iniciais para o PAI | Texto longo | Não | Equipe | Estratégias de comunicação, mediação, acesso, recursos, ambiente e prioridades. |
| 12\. Participantes | Nome do participante | Automático/seleção | Sim | Usuários participantes | Sem assinatura digital. |
| 12\. Participantes | Função | Automático | Sim | Cadastro do usuário | Somente leitura quando usuário interno. |
| 12\. Participantes | Data do preenchimento | Automático | Sim | Sistema | Data/hora da conclusão da contribuição. |

## **11.3 Contribuições complementares da equipe**

| Campo | Tipo | Obrigatório? | Regra |
| :---- | :---- | :---- | :---- |
| Profissional | Automático | Sim | Usuário logado ou participante selecionado; deve existir no cadastro de usuários quando interno. |
| Função | Automático | Sim | Herdada do usuário; não deve ser digitada livremente quando existir função cadastrada. |
| Data | Automático | Sim | Data/hora da gravação da contribuição. |
| Área da contribuição | Lista | Sim | Ex.: Serviço Social, Psicologia, Fonoaudiologia, Fisioterapia, Terapia Ocupacional, Pedagogia, Arte, Educação Física, Outro. |
| Observações | Texto longo | Sim | Contribuição objetiva, vinculada à participação e ao contexto escolar. |
| Implicações para participação/aprendizagem | Texto longo | Não | Registrar impacto educacional/funcional, evitando diagnóstico ou evolução clínica detalhada. |
| Recomendações escolares | Texto longo | Não | Estratégias, recursos, adaptações ou cuidados relevantes à escola. |

* Profissionais complementares não alteram os campos centrais preenchidos pela equipe pedagógica, salvo permissão específica.  
* Cada profissional edita somente sua própria contribuição enquanto a avaliação estiver aberta, salvo permissão superior.  
* Após conclusão, alteração deve exigir reabertura e gerar histórico.  
* As contribuições devem apoiar o pedagógico e não medicalizar o processo de ensino.

## **11.4 Geração de PDF da Avaliação de Ingresso**

| Opção | Conteúdo | Quem pode gerar | Status permitido | Armazenamento/versionamento |
| :---- | :---- | :---- | :---- | :---- |
| Relatório padrão | Somente a estrutura do formulário padrão, com participantes da avaliação. | Coordenação, Direção e Administrador; Secretaria pode visualizar/baixar a versão final. | Somente Concluída (ajuste do PO após 1ª rodada de testes). Antes disso, apenas prévia com marca d'água, sem versão. | PDF armazenado na pasta do estudante; registrar versão, data/hora e usuário gerador. |
| Relatório completo | Formulário padrão \+ contribuições complementares \+ participantes \+ análise integrada. | Coordenação, Direção e Administrador. | Somente Concluída (ajuste do PO após 1ª rodada de testes). Antes disso, apenas prévia com marca d'água, sem versão. | PDF armazenado na pasta do estudante; nova geração cria nova versão, sem apagar a anterior. |

* Se a avaliação for alterada depois de um PDF gerado, marcar a versão anterior como desatualizada e manter histórico.  
* Não sobrescrever PDF já emitido; gerar nova versão.  
* Na geração, o sistema deve solicitar explicitamente Padrão ou Completo.  
* O bloco final da Avaliação de Ingresso deve ser denominado Participantes da Avaliação, contendo nome, função e data do preenchimento. Assinatura digital avançada não faz parte do MVP.  
* Prévia: disponível em qualquer status, gera o PDF com marca d'água "PRÉVIA", não cria versão nem entra em Documentos.  
* Recomendação de elegibilidade, Justificativa e Encaminhamento só são editáveis com status Concluída; para concluir, Elegibilidade e Justificativa são obrigatórias. Se a avaliação for reaberta, os valores ficam guardados, mas "Não elegível" só altera a situação do estudante quando a avaliação é concluída.  
* Relatório padrão: sem Status da avaliação e sem Encaminhamento recomendado (não existem no formulário oficial). Relatório completo inclui o Encaminhamento; "Efetivar matrícula" é exibido com o nome oficial da escola.  
* Função exibida (Equipe responsável e Participantes): área de atuação do usuário quando preenchida, senão o perfil de acesso.  
* Rodapé: "Documento gerado pelo Pertency em dd/mm/aaaa." (sem menção a assinatura digital).

# **12\. Aba 3 – Documentos**

## **12.1 História de usuário**

| Como Secretaria, quero organizar os documentos do estudante em checklist dinâmico, para acompanhar pendências, anexos, conferência e documentos produzidos pelo próprio Pertency sem gerar pendências indevidas. |
| :---- |

| Documento | Variações | Status | Regra |
| :---- | :---- | :---- | :---- |
| Documento civil de identificação | RG, Certidão de Nascimento ou Certidão de Casamento | Entregue/Pendente/Não se aplica | Anexo permitido/obrigatório conforme configuração. |
| CPF | Documento próprio | Entregue/Pendente/Não se aplica | Separado do documento civil. |
| Comprovante de endereço | Comprovante atual | Entregue/Pendente/Não se aplica | Regra configurável pela escola. |
| Carteira de vacinação / Declaração vacinal | Dinâmico por idade/perfil | Entregue/Pendente/Não se aplica | Sistema deve orientar a opção aplicável. |
| Documento de vida escolar anterior | Histórico / Declaração / Guia de Transferência / Não se aplica | Entregue/Pendente/Não se aplica | Alternativas de um mesmo requisito; não gerar três pendências. |
| Laudo / documento diagnóstico | Quando aplicável | Entregue/Pendente/Não se aplica | Não substitui a Avaliação de Ingresso. |
| Avaliação de Ingresso | Gerado pelo Pertency | Gerado pelo sistema | Vincular a versão gerada. |
| Relatório anterior | Quando houver | Entregue/Pendente/Não se aplica | Pode representar último relatório qualitativo ou relatório escolar anterior. |
| Outros documentos previstos pela escola | Parametrizável | Entregue/Pendente/Não se aplica | Conforme PPP/configuração. |

## **12.2 Colunas e comportamento**

| Coluna | Comportamento |
| :---- | :---- |
| Documento | Nome padronizado a partir de Tipos de documentos ou item dinâmico do checklist. |
| Status | Entregue, Pendente, Não se aplica ou Gerado pelo sistema quando pertinente. **Não é escolhido pelo usuário**: é consequência de ações — enviar arquivo → Entregue; "Registrar entrega física" (papel, sem arquivo) → Entregue (físico); "Marcar como não se aplica" com motivo obrigatório → Não se aplica; "Desfazer" (só para entrega física ou não se aplica manual) → Pendente. Histórico escolar e Relatório anterior ficam "Não se aplica" automaticamente quando a Forma de origem é Primeira matrícula escolar. Exibido como badge. |
| Anexo | Upload, visualizar, baixar e substituir conforme permissão. |
| Data de envio | Automática no upload; pode refletir data de recebimento quando informada pela Secretaria. |
| Conferido por | Usuário e data/hora da conferência. |
| Ações | Visualizar, anexar/substituir, baixar, alterar status; exclusão somente conforme regra de auditoria. |

* O checklist deve considerar idade, oferta, escolarização anterior e forma de ingresso.  
* Documento não aplicável não pode aparecer como pendência.  
* Documento de vida escolar anterior deve apresentar somente as alternativas pertinentes.  
* Observações documentais permanecem como campo opcional para pendências e justificativas.  
* Avaliação de Ingresso gerada pelo sistema deve ser vinculada automaticamente ao checklist.  
* Todos os anexos e substituições devem preservar histórico de versão.

# **13\. Aba 4 – Dados escolares**

## **13.1 História de usuário**

| Como Secretaria ou Coordenação, quero registrar o vínculo escolar efetivo do estudante após a elegibilidade, para definir sua situação atual, oferta, organização, turno, turma, número de matrícula e informações administrativas relevantes, preservando a trajetória anual. |
| :---- |

| Campo | Tipo | Obrigatório? | Origem | Regra |
| :---- | :---- | :---- | :---- | :---- |
| Data de ingresso | Data | Sim | Usuário | Data de entrada no processo/escola; não pode ser futura sem regra. |
| Data de matrícula efetiva | Data | Condicional | Usuário | Obrigatória ao ativar matrícula; não pode ser anterior à data de ingresso. |
| Situação do estudante | Lista | Sim | Sistema/usuário autorizado | Ativo, Transferido, Desligado, Inativo; Não elegível é controlado pelo fluxo. |
| Forma de ingresso | Lista | Sim | Configuração | Avaliação de Ingresso, Transferência recebida, Rematrícula/continuidade quando aplicável, Outro. |
| Oferta atual | Lista | Sim para ativo | Ofertas ativas | Educação Infantil, Ensino Fundamental ou EJA Fase I. |
| Organização atual | Lista filtrada | Sim para ativo | Configuração da oferta | Exibir somente organizações compatíveis. |
| Turno | Lista | Sim para ativo | Turnos ativos | Filtrar turmas por turno. Trocar organização ou turno limpa a turma se ela deixar de ser compatível. |
| Turma | Lista filtrada | Sim para ativo | Cadastro de Turmas | Compatível com ano letivo, oferta, organização e turno. |
| Número de matrícula | Texto | Condicional | Usuário | Permitir número utilizado no SERE ou outro número oficial; unicidade conforme regra da escola. |
| Utiliza transporte escolar? | Sim/Não | Sim para ativo | Usuário | Utilizado em listagens e organização interna; não abre módulo de rota no MVP. |
| Forma de origem | Lista | Sim para ativo | Usuário | Primeira matrícula escolar; Transferência de escola da rede municipal / estadual / particular; Transferência de outra escola especializada; Outro. "Primeira matrícula" dispensa os três campos abaixo. |
| Rede de origem | Texto | Não | Usuário | Exibido só quando a Forma de origem não é "Primeira matrícula". |
| Escola de origem | Texto | Não | Usuário | Exibido só quando a Forma de origem não é "Primeira matrícula". |
| Informações sobre a transferência | Texto curto | Não | Usuário | Antes "Histórico de transferência" (renomeado para não confundir com o documento Histórico Escolar). Exibido só quando a Forma de origem não é "Primeira matrícula". |
| Data de transferência/desligamento | Data | Condicional | Usuário | Obrigatória ao alterar para Transferido, Desligado ou Inativo (bloco Encerramento). |
| Motivo da transferência/desligamento | Lista | Condicional | Configuração | Obrigatório junto com a data. |
| Observações escolares | Texto longo | Não | Usuário | Informações escolares relevantes, não repetir campos estruturados. |

## **13.2 Regras por oferta**

| Oferta | Organização / comportamento |
| :---- | :---- |
| Educação Infantil | Exibir somente organizações configuradas para Educação Infantil, como Estimulação Essencial e Pré-Escolar. Não exigir ciclo ou componente curricular nesta aba. |
| Ensino Fundamental | Exibir ciclo e etapa conforme configuração da escola. A turma deve pertencer ao ciclo/etapa e ano letivo compatíveis. |
| EJA Fase I | Exibir organização compatível com EJA Fase I, tipicamente etapa única, sem exigir componente curricular nesta aba. |

# **14\. Aba 5 – Condição do estudante**

## **14.1 História de usuário**

| Como Coordenação Pedagógica ou equipe autorizada, quero registrar condições e informações funcionais relevantes para a rotina escolar, para orientar apoios, planejamento, alertas e cuidados sem transformar o Pertency em prontuário clínico. |
| :---- |

## **14.2 Bloco 1 – Condições e documentos relacionados**

| Campo | Tipo | Obrigatório? | Regra | Uso posterior |
| :---- | :---- | :---- | :---- | :---- |
| Tipo de deficiência/condição | Lista parametrizável | Quando houver | Selecionar a partir das condições configuradas pela escola. | PAI, planejamento, relatórios e filtros autorizados. |
| Documento vinculado | Referência de documento | Não | Vincular a documento existente na aba Documentos; não duplicar upload. | Consulta de comprovação. |
| Observações sobre a condição | Texto | Não | Informação escolar/funcional objetiva. | PAI e acompanhamento. |
| Ações | Ações | Sim | Visualizar/editar; exclusão conforme histórico. | Gestão do registro. |
| CID | Texto | Não | Se mantido, somente no detalhe/edição; nunca obrigatório nem principal. | Uso restrito e conforme permissão. |

## **14.3 Bloco 2 – Informações importantes para a rotina escolar**

| Campo | Tipo | Obrigatório? | Regra |
| :---- | :---- | :---- | :---- |
| Meio de comunicação predominante | Lista | Não | Ex.: oral, gestual, CAA, multimodal, outro. |
| Recurso de Comunicação Aumentativa e Alternativa utilizado | Lista/múltipla | Não | Ex.: prancha, PECS, pictogramas, aplicativo/dispositivo, outro. |
| Necessita apoio para alimentação? | Sim/Não | Não | Quando Sim, informação fica disponível para equipe autorizada. |
| Necessita apoio para higiene? | Sim/Não | Não | Informação funcional. |
| Necessita apoio para locomoção? | Sim/Não | Não | Informação funcional e de segurança. |
| Necessita apoio em outras atividades de vida diária? | Sim/Não | Não | Se Sim, abrir checklist: Vestir-se, Uso do banheiro, Organização de materiais, Organização da rotina, Orientação no ambiente, Outro. |
| Alergias e restrições relevantes para a rotina escolar | Texto | Não | Somente informações necessárias à segurança/rotina escolar. |
| Necessita medicação durante o período escolar? | Sim/Não | Não | Se Sim, exibir "Informações relevantes sobre a medicação na rotina escolar" (sem prontuário ou prescrição detalhada). |
| Recursos de acessibilidade e apoio utilizados | Seleção múltipla | Não | Ex.: comunicação alternativa, tecnologia assistiva, recurso visual, material adaptado, apoio de posicionamento, mobilidade, outro. |
| Outras informações relevantes para a rotina escolar | Texto longo | Não | Evitar repetição dos campos estruturados. |

## **14.4 Bloco 3 – Alertas para a equipe**

| Campo | Regra |
| :---- | :---- |
| Situações que exigem atenção | Descrever situações objetivas que podem afetar participação, segurança ou bem-estar. |
| O que ajuda o estudante | Registrar estratégias, recursos e formas de acolhimento que funcionam no ambiente escolar. |
| Segurança e cuidados importantes | Registrar somente informações relevantes à proteção e ao cotidiano escolar. |

| Mensagem fixa obrigatória: "Informações funcionais para a rotina escolar. Este cadastro não substitui prontuário clínico." |
| :---- |

# **15\. Dependências entre campos e abas**

| Condição | Comportamento esperado | Regra de bloqueio/ocultação |
| :---- | :---- | :---- |
| Dados pessoais salvos | Liberar Avaliação de Ingresso. | Não liberar sem os mínimos definidos. |
| Tipo de documento \= RG | Exibir Órgão emissor/UF. | Ocultar para certidões. |
| Oferta pretendida selecionada | Filtrar Organização pretendida. | Não listar organizações de outra oferta. |
| Avaliação \= Concluída \+ Elegível | Permitir continuidade para vínculo escolar ativo. | Não criar turma ativa antes disso. |
| Avaliação \= Não elegível | Bloquear ativação e vínculo de turma. | Manter avaliação e histórico. |
| Documento de vida escolar anterior | Mostrar apenas alternativas aplicáveis. | Não gerar pendências duplicadas. |
| Oferta atual selecionada | Filtrar Organização atual. | Respeitar configuração da oferta. |
| Oferta \+ organização \+ turno \+ ano letivo | Filtrar Turma. | Somente turmas compatíveis e ativas. |
| Situação \= Transferido/Desligado | Exigir data e motivo de encerramento. | Preservar vínculo anterior. |
| Transporte \= Não | Não exigir dados adicionais de transporte. | Módulo completo fora do MVP. |
| Apoio em AVD \= Sim | Exibir checklist de atividades. | Se Não, ocultar checklist. |
| Medicação no período escolar \= Sim | Exibir campos complementares autorizados. | Se Não, ocultar. |
| Condição com documento | Permitir vincular documento existente. | Não duplicar anexo. |

# **16\. Reaproveitamento das informações**

| Informação | Utilizada em |
| :---- | :---- |
| Dados pessoais | Avaliação de Ingresso, Documentos, relatórios, identificação em turmas. |
| Data de nascimento / Idade | Avaliação, validações de faixa etária, relatórios e alertas. |
| Oferta pretendida / Organização pretendida | Subsídio para decisão de vínculo, sem repetir como campo pretendido em Dados escolares. |
| Orientações iniciais para o PAI | Abertura do PAI e referência para planejamento. |
| Contribuições complementares | Relatório completo e análise integrada. |
| Documento de identificação / CPF | Checklist documental e relatórios administrativos. |
| Oferta atual / Organização atual | Turmas, PAI, Planejamento, Relatórios. |
| Turma | Frequência, Planejamento, Registros e relatórios. |
| Transporte escolar | Listagens e organização da escola. |
| Condição do estudante | PAI, Planejamento, relatórios e filtros autorizados. |
| CAA / recursos de acessibilidade | PAI, Planejamento e orientações aos professores. |
| Alertas para a equipe | Visualização restrita aos profissionais vinculados e autorizados. |

# **17\. Integrações com outros módulos**

| Módulo | Integração |
| :---- | :---- |
| Turmas | Dados escolares fornece ano letivo, oferta, organização, turno e turma; vínculo deve ser consistente. |
| PAI | Recebe identificação, oferta atual, orientações iniciais, condição, comunicação, recursos de acessibilidade e apoios. |
| Planejamento | Recebe turma/oferta e pode usar informações funcionais autorizadas para adaptação e mediação. |
| Frequência | Usa vínculo ativo e turma do ano letivo. |
| Registros | Usa estudante ativo, turma, período e contexto pedagógico. |
| Relatórios | Usa dados cadastrais, vínculo escolar, avaliação, documentos e informações autorizadas. |
| Configurações | Fornece ofertas, organizações, turnos, tipos de documentos, condições e permissões. |
| SERE | Sem integração automática no MVP; Número de matrícula pode registrar o identificador utilizado externamente. |

# **18\. Histórico anual e auditoria**

## **18.1 Vínculo escolar anual**

Oferta atual, organização atual, turno e turma pertencem ao vínculo de um ano letivo. Não devem sobrescrever os dados do ano anterior.

| Oferta | Comportamento anual |
| :---- | :---- |
| Educação Infantil | Criar novo vínculo anual; sugerir organização compatível com idade/configuração quando aplicável; exigir confirmação da escola. Transição para Ensino Fundamental não deve ser automática sem confirmação. |
| Ensino Fundamental | Criar novo vínculo anual; sugerir próxima etapa conforme sequência configurada; não promover automaticamente sem confirmação. Preservar ciclo, etapa, turma e turno anteriores. |
| EJA Fase I | Criar novo vínculo anual, preservando etapa única/organização e turma anteriores; permitir nova turma/turno sem sobrescrever histórico. |

## **18.2 Auditoria**

* situação do estudante  
* elegibilidade  
* oferta e organização  
* turno e turma  
* número de matrícula  
* documentos e anexos  
* parecer/análise integrada  
* contribuições profissionais  
* condições e alertas funcionais  
* reabertura/conclusão da Avaliação de Ingresso

Para cada alteração auditável registrar: usuário, data, hora, valor anterior, valor novo e, quando aplicável, motivo. Registros com relevância histórica não devem ser excluídos definitivamente sem regra administrativa explícita.

# **19\. Permissões**

| Perfil | Visualizar | Criar | Editar | Concluir | Gerar PDF | Observações |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| Administrador | Sim | Sim | Sim | Sim | Sim | Acesso integral e auditoria. |
| Direção | Sim | Conforme política | Conforme política | Pode validar quando definido | Sim | Não altera contribuição de outro profissional sem permissão. |
| Secretaria | Sim | Dados pessoais, Documentos, Dados escolares | Mesmas áreas | Não conclui parecer pedagógico | Não gera nova versão; pode baixar final | Não edita análise pedagógica/condição sem permissão. |
| Coordenação Pedagógica | Sim | Avaliação, condição e áreas pedagógicas | Sim | Sim | Sim | Pode reabrir avaliação conforme regra. |
| Professor | Restrito | Contribuição quando convocado | Somente própria contribuição enquanto aberto | Não | Não | Visualiza estudantes vinculados e informações necessárias ao trabalho. |
| Profissional complementar | Restrito | Sua contribuição | Somente própria contribuição enquanto aberto | Não | Não | Sem acesso amplo a dados não necessários. |

# **20\. Validações**

| Item | Validação |
| :---- | :---- |
| Data de nascimento | Não pode ser futura; recalcular idade. |
| CPF | Validar máscara/dígitos; tratar duplicidade conforme regra institucional. |
| Documento de identificação | Número obrigatório após selecionar tipo; órgão emissor/UF somente para RG. |
| Datas da avaliação | Término não pode ser anterior ao início; conclusão exige data de término. |
| Matrícula efetiva | Não pode ser anterior à data de ingresso. |
| Turma | Deve ser compatível com ano letivo, oferta, organização e turno. |
| Elegibilidade | Não elegível não pode gerar vínculo ativo. |
| Documentos | Não aplicável não gera pendência; Gerado pelo sistema não aceita upload manual substitutivo sem regra. |
| Campos condicionais | Validar somente quando o gatilho estiver ativo. |
| PDF da avaliação | Somente nos status autorizados; preservar versões. |
| Histórico anual | Não permitir edição que apague vínculo anterior; alteração deve criar/atualizar o vínculo do ano corrente. |
| Contribuição profissional | Usuário comum não pode editar contribuição de outro profissional. |

# **21\. Mensagens de erro, alerta e bloqueio**

| Situação | Mensagem sugerida |
| :---- | :---- |
| Campo obrigatório | Preencha os campos obrigatórios antes de continuar. |
| Aba bloqueada | Conclua os dados mínimos da etapa anterior para acessar esta aba. |
| Avaliação não concluída | Conclua a Avaliação de Ingresso e registre a elegibilidade antes de efetivar o vínculo escolar. |
| Não elegível | Este estudante está registrado como Não elegível e não pode ser vinculado a uma turma ativa. |
| Turma incompatível | A turma selecionada não é compatível com o ano letivo, oferta, organização ou turno do estudante. |
| Documento pendente | Há documentos pendentes neste cadastro. Verifique o checklist documental. |
| Dado histórico | Esta alteração afeta um dado histórico. Confirme a criação de um novo registro para o ano letivo atual. |
| PDF desatualizado | A avaliação foi alterada após a geração deste PDF. Gere uma nova versão para obter o conteúdo atualizado. |
| Sucesso | Cadastro salvo com sucesso. |
| Erro | Não foi possível salvar as alterações. Tente novamente ou contate o administrador. |

# **22\. Critérios de aceite**

| ID | Área | DADO | QUANDO | ENTÃO |
| :---- | :---- | :---- | :---- | :---- |
| CA01 | Fluxo geral | Dado que um novo cadastro é iniciado | quando a Secretaria salvar os dados pessoais mínimos | então a Avaliação de Ingresso deve ser liberada. |
| CA02 | Fluxo geral | Dado que os dados pessoais mínimos não foram salvos | quando o usuário tentar acessar a Avaliação de Ingresso | então a aba deve permanecer bloqueada e informar o motivo. |
| CA03 | Dados pessoais | Dado que a data de nascimento é informada | quando o registro for salvo | então a idade deve ser calculada automaticamente e ficar não editável. |
| CA04 | Dados pessoais | Dado que Tipo de documento \= RG | quando o campo for selecionado | então o sistema deve exibir Número do documento e Órgão emissor/UF. |
| CA05 | Dados pessoais | Dado que Tipo de documento \= Certidão de Nascimento | quando o campo for selecionado | então o sistema não deve exigir Órgão emissor/UF. |
| CA06 | Dados pessoais | Dado que o usuário informar CPF inválido | quando tentar concluir a aba | então o sistema deve bloquear a conclusão e indicar o erro. |
| CA07 | Avaliação | Dado que a avaliação foi aberta | quando a equipe registrar Oferta pretendida | então Organização pretendida deve mostrar somente opções compatíveis. |
| CA08 | Avaliação | Dado que a avaliação está em andamento | quando um profissional autorizado salvar sua contribuição | então a contribuição deve registrar profissional, função, data e conteúdo. |
| CA09 | Avaliação | Dado que um profissional complementar não é autor da contribuição | quando tentar editar a contribuição de outro usuário | então o sistema deve bloquear a edição, salvo permissão superior. |
| CA10 | Avaliação | Dado que a equipe seleciona nível de apoio | quando abrir as opções | então somente Intermitente, Limitado, Extensivo e Pervasivo devem estar disponíveis. |
| CA11 | Avaliação | Dado que a avaliação é concluída | quando elegibilidade e justificativa estiverem preenchidas | então o sistema deve registrar status Concluída e histórico. |
| CA12 | Avaliação | Dado que a elegibilidade \= Não elegível | quando a avaliação for concluída | então o sistema deve preservar o cadastro, bloquear vínculo ativo e manter parecer/encaminhamento. |
| CA13 | PDF | Dado que a avaliação está concluída | quando o usuário autorizado clicar em Gerar relatório | então o sistema deve oferecer Relatório padrão e Relatório completo. |
| CA14 | PDF | Dado que Relatório padrão foi selecionado | quando o PDF for gerado | então deve conter somente a estrutura do formulário padrão e participantes. |
| CA15 | PDF | Dado que Relatório completo foi selecionado | quando o PDF for gerado | então deve incluir formulário padrão, contribuições complementares, participantes e análise integrada. |
| CA16 | PDF | Dado que já existe PDF e a avaliação foi alterada | quando uma nova versão for gerada | então a versão anterior deve ser preservada e marcada como anterior/desatualizada. |
| CA17 | Documentos | Dado que um estudante não possui escolarização anterior | quando o checklist for montado | então documento de vida escolar anterior não deve gerar pendência indevida. |
| CA18 | Documentos | Dado que Documento de vida escolar anterior é aplicável | quando o usuário registrar Histórico, Declaração ou Guia | então as alternativas restantes não devem aparecer como pendências separadas. |
| CA19 | Documentos | Dado que a Avaliação de Ingresso gera PDF | quando a geração for concluída | então o documento deve ser vinculado ao checklist do estudante. |
| CA20 | Documentos | Dado que um documento é substituído | quando novo arquivo for enviado | então o sistema deve preservar a versão anterior no histórico. |
| CA21 | Dados escolares | Dado que o estudante é Elegível | quando a Secretaria preencher o vínculo escolar | então Oferta atual, Organização atual, Turno e Turma devem ser exigidos para ativação. |
| CA22 | Dados escolares | Dado que o usuário seleciona Oferta atual | quando abrir Organização atual | então o sistema deve exibir somente organizações compatíveis. |
| CA23 | Dados escolares | Dado que Oferta, Organização e Turno foram selecionados | quando abrir Turma | então devem ser exibidas apenas turmas compatíveis do ano letivo. |
| CA24 | Dados escolares | Dado que o usuário informa Número de matrícula | quando salvar | então o sistema deve aceitar o número utilizado no SERE ou outro número oficial permitido. |
| CA25 | Histórico anual | Dado que inicia novo ano letivo | quando a escola renovar o vínculo | então deve ser criado novo registro anual sem sobrescrever oferta, organização, turno e turma anteriores. |
| CA26 | Histórico anual | Dado que um estudante do Ensino Fundamental possui etapa anterior | quando o novo vínculo for iniciado | então o sistema pode sugerir a próxima etapa, mas deve exigir confirmação da escola. |
| CA27 | Condição | Dado que uma condição é cadastrada | quando houver documento comprobatório na aba Documentos | então deve ser possível vinculá-lo sem novo upload. |
| CA28 | Condição | Dado que Apoio em outras atividades de vida diária \= Sim | quando o campo for marcado | então o checklist de AVD deve ser exibido. |
| CA29 | Condição | Dado que Apoio em outras atividades de vida diária \= Não | quando o campo for marcado | então o checklist complementar deve ficar oculto e não ser validado. |
| CA30 | Condição | Dado que Necessita medicação durante o período escolar \= Sim | quando o campo for marcado | então o sistema deve exibir apenas os campos complementares autorizados pela escola. |
| CA31 | Permissões | Dado que um professor acessa o cadastro | quando o estudante não estiver vinculado à sua turma | então o acesso deve ser negado ou o estudante não deve aparecer. |
| CA32 | Auditoria | Dado que situação, elegibilidade, turma ou condição é alterada | quando o usuário salvar | então o sistema deve registrar usuário, data/hora e valores anterior/novo. |

# **23\. Cenários de QA**

| ID | Cenário | Pré-condição | Passos | Resultado esperado |
| :---- | :---- | :---- | :---- | :---- |
| QA01 | Criar cadastro com dados mínimos | Usuário Secretaria autorizado | Preencher mínimos de Dados pessoais e salvar | Cadastro criado; status Em análise de ingresso; Avaliação liberada. |
| QA02 | Tentar avançar sem nome | Novo cadastro | Deixar Nome completo vazio e concluir | Bloqueio e mensagem de obrigatório. |
| QA03 | Data de nascimento futura | Novo cadastro | Informar data futura | Campo rejeitado; não salva conclusão. |
| QA04 | Cálculo de idade | Data válida | Informar data de nascimento e salvar | Idade correta e não editável. |
| QA05 | RG com órgão emissor | Tipo de documento RG | Selecionar RG | Órgão emissor/UF aparece. |
| QA06 | Certidão sem órgão emissor | Tipo certidão | Selecionar Certidão | Órgão emissor/UF oculto/não exigido. |
| QA07 | CPF inválido | Novo cadastro | Informar CPF inválido | Validação impede conclusão. |
| QA08 | Responsável secundário vazio | Responsável principal preenchido | Não informar segundo responsável | Salvar permitido. |
| QA09 | Abrir avaliação sem dados mínimos | Dados pessoais incompletos | Clicar aba Avaliação | Aba bloqueada com mensagem. |
| QA10 | Filtrar organização pretendida | Avaliação aberta | Selecionar Ensino Fundamental | Somente organizações de EF disponíveis. |
| QA11 | Contribuição multiprofissional | Profissional complementar autorizado | Adicionar contribuição e salvar | Autor, função e data registrados. |
| QA12 | Editar contribuição de outro | Dois profissionais diferentes | Profissional B tenta editar contribuição de A | Edição bloqueada. |
| QA13 | Nível de apoio | Avaliação em andamento | Abrir lista de nível | Intermitente, Limitado, Extensivo, Pervasivo. |
| QA14 | Concluir sem justificativa | Elegibilidade selecionada | Deixar justificativa vazia e concluir | Bloqueio e mensagem. |
| QA15 | Não elegível | Avaliação concluída como Não elegível | Tentar ativar estudante | Ativação bloqueada. |
| QA16 | Gerar PDF padrão | Avaliação concluída | Gerar \> Padrão | PDF com formulário padrão, sem contribuições complementares. |
| QA17 | Gerar PDF completo | Avaliação com contribuições | Gerar \> Completo | PDF inclui contribuições complementares. |
| QA18 | Versionar PDF | PDF existente \+ avaliação alterada | Gerar novo PDF | Nova versão criada; anterior preservada. |
| QA19 | Checklist criança menor | Estudante menor | Abrir Documentos | Item de vacinação adequado é apresentado. |
| QA20 | Documento escolar não aplicável | Sem escolarização anterior | Abrir checklist | Documento de vida escolar não gera pendência indevida. |
| QA21 | Registrar histórico escolar | Documento escolar aplicável | Selecionar Histórico Escolar e anexar | Requisito atendido sem exigir Guia/Declaração separadamente. |
| QA22 | Substituir anexo | Documento entregue | Enviar novo arquivo | Versão anterior preservada. |
| QA23 | Avaliação gerada pelo sistema | PDF gerado | Abrir Documentos | Avaliação aparece vinculada como Gerado pelo sistema. |
| QA24 | Efetivar vínculo elegível | Avaliação Elegível | Preencher Dados escolares | Salvar permitido com campos obrigatórios. |
| QA25 | Data matrícula anterior ao ingresso | Datas informadas | Salvar | Bloqueio por inconsistência. |
| QA26 | Filtrar turma | Ano/oferta/organização/turno definidos | Abrir Turma | Somente turmas compatíveis. |
| QA27 | Número de matrícula SERE | Estudante ativo | Informar número externo válido | Salvar permitido. |
| QA28 | Transporte Não | Estudante ativo | Marcar Não | Nenhum dado adicional de transporte exigido. |
| QA29 | Transferir estudante | Estudante ativo | Mudar para Transferido sem data/motivo | Bloqueio. |
| QA30 | Transferência completa | Estudante ativo | Informar Transferido \+ data \+ motivo | Vínculo encerrado, histórico preservado. |
| QA31 | Novo ano letivo | Estudante com vínculo anterior | Iniciar rematrícula/progressão | Novo vínculo anual criado sem sobrescrever anterior. |
| QA32 | Sugestão EF | Estudante EF com etapa anterior | Criar vínculo novo ano | Próxima etapa sugerida; exige confirmação. |
| QA33 | EJA anual | Estudante EJA Fase I | Criar novo vínculo anual | Etapa única preservada; turma/turno podem mudar. |
| QA34 | Vincular documento à condição | Laudo anexado | Adicionar condição e selecionar documento | Referência criada sem novo upload. |
| QA35 | AVD Sim | Aba Condição | Marcar apoio AVD \= Sim | Checklist aparece. |
| QA36 | AVD Não | Aba Condição | Marcar Não | Checklist oculto e não validado. |
| QA37 | Medicação Sim | Aba Condição | Marcar Sim | Campos complementares autorizados aparecem. |
| QA38 | Professor sem vínculo | Professor autenticado | Buscar estudante de outra turma | Acesso negado/não exibido. |
| QA39 | Professor com vínculo | Professor autenticado e vinculado | Abrir estudante | Visualiza somente informações autorizadas. |
| QA40 | Auditoria | Usuário autorizado | Alterar turma e salvar | Log com anterior/novo, usuário, data/hora. |
| QA41 | Reabrir avaliação | Avaliação concluída | Coordenação reabre | Status Reaberta; histórico registrado. |
| QA42 | Erro de salvamento | Falha simulada | Salvar | Mensagem de erro sem perda silenciosa dos dados já persistidos. |

# **24\. Fora do escopo**

* Financeiro, mensalidades e cobranças.  
* Responsável financeiro.  
* Prontuário clínico.  
* Evolução terapêutica.  
* Prescrição médica detalhada.  
* Transporte completo com rota, motorista, veículo e horários operacionais.  
* Integração automática com SERE.  
* Assinatura digital avançada.  
* Portal da família.

# **25\. Definition of Done**

* Todas as regras de negócio desta especificação implementadas ou formalmente excepcionadas.  
* Permissões por perfil implementadas e testadas.  
* Todos os critérios de aceite aprovados.  
* Cenários de QA prioritários executados sem defeitos bloqueadores.  
* PDF padrão e PDF completo validados por negócio e QA.  
* Versionamento de PDF funcionando.  
* Histórico anual preservando vínculos anteriores.  
* Auditoria registrando alterações definidas.  
* Campos automáticos e filtros dependentes funcionando.  
* Validações de data, CPF, oferta/organização/turma e elegibilidade funcionando.  
* Checklist documental dinâmico validado em diferentes perfis de estudante.  
* Comportamento responsivo sem perda de legibilidade ou funcionalidade.  
* Documentação técnica e contratos de dados/API atualizados.  
* Mensagens de bloqueio e erro compreensíveis ao usuário.

# **26\. História final resumida**

| Como Secretaria ou Coordenação Pedagógica da escola especializada, quero cadastrar e acompanhar o estudante em um fluxo progressivo de Dados pessoais, Avaliação de Ingresso, Documentos, Dados escolares e Condição do estudante, com regras de acesso, histórico, auditoria e reaproveitamento das informações, para garantir que ingresso, elegibilidade, matrícula, trajetória escolar e apoios necessários à rotina sejam registrados de forma segura, clara e adequada à Educação Infantil, Ensino Fundamental e EJA Fase I. |
| :---- |

# **CHECKLIST DE REVISÃO FUNCIONAL**

* \[x\] Fluxo validado  
* \[x\] Campos validados  
* \[x\] Regras validadas  
* \[x\] Permissões validadas  
* \[x\] Integrações validadas  
* \[x\] Relatórios validados  
* \[x\] Histórico validado  
* \[x\] Critérios de aceite validados  
* \[x\] Cenários de QA validados

Validação funcional realizada considerando o Formulário de Avaliação de Ingresso, os cadernos utilizados no projeto e as definições funcionais aprovadas para as cinco abas.
