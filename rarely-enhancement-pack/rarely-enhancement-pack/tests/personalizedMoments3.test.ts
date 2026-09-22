import { describe, expect, it } from "vitest";
import { rankMoments, suppressRejectedMoments, DEFAULT_MOMENTS } from "../lib/ux/upgrade";
import type { MemoryItem } from "../lib/ux/upgrade";
import { fixtureEvent } from "./fixtures";

describe("personalized moments matrix 3", () => {
  it("ranks candidate set 3.1", () => {
    const events = [fixtureEvent({ id: "e-3-1", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 3.2", () => {
    const events = [fixtureEvent({ id: "e-3-2", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 3.3", () => {
    const events = [fixtureEvent({ id: "e-3-3", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 3.4", () => {
    const events = [fixtureEvent({ id: "e-3-4", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 3.5", () => {
    const events = [fixtureEvent({ id: "e-3-5", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 3.6", () => {
    const events = [fixtureEvent({ id: "e-3-6", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 3.7", () => {
    const events = [fixtureEvent({ id: "e-3-7", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 3.8", () => {
    const events = [fixtureEvent({ id: "e-3-8", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 3.9", () => {
    const events = [fixtureEvent({ id: "e-3-9", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 3.10", () => {
    const events = [fixtureEvent({ id: "e-3-10", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 3.11", () => {
    const events = [fixtureEvent({ id: "e-3-11", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 3.12", () => {
    const events = [fixtureEvent({ id: "e-3-12", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 3.13", () => {
    const events = [fixtureEvent({ id: "e-3-13", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 3.14", () => {
    const events = [fixtureEvent({ id: "e-3-14", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 3.15", () => {
    const events = [fixtureEvent({ id: "e-3-15", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 3.16", () => {
    const events = [fixtureEvent({ id: "e-3-16", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 3.17", () => {
    const events = [fixtureEvent({ id: "e-3-17", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 3.18", () => {
    const events = [fixtureEvent({ id: "e-3-18", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 3.19", () => {
    const events = [fixtureEvent({ id: "e-3-19", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 3.20", () => {
    const events = [fixtureEvent({ id: "e-3-20", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 3.21", () => {
    const events = [fixtureEvent({ id: "e-3-21", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 3.22", () => {
    const events = [fixtureEvent({ id: "e-3-22", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 3.23", () => {
    const events = [fixtureEvent({ id: "e-3-23", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 3.24", () => {
    const events = [fixtureEvent({ id: "e-3-24", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 3.25", () => {
    const events = [fixtureEvent({ id: "e-3-25", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 3.26", () => {
    const events = [fixtureEvent({ id: "e-3-26", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 3.27", () => {
    const events = [fixtureEvent({ id: "e-3-27", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 3.28", () => {
    const events = [fixtureEvent({ id: "e-3-28", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 3.29", () => {
    const events = [fixtureEvent({ id: "e-3-29", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 3.30", () => {
    const events = [fixtureEvent({ id: "e-3-30", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 3.31", () => {
    const events = [fixtureEvent({ id: "e-3-31", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 3.32", () => {
    const events = [fixtureEvent({ id: "e-3-32", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 3.33", () => {
    const events = [fixtureEvent({ id: "e-3-33", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 3.34", () => {
    const events = [fixtureEvent({ id: "e-3-34", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 3.35", () => {
    const events = [fixtureEvent({ id: "e-3-35", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 3.36", () => {
    const events = [fixtureEvent({ id: "e-3-36", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 3.37", () => {
    const events = [fixtureEvent({ id: "e-3-37", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 3.38", () => {
    const events = [fixtureEvent({ id: "e-3-38", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 3.39", () => {
    const events = [fixtureEvent({ id: "e-3-39", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 3.40", () => {
    const events = [fixtureEvent({ id: "e-3-40", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

});
