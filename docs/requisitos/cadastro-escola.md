**História do Módulo Cadastro de Escola**

**1\. Visão geral**

O **Cadastro de Escola** é o módulo responsável por registrar os dados institucionais essenciais da escola especializada dentro do Pertency.

Ele deve funcionar como a base institucional da unidade escolar no sistema. A partir dele, outras áreas poderão utilizar as informações da escola em documentos, relatórios, cadastros de estudantes, usuários, PAI, planejamentos, registros e comunicações. 

O objetivo não é criar uma tela burocrática, mas sim um cadastro direto, confiável e funcional para o dia a dia.

**2\. Objetivo funcional**

O Cadastro de Escola deve permitir:

* identificar oficialmente a escola; 

* registrar nome oficial e nome usual; 

* registrar código da escola, quando houver; 

* indicar tipo de escola e modalidade; 

* vincular a escola ao NRE correspondente; 

* controlar o status da escola; 

* registrar endereço e contatos institucionais; 

* registrar os responsáveis principais pela escola; 

* disponibilizar esses dados para documentos, relatórios, comunicações e configurações internas do sistema. 

**3\. Contexto de uso**

A escola especializada será cadastrada no Pertency para que exista uma unidade institucional ativa no sistema.

Esse cadastro será utilizado principalmente por:

| Perfil | Uso principal |
| :---- | :---- |
| Administrador | Cadastrar e editar os dados da escola |
| Direção | Consultar e, se autorizado, atualizar dados institucionais |
| Coordenação pedagógica | Consultar informações usadas em documentos e relatórios |
| Secretaria | Utilizar dados da escola em cadastros, documentos e rotinas administrativas |

A tela deve ser acessada dentro da área de **Configurações**, com o item **Escolas** selecionado no menu lateral. 

**4\. Estrutura da tela**

**Título da tela**

**Cadastro de Escola**

**Subtítulo**

**Informe os dados da escola especializada.**

**Blocos principais**

A tela deve conter três blocos:

1. **Identificação da escola** 

2. **Endereço e contato** 

3. **Responsáveis pela escola** 

Também deve conter botão de voltar, botão **Cancelar**, botão **Salvar escola**, menu lateral do Pertency e aviso informativo ao final da tela. 

**5\. Bloco 1: Identificação da escola**

**Objetivo do bloco**

Registrar os dados principais que identificam a escola dentro do sistema. Esses dados serão usados em documentos, relatórios, listagens, cabeçalhos e filtros internos.

| Campo | Tipo | Obrigatório | Finalidade |
| :---- | :---- | :---- | :---- |
| Nome oficial da escola | Texto | Sim | Registrar o nome formal da escola conforme documentos institucionais |
| Nome usual | Texto | Não | Registrar o nome utilizado no dia a dia |
| Código da escola | Texto | Não | Registrar código interno ou institucional, quando houver |
| Tipo de escola | Lista suspensa | Sim | Classificar a unidade como escola especializada |
| Modalidade | Lista suspensa | Sim | Registrar a modalidade Educação Especial |
| NRE vinculado | Lista suspensa | Sim | Vincular a escola ao Núcleo Regional de Educação |
| Status da escola | Lista suspensa | Sim | Controlar se a escola está ativa ou inativa |

**Detalhamento dos campos**

**Nome oficial da escola**

Campo obrigatório. Deve registrar o nome oficial da escola conforme documentos institucionais.

Uso no sistema:

* documentos; 

* relatórios; 

* cabeçalhos; 

* listagens; 

* identificação formal da unidade. 

Regra: o nome oficial deve ser a referência principal em documentos e relatórios formais. 

**Nome usual**

Campo opcional. Deve registrar o nome pelo qual a escola é conhecida no dia a dia.

Uso no sistema:

* telas internas; 

* buscas; 

* filtros; 

* identificação rápida pelos usuários. 

Regra: quando informado, pode aparecer em telas internas, mas não deve substituir o nome oficial em documentos formais, salvo configuração futura. 

**Código da escola**

Campo opcional. Deve registrar o código utilizado pela escola ou pela rede para identificação institucional.

Uso no sistema:

* filtros; 

* integrações futuras; 

* relatórios; 

* controle interno. 

Regra: no MVP, o campo é opcional. 

**Tipo de escola**

Campo obrigatório, do tipo lista suspensa.

Valor padrão recomendado:

**Escola de Educação Básica, Modalidade Educação Especial**

Regra: para o MVP, esse valor pode vir previamente preenchido, considerando que o Pertency está direcionado a escolas especializadas. 

**Modalidade**

Campo obrigatório, do tipo lista suspensa.

Valor padrão:

**Educação Especial**

Regra: para o MVP, pode vir previamente preenchido como Educação Especial. 

**NRE vinculado**

Campo obrigatório. Deve indicar o Núcleo Regional de Educação ao qual a escola está vinculada.

Uso no sistema:

* filtros administrativos; 

* relatórios; 

* organização regional; 

* identificação institucional. 

Regra: a lista de NREs deve ser configurável ou cadastrada previamente no sistema. 

**Status da escola**

Campo obrigatório.

Opções:

* Ativa; 

* Inativa. 

Valor padrão: **Ativa**.

Regra: quando a escola estiver inativa, ela deve permanecer disponível para consulta histórica, mas não deve permitir novos cadastros operacionais, conforme regra administrativa. 

**6\. Bloco 2: Endereço e contato**

**Objetivo do bloco**

Registrar os dados de localização e comunicação institucional da escola.

| Campo | Tipo | Obrigatório | Finalidade |
| :---- | :---- | :---- | :---- |
| Logradouro | Texto | Sim | Registrar rua, avenida, estrada ou endereço equivalente |
| Número | Texto | Sim | Registrar número do endereço |
| Complemento | Texto | Não | Registrar bloco, sala, referência ou complemento |
| Bairro | Texto | Sim | Registrar bairro ou localidade |
| CEP | Texto com máscara | Sim | Registrar CEP da escola |
| Município | Lista ou busca | Sim | Registrar município da escola |
| UF | Lista suspensa | Sim | Registrar estado da escola |
| Fone institucional | Telefone com máscara | Sim | Registrar telefone oficial |
| E-mail institucional | E-mail | Sim | Registrar e-mail oficial da escola |

**Regras do bloco**

* O CEP deve usar máscara **00000-000**. 

* O telefone deve usar máscara. 

* O e-mail institucional deve ser validado. 

* O município pode vir de uma base cadastrada no sistema. 

* A UF pode ser preenchida automaticamente ao selecionar o município, se o sistema permitir. 

**7\. Bloco 3: Responsáveis pela escola**

**Objetivo do bloco**

Registrar os principais responsáveis institucionais pela escola no dia a dia do sistema.

O bloco deve ser dividido em duas colunas:

1. **Diretor(a)** 

2. **Coordenador(a) pedagógico(a)** 

Essa divisão está adequada porque direção e coordenação são os dois papéis centrais para gestão institucional, Avaliação de Ingresso, PAI, planejamento, registros pedagógicos e relatórios. 

**7.1 Diretor(a)**

| Campo | Tipo | Obrigatório | Finalidade |
| :---- | :---- | :---- | :---- |
| Nome do diretor(a) | Texto | Sim | Identificar a pessoa responsável pela direção |
| Fone do diretor(a) | Telefone com máscara | Sim | Registrar contato direto da direção |
| E-mail do diretor(a) | E-mail | Sim | Registrar e-mail da direção |

Uso no sistema:

* documentos; 

* relatórios; 

* comunicação institucional; 

* identificação da gestão; 

* notificações. 

Regra: o sistema deve validar o formato do e-mail. 

**7.2 Coordenador(a) pedagógico(a)**

| Campo | Tipo | Obrigatório | Finalidade |
| :---- | :---- | :---- | :---- |
| Nome do coordenador(a) | Texto | Sim | Identificar a pessoa responsável pela coordenação pedagógica |
| Fone do coordenador(a) | Telefone com máscara | Sim | Registrar contato direto da coordenação |
| E-mail do coordenador(a) | E-mail | Sim | Registrar e-mail da coordenação |

Uso no sistema:

* Avaliação de Ingresso; 

* PAI; 

* planejamento; 

* registros pedagógicos; 

* relatórios; 

* acompanhamento dos estudantes; 

* comunicações pedagógicas. 

Regra: o sistema deve validar o formato do e-mail. 

**8\. Aviso informativo da tela**

Ao final da tela, exibir a mensagem:

**Importante:** As informações cadastradas serão utilizadas em documentos, relatórios e comunicações do sistema.

Objetivo: alertar o usuário de que os dados devem ser preenchidos com atenção, pois serão reaproveitados em outras partes do Pertency. 

**9\. Botões e ações**

| Botão | Local | Função | Regra |
| :---- | :---- | :---- | :---- |
| Voltar | Canto superior esquerdo | Retornar à tela anterior ou listagem de escolas | Se houver alterações não salvas, alertar o usuário |
| Cancelar | Canto superior direito | Cancelar criação ou edição | Se houver alterações não salvas, pedir confirmação |
| Salvar escola | Canto superior direito | Gravar as informações da escola | Validar obrigatórios, e-mail, CEP e telefone |

As ações devem garantir que o usuário não perca dados preenchidos por acidente. 

**10\. Regras de negócio**

1. Toda escola cadastrada deve possuir nome oficial. 

2. Toda escola cadastrada deve possuir tipo de escola. 

3. Toda escola cadastrada deve possuir modalidade. 

4. Toda escola cadastrada deve possuir NRE vinculado. 

5. Toda escola cadastrada deve possuir status. 

6. Toda escola cadastrada deve possuir endereço completo. 

7. Toda escola cadastrada deve possuir fone institucional. 

8. Toda escola cadastrada deve possuir e-mail institucional. 

9. Toda escola cadastrada deve possuir diretor(a) informado. 

10. Toda escola cadastrada deve possuir coordenador(a) pedagógico(a) informado. 

11. O campo Nome usual é opcional. 

12. O campo Código da escola é opcional. 

13. O campo Complemento é opcional. 

14. O sistema deve validar o formato do e-mail institucional. 

15. O sistema deve validar o formato do e-mail do diretor(a). 

16. O sistema deve validar o formato do e-mail do coordenador(a). 

17. O sistema deve aplicar máscara para telefone. 

18. O sistema deve aplicar máscara para CEP. 

19. A escola com status **Inativa** não deve permitir novos cadastros operacionais, conforme regra administrativa. 

20. Os dados da escola devem ser reutilizados em documentos, relatórios e comunicações do sistema. 

21. O Cadastro de Escola não deve incluir ano letivo, períodos, ofertas, etapas, turnos, turmas ou prazos. 

22. Ano letivo, ofertas, etapas, turnos e prazos devem ser configurados em telas próprias. 

23. O cadastro deve ser simples, institucional e objetivo. 

24. O sistema deve manter histórico de alterações sensíveis, como mudança de status, direção, coordenação, e-mail institucional e NRE vinculado. 

**11\. Permissões por perfil**

| Perfil | Permissões |
| :---- | :---- |
| Administrador | Pode criar escola, editar todos os campos, alterar status, visualizar histórico e acessar configurações relacionadas |
| Direção | Pode visualizar os dados da escola, acompanhar dados institucionais e atualizar informações se autorizada |
| Coordenação pedagógica | Pode visualizar dados da escola e consultar informações usadas em documentos e relatórios pedagógicos |
| Secretaria | Pode visualizar dados da escola e utilizar informações em documentos e cadastros, podendo editar somente se autorizada |
| Professor | Não precisa acessar a edição do Cadastro de Escola, podendo visualizar informações institucionais apenas quando necessário |

A edição deve ser restrita, porque os dados da escola alimentam documentos, relatórios e comunicações institucionais. 

**12\. Critérios de aceite**

**Critério 1: salvar cadastro válido**

**Dado** que o usuário está cadastrando uma escola,  
**quando** preencher todos os campos obrigatórios corretamente e clicar em **Salvar escola**,  
**então** o sistema deve salvar o cadastro e exibir mensagem de sucesso.

**Critério 2: campos obrigatórios**

**Dado** que o usuário está cadastrando uma escola,  
**quando** tentar salvar sem preencher campos obrigatórios,  
**então** o sistema deve destacar os campos pendentes e impedir o salvamento.

**Critério 3: validação de e-mail**

**Dado** que o usuário informou um e-mail inválido,  
**quando** clicar em **Salvar escola**,  
**então** o sistema deve exibir mensagem de erro no campo correspondente.

**Critério 4: status da escola**

**Dado** que uma escola foi cadastrada como **Inativa**,  
**quando** o usuário tentar realizar novo cadastro operacional vinculado a essa escola,  
**então** o sistema deve bloquear a operação ou solicitar alteração do status, conforme permissão.

**Critério 5: uso em documentos**

**Dado** que a escola possui dados cadastrados,  
**quando** o sistema gerar documentos ou relatórios,  
**então** deve utilizar as informações oficiais do Cadastro de Escola.

**Critério 6: alteração de dados sensíveis**

**Dado** que o usuário altera dados sensíveis da escola, como status, NRE, direção, coordenação ou e-mail institucional,  
**quando** salvar a alteração,  
**então** o sistema deve registrar histórico com data, hora e usuário responsável.

**Critério 7: cancelamento com alteração**

**Dado** que o usuário alterou dados da escola,  
**quando** clicar em **Cancelar** ou **Voltar**,  
**então** o sistema deve avisar que existem alterações não salvas. 

