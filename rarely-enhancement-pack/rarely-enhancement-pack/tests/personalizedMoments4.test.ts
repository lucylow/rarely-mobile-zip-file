import { describe, expect, it } from "vitest";
import { rankMoments, suppressRejectedMoments, DEFAULT_MOMENTS } from "../lib/ux/upgrade";
import type { MemoryItem } from "../lib/ux/upgrade";
import { fixtureEvent } from "./fixtures";

describe("personalized moments matrix 4", () => {
  it("ranks candidate set 4.1", () => {
    const events = [fixtureEvent({ id: "e-4-1", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 4.2", () => {
    const events = [fixtureEvent({ id: "e-4-2", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 4.3", () => {
    const events = [fixtureEvent({ id: "e-4-3", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 4.4", () => {
    const events = [fixtureEvent({ id: "e-4-4", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 4.5", () => {
    const events = [fixtureEvent({ id: "e-4-5", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 4.6", () => {
    const events = [fixtureEvent({ id: "e-4-6", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 4.7", () => {
    const events = [fixtureEvent({ id: "e-4-7", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 4.8", () => {
    const events = [fixtureEvent({ id: "e-4-8", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 4.9", () => {
    const events = [fixtureEvent({ id: "e-4-9", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 4.10", () => {
    const events = [fixtureEvent({ id: "e-4-10", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 4.11", () => {
    const events = [fixtureEvent({ id: "e-4-11", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 4.12", () => {
    const events = [fixtureEvent({ id: "e-4-12", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 4.13", () => {
    const events = [fixtureEvent({ id: "e-4-13", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 4.14", () => {
    const events = [fixtureEvent({ id: "e-4-14", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 4.15", () => {
    const events = [fixtureEvent({ id: "e-4-15", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 4.16", () => {
    const events = [fixtureEvent({ id: "e-4-16", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 4.17", () => {
    const events = [fixtureEvent({ id: "e-4-17", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 4.18", () => {
    const events = [fixtureEvent({ id: "e-4-18", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 4.19", () => {
    const events = [fixtureEvent({ id: "e-4-19", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 4.20", () => {
    const events = [fixtureEvent({ id: "e-4-20", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 4.21", () => {
    const events = [fixtureEvent({ id: "e-4-21", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 4.22", () => {
    const events = [fixtureEvent({ id: "e-4-22", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 4.23", () => {
    const events = [fixtureEvent({ id: "e-4-23", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 4.24", () => {
    const events = [fixtureEvent({ id: "e-4-24", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 4.25", () => {
    const events = [fixtureEvent({ id: "e-4-25", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 4.26", () => {
    const events = [fixtureEvent({ id: "e-4-26", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 4.27", () => {
    const events = [fixtureEvent({ id: "e-4-27", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 4.28", () => {
    const events = [fixtureEvent({ id: "e-4-28", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 4.29", () => {
    const events = [fixtureEvent({ id: "e-4-29", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 4.30", () => {
    const events = [fixtureEvent({ id: "e-4-30", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 4.31", () => {
    const events = [fixtureEvent({ id: "e-4-31", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 4.32", () => {
    const events = [fixtureEvent({ id: "e-4-32", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 4.33", () => {
    const events = [fixtureEvent({ id: "e-4-33", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 4.34", () => {
    const events = [fixtureEvent({ id: "e-4-34", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 4.35", () => {
    const events = [fixtureEvent({ id: "e-4-35", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 4.36", () => {
    const events = [fixtureEvent({ id: "e-4-36", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 4.37", () => {
    const events = [fixtureEvent({ id: "e-4-37", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 4.38", () => {
    const events = [fixtureEvent({ id: "e-4-38", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 4.39", () => {
    const events = [fixtureEvent({ id: "e-4-39", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 4.40", () => {
    const events = [fixtureEvent({ id: "e-4-40", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

});
