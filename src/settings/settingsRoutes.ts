import { configStore, type ConnectionProfile } from "./configStore.js";
import { settingsPageHtml } from "./settingsPage.js";

const PASSWORD_SENTINEL = "***";

function isNonEmptyString(v: unknown): v is string {
    return typeof v === "string" && v.trim().length > 0;
}

function isBool(v: unknown): v is boolean {
    return typeof v === "boolean";
}

function isPositiveInt(v: unknown): v is number {
    return typeof v === "number" && Number.isInteger(v) && v > 0;
}

// Mask passwords before sending to the browser — never expose credentials in GET responses.
function maskConfig(cfg: ReturnType<typeof configStore.getAll>) {
    return {
        ...cfg,
        connection_profiles: cfg.connection_profiles.map((p) => ({
            ...p,
            password: p.password ? PASSWORD_SENTINEL : "",
        })),
    };
}

// Registers the settings UI and REST API routes.
// The exact signature of api.registerHttpRoute may vary with the Open Claw SDK version —
// adjust the call format below if needed (e.g. positional args vs object).
export function registerSettingsRoutes(api: any): void {
    function route(method: string, path: string, handler: (req: any, res: any) => void | Promise<void>): void {
        api.registerHttpRoute({ method, path, handler });
    }

    route("GET", "/plugin/odoo/settings", (_req, res) => {
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.end(settingsPageHtml());
    });

    route("GET", "/plugin/odoo/api/config", (_req, res) => {
        res.json(maskConfig(configStore.getAll()));
    });

    // ---- Connection profiles ----

    route("PUT", "/plugin/odoo/api/connection-profiles", (req, res) => {
        const b = req.body;

        if (!isNonEmptyString(b?.id) || !isNonEmptyString(b?.label) ||
            !isNonEmptyString(b?.base_url) || !isNonEmptyString(b?.login)) {
            res.status(400).json({ error: "id, label, base_url et login sont requis (string non vide)" });
            return;
        }
        if (b.auth_type !== "password" && b.auth_type !== "api_key") {
            res.status(400).json({ error: "auth_type doit être 'password' ou 'api_key'" });
            return;
        }
        if (!isPositiveInt(b.port ?? 443)) {
            res.status(400).json({ error: "port doit être un entier positif" });
            return;
        }
        if (!isBool(b.enabled ?? true)) {
            res.status(400).json({ error: "enabled doit être un booléen" });
            return;
        }

        // If the password is the sentinel or empty, preserve the existing stored password.
        let password: string = typeof b.password === "string" ? b.password : "";
        if (!password || password === PASSWORD_SENTINEL) {
            const existing = configStore.getAll().connection_profiles.find((p) => p.id === b.id);
            password = existing?.password ?? "";
        }

        const profile: ConnectionProfile = {
            id: b.id.trim(),
            label: b.label.trim(),
            base_url: String(b.base_url).trim().replace(/\/$/, ""),
            database: String(b.database ?? "").trim(),
            login: b.login.trim(),
            password,
            auth_type: b.auth_type,
            secret_ref: String(b.secret_ref ?? b.id).trim(),
            api_mode: "jsonrpc",
            enabled: b.enabled ?? true,
            port: b.port ?? 443,
        };

        configStore.upsertConnectionProfile(profile);
        res.json({ ok: true });
    });

    route("DELETE", "/plugin/odoo/api/connection-profiles/:id", (req, res) => {
        if (!isNonEmptyString(req.params?.id)) {
            res.status(400).json({ error: "id requis" });
            return;
        }
        configStore.deleteConnectionProfile(req.params.id);
        res.json({ ok: true });
    });

    // ---- Access profiles ----

    route("PUT", "/plugin/odoo/api/access-profiles", (req, res) => {
        const b = req.body;

        if (!isNonEmptyString(b?.id) || !isNonEmptyString(b?.label) || !isNonEmptyString(b?.connection_profile_id)) {
            res.status(400).json({ error: "id, label et connection_profile_id sont requis (string non vide)" });
            return;
        }
        for (const field of ["default_read_confirmation", "default_create_confirmation",
                              "default_write_confirmation", "default_delete_confirmation"] as const) {
            if (field in b && !isBool(b[field])) {
                res.status(400).json({ error: `${field} doit être un booléen` });
                return;
            }
        }

        configStore.upsertAccessProfile({
            id: b.id.trim(),
            label: b.label.trim(),
            connection_profile_id: b.connection_profile_id.trim(),
            enabled: b.enabled ?? true,
            default_read_confirmation: b.default_read_confirmation ?? false,
            default_create_confirmation: b.default_create_confirmation ?? true,
            default_write_confirmation: b.default_write_confirmation ?? true,
            default_delete_confirmation: b.default_delete_confirmation ?? true,
        });
        res.json({ ok: true });
    });

    route("DELETE", "/plugin/odoo/api/access-profiles/:id", (req, res) => {
        if (!isNonEmptyString(req.params?.id)) {
            res.status(400).json({ error: "id requis" });
            return;
        }
        configStore.deleteAccessProfile(req.params.id);
        res.json({ ok: true });
    });

    // ---- Permission rules ----

    const VALID_OPERATIONS = new Set(["read", "create", "write", "delete"]);

    route("PUT", "/plugin/odoo/api/permission-rules", (req, res) => {
        const b = req.body;

        if (!isNonEmptyString(b?.id) || !isNonEmptyString(b?.access_profile_id) ||
            !isNonEmptyString(b?.model) || !isNonEmptyString(b?.field)) {
            res.status(400).json({ error: "id, access_profile_id, model et field sont requis (string non vide)" });
            return;
        }
        if (!VALID_OPERATIONS.has(b?.operation)) {
            res.status(400).json({ error: "operation doit être read, create, write ou delete" });
            return;
        }
        if ("allowed" in b && !isBool(b.allowed)) {
            res.status(400).json({ error: "allowed doit être un booléen" });
            return;
        }

        configStore.upsertPermissionRule({
            id: b.id.trim(),
            access_profile_id: b.access_profile_id.trim(),
            model: b.model.trim(),
            field: b.field.trim(),
            operation: b.operation,
            allowed: b.allowed ?? true,
            require_confirmation: b.require_confirmation ?? false,
            template_ids: Array.isArray(b.template_ids) ? b.template_ids : undefined,
        });
        res.json({ ok: true });
    });

    route("DELETE", "/plugin/odoo/api/permission-rules/:id", (req, res) => {
        if (!isNonEmptyString(req.params?.id)) {
            res.status(400).json({ error: "id requis" });
            return;
        }
        configStore.deletePermissionRule(req.params.id);
        res.json({ ok: true });
    });
}
