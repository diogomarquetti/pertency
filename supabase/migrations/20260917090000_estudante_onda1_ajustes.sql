-- Cadastro de Estudante — ajustes "Onda 1" pra alinhar com a HU-EST-001 v2.0
-- (docs/requisitos/cadastro-estudante.md). Três frentes independentes:
-- Aba 1 (tipo de documento de identificação), Aba 3 (separar CPF do
-- documento civil, unificar histórico escolar/guia de transferência) e
-- Aba 4 (opções de forma de ingresso, remover tipo de matrícula, motivo de
-- encerramento vira lista).

-- ---------------------------------------------------------------------------
-- Aba 1 — Dados pessoais: RG e Certidão de nascimento eram dois campos
-- soltos; viram um seletor único "Tipo de documento de identificação"
-- (rg | certidao_nascimento | certidao_casamento) + número do documento +
-- órgão emissor/UF (só quando rg).
-- ---------------------------------------------------------------------------
alter table public.estudantes
  add column tipo_documento_identificacao text
    check (tipo_documento_identificacao in ('rg', 'certidao_nascimento', 'certidao_casamento')),
  add column numero_documento text,
  add column orgao_emissor_uf text;

update public.estudantes
set tipo_documento_identificacao = 'rg', numero_documento = rg
where rg is not null and rg <> '';

update public.estudantes
set tipo_documento_identificacao = 'certidao_nascimento', numero_documento = certidao_nascimento
where tipo_documento_identificacao is null
  and certidao_nascimento is not null
  and certidao_nascimento <> '';

alter table public.estudantes drop column rg;
alter table public.estudantes drop column certidao_nascimento;

-- Auditoria da Aba 1 cobria só "situacao"; a HU v2.0 pede auditar também CPF
-- e o documento de identificação.
create or replace function public.audit_estudantes_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.situacao is distinct from old.situacao then
    insert into public.estudantes_auditoria (estudante_id, escola_id, campo_alterado, valor_anterior, valor_novo, alterado_por)
    values (new.id, new.escola_id, 'situacao', old.situacao, new.situacao, auth.uid());
  end if;

  if new.cpf is distinct from old.cpf then
    insert into public.estudantes_auditoria (estudante_id, escola_id, campo_alterado, valor_anterior, valor_novo, alterado_por)
    values (new.id, new.escola_id, 'cpf', old.cpf, new.cpf, auth.uid());
  end if;

  if new.tipo_documento_identificacao is distinct from old.tipo_documento_identificacao
    or new.numero_documento is distinct from old.numero_documento then
    insert into public.estudantes_auditoria (estudante_id, escola_id, campo_alterado, valor_anterior, valor_novo, alterado_por)
    values (
      new.id, new.escola_id, 'documento_identificacao',
      concat_ws(' ', old.tipo_documento_identificacao, old.numero_documento),
      concat_ws(' ', new.tipo_documento_identificacao, new.numero_documento),
      auth.uid()
    );
  end if;

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Aba 3 — Documentos: CPF sai do item combinado "certidao_rg_cpf" e vira
-- linha própria; "histórico escolar" e "guia de transferência" (hoje duas
-- linhas fixas) se unificam numa só — são alternativas do mesmo requisito,
-- não pendências distintas (CA17/CA18 da HU v2.0).
-- ---------------------------------------------------------------------------
-- A constraint precisa cair antes de qualquer UPDATE pros novos valores de
-- tipo — ela ainda valeria a lista antiga e bloquearia a migração dos dados.
alter table public.documentos_estudante drop constraint documentos_estudante_tipo_check;

update public.documentos_estudante
set tipo = 'documento_identificacao'
where tipo = 'certidao_rg_cpf';

-- Se o mesmo estudante tiver as duas linhas (não deveria acontecer ainda —
-- só há dado de teste), mantém a de histórico escolar e descarta a de guia
-- de transferência antes de unificar, evitando violar o índice único
-- parcial (estudante_id, tipo).
delete from public.documentos_estudante de
where de.tipo = 'guia_transferencia'
  and exists (
    select 1 from public.documentos_estudante de2
    where de2.estudante_id = de.estudante_id and de2.tipo = 'historico_escolar'
  );

update public.documentos_estudante
set tipo = 'vida_escolar_anterior'
where tipo in ('historico_escolar', 'guia_transferencia');

alter table public.documentos_estudante add constraint documentos_estudante_tipo_check
  check (
    tipo in (
      'documento_identificacao', 'cpf', 'comprovante_endereco', 'carteira_vacinacao',
      'vida_escolar_anterior', 'laudo', 'relatorio_anterior', 'outro'
    )
  );

-- ---------------------------------------------------------------------------
-- Aba 4 — Dados escolares: opções de "Forma de ingresso" mudam; "Tipo de
-- matrícula" some da HU v2.0 (fica absorvido em Forma de ingresso); "Motivo
-- do encerramento" deixa de ser texto livre e vira lista fechada (a HU não
-- enumera as opções — lista provisória até existir um módulo de
-- Configurações que a parametrize por escola).
-- ---------------------------------------------------------------------------
alter table public.dados_escolares drop column tipo_matricula;

alter table public.dados_escolares drop constraint dados_escolares_forma_ingresso_check;

update public.dados_escolares
set forma_ingresso = case forma_ingresso
  when 'processo' then 'avaliacao_ingresso'
  when 'transferencia' then 'transferencia_recebida'
  when 'encaminhamento' then 'outro'
  else forma_ingresso
end
where forma_ingresso is not null;

alter table public.dados_escolares add constraint dados_escolares_forma_ingresso_check
  check (
    forma_ingresso in (
      'avaliacao_ingresso', 'transferencia_recebida', 'rematricula_continuidade', 'outro'
    )
  );

alter table public.dados_escolares add constraint dados_escolares_motivo_encerramento_check
  check (
    motivo_encerramento in (
      'transferencia_outra_escola', 'mudanca_endereco', 'solicitacao_familia', 'decisao_pedagogica', 'outro'
    )
  );
