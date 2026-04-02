import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";
import { Type } from "@sinclair/typebox";
import { getPluginConfig } from "./config.js";
import { runPythonAction } from "./pythonBridge.js";

export default definePluginEntry({
    id: "odoo-plugin",
    name: "Odoo Plugin",
    description: "Safe Odoo connector for OpenClaw",

    register(api) {
        api.registerTool({
            name: "odoo_list_tasks",
            description: "List tasks from an Odoo project",
            parameters: Type.Object({
                project_id: Type.Number(),
                limit: Type.Optional(Type.Number()),
            }),
            async execute(_id, params) {
                const config = getPluginConfig(api);

                const result = await runPythonAction("list_tasks", {
                    ...params,
                    config,
                });

                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            },
        });

        api.registerTool(
            {
                name: "odoo_create_task",
                description: "Create a task in Odoo",
                parameters: Type.Object({
                    project_id: Type.Number(),
                    name: Type.String(),
                    description: Type.Optional(Type.String()),
                }),
                async execute(_id, params) {
                    const config = getPluginConfig(api);

                    const result = await runPythonAction("create_task", {
                        ...params,
                        config,
                    });

                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(result, null, 2),
                            },
                        ],
                    };
                },
            },
            { optional: true },
        );
    },
});
