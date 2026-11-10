drop table if exists variacoes cascade;
drop table if exists itens cascade;
drop table if exists categorias cascade;

create table categorias (
    id          serial primary key,
    nome        text not null unique,
    descricao   text
);

create table itens (
    id            serial primary key,
    categoria_id  integer not null references categorias(id),
    nome          text not null,
    ativo         boolean not null default true,
    criado_em     timestamptz not null default now(),
    atualizado_em timestamptz not null default now(),

    unique (categoria_id, nome)
);

create table variacoes (
    id                 serial primary key,
    item_id            integer not null references itens(id) on delete cascade,
    tamanho            numeric(10,3) not null,
    unidade            text not null,
    quantidade_estoque numeric(10,2) not null default 0,
    ativo              boolean not null default true,
    criado_em          timestamptz not null default now(),
    atualizado_em      timestamptz not null default now(),

    unique (item_id, tamanho, unidade)
);

create index idx_itens_categoria on itens (categoria_id);
create index idx_variacoes_item on variacoes (item_id);

create or replace function set_atualizado_em()
returns trigger as $$
begin
    new.atualizado_em = now();
    return new;
end;
$$ language plpgsql;

create trigger trg_itens_atualizado_em
    before update on itens
    for each row execute function set_atualizado_em();

create trigger trg_variacoes_atualizado_em
    before update on variacoes
    for each row execute function set_atualizado_em();

create or replace view v_estoque as
select
    c.nome  as categoria,
    i.nome  as item,
    v.tamanho,
    v.unidade,
    (v.tamanho::text || ' ' || v.unidade) as embalagem,
    v.quantidade_estoque
from variacoes v
join itens i      on i.id = v.item_id
join categorias c on c.id = i.categoria_id
where i.ativo and v.ativo
order by c.nome, i.nome, v.tamanho;
