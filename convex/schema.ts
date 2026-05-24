import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  generations: defineTable({
    userId: v.string(),
    createdAt: v.number(),
    ocr: v.any(),
    uiJson: v.any(),
    ocrFailed: v.optional(v.boolean()),
    thumbnail: v.optional(v.string()),
    pageType: v.optional(v.string()),
    pageTheme: v.optional(v.string()),
    sectionCount: v.optional(v.number()),
  }).index("by_user_created", ["userId", "createdAt"]),
});
