import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const pluginRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pythonCommand = process.env.PYTHON || (process.platform === "win32" ? "python" : "python3");
const pipArgs = process.argv.slice(2);

function runStep(args, label) {
    process.stdout.write(`\n[install-python] ${label}\n`);
    process.stdout.write(`[install-python] ${pythonCommand} ${args.join(" ")}\n`);

    const result = spawnSync(pythonCommand, args, {
        cwd: pluginRoot,
        stdio: "inherit",
    });

    if (result.error) {
        throw result.error;
    }

    if (typeof result.status === "number" && result.status !== 0) {
        process.exit(result.status);
    }
}

try {
    runStep(["-m", "pip", "install", ...pipArgs, "-r", "requirements.txt"], "Installing Python dependencies");
} catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`[install-python] Failed: ${message}\n`);
    process.exit(1);
}
