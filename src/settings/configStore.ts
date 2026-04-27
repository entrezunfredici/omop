import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";

export interface ConnectionProfile {
    id: string;
    label: string;
    base_url: string;
    database: string;
    login: string;
    password: string;
    auth_type: "password" | "api_key";
    secret_ref: string;
    api_mode: "jsonrpc";
    enabled: boolean;
    port: number;
}

export interface AccessProfile {
    id: string;
    label: string;
    connection_profile_id: string;
    enabled: boolean;
    default_read_confirmation: boolean;
    default_create_confirmation: boolean;
    default_write_confirmation: boolean;
    default_delete_confirmation: boolean;
}

export interface PermissionRule {
    id: string;
    access_profile_id: string;
    model: string;
    field: string;
    operation: "read" | "create" | "write" | "delete";
    allowed: boolean;
    require_confirmation?: boolean;
    template_ids?: string[];
}

interface ProfilesConfig {
    connection_profiles: ConnectionProfile[];
    access_profiles: AccessProfile[];
    permission_rules: PermissionRule[];
}

const CONFIG_FILE = join(
    process.env.ODOO_PLUGIN_DATA_DIR ?? "/data",
    "odoo-plugin",
    "profiles.json",
);

function ensureDir(): void {
    mkdirSync(dirname(CONFIG_FILE), { recursive: true });
}

function read(): ProfilesConfig {
    try {
        if (!existsSync(CONFIG_FILE)) {
            return { connection_profiles: [], access_profiles: [], permission_rules: [] };
        }
        return JSON.parse(readFileSync(CONFIG_FILE, "utf-8")) as ProfilesConfig;
    } catch {
        return { connection_profiles: [], access_profiles: [], permission_rules: [] };
    }
}

function write(cfg: ProfilesConfig): void {
    ensureDir();
    writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2), "utf-8");
}

export const configStore = {
    getAll(): ProfilesConfig {
        return read();
    },

    upsertConnectionProfile(profile: ConnectionProfile): void {
        const cfg = read();
        const idx = cfg.connection_profiles.findIndex((p) => p.id === profile.id);
        if (idx >= 0) cfg.connection_profiles[idx] = profile;
        else cfg.connection_profiles.push(profile);
        write(cfg);
    },

    deleteConnectionProfile(id: string): void {
        const cfg = read();
        cfg.connection_profiles = cfg.connection_profiles.filter((p) => p.id !== id);
        write(cfg);
    },

    upsertAccessProfile(profile: AccessProfile): void {
        const cfg = read();
        const idx = cfg.access_profiles.findIndex((p) => p.id === profile.id);
        if (idx >= 0) cfg.access_profiles[idx] = profile;
        else cfg.access_profiles.push(profile);
        write(cfg);
    },

    deleteAccessProfile(id: string): void {
        const cfg = read();
        cfg.access_profiles = cfg.access_profiles.filter((p) => p.id !== id);
        write(cfg);
    },

    upsertPermissionRule(rule: PermissionRule): void {
        const cfg = read();
        const idx = cfg.permission_rules.findIndex((r) => r.id === rule.id);
        if (idx >= 0) cfg.permission_rules[idx] = rule;
        else cfg.permission_rules.push(rule);
        write(cfg);
    },

    deletePermissionRule(id: string): void {
        const cfg = read();
        cfg.permission_rules = cfg.permission_rules.filter((r) => r.id !== id);
        write(cfg);
    },
};
