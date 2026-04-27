import { configStore } from "./configStore.js";
import { settingsPageHtml } from "./settingsPage.js";

// Registers the settings UI and REST API routes.
// The exact signature of api.registerHttpRoute may vary with the Open Claw SDK version —
// adjust the call format below if needed (e.g. positional args vs. object).
export function registerSettingsRoutes(api: any): void {
    function route(method: string, path: string, handler: (req: any, res: any) => void | Promise<void>): void {
        api.registerHttpRoute({ method, path, handler });
    }

    route("GET", "/plugin/odoo/settings", (_req, res) => {
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.end(settingsPageHtml());
    });

    route("GET", "/plugin/odoo/api/config", (_req, res) => {
        res.json(configStore.getAll());
    });

    // ---- Connection profiles ----

    route("PUT", "/plugin/odoo/api/connection-profiles", (req, res) => {
        const body = req.body;
        if (!body?.id || !body?.label || !body?.base_url || !body?.login) {
            res.status(400).json({ error: "Champs obligatoires manquants : id, label, base_url, login" });
            return;
        }
        configStore.upsertConnectionProfile(body);
        res.json({ ok: true });
    });

    route("DELETE", "/plugin/odoo/api/connection-profiles/:id", (req, res) => {
        configStore.deleteConnectionProfile(req.params.id);
        res.json({ ok: true });
    });

    // ---- Access profiles ----

    route("PUT", "/plugin/odoo/api/access-profiles", (req, res) => {
        const body = req.body;
        if (!body?.id || !body?.label || !body?.connection_profile_id) {
            res.status(400).json({ error: "Champs obligatoires manquants : id, label, connection_profile_id" });
            return;
        }
        configStore.upsertAccessProfile(body);
        res.json({ ok: true });
    });

    route("DELETE", "/plugin/odoo/api/access-profiles/:id", (req, res) => {
        configStore.deleteAccessProfile(req.params.id);
        res.json({ ok: true });
    });

    // ---- Permission rules ----

    route("PUT", "/plugin/odoo/api/permission-rules", (req, res) => {
        const body = req.body;
        if (!body?.id || !body?.access_profile_id || !body?.model || !body?.field || !body?.operation) {
            res.status(400).json({ error: "Champs obligatoires manquants : id, access_profile_id, model, field, operation" });
            return;
        }
        configStore.upsertPermissionRule(body);
        res.json({ ok: true });
    });

    route("DELETE", "/plugin/odoo/api/permission-rules/:id", (req, res) => {
        configStore.deletePermissionRule(req.params.id);
        res.json({ ok: true });
    });
}
