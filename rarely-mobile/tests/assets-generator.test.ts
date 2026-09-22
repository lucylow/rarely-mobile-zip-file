import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const generatedDirectories: string[] = [];

function pngDimensions(path: string) {
  const image = readFileSync(path);
  return {
    width: image.readUInt32BE(16),
    height: image.readUInt32BE(20),
  };
}

afterEach(() => {
  while (generatedDirectories.length) {
    rmSync(generatedDirectories.pop()!, { recursive: true, force: true });
  }
});

describe("RARELY asset generator", () => {
  it("generates every app asset at the dimensions its validation requires", () => {
    const outputDirectory = mkdtempSync(join(tmpdir(), "rarely-assets-"));
    generatedDirectories.push(outputDirectory);

    execFileSync(process.execPath, [resolve("scripts/generate-assets.mjs")], {
      cwd: resolve("."),
      env: { ...process.env, RARELY_ASSET_OUTPUT_DIR: outputDirectory },
      stdio: "pipe",
    });

    expect(pngDimensions(join(outputDirectory, "icon.png"))).toEqual({ width: 1024, height: 1024 });
    expect(pngDimensions(join(outputDirectory, "android-icon-background.png"))).toEqual({ width: 512, height: 512 });
    expect(pngDimensions(join(outputDirectory, "android-icon-foreground.png"))).toEqual({ width: 512, height: 512 });
    expect(pngDimensions(join(outputDirectory, "android-icon-monochrome.png"))).toEqual({ width: 432, height: 432 });
    expect(pngDimensions(join(outputDirectory, "favicon.png"))).toEqual({ width: 48, height: 48 });
    expect(pngDimensions(join(outputDirectory, "splash-icon.png"))).toEqual({ width: 1024, height: 1024 });
  });
});
