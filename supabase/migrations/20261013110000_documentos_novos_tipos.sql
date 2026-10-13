-- Checklist documental: entram Cartão SUS, RG/CPF de cada responsável
-- (principal e segundo — o segundo só conta quando existe) e Autorização de
-- uso de imagem (a escola gera o termo padrão, a via assinada entra por
-- upload ou entrega física).
alter table public.documentos_estudante drop constraint documentos_estudante_tipo_check;
alter table public.documentos_estudante add constraint documentos_estudante_tipo_check
  check (
    tipo in (
      'documento_identificacao', 'cpf', 'comprovante_endereco', 'carteira_vacinacao', 'cartao_sus',
      'rg_cpf_responsavel_principal', 'rg_cpf_segundo_responsavel', 'autorizacao_imagem',
      'vida_escolar_anterior', 'laudo', 'relatorio_anterior', 'avaliacao_ingresso', 'outro'
    )
  );
