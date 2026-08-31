**História do Módulo Cadastro de Usuário**

**1\. Visão geral**

O **Cadastro de Usuário** é o módulo responsável por registrar os profissionais que terão acesso ao Pertency.

Ele deve permitir que a escola especializada controle quem usa o sistema, qual função cada profissional exerce, quais permissões terá e, no caso dos professores, quais turmas e componentes curriculares poderá acessar.

O cadastro deve ser simples e voltado ao uso operacional do sistema. Não deve funcionar como cadastro de RH, ficha funcional ou prontuário profissional. O foco é **controle de acesso, função no sistema e vínculo operacional com a escola**. 

**2\. Objetivo funcional**

O Cadastro de Usuário deve permitir:

* identificar o usuário pelo nome completo; 

* registrar e-mail e telefone; 

* definir a função do usuário no sistema; 

* controlar o status do usuário; 

* permitir acesso ao sistema por e-mail de login e senha provisória; 

* vincular professores às turmas correspondentes; 

* vincular professores aos componentes curriculares que poderão acessar; 

* permitir ou restringir funcionalidades conforme a função selecionada; 

* manter o cadastro simples, funcional e adequado ao MVP. 

**3\. Contexto de uso**

A escola especializada terá diferentes profissionais utilizando o Pertency. Cada profissional deve acessar apenas as funcionalidades compatíveis com sua função.

| Função | Uso principal no sistema |
| :---- | :---- |
| Administrador | Configurações gerais, cadastros e permissões |
| Direção | Acompanhamento da gestão, cadastros e relatórios |
| Secretaria | Cadastro de estudantes, documentos e dados escolares |
| Coordenação Pedagógica | Avaliação de Ingresso, PAI, planejamentos e registros |
| Professor(a) Regente | Acesso às turmas vinculadas e registros pedagógicos |
| Professor(a) de Arte | Acesso às turmas e registros do componente Arte |
| Professor(a) de Educação Física | Acesso às turmas e registros do componente Educação Física |

A função selecionada no cadastro deve determinar automaticamente as permissões. Não deve existir, no MVP, um campo separado chamado **perfil de acesso**. 

**4\. Estrutura da tela**

A tela pode assumir dois títulos, conforme a operação:

* **Cadastrar Usuário**, quando for novo cadastro; 

* **Editar Usuário**, quando for alteração de usuário existente. 

A tela deve conter quatro blocos principais:

1. **Dados gerais** 

2. **Turmas vinculadas** 

3. **Acesso** 

4. **Foto** 

Também deve conter menu lateral do Pertency, item **Usuários** selecionado, botão **Cancelar**, botão **Salvar**, identificação do usuário logado e painel lateral **Adicionar turma** quando o usuário clicar para incluir vínculo de turma. 

**5\. Bloco 1: Dados gerais**

**Objetivo**

Registrar as informações básicas do profissional e definir sua função no sistema.

| Campo | Tipo | Obrigatório | Finalidade |
| :---- | :---- | :---- | :---- |
| Nome completo | Texto | Sim | Identificar o profissional no sistema |
| E-mail | E-mail | Sim | Contato, notificações e sugestão para login |
| Telefone | Telefone com máscara | Conforme regra da escola | Contato institucional interno |
| Função no sistema | Lista suspensa | Sim | Definir permissões automáticas |
| Status do usuário | Lista suspensa | Sim | Controlar se o usuário pode acessar o sistema |

**Nome completo**

Deve registrar o nome completo do profissional.

Uso no sistema:

* listagens de usuários; 

* registros de ações; 

* relatórios; 

* histórico de alterações; 

* vínculos com turmas; 

* auditoria. 

Regra: o nome completo deve aparecer nas telas e registros associados ao usuário. 

**E-mail**

Deve registrar o e-mail principal do usuário.

Uso no sistema:

* contato; 

* notificações; 

* sugestão automática para e-mail de login. 

Regra: o sistema deve validar o formato do e-mail. 

**Telefone**

Deve registrar telefone de contato institucional do usuário.

Regra: o sistema deve aplicar máscara de telefone. 

**Função no sistema**

Campo obrigatório, do tipo lista suspensa.

Opções sugeridas para o MVP:

* Administrador; 

* Direção; 

* Secretaria; 

* Coordenação Pedagógica; 

* Professor(a) Regente; 

* Professor(a) de Arte; 

* Professor(a) de Educação Física. 

Regra principal: a função selecionada deve determinar automaticamente as permissões do usuário. Não criar campo separado de **perfil de acesso** no MVP. 

**Status do usuário**

Opções:

* Ativo; 

* Inativo. 

Valor padrão: **Ativo**.

Regra: usuário com status **Inativo** não deve conseguir acessar o sistema. 

**6\. Bloco 2: Turmas vinculadas**

**Objetivo**

Vincular usuários professores às turmas e componentes curriculares que poderão acessar e registrar.

Esse bloco deve aparecer principalmente para:

* Professor(a) Regente; 

* Professor(a) de Arte; 

* Professor(a) de Educação Física. 

Para Administrador, Direção, Secretaria e Coordenação Pedagógica, o bloco pode ficar oculto, desabilitado ou não obrigatório, porque esses perfis acessam a escola de forma mais ampla. 

**Campos da tabela**

| Campo | Tipo | Obrigatório para professor | Finalidade |
| :---- | :---- | :---- | :---- |
| Etapa/Ciclo | Seleção vinda das turmas | Sim | Indicar etapa ou ciclo vinculado |
| Turno | Seleção | Sim | Indicar turno da turma |
| Turma | Seleção | Sim | Indicar turma que o professor acessa |
| Componentes curriculares | Lista múltipla | Sim | Definir componentes liberados |
| Ações | Botão/ícone | Não | Remover vínculo |

**Componentes curriculares**

Opções sugeridas:

* Português; 

* Matemática; 

* Ciências; 

* Geografia; 

* História; 

* Arte; 

* Educação Física. 

Regra: o professor só poderá acessar estudantes, registros e componentes relacionados às turmas vinculadas. 

**7\. Painel lateral: Adicionar turma**

**Objetivo**

Permitir incluir um novo vínculo entre o usuário professor, uma turma e seus componentes curriculares.

O painel deve abrir na lateral direita da tela quando o usuário clicar em **Adicionar turma**. 

**Campos do painel**

| Campo | Tipo | Obrigatório | Origem |
| :---- | :---- | :---- | :---- |
| Etapa/Ciclo | Lista suspensa | Sim | Módulo de Turmas ou Configurações da Escola |
| Turno | Lista suspensa | Sim | Turnos ou Turmas |
| Turma | Lista suspensa | Sim | Turmas cadastradas |
| Componentes curriculares | Checkboxes | Sim | Lista de componentes |
| Botão Adicionar | Botão primário | Sim | Confirma vínculo |

Regra: o usuário deve selecionar ao menos um componente curricular para adicionar o vínculo. Ao clicar em **Adicionar**, o sistema deve inserir o vínculo na tabela **Turmas vinculadas**. 

**Mensagem informativa**

Abaixo da tabela de turmas vinculadas, exibir:

Este usuário está vinculado à(s) turma(s) acima e poderá registrar atividades, frequências e acessar informações dos componentes curriculares selecionados.

Essa mensagem explica que o vínculo com turma define o escopo de atuação do professor no sistema. 

**8\. Bloco 3: Acesso**

**Objetivo**

Definir as informações necessárias para login do usuário no sistema.

| Campo | Tipo | Obrigatório | Finalidade |
| :---- | :---- | :---- | :---- |
| E-mail de login | E-mail | Sim | Autenticação e identificação do usuário |
| Senha provisória | Senha | Sim no primeiro cadastro ou conforme regra de convite | Primeiro acesso ou redefinição |

**E-mail de login**

Regra:

* deve ser único no sistema; 

* pode ser preenchido automaticamente com o e-mail informado em **Dados gerais**. 

**Senha provisória**

Regra:

* permite primeiro acesso ou redefinição; 

* o usuário pode ser orientado a alterar a senha no primeiro acesso; 

* em edição de usuário existente, se ficar em branco, o sistema deve manter a senha atual. 

Mensagem de apoio:

Deixe em branco para manter a senha atual. 

**9\. Bloco 4: Foto**

**Objetivo**

Permitir o upload de foto do usuário para identificação visual no sistema.

| Campo | Tipo | Obrigatório | Regra |
| :---- | :---- | :---- | :---- |
| Foto do usuário | Upload de imagem | Não | JPG ou PNG, tamanho máximo sugerido de 5MB |

Uso no sistema:

* perfil do usuário; 

* listagens; 

* cabeçalho de ações; 

* identificação visual. 

Regra: a foto é opcional e não deve bloquear o salvamento do cadastro. 

**10\. Regras de negócio**

1. Todo usuário deve possuir nome completo. 

2. Todo usuário deve possuir e-mail. 

3. Todo usuário deve possuir função no sistema. 

4. Todo usuário deve possuir status. 

5. O e-mail informado deve ter formato válido. 

6. O e-mail de login deve ser único no sistema. 

7. A função no sistema deve definir automaticamente as permissões. 

8. Não deve existir campo separado chamado **perfil de acesso** no MVP. 

9. Usuário com status **Ativo** pode acessar o sistema. 

10. Usuário com status **Inativo** não pode acessar o sistema. 

11. O bloco **Turmas vinculadas** deve ser obrigatório apenas para professores. 

12. Professores devem estar vinculados a pelo menos uma turma para acessar registros de turma. 

13. Cada vínculo de turma deve possuir etapa/ciclo, turno, turma e ao menos um componente curricular. 

14. O professor só poderá acessar os estudantes, registros e componentes relacionados às turmas vinculadas. 

15. Administrador, Direção, Secretaria e Coordenação Pedagógica não precisam de vínculo com turma para acessar suas áreas. 

16. A senha provisória deve permitir primeiro acesso ou redefinição de senha. 

17. Em edição de usuário, senha em branco deve manter a senha atual. 

18. A foto do usuário é opcional. 

19. O sistema deve aplicar máscara ao telefone. 

20. Alterações em função, status, e-mail de login e vínculos de turma devem gerar histórico de auditoria. 

21. Ao remover vínculo de turma, o sistema deve solicitar confirmação. 

22. Um mesmo professor pode estar vinculado a mais de uma turma. 

23. Um mesmo professor pode estar vinculado a mais de um componente curricular. 

24. O sistema deve impedir duplicidade do mesmo vínculo de turma e componente para o mesmo usuário. 

25. Usuários inativos devem permanecer disponíveis para consulta histórica, mas sem acesso ao sistema. 

**11\. Permissões por função**

**Administrador**

* Pode criar usuários. 

* Pode editar todos os campos. 

* Pode ativar e inativar usuários. 

* Pode redefinir senha. 

* Pode vincular usuários às turmas. 

* Pode acessar configurações. 

* Pode visualizar histórico e auditoria. 

**Direção**

* Pode visualizar usuários da escola. 

* Pode acompanhar status dos usuários. 

* Pode solicitar ou realizar alterações, se autorizado. 

* Pode acessar relatórios e informações institucionais. 

**Secretaria**

* Pode visualizar usuários. 

* Pode cadastrar estudantes, documentos e dados escolares. 

* Pode consultar usuários para fins administrativos. 

* Pode editar usuários somente se autorizado pela escola. 

**Coordenação Pedagógica**

* Pode visualizar usuários. 

* Pode acompanhar professores vinculados às turmas. 

* Pode acessar Avaliação de Ingresso, PAI, planejamentos e registros pedagógicos. 

* Pode acompanhar professores da equipe avaliadora. 

**Professor(a) Regente**

* Pode acessar as turmas vinculadas. 

* Pode visualizar estudantes vinculados às suas turmas. 

* Pode registrar atividades, frequências e informações pedagógicas conforme componentes liberados. 

* Não deve editar dados cadastrais de usuários. 

**Professor(a) de Arte**

* Pode acessar as turmas vinculadas. 

* Pode registrar informações relacionadas ao componente Arte. 

* Pode visualizar estudantes das turmas vinculadas. 

* Não deve editar dados cadastrais de usuários. 

**Professor(a) de Educação Física**

* Pode acessar as turmas vinculadas. 

* Pode registrar informações relacionadas ao componente Educação Física. 

* Pode visualizar estudantes das turmas vinculadas. 

* Não deve editar dados cadastrais de usuários. 

**12\. Critérios de aceite**

**Critério 1: salvar usuário válido**

**Dado** que o administrador está cadastrando um usuário,  
**quando** preencher os campos obrigatórios corretamente e clicar em **Salvar**,  
**então** o sistema deve salvar o usuário e exibir mensagem de sucesso.

**Critério 2: campos obrigatórios**

**Dado** que o administrador está cadastrando um usuário,  
**quando** tentar salvar sem preencher nome completo, e-mail, função ou status,  
**então** o sistema deve destacar os campos pendentes e impedir o salvamento.

**Critério 3: e-mail inválido**

**Dado** que o usuário informou um e-mail em formato inválido,  
**quando** tentar salvar o cadastro,  
**então** o sistema deve exibir mensagem de erro no campo e-mail.

**Critério 4: e-mail de login duplicado**

**Dado** que já existe um usuário com o mesmo e-mail de login,  
**quando** tentar salvar um novo usuário com esse e-mail,  
**então** o sistema deve impedir o cadastro e informar que o e-mail já está em uso.

**Critério 5: função define permissões**

**Dado** que o usuário foi cadastrado com uma função no sistema,  
**quando** acessar o Pertency,  
**então** o sistema deve liberar apenas as funcionalidades compatíveis com sua função.

**Critério 6: professor sem turma**

**Dado** que o usuário possui função de professor,  
**quando** tentar concluir o cadastro sem turma vinculada,  
**então** o sistema deve alertar que o professor precisa de pelo menos uma turma para atuar no sistema.

**Critério 7: adicionar turma**

**Dado** que o usuário possui função de professor,  
**quando** o administrador selecionar etapa/ciclo, turno, turma e componentes curriculares no painel **Adicionar turma**,  
**então** o sistema deve incluir o vínculo na tabela **Turmas vinculadas**.

**Critério 8: componentes curriculares obrigatórios**

**Dado** que o administrador está adicionando uma turma ao professor,  
**quando** não selecionar nenhum componente curricular,  
**então** o sistema deve impedir a inclusão do vínculo e solicitar ao menos um componente.

**Critério 9: usuário inativo**

**Dado** que o usuário está com status **Inativo**,  
**quando** tentar acessar o sistema,  
**então** o sistema deve bloquear o login.

**Critério 10: manter senha atual**

**Dado** que o administrador está editando um usuário existente,  
**quando** deixar o campo senha provisória em branco e salvar,  
**então** o sistema deve manter a senha atual.

**Critério 11: remover turma vinculada**

**Dado** que um usuário possui turma vinculada,  
**quando** o administrador clicar em remover vínculo,  
**então** o sistema deve solicitar confirmação antes de excluir.

**Critério 12: foto opcional**

**Dado** que o administrador está cadastrando um usuário,  
**quando** não enviar foto,  
**então** o sistema deve permitir salvar normalmente. 

**13\. Fora do escopo do Cadastro de Usuário**

Não incluir nesta tela:

* endereço residencial do usuário; 

* CPF; 

* RG; 

* data de nascimento; 

* formação acadêmica; 

* histórico profissional; 

* carga horária; 

* vínculo empregatício; 

* documentos pessoais anexados; 

* assinatura digital; 

* permissões manuais campo a campo; 

* dados financeiros; 

* dados de folha de pagamento; 

* avaliação de desempenho; 

* prontuário profissional. 

Esses dados não são necessários para o MVP e deixariam o cadastro pesado. 

**14\. Observações de UX/UI**

A tela deve manter o padrão visual do Pertency:

* menu lateral azul escuro; 

* item **Usuários** destacado; 

* título claro; 

* blocos em cartões brancos; 

* campos com bordas arredondadas; 

* botão primário azul para **Salvar**; 

* botão secundário para **Cancelar**; 

* painel lateral para **Adicionar turma**; 

* tabela simples para **Turmas vinculadas**; 

* mensagem informativa sobre vínculo com turma; 

* foto em área de upload simples. 

Regra visual importante:

* quando a função selecionada não for professor, o bloco **Turmas vinculadas** pode ficar oculto ou desabilitado; 

* quando a função selecionada for professor, o bloco **Turmas vinculadas** deve ser exibido. 

**15\. Conclusão funcional**

O **Cadastro de Usuário** do Pertency deve ser simples, seguro e orientado ao controle de acesso.

A função do usuário é o ponto central do cadastro, porque define permissões e comportamentos no sistema. Para professores, o vínculo com turmas e componentes curriculares garante que cada profissional acesse apenas o que faz parte da sua atuação. Para os demais perfis, o sistema libera funcionalidades conforme a função, sem exigir vínculo com turma.

Essa estrutura atende ao MVP porque resolve o essencial: cadastrar profissionais, controlar acesso, vincular professores às turmas e manter o sistema organizado por função.

