insert into categorias (nome, descricao) values
    ('Alimentos', 'Alimentos não perecíveis da cesta básica'),
    ('Higiene',   'Produtos de higiene e limpeza');

insert into itens (categoria_id, nome) values
    ((select id from categorias where nome = 'Alimentos'), 'Arroz'),
    ((select id from categorias where nome = 'Alimentos'), 'Feijão'),
    ((select id from categorias where nome = 'Alimentos'), 'Macarrão'),
    ((select id from categorias where nome = 'Alimentos'), 'Óleo'),
    ((select id from categorias where nome = 'Alimentos'), 'Achocolatado'),
    ((select id from categorias where nome = 'Alimentos'), 'Sardinha'),
    ((select id from categorias where nome = 'Alimentos'), 'Açúcar'),
    ((select id from categorias where nome = 'Alimentos'), 'Fubá'),
    ((select id from categorias where nome = 'Higiene'),   'Papel higiênico'),
    ((select id from categorias where nome = 'Higiene'),   'Água sanitária (Qboa)'),
    ((select id from categorias where nome = 'Higiene'),   'Detergente'),
    ((select id from categorias where nome = 'Higiene'),   'Pasta de dente'),
    ((select id from categorias where nome = 'Higiene'),   'Sabonete'),
    ((select id from categorias where nome = 'Higiene'),   'Sabão em pedra'),
    ((select id from categorias where nome = 'Higiene'),   'Escova de dente');

insert into variacoes (item_id, tamanho, unidade) values
    ((select id from itens where nome = 'Arroz'),                 1,   'kg'),
    ((select id from itens where nome = 'Arroz'),                 5,   'kg'),
    ((select id from itens where nome = 'Feijão'),                1,   'kg'),
    ((select id from itens where nome = 'Macarrão'),              500, 'g'),
    ((select id from itens where nome = 'Óleo'),                  900, 'ml'),
    ((select id from itens where nome = 'Achocolatado'),          400, 'g'),
    ((select id from itens where nome = 'Sardinha'),              125, 'g'),
    ((select id from itens where nome = 'Açúcar'),                1,   'kg'),
    ((select id from itens where nome = 'Açúcar'),                5,   'kg'),
    ((select id from itens where nome = 'Fubá'),                  1,   'kg'),
    ((select id from itens where nome = 'Papel higiênico'),       4,   'unidade'),
    ((select id from itens where nome = 'Água sanitária (Qboa)'), 2,   'L'),
    ((select id from itens where nome = 'Detergente'),            500, 'ml'),
    ((select id from itens where nome = 'Pasta de dente'),        90,  'g'),
    ((select id from itens where nome = 'Sabonete'),              90,  'g'),
    ((select id from itens where nome = 'Sabão em pedra'),        1,   'unidade'),
    ((select id from itens where nome = 'Escova de dente'),       1,   'unidade');

select * from v_estoque;
