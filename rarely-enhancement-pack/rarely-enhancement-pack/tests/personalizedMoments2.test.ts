import { describe, expect, it } from "vitest";
import { rankMoments, suppressRejectedMoments, DEFAULT_MOMENTS } from "../lib/ux/upgrade";
import type { MemoryItem } from "../lib/ux/upgrade";
import { fixtureEvent } from "./fixtures";

describe("personalized moments matrix 2", () => {
  it("ranks candidate set 2.1", () => {
    const events = [fixtureEvent({ id: "e-2-1", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 2.2", () => {
    const events = [fixtureEvent({ id: "e-2-2", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 2.3", () => {
    const events = [fixtureEvent({ id: "e-2-3", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 2.4", () => {
    const events = [fixtureEvent({ id: "e-2-4", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 2.5", () => {
    const events = [fixtureEvent({ id: "e-2-5", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 2.6", () => {
    const events = [fixtureEvent({ id: "e-2-6", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 2.7", () => {
    const events = [fixtureEvent({ id: "e-2-7", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 2.8", () => {
    const events = [fixtureEvent({ id: "e-2-8", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 2.9", () => {
    const events = [fixtureEvent({ id: "e-2-9", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 2.10", () => {
    const events = [fixtureEvent({ id: "e-2-10", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 2.11", () => {
    const events = [fixtureEvent({ id: "e-2-11", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 2.12", () => {
    const events = [fixtureEvent({ id: "e-2-12", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 2.13", () => {
    const events = [fixtureEvent({ id: "e-2-13", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 2.14", () => {
    const events = [fixtureEvent({ id: "e-2-14", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 2.15", () => {
    const events = [fixtureEvent({ id: "e-2-15", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 2.16", () => {
    const events = [fixtureEvent({ id: "e-2-16", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 2.17", () => {
    const events = [fixtureEvent({ id: "e-2-17", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 2.18", () => {
    const events = [fixtureEvent({ id: "e-2-18", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 2.19", () => {
    const events = [fixtureEvent({ id: "e-2-19", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 2.20", () => {
    const events = [fixtureEvent({ id: "e-2-20", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 2.21", () => {
    const events = [fixtureEvent({ id: "e-2-21", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 2.22", () => {
    const events = [fixtureEvent({ id: "e-2-22", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 2.23", () => {
    const events = [fixtureEvent({ id: "e-2-23", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 2.24", () => {
    const events = [fixtureEvent({ id: "e-2-24", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 2.25", () => {
    const events = [fixtureEvent({ id: "e-2-25", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 2.26", () => {
    const events = [fixtureEvent({ id: "e-2-26", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 2.27", () => {
    const events = [fixtureEvent({ id: "e-2-27", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 2.28", () => {
    const events = [fixtureEvent({ id: "e-2-28", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 2.29", () => {
    const events = [fixtureEvent({ id: "e-2-29", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 2.30", () => {
    const events = [fixtureEvent({ id: "e-2-30", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 2.31", () => {
    const events = [fixtureEvent({ id: "e-2-31", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 2.32", () => {
    const events = [fixtureEvent({ id: "e-2-32", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 2.33", () => {
    const events = [fixtureEvent({ id: "e-2-33", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 2.34", () => {
    const events = [fixtureEvent({ id: "e-2-34", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 2.35", () => {
    const events = [fixtureEvent({ id: "e-2-35", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 2.36", () => {
    const events = [fixtureEvent({ id: "e-2-36", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 2.37", () => {
    const events = [fixtureEvent({ id: "e-2-37", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 2.38", () => {
    const events = [fixtureEvent({ id: "e-2-38", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 2.39", () => {
    const events = [fixtureEvent({ id: "e-2-39", metadata: { toolId: "journal", tags: ["journaling"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "journaling"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

  it("ranks candidate set 2.40", () => {
    const events = [fixtureEvent({ id: "e-2-40", metadata: { toolId: "journal", tags: ["visual"] } })];
    const memories: MemoryItem[] = [];
    const candidates = DEFAULT_MOMENTS.map((item) => ({ ...item, tags: [...item.tags, "visual"] }));
    const visible = suppressRejectedMoments(events, candidates);
    const ranked = rankMoments(events, memories, visible, 5);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.every((item) => Number.isFinite(item.score))).toBe(true);
  });

});
