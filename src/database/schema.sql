-- EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- TYPES
CREATE TYPE org_type AS ENUM ('central','store','supplier','televendas');
CREATE TYPE order_status AS ENUM ('draft','placed','confirmed','separated','shipped','delivered','cancelled','rejected');
CREATE TYPE campaign_type AS ENUM ('cashback','gift');
CREATE TYPE campaign_scope AS ENUM ('all','category','product');
CREATE TYPE user_account_status AS ENUM ('active','inactive','suspended');
CREATE TYPE permission_name AS ENUM (
  'manage_stores','manage_suppliers','manage_products','view_orders','manage_orders',
  'manage_campaigns','manage_conditions','manage_users','view_reports'
);

-- TABLES
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name permission_name NOT NULL UNIQUE,
  description TEXT
);

CREATE TABLE role_permissions (
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  role_id UUID NOT NULL REFERENCES roles(id),
  organization_id UUID, -- FK adicionada depois
  status user_account_status DEFAULT 'active',
  last_login TIMESTAMP WITH TIME ZONE,
  created_by UUID, -- FK adicionada depois
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type org_type NOT NULL,
  legal_name TEXT,
  trade_name TEXT,
  tax_id TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  created_by UUID, -- FK adicionada depois
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  active BOOLEAN DEFAULT TRUE
);

CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  street TEXT,
  number TEXT,
  complement TEXT,
  neighborhood TEXT,
  city TEXT,
  state CHAR(2),
  postal_code TEXT,
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id),
  sku TEXT,
  name TEXT NOT NULL,
  description TEXT,
  unit TEXT,
  base_price NUMERIC(12,2) NOT NULL CHECK (base_price >= 0),
  available_quantity INTEGER DEFAULT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_by UUID, -- FK adicionada depois
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt TEXT,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE payment_conditions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT,
  payment_term_days INTEGER DEFAULT 0,
  payment_method TEXT,
  notes TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE supplier_state_conditions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  state CHAR(2) NOT NULL,
  cashback_percent NUMERIC(5,2) CHECK (cashback_percent >= 0 AND cashback_percent <= 100),
  payment_term_days INTEGER,
  unit_price_adjustment NUMERIC(12,2) DEFAULT 0,
  effective_from DATE,
  effective_to DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (supplier_org_id, state, effective_from)
);

CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type campaign_type NOT NULL,
  scope campaign_scope NOT NULL DEFAULT 'all',
  min_total NUMERIC(12,2) DEFAULT NULL,
  min_quantity INTEGER DEFAULT NULL,
  cashback_percent NUMERIC(5,2) CHECK (cashback_percent >= 0 AND cashback_percent <= 100),
  gift_product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  category_id UUID REFERENCES categories(id),
  start_at TIMESTAMP WITH TIME ZONE,
  end_at TIMESTAMP WITH TIME ZONE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE campaign_products (
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  PRIMARY KEY (campaign_id, product_id)
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE,
  store_org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  supplier_org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  status order_status NOT NULL DEFAULT 'placed',
  placed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expected_delivery_date DATE,
  shipping_address_id UUID REFERENCES addresses(id),
  subtotal_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  shipping_cost NUMERIC(12,2) DEFAULT 0,
  adjustments NUMERIC(12,2) DEFAULT 0,
  total_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_cashback NUMERIC(12,2) DEFAULT 0,
  applied_supplier_state_condition_id UUID REFERENCES supplier_state_conditions(id),
  payment_condition_id UUID REFERENCES payment_conditions(id),
  created_by UUID, -- FK adicionada depois
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  product_name_snapshot TEXT NOT NULL,
  product_sku_snapshot TEXT,
  unit_price NUMERIC(12,2) NOT NULL,
  unit_price_adjusted NUMERIC(12,2) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  total_price NUMERIC(14,2) NOT NULL,
  applied_cashback_amount NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE order_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  previous_status order_status,
  new_status order_status NOT NULL,
  changed_by UUID, -- FK adicionada depois
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- FOREIGN KEYS ADDED AFTER TO BREAK CYCLES
ALTER TABLE users
  ADD CONSTRAINT fk_users_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
  ADD CONSTRAINT fk_users_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE organizations
  ADD CONSTRAINT fk_organizations_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE products
  ADD CONSTRAINT fk_products_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE orders
  ADD CONSTRAINT fk_orders_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE order_status_history
  ADD CONSTRAINT fk_order_status_history_changed_by FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL;

-- INDEXES
CREATE INDEX idx_addresses_org ON addresses(organization_id);
CREATE INDEX idx_addresses_state ON addresses(state);
CREATE INDEX idx_products_supplier ON products(supplier_org_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_payment_conditions_supplier ON payment_conditions(supplier_org_id);
CREATE INDEX idx_supplier_state_conditions_supplier_state ON supplier_state_conditions(supplier_org_id, state);
CREATE INDEX idx_campaigns_supplier ON campaigns(supplier_org_id);
CREATE INDEX idx_orders_store ON orders(store_org_id);
CREATE INDEX idx_orders_supplier ON orders(supplier_org_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_users_org ON users(organization_id);
CREATE INDEX idx_products_supplier_category ON products(supplier_org_id, category_id);

-- TRIGGERS
CREATE OR REPLACE FUNCTION trg_check_product_supplier_type()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.supplier_org_id IS NOT NULL THEN
    PERFORM 1 FROM organizations WHERE id = NEW.supplier_org_id AND type = 'supplier';
    IF NOT FOUND THEN
      RAISE EXCEPTION 'supplier_org_id % does not reference an organization of type supplier', NEW.supplier_org_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER check_product_supplier_type
BEFORE INSERT OR UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION trg_check_product_supplier_type();

CREATE OR REPLACE FUNCTION trg_check_order_org_types()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  PERFORM 1 FROM organizations WHERE id = NEW.store_org_id AND type = 'store';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'store_org_id % does not reference an organization of type store', NEW.store_org_id;
  END IF;

  PERFORM 1 FROM organizations WHERE id = NEW.supplier_org_id AND type = 'supplier';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'supplier_org_id % does not reference an organization of type supplier', NEW.supplier_org_id;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER check_order_org_types
BEFORE INSERT OR UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION trg_check_order_org_types();

CREATE OR REPLACE FUNCTION trg_check_user_org_exists()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.organization_id IS NOT NULL THEN
    PERFORM 1 FROM organizations WHERE id = NEW.organization_id;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'organization_id % does not reference an existing organization', NEW.organization_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER check_user_org_exists
BEFORE INSERT OR UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION trg_check_user_org_exists();
