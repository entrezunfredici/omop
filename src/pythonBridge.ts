const SERVICE_URL = (process.env.ODOO_SERVICE_URL ?? "http://localhost:8765").replace(/\/$/, "");

export interface BridgeRequest {
    action: string;
    model?: string;
    payload?: Record<string, unknown>;
    config: Record<string, unknown>;
}

export async function runPythonAction(request: BridgeRequest): Promise<unknown> {
    let response: Response;
    try {
        response = await fetch(`${SERVICE_URL}/execute`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(request),
        });
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        throw new Error(
            `Cannot reach the Odoo connector service at ${SERVICE_URL}. ` +
                `Start it with: python -m python.odoo_connector.server\n${msg}`,
        );
    }

    const body = await response.json().catch(() => null);

    if (!response.ok) {
        const detail = body?.detail ?? body ?? response.statusText;
        throw new Error(
            typeof detail === "string" ? detail : JSON.stringify(detail),
        );
    }

    return body;
}
