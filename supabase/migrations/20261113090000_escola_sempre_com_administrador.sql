-- A escola nunca fica sem administrador ativo: rebaixar, inativar ou excluir o
-- último administrador é barrado. Sem isso, o único admin que trocasse a
-- própria função (ou fosse inativado) deixava a escola sem ninguém para
-- configurá-la — a secretaria não promove administrador e o admin da
-- plataforma só cria o primeiro.
--
-- Só vale para quem age logado (auth.uid() não nulo). Script de manutenção e
-- service role (seed --reset, compensações) passam: lá não há "alguém se
-- trancando para fora".

create or replace function public.garantir_administrador_na_escola()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return coalesce(new, old);
  end if;

  if old.funcao = 'administrador' and old.status = 'ativo'
     and (tg_op = 'DELETE' or new.funcao <> 'administrador' or new.status <> 'ativo')
     and not exists (
       select 1 from public.usuarios u
       where u.escola_id = old.escola_id
         and u.id <> old.id
         and u.funcao = 'administrador'
         and u.status = 'ativo'
     )
  then
    raise exception 'A escola precisa ter ao menos um administrador ativo.'
      using errcode = 'P0001', hint = 'ultimo_administrador';
  end if;

  return coalesce(new, old);
end;
$$;

revoke all on function public.garantir_administrador_na_escola() from public, anon, authenticated;

create trigger trg_usuarios_garantir_administrador
  before update or delete on public.usuarios
  for each row execute function public.garantir_administrador_na_escola();
