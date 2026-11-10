alter table itens add column if not exists vai_na_cesta boolean not null default true;

drop table if exists entradas cascade;
create table entradas (
    id          serial primary key,
    data        date not null default current_date,
    variacao_id integer not null references variacoes(id),
    quantidade  numeric(10,2) not null check (quantidade > 0),
    criado_em   timestamptz not null default now()
);
create index idx_entradas_data on entradas (data);

create or replace function aplicar_entrada()
returns trigger as $$
begin
    if (tg_op = 'INSERT') then
        update variacoes set quantidade_estoque = quantidade_estoque + new.quantidade
        where id = new.variacao_id;
    elsif (tg_op = 'DELETE') then
        update variacoes set quantidade_estoque = quantidade_estoque - old.quantidade
        where id = old.variacao_id;
    end if;
    return null;
end;
$$ language plpgsql;

create trigger trg_aplicar_entrada
    after insert or delete on entradas
    for each row execute function aplicar_entrada();

drop table if exists montagens cascade;
create table montagens (
    id            serial primary key,
    data          date not null default current_date,
    tipo_cesta_id integer not null references tipos_cesta(id),
    quantidade    integer not null check (quantidade > 0),
    criado_em     timestamptz not null default now()
);
create index idx_montagens_data on montagens (data);

create or replace function aplicar_montagem()
returns trigger as $$
begin
    if (tg_op = 'INSERT') then
        update variacoes v
        set quantidade_estoque = v.quantidade_estoque - (ci.quantidade * new.quantidade)
        from cesta_itens ci
        where ci.variacao_id = v.id and ci.tipo_cesta_id = new.tipo_cesta_id;
    elsif (tg_op = 'DELETE') then
        update variacoes v
        set quantidade_estoque = v.quantidade_estoque + (ci.quantidade * old.quantidade)
        from cesta_itens ci
        where ci.variacao_id = v.id and ci.tipo_cesta_id = old.tipo_cesta_id;
    end if;
    return null;
end;
$$ language plpgsql;

create trigger trg_aplicar_montagem
    after insert or delete on montagens
    for each row execute function aplicar_montagem();

create or replace view v_cestas_esperadas as
select
    tc.id   as tipo_cesta_id,
    tc.nome as cesta,
    count(f.id) as esperadas
from tipos_cesta tc
left join familias f on f.tipo_cesta_id = tc.id and f.ativo
group by tc.id, tc.nome
order by tc.nome;

do $$
declare t text;
begin
    foreach t in array array[
        'categorias','itens','variacoes','tipos_cesta',
        'familias','cesta_itens','entradas','montagens'
    ]
    loop
        execute format('alter table %I enable row level security;', t);
        execute format('drop policy if exists acesso_app on %I;', t);
        execute format(
            'create policy acesso_app on %I for all to anon, authenticated using (true) with check (true);', t);
    end loop;
end $$;
