drop table if exists cesta_itens cascade;
drop table if exists familias cascade;
drop table if exists tipos_cesta cascade;

create table tipos_cesta (
    id        serial primary key,
    nome      text not null unique,
    descricao text
);

create table familias (
    id               serial primary key,
    nome_responsavel text not null,
    telefone         text,
    endereco         text,
    qtd_pessoas      integer,
    tipo_cesta_id    integer references tipos_cesta(id),
    ativo            boolean not null default true,
    observacoes      text,
    criado_em        timestamptz not null default now(),
    atualizado_em    timestamptz not null default now()
);

create table cesta_itens (
    id            serial primary key,
    tipo_cesta_id integer not null references tipos_cesta(id) on delete cascade,
    variacao_id   integer not null references variacoes(id),
    quantidade    numeric(10,2) not null default 1,

    unique (tipo_cesta_id, variacao_id)
);

create index idx_familias_tipo_cesta on familias (tipo_cesta_id);
create index idx_cesta_itens_tipo on cesta_itens (tipo_cesta_id);
create index idx_cesta_itens_variacao on cesta_itens (variacao_id);

create trigger trg_familias_atualizado_em
    before update on familias
    for each row execute function set_atualizado_em();

insert into tipos_cesta (nome, descricao) values
    ('P', 'Cesta pequena'),
    ('M', 'Cesta média'),
    ('G', 'Cesta grande');

create or replace view v_composicao_cesta as
select
    tc.nome  as cesta,
    i.nome   as item,
    (v.tamanho::text || ' ' || v.unidade) as embalagem,
    ci.quantidade
from cesta_itens ci
join tipos_cesta tc on tc.id = ci.tipo_cesta_id
join variacoes v    on v.id = ci.variacao_id
join itens i        on i.id = v.item_id
order by tc.nome, i.nome;

select * from tipos_cesta;
