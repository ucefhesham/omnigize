-- ==========================================
-- OMNIGIZE COMPREHENSIVE DATABASE SCHEMA
-- Version: 1.0
-- Industry-Agnostic, Multi-Tenant CRM System
-- ==========================================

-- ==========================================
-- 1. EXTENSIONS & CORE ENUMS
-- ==========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Core enums for the entire system
DO $$ BEGIN
    CREATE TYPE user_status AS ENUM ('Active', 'Suspended', 'Invited');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE channel_type AS ENUM ('WhatsApp', 'Meta', 'Web', 'Email', 'Voice', 'Telegram', 'SMS');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE entity_type_enum AS ENUM ('Lead', 'Deal', 'Contact', 'Property', 'Task', 'Document', 'Company');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE property_status AS ENUM ('Available', 'Reserved', 'Sold', 'Rented');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE doc_status AS ENUM ('Draft', 'Pending Approval', 'Approved', 'Rejected', 'Signed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE pipeline_status AS ENUM ('Active', 'Archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE action_type AS ENUM ('Create', 'Update', 'Delete', 'Login', 'Logout', 'Approve', 'Reject', 'Move', 'View', 'Export');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE task_priority AS ENUM ('Low', 'Medium', 'High', 'Urgent');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE field_type AS ENUM ('text', 'number', 'select', 'multiselect', 'date', 'datetime', 'boolean', 'textarea', 'gallery', 'location', 'repeater', 'url', 'email', 'phone', 'currency', 'percentage', 'json');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ==========================================
-- 2. WORKSPACES & INDUSTRIES (Multi-tenant Foundation)
-- ==========================================
CREATE TABLE workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) UNIQUE,
    industry VARCHAR(100) DEFAULT 'General',
    logo VARCHAR(500),
    subscription_tier VARCHAR(50) DEFAULT 'Professional',
    is_active BOOLEAN DEFAULT true,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_workspaces_domain ON workspaces(domain);

-- Workspace quotas/limits
CREATE TABLE workspace_quotas (
    workspace_id UUID PRIMARY KEY REFERENCES workspaces(id) ON DELETE CASCADE,
    max_users INTEGER DEFAULT 10,
    max_leads INTEGER DEFAULT 1000,
    max_deals INTEGER DEFAULT 500,
    max_properties INTEGER DEFAULT 500,
    max_storage_mb INTEGER DEFAULT 1000,
    used_storage_mb INTEGER DEFAULT 0,
    max_api_calls_per_day INTEGER DEFAULT 10000,
    used_api_calls_today INTEGER DEFAULT 0,
    api_calls_reset_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 3. DEPARTMENTS & TEAMS
-- ==========================================
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    manager_id UUID,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_departments_workspace ON departments(workspace_id);
CREATE INDEX idx_teams_workspace ON teams(workspace_id);
CREATE INDEX idx_teams_department ON teams(department_id);

-- ==========================================
-- 4. USERS & AUTHENTICATION
-- ==========================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    avatar VARCHAR(500),
    status user_status DEFAULT 'Invited',
    is_workspace_owner BOOLEAN DEFAULT false,
    last_login_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_workspace ON users(workspace_id);
CREATE INDEX idx_users_email ON users(email);

-- Sessions for authentication
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token);

-- Account links (OAuth, password, etc.)
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    provider_id VARCHAR(255) NOT NULL,
    account_id VARCHAR(255) NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    id_token TEXT,
    access_token_expires_at TIMESTAMP WITH TIME ZONE,
    refresh_token_expires_at TIMESTAMP WITH TIME ZONE,
    scope VARCHAR(500),
    password VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email verification tokens
CREATE TABLE verification_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    identifier VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_verification_token ON verification_tokens(token);

-- ==========================================
-- 5. ROBUST RBAC (Maker/Checker Ready)
-- ==========================================
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_system_role BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(workspace_id, name)
);

CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(workspace_id, action)
);

CREATE TABLE role_permissions (
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE user_roles (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

CREATE INDEX idx_roles_workspace ON roles(workspace_id);
CREATE INDEX idx_permissions_workspace ON permissions(workspace_id);

-- ==========================================
-- 6. MODULES (Feature Toggles)
-- ==========================================
CREATE TABLE modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workspace module enable/disable
CREATE TABLE workspace_modules (
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
    is_enabled BOOLEAN DEFAULT true,
    settings JSONB DEFAULT '{}',
    PRIMARY KEY (workspace_id, module_id)
);

-- ==========================================
-- 7. ENTITY TYPES (Generic - Industry Agnostic)
-- ==========================================
CREATE TABLE entity_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) NOT NULL,
    icon VARCHAR(50),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(workspace_id, slug)
);

-- Workspace entity type configuration
CREATE TABLE workspace_entity_types (
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    entity_type_id UUID REFERENCES entity_types(id) ON DELETE CASCADE,
    is_enabled BOOLEAN DEFAULT true,
    PRIMARY KEY (workspace_id, entity_type_id)
);

CREATE INDEX idx_entity_types_workspace ON entity_types(workspace_id);

-- ==========================================
-- 8. CUSTOM FIELDS (15+ Field Types)
-- ==========================================
CREATE TABLE custom_fields (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    entity_type_id UUID REFERENCES entity_types(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) NOT NULL,
    field_type field_type NOT NULL,
    description TEXT,
    placeholder VARCHAR(255),
    default_value JSONB,
    options JSONB,
    repeater_fields JSONB,
    is_required BOOLEAN DEFAULT false,
    min_value DECIMAL(15, 2),
    max_value DECIMAL(15, 2),
    min_length INTEGER,
    max_length INTEGER,
    pattern VARCHAR(255),
    display_order INTEGER DEFAULT 0,
    visible_on_table BOOLEAN DEFAULT true,
    visible_on_form BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(workspace_id, entity_type_id, slug)
);

-- Custom field values (flexible - any entity)
CREATE TABLE custom_field_values (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    field_id UUID REFERENCES custom_fields(id) ON DELETE CASCADE,
    entity_id UUID NOT NULL,
    value JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_cfv_entity ON custom_field_values(entity_id);
CREATE INDEX idx_cfv_field ON custom_field_values(field_id);

-- ==========================================
-- 9. TEMPLATES (Pre-built Configurations)
-- ==========================================
CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    industry VARCHAR(100),
    description TEXT,
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    config JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Template entity types
CREATE TABLE template_entity_types (
    template_id UUID REFERENCES templates(id) ON DELETE CASCADE,
    entity_type_id UUID REFERENCES entity_types(id) ON DELETE CASCADE,
    PRIMARY KEY (template_id, entity_type_id)
);

-- Template modules
CREATE TABLE template_modules (
    template_id UUID REFERENCES templates(id) ON DELETE CASCADE,
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
    PRIMARY KEY (template_id, module_id)
);

-- Template pipelines
CREATE TABLE template_pipelines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID REFERENCES templates(id) ON DELETE CASCADE,
    entity_type_slug VARCHAR(50) NOT NULL,
    stages JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 10. CONTACTS
-- ==========================================
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(50),
    company_name VARCHAR(255),
    source_channel channel_type,
    metadata JSONB DEFAULT '{}',
    tags JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_contacts_workspace ON contacts(workspace_id);
CREATE INDEX idx_contacts_owner ON contacts(owner_id);

-- ==========================================
-- 11. LEADS (Generic Pipeline)
-- ==========================================
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    source_channel channel_type,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(50),
    country VARCHAR(100),
    company_name VARCHAR(255),
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    tags JSONB DEFAULT '[]',
    pipeline_id UUID,
    stage_id UUID,
    stage_changed_at TIMESTAMP WITH TIME ZONE,
    converted_to_deal_id UUID,
    converted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_leads_workspace ON leads(workspace_id);
CREATE INDEX idx_leads_owner ON leads(owner_id);
CREATE INDEX idx_leads_stage ON leads(stage_id);
CREATE INDEX idx_leads_status ON leads(deleted_at) WHERE deleted_at IS NULL;

-- ==========================================
-- 12. DEALS (With Multiple Properties Support)
-- ==========================================
CREATE TABLE deals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    pipeline_id UUID,
    stage_id UUID,
    owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    value DECIMAL(15, 2) DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT 'USD',
    probability INTEGER DEFAULT 50,
    expected_close_date DATE,
    actual_close_date DATE,
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    tags JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_deals_workspace ON deals(workspace_id);
CREATE INDEX idx_deals_stage ON deals(stage_id);
CREATE INDEX idx_deals_owner ON deals(owner_id);
CREATE INDEX idx_deals_lead ON deals(lead_id);

-- Junction: A deal can involve multiple properties
CREATE TABLE deal_properties (
    deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
    property_id UUID ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false,
    PRIMARY KEY (deal_id, property_id)
);

-- ==========================================
-- 13. PROPERTIES (Inventory - Industry Agnostic)
-- ==========================================
CREATE TABLE property_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50),
    icon VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(workspace_id, slug)
);

CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    property_type_id UUID REFERENCES property_types(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(15, 2),
    currency VARCHAR(10) DEFAULT 'USD',
    status property_status DEFAULT 'Available',
    location JSONB,
    bedrooms INTEGER,
    bathrooms INTEGER,
    area_sqft INTEGER,
    year_built INTEGER,
    images JSONB DEFAULT '[]',
    virtual_tour_url VARCHAR(500),
    pf_reference VARCHAR(100),
    bayut_reference VARCHAR(100),
    metadata JSONB DEFAULT '{}',
    tags JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_properties_workspace ON properties(workspace_id);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_type ON properties(property_type_id);

-- ==========================================
-- 14. CUSTOM PIPELINES (Flexible Workflows)
-- ==========================================
CREATE TABLE pipelines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    entity_type_id UUID REFERENCES entity_types(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE pipeline_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pipeline_id UUID REFERENCES pipelines(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color_code VARCHAR(10) DEFAULT '#000000',
    stage_order INTEGER NOT NULL,
    is_start BOOLEAN DEFAULT false,
    is_end BOOLEAN DEFAULT false,
    is_won BOOLEAN DEFAULT false,
    is_lost BOOLEAN DEFAULT false,
    allowed_actions JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE pipeline_transitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    pipeline_id UUID REFERENCES pipelines(id) ON DELETE CASCADE,
    from_stage_id UUID REFERENCES pipeline_stages(id) ON DELETE CASCADE,
    to_stage_id UUID REFERENCES pipeline_stages(id) ON DELETE CASCADE,
    action VARCHAR(50),
    conditions JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stage history (audit trail)
CREATE TABLE stage_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    from_stage_id UUID REFERENCES pipeline_stages(id) ON DELETE SET NULL,
    to_stage_id UUID REFERENCES pipeline_stages(id) ON DELETE SET NULL,
    moved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    moved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_pipelines_workspace ON pipelines(workspace_id);
CREATE INDEX idx_pipeline_stages_pipeline ON pipeline_stages(pipeline_id);
CREATE INDEX idx_stage_history_entity ON stage_history(entity_type, entity_id);

-- ==========================================
-- 15. FLOW ACTIONS (Automation)
-- ==========================================
CREATE TABLE flow_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    entity_type_id UUID REFERENCES entity_types(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    requires_input BOOLEAN DEFAULT false,
    input_fields JSONB,
    webhook_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Action execution log
CREATE TABLE flow_action_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    action_id UUID REFERENCES flow_actions(id) ON DELETE SET NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    performed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    input_values JSONB,
    result JSONB,
    success BOOLEAN DEFAULT true,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_flow_actions_workspace ON flow_actions(workspace_id);
CREATE INDEX idx_flow_action_logs_entity ON flow_action_logs(entity_type, entity_id);

-- ==========================================
-- 16. OMNI-CHANNEL COMMUNICATIONS
-- ==========================================
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    channel channel_type NOT NULL,
    external_thread_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_message_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender_type VARCHAR(50) NOT NULL,
    sender_id UUID,
    content TEXT,
    media_url VARCHAR(500),
    metadata JSONB DEFAULT '{}',
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Voice sessions
CREATE TABLE ai_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    duration_seconds INTEGER,
    recording_url VARCHAR(500),
    transcript TEXT,
    summary TEXT,
    sentiment VARCHAR(50),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_conversations_workspace ON conversations(workspace_id);
CREATE INDEX idx_conversations_lead ON conversations(lead_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);

-- ==========================================
-- 17. DOCUMENTS & APPROVALS
-- ==========================================
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
    property_id UUID,
    maker_id UUID REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    doc_type VARCHAR(100),
    file_url VARCHAR(500),
    status doc_status DEFAULT 'Draft',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Approval workflow (Maker/Checker)
CREATE TABLE approval_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    maker_id UUID REFERENCES users(id) ON DELETE SET NULL,
    checker_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status doc_status DEFAULT 'Pending Approval',
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Document versions
CREATE TABLE document_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    file_url VARCHAR(500),
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_documents_workspace ON documents(workspace_id);
CREATE INDEX idx_documents_deal ON documents(deal_id);
CREATE INDEX idx_approval_requests_document ON approval_requests(document_id);

-- ==========================================
-- 18. TASKS & ACTIVITIES
-- ==========================================
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES users(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    priority task_priority DEFAULT 'Medium',
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity log for entities
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tasks_workspace ON tasks(workspace_id);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX idx_activities_entity ON activities(entity_type, entity_id);

-- ==========================================
-- 19. WEBHOOKS (Event Triggers)
-- ==========================================
CREATE TABLE webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    url VARCHAR(500) NOT NULL,
    events JSONB NOT NULL,
    secret VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    headers JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Webhook delivery logs
CREATE TABLE webhook_deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    webhook_id UUID REFERENCES webhooks(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB,
    response_status INTEGER,
    response_body TEXT,
    delivered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    retry_count INTEGER DEFAULT 0
);

CREATE INDEX idx_webhooks_workspace ON webhooks(workspace_id);
CREATE INDEX idx_webhook_deliveries_webhook ON webhook_deliveries(webhook_id);

-- ==========================================
-- 20. API KEYS (External Integrations)
-- ==========================================
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    key_hash VARCHAR(255) UNIQUE NOT NULL,
    prefix VARCHAR(20) NOT NULL,
    permissions JSONB DEFAULT '[]',
    rate_limit INTEGER DEFAULT 1000,
    last_used_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_api_keys_workspace ON api_keys(workspace_id);

-- ==========================================
-- 21. COMPREHENSIVE AUDIT LOGS
-- ==========================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action action_type NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    previous_value JSONB,
    new_value JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    location JSONB,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_workspace ON audit_logs(workspace_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

-- ==========================================
-- 22. TICKETS (Support System)
-- ==========================================
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'open',
    priority task_priority DEFAULT 'Medium',
    category VARCHAR(100),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE ticket_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tickets_workspace ON tickets(workspace_id);
CREATE INDEX idx_tickets_user ON tickets(user_id);

-- ==========================================
-- SEED DATA (Optional - Run if needed)
-- ==========================================

-- Seed default modules
INSERT INTO modules (id, name, slug, description, icon) VALUES
    (uuid_generate_v4(), 'Leads Management', 'leads', 'Lead capture and nurturing', 'person_search'),
    (uuid_generate_v4(), 'Deals Pipeline', 'deals', 'Deal management and tracking', 'handshake'),
    (uuid_generate_v4(), 'Properties', 'properties', 'Property inventory management', 'home_work'),
    (uuid_generate_v4(), 'Communications', 'communications', 'Omni-channel messaging', 'chat'),
    (uuid_generate_v4(), 'Documents', 'documents', 'Document management and e-signatures', 'description'),
    (uuid_generate_v4(), 'Tasks', 'tasks', 'Task and activity management', 'checklist'),
    (uuid_generate_v4(), 'Reports', 'reports', 'Analytics and reporting', 'analytics'),
    (uuid_generate_v4(), 'Webhooks', 'webhooks', 'Integration webhooks', 'webhook')
ON CONFLICT (slug) DO NOTHING;

-- Seed default entity types
INSERT INTO entity_types (id, workspace_id, name, slug, icon) VALUES
    (uuid_generate_v4(), NULL, 'Lead', 'lead', 'person_search'),
    (uuid_generate_v4(), NULL, 'Deal', 'deal', 'handshake'),
    (uuid_generate_v4(), NULL, 'Contact', 'contact', 'contacts'),
    (uuid_generate_v4(), NULL, 'Property', 'property', 'home_work'),
    (uuid_generate_v4(), NULL, 'Task', 'task', 'checklist'),
    (uuid_generate_v4(), NULL, 'Document', 'document', 'description')
ON CONFLICT DO NOTHING;

-- Seed default system roles and permissions would typically be done per workspace
