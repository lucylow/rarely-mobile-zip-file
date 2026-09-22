import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = path.resolve(process.cwd());
const assetsDir = path.join(projectRoot, "assets", "images");
const generator = path.join(projectRoot, "scripts", "generate-assets.mjs");
const expectedAssets = [
  ["icon.png", 1024, 1024],
  ["android-icon-background.png", 512, 512],
  ["android-icon-foreground.png", 512, 512],
  ["android-icon-monochrome.png", 432, 432],
  ["favicon.png", 48, 48],
  ["splash-icon.png", 1024, 1024],
] as const;

describe("asset generation", () => {
  it("fails when an existing required asset is malformed", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "rarely-assets-"));
    fs.writeFileSync(path.join(tempDir, "icon.png"), "not a png");
    expect(() => execFileSync(process.execPath, [generator], { cwd: projectRoot, env: { ...process.env, RARELY_ASSET_OUTPUT_DIR: tempDir }, stdio: "pipe" })).toThrow(/Invalid PNG asset: icon.png/);
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it("fails when an existing required asset has the wrong dimensions", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "rarely-assets-"));
    fs.copyFileSync(path.join(assetsDir, "favicon.png"), path.join(tempDir, "icon.png"));
    expect(() => execFileSync(process.execPath, [generator], { cwd: projectRoot, env: { ...process.env, RARELY_ASSET_OUTPUT_DIR: tempDir }, stdio: "pipe" })).toThrow(/Unexpected dimensions for icon.png/);
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it("keeps all required branded PNG assets valid and dimensioned", () => {
    expect(() => execFileSync(process.execPath, [generator], { cwd: projectRoot, stdio: "pipe" })).not.toThrow();

    for (const [filename, width, height] of expectedAssets) {
      const buffer = fs.readFileSync(path.join(assetsDir, filename));
      expect(buffer.subarray(0, 8)).toEqual(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
      expect(buffer.readUInt32BE(16)).toBe(width);
      expect(buffer.readUInt32BE(20)).toBe(height);
    }
  });
});

export {};
