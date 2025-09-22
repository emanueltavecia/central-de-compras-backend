-- PERMISSÕES
INSERT INTO permissions (name, description) VALUES
  ('manage_users', 'Permite cadastrar e gerenciar usuários'),
  ('manage_stores', 'Permite cadastrar e gerenciar lojas'),
  ('manage_suppliers', 'Permite cadastrar e gerenciar fornecedores'),
  ('view_suppliers', 'Permite visualizar fornecedores e suas categorias'),
  ('manage_products', 'Permite cadastrar e gerenciar produtos'),
  ('view_orders', 'Permite visualizar pedidos'),
  ('create_orders', 'Permite criar novos pedidos'),
  ('manage_orders', 'Permite gerenciar pedidos (separar, enviar, confirmar, cancelar)'),
  ('manage_campaigns', 'Permite criar e gerenciar campanhas promocionais'),
  ('manage_conditions', 'Permite cadastrar e gerenciar condições comerciais');

INSERT INTO roles (name, description) VALUES
  ('admin', 'Administrador da Central de Compras - controla todo o sistema'),
  ('store', 'Usuário de Loja - realiza pedidos e consulta informações'),
  ('supplier', 'Usuário de Fornecedor - gerencia produtos, pedidos e campanhas');

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'admin';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r
JOIN permissions p ON p.name IN ('view_suppliers','create_orders','view_orders')
WHERE r.name = 'store';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r
JOIN permissions p ON p.name IN ('manage_products','view_orders','manage_orders','manage_campaigns','manage_conditions')
WHERE r.name = 'supplier';

-- ORGANIZAÇÕES DE EXEMPLO
INSERT INTO organizations (type, legal_name, trade_name, tax_id, phone, email, active) VALUES
  ('central', 'Central de Compras LTDA', 'Central de Compras', '12345678000100', '48999999999', 'contato@centralcompras.com', TRUE),
  ('store', 'Loja Exemplo LTDA', 'Loja Exemplo', '98765432000101', '48888888888', 'contato@lojaexemplo.com', TRUE),
  ('supplier', 'Fornecedor Exemplo LTDA', 'Fornecedor Exemplo', '11122233000102', '48777777777', 'contato@fornecedorexemplo.com', TRUE);

-- USUÁRIOS DE EXEMPLO
-- Senha para todos: Admin123!

INSERT INTO users (email, password, full_name, phone, role_id, organization_id, status) VALUES
  (
    'admin@centralcompras.com',
    '$2a$12$nA5zAh3Ufn0LrCmzKYxmaOCKPEsOnXOXJApBjitRmERmrkr3tHvmS',
    'Administrador Central',
    '48999999999',
    (SELECT id FROM roles WHERE name = 'admin'),
    (SELECT id FROM organizations WHERE tax_id = '12345678000100'),
    'active'
  ),
  (
    'loja@lojaexemplo.com',
    '$2a$12$nA5zAh3Ufn0LrCmzKYxmaOCKPEsOnXOXJApBjitRmERmrkr3tHvmS',
    'Usuário da Loja',
    '48888888888',
    (SELECT id FROM roles WHERE name = 'store'),
    (SELECT id FROM organizations WHERE tax_id = '98765432000101'),
    'active'
  ),
  (
    'fornecedor@fornecedorexemplo.com',
    '$2a$12$nA5zAh3Ufn0LrCmzKYxmaOCKPEsOnXOXJApBjitRmERmrkr3tHvmS',
    'Usuário do Fornecedor',
    '48777777777',
    (SELECT id FROM roles WHERE name = 'supplier'),
    (SELECT id FROM organizations WHERE tax_id = '11122233000102'),
    'active'
  );
