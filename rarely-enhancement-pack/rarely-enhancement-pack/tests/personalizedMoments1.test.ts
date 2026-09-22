import { describe, expect, it } from "vitest";
import { rankMoments, suppressRejectedMoments, DEFAULT_MOMENTS } from "../lib/ux/upgrade";
import type { MemoryItem } from "../lib/ux/upgrade";
import { fixtureEvent } from "./fixtures";

describe("personalized moments matrix 1", () => {
  it("ranks candidate set 1.1", () => {
    const events = [fixtureEvent({ id: "e-1-1", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 1.2", () => {
    const events = [fixtureEvent({ id: "e-1-2", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 1.3", () => {
    const events = [fixtureEvent({ id: "e-1-3", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 1.4", () => {
    const events = [fixtureEvent({ id: "e-1-4", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 1.5", () => {
    const events = [fixtureEvent({ id: "e-1-5", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 1.6", () => {
    const events = [fixtureEvent({ id: "e-1-6", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 1.7", () => {
    const events = [fixtureEvent({ id: "e-1-7", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 1.8", () => {
    const events = [fixtureEvent({ id: "e-1-8", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 1.9", () => {
    const events = [fixtureEvent({ id: "e-1-9", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 1.10", () => {
    const events = [fixtureEvent({ id: "e-1-10", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 1.11", () => {
    const events = [fixtureEvent({ id: "e-1-11", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 1.12", () => {
    const events = [fixtureEvent({ id: "e-1-12", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 1.13", () => {
    const events = [fixtureEvent({ id: "e-1-13", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 1.14", () => {
    const events = [fixtureEvent({ id: "e-1-14", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 1.15", () => {
    const events = [fixtureEvent({ id: "e-1-15", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 1.16", () => {
    const events = [fixtureEvent({ id: "e-1-16", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 1.17", () => {
    const events = [fixtureEvent({ id: "e-1-17", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 1.18", () => {
    const events = [fixtureEvent({ id: "e-1-18", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 1.19", () => {
    const events = [fixtureEvent({ id: "e-1-19", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 1.20", () => {
    const events = [fixtureEvent({ id: "e-1-20", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 1.21", () => {
    const events = [fixtureEvent({ id: "e-1-21", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 1.22", () => {
    const events = [fixtureEvent({ id: "e-1-22", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 1.23", () => {
    const events = [fixtureEvent({ id: "e-1-23", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 1.24", () => {
    const events = [fixtureEvent({ id: "e-1-24", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 1.25", () => {
    const events = [fixtureEvent({ id: "e-1-25", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 1.26", () => {
    const events = [fixtureEvent({ id: "e-1-26", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 1.27", () => {
    const events = [fixtureEvent({ id: "e-1-27", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 1.28", () => {
    const events = [fixtureEvent({ id: "e-1-28", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 1.29", () => {
    const events = [fixtureEvent({ id: "e-1-29", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 1.30", () => {
    const events = [fixtureEvent({ id: "e-1-30", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 1.31", () => {
    const events = [fixtureEvent({ id: "e-1-31", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 1.32", () => {
    const events = [fixtureEvent({ id: "e-1-32", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 1.33", () => {
    const events = [fixtureEvent({ id: "e-1-33", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 1.34", () => {
    const events = [fixtureEvent({ id: "e-1-34", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 1.35", () => {
    const events = [fixtureEvent({ id: "e-1-35", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 1.36", () => {
    const events = [fixtureEvent({ id: "e-1-36", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 1.37", () => {
    const events = [fixtureEvent({ id: "e-1-37", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 1.38", () => {
    const events = [fixtureEvent({ id: "e-1-38", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 1.39", () => {
    const events = [fixtureEvent({ id: "e-1-39", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 1.40", () => {
    const events = [fixtureEvent({ id: "e-1-40", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

});
