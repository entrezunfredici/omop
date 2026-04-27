import { configStore } from "./settings/configStore.js";

export type ConnectionProfileConfig = {
    id: string;
    label: string;
    base_url: string;
    database: string;
    login: string;
    auth_type: "password" | "api_key";
    api_mode: "jsonrpc";
    enabled: boolean;
    port?: number;
    // One of these must be set for authentication:
    password?: string;   // direct password (stored in profiles.json)
    secret_ref?: string; // reference resolved via keyring / env ODOO_SECRET_<REF>
};

export type AccessProfileConfig = {
    id: string;
    label: string;
    connection_profile_id: string;
    enabled: boolean;
    default_read_confirmation: boolean;
    default_create_confirmation: boolean;
    default_write_confirmation: boolean;
    default_delete_confirmation: boolean;
};

export type PermissionRuleConfig = {
    id: string;
    access_profile_id: string;
    model: string;
    field: string;
    operation: "read" | "create" | "write" | "delete";
    allowed: boolean;
    require_confirmation?: boolean;
    template_ids?: string[];
};

export type TemplateConfig = {
    id: string;
    label: string;
    action: "create_task";
    required_variables: string[];
    payload_template: Record<string, unknown>;
    enabled: boolean;
};

export type OdooPluginConfig = {
    active_connection_profile_id: string;
    active_access_profile_id: string;
    default_limit: number;
    read_only: boolean;
    connection_profiles: ConnectionProfileConfig[];
    access_profiles: AccessProfileConfig[];
    permission_rules: PermissionRuleConfig[];
    templates: TemplateConfig[];
};

function asArray<T>(value: unknown): T[] {
    return Array.isArray(value) ? (value as T[]) : [];
}

export function getPluginConfig(api: any): OdooPluginConfig {
    const entry = api?.pluginConfig ?? {};

    const defaultLimit = entry.default_limit ?? entry.defaultLimit ?? 25;
    const readOnly = entry.read_only ?? entry.readOnly ?? true;

    // Profiles come from the settings file (managed via the settings UI).
    // Fall back to openclaw.json plugin config for backward compatibility.
    const stored = configStore.getAll();

    const connectionProfiles: ConnectionProfileConfig[] = stored.connection_profiles.length
        ? stored.connection_profiles
        : asArray<ConnectionProfileConfig>(entry.connection_profiles);

    const accessProfiles: AccessProfileConfig[] = stored.access_profiles.length
        ? stored.access_profiles
        : asArray<AccessProfileConfig>(entry.access_profiles);

    const permissionRules: PermissionRuleConfig[] = stored.permission_rules.length
        ? stored.permission_rules
        : asArray<PermissionRuleConfig>(entry.permission_rules);

    const templates = asArray<TemplateConfig>(entry.templates);

    const activeConnectionId =
        entry.active_connection_profile_id ?? connectionProfiles[0]?.id ?? "default";
    const activeAccessId =
        entry.active_access_profile_id ?? (readOnly ? "readonly" : "project_ops");

    return {
        active_connection_profile_id: activeConnectionId,
        active_access_profile_id: activeAccessId,
        default_limit: defaultLimit,
        read_only: readOnly,
        connection_profiles: connectionProfiles,
        access_profiles: accessProfiles,
        permission_rules: permissionRules,
        templates,
    };
}
