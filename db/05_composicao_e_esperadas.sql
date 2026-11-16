-- Pastoral da Partilha - 05: cestas esperadas manuais + composicao (da planilha)
-- Rode DEPOIS do 01, 02, 03 e 04.

alter table tipos_cesta add column if not exists esperadas integer not null default 0;

drop view if exists v_cestas_esperadas;
create view v_cestas_esperadas as
select id as tipo_cesta_id, nome as cesta, esperadas from tipos_cesta order by nome;

update tipos_cesta set esperadas = 34 where nome = 'P';
update tipos_cesta set esperadas = 26 where nome = 'M';
update tipos_cesta set esperadas = 6 where nome = 'G';

truncate itens restart identity cascade;

insert into itens (categoria_id, nome, vai_na_cesta) values
  ((select id from categorias where nome='Alimentos'), 'Achocolatado', true),
  ((select id from categorias where nome='Alimentos'), 'Arroz', true),
  ((select id from categorias where nome='Alimentos'), 'Açúcar', true),
  ((select id from categorias where nome='Alimentos'), 'Bolacha', true),
  ((select id from categorias where nome='Alimentos'), 'Café', true),
  ((select id from categorias where nome='Alimentos'), 'Farinha de mandioca', true),
  ((select id from categorias where nome='Alimentos'), 'Farinha de trigo', true),
  ((select id from categorias where nome='Alimentos'), 'Feijão', true),
  ((select id from categorias where nome='Alimentos'), 'Fubá', true),
  ((select id from categorias where nome='Alimentos'), 'Macarrão', true),
  ((select id from categorias where nome='Alimentos'), 'Molho de tomate', true),
  ((select id from categorias where nome='Alimentos'), 'Sal', true),
  ((select id from categorias where nome='Alimentos'), 'Sardinha', true),
  ((select id from categorias where nome='Alimentos'), 'Vinagre', true),
  ((select id from categorias where nome='Alimentos'), 'Óleo', true),
  ((select id from categorias where nome='Higiene'), 'Água sanitária', true),
  ((select id from categorias where nome='Higiene'), 'Creme dental', true),
  ((select id from categorias where nome='Higiene'), 'Detergente', true),
  ((select id from categorias where nome='Higiene'), 'Escova de dente', true),
  ((select id from categorias where nome='Higiene'), 'Papel higiênico', true),
  ((select id from categorias where nome='Higiene'), 'Sabonete', true),
  ((select id from categorias where nome='Higiene'), 'Sabão pedra', true);

insert into variacoes (item_id, tamanho, unidade) values
  ((select id from itens where nome='Achocolatado'), 400, 'g'),
  ((select id from itens where nome='Arroz'), 5, 'kg'),
  ((select id from itens where nome='Açúcar'), 1, 'kg'),
  ((select id from itens where nome='Açúcar'), 3, 'kg'),
  ((select id from itens where nome='Açúcar'), 5, 'kg'),
  ((select id from itens where nome='Bolacha'), 400, 'g'),
  ((select id from itens where nome='Café'), 500, 'g'),
  ((select id from itens where nome='Farinha de mandioca'), 1, 'kg'),
  ((select id from itens where nome='Farinha de trigo'), 1, 'kg'),
  ((select id from itens where nome='Feijão'), 1, 'kg'),
  ((select id from itens where nome='Fubá'), 1, 'kg'),
  ((select id from itens where nome='Macarrão'), 500, 'g'),
  ((select id from itens where nome='Molho de tomate'), 340, 'g'),
  ((select id from itens where nome='Sal'), 1, 'kg'),
  ((select id from itens where nome='Sardinha'), 1, 'lata'),
  ((select id from itens where nome='Vinagre'), 1, 'L'),
  ((select id from itens where nome='Óleo'), 1, 'L'),
  ((select id from itens where nome='Água sanitária'), 1, 'L'),
  ((select id from itens where nome='Creme dental'), 1, 'unidade'),
  ((select id from itens where nome='Detergente'), 1, 'unidade'),
  ((select id from itens where nome='Escova de dente'), 1, 'unidade'),
  ((select id from itens where nome='Papel higiênico'), 1, 'rolo'),
  ((select id from itens where nome='Sabonete'), 1, 'unidade'),
  ((select id from itens where nome='Sabão pedra'), 1, 'unidade');

insert into cesta_itens (tipo_cesta_id, variacao_id, quantidade)
select tc.id, v.id, x.q from (values
  ('P','Açúcar',1,'kg',3),
  ('P','Arroz',5,'kg',1),
  ('P','Farinha de trigo',1,'kg',1),
  ('P','Feijão',1,'kg',2),
  ('P','Óleo',1,'L',2),
  ('P','Sal',1,'kg',1),
  ('P','Fubá',1,'kg',1),
  ('P','Farinha de mandioca',1,'kg',1),
  ('P','Sardinha',1,'lata',1),
  ('P','Vinagre',1,'L',1),
  ('P','Achocolatado',400,'g',1),
  ('P','Café',500,'g',1),
  ('P','Molho de tomate',340,'g',2),
  ('P','Macarrão',500,'g',2),
  ('P','Bolacha',400,'g',1),
  ('P','Água sanitária',1,'L',1),
  ('P','Papel higiênico',1,'rolo',4),
  ('P','Creme dental',1,'unidade',2),
  ('P','Sabão pedra',1,'unidade',2),
  ('P','Sabonete',1,'unidade',2),
  ('P','Detergente',1,'unidade',1),
  ('P','Escova de dente',1,'unidade',3),
  ('M','Açúcar',3,'kg',1),
  ('M','Arroz',5,'kg',2),
  ('M','Farinha de trigo',1,'kg',2),
  ('M','Feijão',1,'kg',3),
  ('M','Óleo',1,'L',3),
  ('M','Sal',1,'kg',1),
  ('M','Fubá',1,'kg',1),
  ('M','Farinha de mandioca',1,'kg',1),
  ('M','Sardinha',1,'lata',2),
  ('M','Vinagre',1,'L',1),
  ('M','Achocolatado',400,'g',1),
  ('M','Café',500,'g',1),
  ('M','Molho de tomate',340,'g',2),
  ('M','Macarrão',500,'g',3),
  ('M','Bolacha',400,'g',2),
  ('M','Água sanitária',1,'L',1),
  ('M','Papel higiênico',1,'rolo',8),
  ('M','Creme dental',1,'unidade',2),
  ('M','Sabão pedra',1,'unidade',3),
  ('M','Sabonete',1,'unidade',3),
  ('M','Detergente',1,'unidade',1),
  ('M','Escova de dente',1,'unidade',4),
  ('G','Açúcar',5,'kg',1),
  ('G','Arroz',5,'kg',3),
  ('G','Farinha de trigo',1,'kg',2),
  ('G','Feijão',1,'kg',4),
  ('G','Óleo',1,'L',3),
  ('G','Sal',1,'kg',1),
  ('G','Fubá',1,'kg',2),
  ('G','Farinha de mandioca',1,'kg',2),
  ('G','Sardinha',1,'lata',3),
  ('G','Vinagre',1,'L',1),
  ('G','Achocolatado',400,'g',2),
  ('G','Café',500,'g',2),
  ('G','Molho de tomate',340,'g',3),
  ('G','Macarrão',500,'g',4),
  ('G','Bolacha',400,'g',3),
  ('G','Água sanitária',1,'L',1),
  ('G','Papel higiênico',1,'rolo',8),
  ('G','Creme dental',1,'unidade',3),
  ('G','Sabão pedra',1,'unidade',5),
  ('G','Sabonete',1,'unidade',4),
  ('G','Detergente',1,'unidade',1),
  ('G','Escova de dente',1,'unidade',5)
) as x(cesta, item, tam, uni, q)
join tipos_cesta tc on tc.nome = x.cesta
join itens i on i.nome = x.item
join variacoes v on v.item_id = i.id and v.tamanho = x.tam and v.unidade = x.uni;

select * from v_composicao_cesta;