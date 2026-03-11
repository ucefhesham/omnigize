-- Enable Row Level Security (RLS) for multi-tenancy isolation

-- 1. Helper function to get current workspace from session
CREATE OR REPLACE FUNCTION get_current_workspace_id() 
RETURNS UUID AS $$
    SELECT current_setting('app.current_workspace_id', true)::UUID;
$$ LANGUAGE SQL STABLE;

-- 2. Enable RLS on all tenant-specific tables
-- Note: Tables like 'workspaces' and 'modules' are global or handled differently.

DO $$ 
DECLARE 
    t TEXT;
    tenant_tables TEXT[] := ARRAY[
        'workspace_quotas', 'departments', 'teams', 'users', 'roles', 'permissions', 
        'entity_types', 'workspace_entity_types', 'custom_fields', 'template_entity_types', 
        'template_modules', 'template_pipelines', 'contacts', 'leads', 'deals', 
        'property_types', 'properties', 'pipelines', 'pipeline_stages', 'pipeline_transitions', 
        'flow_actions', 'conversations', 'messages', 'ai_sessions', 'documents', 
        'approval_requests', 'document_versions', 'tasks', 'activities', 'webhooks', 
        'webhook_deliveries', 'api_keys', 'audit_logs', 'tickets', 'ticket_messages'
    ];
BEGIN 
    FOREACH t IN ARRAY tenant_tables LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
        EXECUTE format('DROP POLICY IF EXISTS tenant_isolation_policy ON %I', t);
        
        -- Special case for workspace_quotas where PK is workspace_id
        IF t = 'workspace_quotas' THEN
            EXECUTE format('CREATE POLICY tenant_isolation_policy ON %I USING (workspace_id = get_current_workspace_id())', t);
        -- For most tables, we check the workspace_id column
        ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = t AND column_name = 'workspace_id') THEN
            EXECUTE format('CREATE POLICY tenant_isolation_policy ON %I USING (workspace_id = get_current_workspace_id())', t);
        -- For join tables or others without workspace_id, we need to join or handle separately.
        -- For this implementation, we assume core tables have workspace_id.
        END IF;
    END LOOP;
END $$;
