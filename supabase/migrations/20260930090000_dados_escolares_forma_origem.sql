-- Forma de origem — define se o bloco Origem escolar precisa dos detalhes da
-- escola anterior. "Primeira matrícula escolar" dispensa Rede/Escola de
-- origem e Informações sobre a transferência (a aplicação limpa esses campos
-- ao salvar). Obrigatória só com o estudante Ativo — regra na aplicação, não
-- aqui, pra não travar cadastros que ainda não a têm.
alter table public.dados_escolares
  add column forma_origem text check (
    forma_origem in (
      'primeira_matricula', 'transferencia_municipal', 'transferencia_estadual',
      'transferencia_particular', 'transferencia_especializada', 'outro'
    )
  );
