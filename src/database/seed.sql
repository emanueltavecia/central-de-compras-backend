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
