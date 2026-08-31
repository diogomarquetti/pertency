**História do Módulo Cadastro de Mantenedora**

**1\. Visão geral**

O **Cadastro de Mantenedora** é o módulo responsável por registrar os dados institucionais da entidade jurídica responsável pela escola especializada.

No contexto do Pertency, essa mantenedora poderá ser uma **APAE** ou instituição equivalente. O cadastro deve permitir que o sistema identifique a entidade, registre seus contatos, representante legal, situação cadastral e utilize essas informações em documentos, relatórios, comunicações, contratos, vínculos institucionais e configurações internas. 

O objetivo é manter um cadastro **simples, objetivo e funcional**, com foco no que será utilizado no dia a dia da instituição.

**2\. Objetivo funcional**

O Cadastro de Mantenedora deve permitir:

* identificar oficialmente a mantenedora; 

* registrar razão social, nome fantasia e CNPJ; 

* registrar endereço e contatos institucionais; 

* registrar o representante legal da mantenedora; 

* controlar o status da mantenedora; 

* vincular a mantenedora à escola especializada; 

* disponibilizar esses dados para documentos, relatórios, comunicações, contratos e configurações do sistema. 

O cadastro não deve concentrar dados operacionais da escola, como estudantes, turmas, PAI, planejamento, registros pedagógicos, ano letivo, ofertas, etapas, turnos ou prazos. Esses itens pertencem a outros módulos do Pertency. 

**3\. Contexto de uso**

A mantenedora será cadastrada para representar a entidade jurídica responsável pela escola especializada.

Esse cadastro será utilizado principalmente por:

| Perfil | Uso principal |
| :---- | :---- |
| Administrador | Criar, editar, ativar, inativar e vincular mantenedora à escola |
| Direção | Consultar dados institucionais e solicitar atualização quando necessário |
| Secretaria | Utilizar dados em documentos, cadastros e comunicações |
| Coordenação pedagógica | Consultar dados institucionais quando necessário |
| Professor | Visualizar apenas informações institucionais quando necessário em documentos ou relatórios |

A tela será usada principalmente por perfis administrativos ou autorizados pela instituição. 

**4\. Estrutura da tela**

**Título**

**Cadastro da Mantenedora**

**Subtítulo**

**Dados institucionais da APAE mantenedora da escola especializada.**

**Blocos da tela**

A tela deve conter quatro blocos principais:

1. **Identificação da Mantenedora** 

2. **Endereço e Contato** 

3. **Representação Legal** 

4. **Situação** 

Também deve conter menu lateral do Pertency, item **Mantenedoras** selecionado, botão **Cancelar**, botão **Salvar rascunho** e botão **Salvar e continuar**. 

**5\. Bloco 1: Identificação da Mantenedora**

**Objetivo do bloco**

Registrar os dados principais que identificam juridicamente e institucionalmente a mantenedora dentro do sistema.

| Campo | Tipo | Obrigatório | Finalidade |
| :---- | :---- | :---- | :---- |
| Razão social | Texto | Sim | Registrar o nome jurídico oficial da entidade mantenedora |
| Nome fantasia | Texto | Sim | Registrar o nome de uso público ou institucional |
| CNPJ | Texto com máscara | Sim | Registrar a identificação jurídica da entidade |

**Razão social**

Campo obrigatório.

Deve registrar o nome jurídico oficial da mantenedora.

Uso no sistema:

* documentos institucionais; 

* relatórios; 

* contratos; 

* vínculos formais; 

* cadastros; 

* identificação jurídica. 

Regra: a razão social deve ser usada como referência principal em documentos formais e relatórios institucionais. 

**Nome fantasia**

Campo obrigatório.

Deve registrar o nome de uso público ou institucional da mantenedora.

Uso no sistema:

* telas internas; 

* busca; 

* filtros; 

* comunicações; 

* identificação rápida pelos usuários. 

Regra: o nome fantasia pode aparecer em telas internas e comunicações, mas não deve substituir a razão social em documentos formais, salvo configuração futura. 

**CNPJ**

Campo obrigatório, com máscara:

**00.000.000/0000-00**

Uso no sistema:

* identificação jurídica; 

* documentos; 

* relatórios; 

* contratos; 

* vínculos institucionais; 

* validações administrativas. 

Regra: o sistema deve validar o formato do CNPJ antes de permitir salvar o cadastro. 

**6\. Bloco 2: Endereço e Contato**

**Objetivo do bloco**

Registrar os dados de localização e comunicação institucional da mantenedora.

| Campo | Tipo | Obrigatório | Finalidade |
| :---- | :---- | :---- | :---- |
| Logradouro | Texto | Sim | Registrar rua, avenida, estrada ou outro endereço |
| Número | Texto | Sim | Registrar o número do endereço |
| Complemento | Texto | Não | Registrar informação adicional do endereço |
| Bairro | Texto | Sim | Registrar bairro ou localidade |
| CEP | Texto com máscara | Sim | Registrar CEP da mantenedora |
| Município | Texto, lista ou busca | Sim | Registrar município da mantenedora |
| UF | Lista suspensa | Sim | Registrar unidade federativa |
| Fone institucional | Telefone com máscara | Sim | Registrar telefone oficial |
| WhatsApp institucional | Telefone com máscara | Não | Registrar canal rápido de comunicação |
| E-mail institucional | E-mail | Sim | Registrar e-mail oficial |
| Site | URL ou texto | Não | Registrar site institucional, quando houver |

**Regras do bloco**

* O CEP deve usar máscara **00000-000**. 

* O telefone deve usar máscara. 

* O WhatsApp institucional é opcional. 

* O site é opcional. 

* O e-mail institucional deve ter formato validado. 

* Município pode ser carregado a partir de uma base previamente cadastrada. 

* A UF pode ser preenchida automaticamente quando o município estiver vinculado a uma base de municípios. 

**7\. Bloco 3: Representação Legal**

**Objetivo do bloco**

Registrar os dados da pessoa que representa legalmente a mantenedora.

Esse bloco deve deixar claro que o presidente cadastrado representa a **mantenedora**, e não necessariamente a direção da escola. A direção e a coordenação pedagógica pertencem ao **Cadastro de Escola**. 

| Campo | Tipo | Obrigatório | Finalidade |
| :---- | :---- | :---- | :---- |
| Nome do presidente | Texto | Sim | Identificar o presidente ou representante legal |
| CPF do presidente | Texto com máscara | Sim | Identificar juridicamente o representante legal |
| Fone do presidente | Telefone com máscara | Sim | Registrar contato direto do representante |
| E-mail do presidente | E-mail | Sim | Registrar contato eletrônico do representante |

**Nome do presidente**

Campo obrigatório.

Uso no sistema:

* documentos institucionais; 

* contratos; 

* relatórios; 

* termos; 

* comunicações; 

* validações administrativas. 

Regra: este campo identifica o representante legal da entidade mantenedora. 

**CPF do presidente**

Campo obrigatório, com máscara:

**000.000.000-00**

Uso no sistema:

* identificação do representante legal; 

* documentos; 

* contratos; 

* termos. 

Regra: o sistema deve validar o formato do CPF antes de salvar. 

**Fone do presidente**

Campo obrigatório, com máscara de telefone.

Uso no sistema:

* comunicação administrativa; 

* contato institucional; 

* validações internas. 

**E-mail do presidente**

Campo obrigatório, com validação de formato.

Uso no sistema:

* comunicações administrativas; 

* notificações; 

* documentos institucionais. 

**8\. Bloco 4: Situação**

**Objetivo do bloco**

Controlar se a mantenedora está ativa ou inativa no sistema.

| Campo | Tipo | Obrigatório | Opções |
| :---- | :---- | :---- | :---- |
| Status da mantenedora | Lista suspensa | Sim | Ativa, Inativa |

Valor padrão: **Ativa**.

Regra: quando a mantenedora estiver **Inativa**, ela deve permanecer disponível para consulta histórica, mas não deve permitir novos vínculos ou novas operações vinculadas, conforme permissão administrativa. 

**9\. Botões e ações**

| Botão | Local | Função | Regra |
| :---- | :---- | :---- | :---- |
| Cancelar | Rodapé | Cancelar criação ou edição | Se houver alterações não salvas, pedir confirmação |
| Salvar rascunho | Rodapé | Salvar dados parciais | Deve respeitar validações mínimas |
| Salvar e continuar | Rodapé | Salvar cadastro e avançar | Deve validar campos obrigatórios antes de concluir |

Essas ações ajudam a manter segurança no preenchimento e evitam perda de informações durante o cadastro. 

**10\. Menu lateral**

A tela deve estar dentro da área de cadastros institucionais ou configurações do sistema.

O menu lateral pode conter:

* Dashboard; 

* Mantenedoras; 

* Estudantes; 

* Responsáveis; 

* Relatórios; 

* Configurações; 

* Ajuda. 

O item **Mantenedoras** deve aparecer selecionado. A nomenclatura recomendada é **Estudantes**, e não **Alunos**, para manter consistência com o módulo Cadastro de Estudante. 

**11\. Regras de negócio**

1. Toda mantenedora deve possuir razão social. 

2. Toda mantenedora deve possuir nome fantasia. 

3. Toda mantenedora deve possuir CNPJ. 

4. Toda mantenedora deve possuir endereço institucional. 

5. Toda mantenedora deve possuir município e UF. 

6. Toda mantenedora deve possuir fone institucional. 

7. Toda mantenedora deve possuir e-mail institucional. 

8. Toda mantenedora deve possuir representante legal informado. 

9. O representante legal deve possuir nome, CPF, fone e e-mail. 

10. Toda mantenedora deve possuir status. 

11. O status padrão deve ser **Ativa**. 

12. O campo Complemento é opcional. 

13. O campo WhatsApp institucional é opcional. 

14. O campo Site é opcional. 

15. O sistema deve aplicar máscara para CNPJ. 

16. O sistema deve aplicar máscara para CPF. 

17. O sistema deve aplicar máscara para CEP. 

18. O sistema deve aplicar máscara para telefone. 

19. O sistema deve validar o formato do e-mail institucional. 

20. O sistema deve validar o formato do e-mail do presidente. 

21. A mantenedora inativa deve permanecer disponível para consulta histórica. 

22. A mantenedora inativa não deve permitir novos vínculos ou novas operações, conforme regra administrativa. 

23. Os dados da mantenedora devem ser reutilizados em documentos, relatórios e comunicações do sistema. 

24. A presidência cadastrada na mantenedora não substitui a direção da escola. 

25. Direção e coordenação pedagógica devem ser registradas no Cadastro de Escola. 

26. O Cadastro de Mantenedora não deve incluir estudantes, turmas, PAI, planejamento, registros pedagógicos, ano letivo ou configurações operacionais. 

27. O sistema deve manter histórico de alterações sensíveis, como razão social, CNPJ, status, representante legal, e-mail institucional e endereço. 

**12\. Permissões por perfil**

| Perfil | Permissões |
| :---- | :---- |
| Administrador | Criar mantenedora, editar todos os campos, alterar status, visualizar histórico, vincular mantenedora à escola e acessar configurações relacionadas |
| Direção | Visualizar dados da mantenedora, solicitar ou realizar atualização se autorizada, consultar dados institucionais |
| Secretaria | Visualizar dados da mantenedora, utilizar informações em cadastros, documentos e comunicações, editar apenas se autorizado |
| Coordenação pedagógica | Visualizar informações básicas quando necessário para documentos, relatórios ou identificação institucional |
| Professor | Não precisa acessar edição da mantenedora, podendo visualizar apenas informações institucionais quando necessário |

A edição deve ser controlada porque envolve dados jurídicos e institucionais da entidade mantenedora. 

**13\. Critérios de aceite**

**Critério 1: salvar cadastro válido**

**Dado** que o usuário está cadastrando uma mantenedora,  
**quando** preencher todos os campos obrigatórios corretamente e clicar em **Salvar e continuar**,  
**então** o sistema deve salvar o cadastro e exibir mensagem de sucesso.

**Critério 2: campos obrigatórios**

**Dado** que o usuário está cadastrando uma mantenedora,  
**quando** tentar salvar sem preencher campos obrigatórios,  
**então** o sistema deve destacar os campos pendentes e impedir a conclusão do cadastro.

**Critério 3: validação de CNPJ**

**Dado** que o usuário informou um CNPJ em formato inválido,  
**quando** tentar salvar a mantenedora,  
**então** o sistema deve exibir mensagem de erro no campo CNPJ.

**Critério 4: validação de CPF do presidente**

**Dado** que o usuário informou um CPF em formato inválido,  
**quando** tentar salvar a representação legal,  
**então** o sistema deve exibir mensagem de erro no campo CPF do presidente.

**Critério 5: validação de e-mail institucional**

**Dado** que o usuário informou um e-mail institucional inválido,  
**quando** clicar em **Salvar e continuar**,  
**então** o sistema deve exibir mensagem de erro no campo correspondente.

**Critério 6: status da mantenedora**

**Dado** que uma mantenedora foi cadastrada como **Inativa**,  
**quando** o usuário tentar criar novo vínculo operacional com essa mantenedora,  
**então** o sistema deve bloquear a operação ou solicitar alteração do status, conforme permissão administrativa.

**Critério 7: uso em documentos**

**Dado** que a mantenedora possui dados cadastrados,  
**quando** o sistema gerar documentos, relatórios ou comunicações institucionais,  
**então** deve utilizar as informações oficiais do Cadastro de Mantenedora.

**Critério 8: representação legal**

**Dado** que o usuário cadastrou o presidente da mantenedora,  
**quando** o sistema utilizar dados de representação legal,  
**então** deve considerar esse presidente como representante da mantenedora, e não como diretor da escola.

**Critério 9: cancelamento com alteração**

**Dado** que o usuário alterou dados da mantenedora,  
**quando** clicar em **Cancelar**,  
**então** o sistema deve avisar que existem alterações não salvas.

**Critério 10: histórico de alterações sensíveis**

**Dado** que o usuário altera dados sensíveis, como razão social, CNPJ, status, representante legal, e-mail institucional ou endereço,  
**quando** salvar a alteração,  
**então** o sistema deve registrar histórico com data, hora e usuário responsável. 

**14\. Fora do escopo do Cadastro de Mantenedora**

Não incluir nesta tela:

* estudantes; 

* responsáveis de estudantes; 

* turmas; 

* usuários; 

* PAI; 

* planejamentos; 

* registros pedagógicos; 

* relatórios pedagógicos detalhados; 

* ano letivo; 

* períodos; 

* ofertas; 

* etapas; 

* turnos; 

* prazos do sistema; 

* dados clínicos; 

* financeiro; 

* transporte escolar; 

* documentos jurídicos anexados; 

* dados bancários; 

* estatuto social; 

* ata de eleição; 

* mandato do presidente; 

* associação escolar separada; 

* configurações avançadas. 

Esses itens pertencem a outros módulos ou poderão ser avaliados em fases futuras. 

**15\. Observações de UX/UI**

A tela deve manter o padrão visual do Pertency:

* menu lateral azul escuro; 

* item **Mantenedoras** destacado; 

* título grande e claro; 

* subtítulo explicativo; 

* blocos em cartões brancos; 

* numeração dos blocos; 

* campos com bordas arredondadas; 

* obrigatórios sinalizados com asterisco; 

* botões no rodapé; 

* botão principal **Salvar e continuar** em azul; 

* botão secundário **Salvar rascunho**; 

* botão neutro **Cancelar**. 

A interface deve transmitir segurança institucional e simplicidade, pois será utilizada por equipes administrativas que precisam de rapidez no cadastro. 

**16\. Conclusão funcional**

O **Cadastro de Mantenedora** do Pertency deve permanecer enxuto e institucional.

Ele registra os dados essenciais da entidade responsável pela escola especializada, garante identificação jurídica, mantém contatos oficiais, registra o representante legal e controla a situação da mantenedora no sistema.

Essa estrutura atende ao MVP porque resolve o necessário para o funcionamento diário, sem incluir campos jurídicos, financeiros ou operacionais que podem ficar para fases futuras.

