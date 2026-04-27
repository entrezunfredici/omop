const SERVICE_URL = (process.env.ODOO_SERVICE_URL ?? "http://127.0.0.1:8765").replace(/\/$/, "");
const PLUGIN_TOKEN = process.env.ODOO_PLUGIN_TOKEN ?? "";
const REQUEST_TIMEOUT_MS = 30_000;

export interface BridgeRequest {
    action: string;
    model?: string;
    payload?: Record<string, unknown>;
    config: Record<string, unknown>;
}

export async function runPythonAction(request: BridgeRequest): Promise<unknown> {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (PLUGIN_TOKEN) headers["X-Plugin-Token"] = PLUGIN_TOKEN;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    let response: Response;
    try {
        response = await fetch(`${SERVICE_URL}/execute`, {
            method: "POST",
            headers,
            body: JSON.stringify(request),
            signal: controller.signal,
        });
    } catch (err: unknown) {
        const isTimeout = err instanceof Error && err.name === "AbortError";
        const msg = isTimeout
            ? `Odoo connector service timed out after ${REQUEST_TIMEOUT_MS / 1000}s (${SERVICE_URL})`
            : `Cannot reach Odoo connector service at ${SERVICE_URL} — start it with: python -m python.odoo_connector.server\n${err instanceof Error ? err.message : String(err)}`;
        throw new Error(msg);
    } finally {
        clearTimeout(timer);
    }

    const body = await response.json().catch(() => null);

    if (!response.ok) {
        const detail = body?.detail ?? body ?? response.statusText;
        throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
    }

    return body;
}
