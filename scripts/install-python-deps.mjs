import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const pluginRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const basePythonCommand = process.env.PYTHON || (process.platform === "win32" ? "python" : "python3");
const venvPath = resolve(pluginRoot, ".venv");
const venvPythonCommand =
    process.platform === "win32" ? resolve(venvPath, "Scripts", "python.exe") : resolve(venvPath, "bin", "python");
const pipArgs = process.argv.slice(2);

function runStep(command, args, label) {
    process.stdout.write(`\n[install-python] ${label}\n`);
    process.stdout.write(`[install-python] ${command} ${args.join(" ")}\n`);

    const result = spawnSync(command, args, {
        cwd: pluginRoot,
        stdio: "inherit",
    });

    if (result.error) {
        throw result.error;
    }

    if (typeof result.status === "number" && result.status !== 0) {
        throw new Error(`${label} failed with exit code ${result.status}`);
    }
}

function ensureVirtualEnv() {
    if (existsSync(venvPythonCommand)) {
        process.stdout.write(`\n[install-python] Reusing existing virtual environment at ${venvPath}\n`);
        return;
    }

    try {
        runStep(basePythonCommand, ["-m", "venv", ".venv"], "Creating local virtual environment");
    } catch (error) {
        process.stderr.write(
            "[install-python] Failed to create .venv. Install the Python venv package for this interpreter " +
                "(for example `python3-venv` or a versioned package such as `python3.13-venv`) and retry.\n",
        );
        throw error;
    }
}

try {
    if (pipArgs.includes("--user")) {
        throw new Error("`--user` is not supported because dependencies are installed into the local .venv");
    }

    ensureVirtualEnv();
    runStep(venvPythonCommand, ["-m", "pip", "install", ...pipArgs, "-r", "requirements.txt"], "Installing Python dependencies");
} catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`[install-python] Failed: ${message}\n`);
    process.exit(1);
}
