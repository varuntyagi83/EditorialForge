import { spawn } from "child_process";
import { randomUUID } from "crypto";
import * as path from "path";
import * as os from "os";
import * as fs from "fs/promises";
import { uploadImage } from "../storage/gcs";

interface Zone {
  x: number;
  y: number;
  w: number;
  h: number;
  align?: "left" | "center" | "right";
}

interface LayoutTemplate {
  id: string;
  headlineZone: unknown;
  subheadZone?: unknown;
  ctaZone?: unknown;
  logoZone?: unknown;
  typography: unknown;
}

interface ComposeParams {
  sceneId: string;
  sceneUrl: string;
  layoutTemplate: LayoutTemplate;
  headlineText: string;
  subheadText: string | null;
  ctaText: string | null;
  logoUrl: string | null;
}

interface ComposeResult {
  gcsPath: string;
  gcsUrl: string;
}

const SCRIPT_PATH = path.resolve(process.cwd(), "scripts/compose_editorial.py");

function runPython(inputJson: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn("python3", [SCRIPT_PATH], { stdio: ["pipe", "pipe", "pipe"] });

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (d: Buffer) => { stdout += d.toString(); });
    proc.stderr.on("data", (d: Buffer) => { stderr += d.toString(); });

    proc.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`compositor exited ${code}: ${stderr.slice(0, 500)}`));
        return;
      }
      try {
        const result = JSON.parse(stdout.trim());
        if (!result.success) {
          reject(new Error(`compositor failed: ${result.error}`));
        } else {
          resolve(result.path as string);
        }
      } catch {
        reject(new Error(`compositor output parse error: ${stdout.slice(0, 200)}`));
      }
    });

    proc.stdin.write(inputJson);
    proc.stdin.end();
  });
}

export async function compose(params: ComposeParams): Promise<ComposeResult> {
  const outFile = path.join(os.tmpdir(), `comp_${randomUUID()}.png`);

  const payload = {
    scene_url: params.sceneUrl,
    layout_template: params.layoutTemplate,
    headline_text: params.headlineText,
    subhead_text: params.subheadText,
    cta_text: params.ctaText,
    logo_url: params.logoUrl,
    output_path: outFile,
  };

  const localPath = await runPython(JSON.stringify(payload));

  const buffer = await fs.readFile(localPath);
  const gcsPath = `compositions/${params.sceneId}/${randomUUID()}.png`;
  const gcsUrl = await uploadImage(buffer, gcsPath, "image/png");

  await fs.unlink(localPath).catch(() => {});

  return { gcsPath, gcsUrl };
}
