import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";

const MAX_GENERATIONS = 20;

function getPageMeta(uiJson: unknown) {
  const page = (uiJson as { page?: { type?: string; theme?: string; sections?: unknown[] } })
    ?.page;
  return {
    pageType: page?.type,
    pageTheme: page?.theme,
    sectionCount: page?.sections?.length,
  };
}

async function getOwnedGeneration(
  ctx: QueryCtx | MutationCtx,
  id: Id<"generations">
) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }
  const doc = await ctx.db.get(id);
  if (!doc || doc.userId !== identity.subject) {
    return null;
  }
  return doc;
}

export const create = mutation({
  args: {
    ocr: v.any(),
    uiJson: v.any(),
    ocrFailed: v.optional(v.boolean()),
    thumbnailDataUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const userId = identity.subject;
    const { pageType, pageTheme, sectionCount } = getPageMeta(args.uiJson);

    const id = await ctx.db.insert("generations", {
      userId,
      createdAt: Date.now(),
      ocr: args.ocr,
      uiJson: args.uiJson,
      ocrFailed: args.ocrFailed,
      thumbnail: args.thumbnailDataUrl,
      pageType,
      pageTheme,
      sectionCount,
    });

    const items = await ctx.db
      .query("generations")
      .withIndex("by_user_created", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    if (items.length > MAX_GENERATIONS) {
      for (const doc of items.slice(MAX_GENERATIONS)) {
        await ctx.db.delete(doc._id);
      }
    }

    return id;
  },
});

export const listForUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const userId = identity.subject;
    const docs = await ctx.db
      .query("generations")
      .withIndex("by_user_created", (q) => q.eq("userId", userId))
      .order("desc")
      .take(MAX_GENERATIONS);

    return docs.map((doc) => ({
      _id: doc._id,
      createdAt: doc.createdAt,
      ocr: doc.ocr,
      uiJson: doc.uiJson,
      ocrFailed: doc.ocrFailed,
      pageType: doc.pageType,
      pageTheme: doc.pageTheme,
      sectionCount: doc.sectionCount,
      thumbnailUrl: doc.thumbnail ?? null,
    }));
  },
});

export const remove = mutation({
  args: {
    id: v.id("generations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const doc = await ctx.db.get(args.id);
    if (!doc || doc.userId !== identity.subject) {
      throw new Error("Generation not found");
    }

    await ctx.db.delete(args.id);
  },
});

export const getPublicMock = query({
  args: {
    id: v.id("generations"),
  },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.id);
    if (!doc || doc.mockApiEnabled !== true || doc.mockApiJson === undefined) {
      return null;
    }
    return doc.mockApiJson;
  },
});

export const getMockForOwner = query({
  args: {
    id: v.id("generations"),
  },
  handler: async (ctx, args) => {
    const doc = await getOwnedGeneration(ctx, args.id);
    if (!doc) {
      return null;
    }
    return {
      mockApiEnabled: doc.mockApiEnabled ?? false,
      mockApiJson: doc.mockApiJson ?? null,
      mockApiUpdatedAt: doc.mockApiUpdatedAt ?? null,
      uiJson: doc.uiJson,
    };
  },
});

export const enableMockApi = mutation({
  args: {
    id: v.id("generations"),
  },
  handler: async (ctx, args) => {
    const doc = await getOwnedGeneration(ctx, args.id);
    if (!doc) {
      throw new Error("Generation not found");
    }

    const now = Date.now();
    await ctx.db.patch(args.id, {
      mockApiEnabled: true,
      mockApiJson: doc.mockApiJson ?? doc.uiJson,
      mockApiUpdatedAt: now,
    });
  },
});

export const updateMockApi = mutation({
  args: {
    id: v.id("generations"),
    mockApiJson: v.any(),
  },
  handler: async (ctx, args) => {
    const doc = await getOwnedGeneration(ctx, args.id);
    if (!doc) {
      throw new Error("Generation not found");
    }

    await ctx.db.patch(args.id, {
      mockApiEnabled: true,
      mockApiJson: args.mockApiJson,
      mockApiUpdatedAt: Date.now(),
    });
  },
});

export const disableMockApi = mutation({
  args: {
    id: v.id("generations"),
  },
  handler: async (ctx, args) => {
    const doc = await getOwnedGeneration(ctx, args.id);
    if (!doc) {
      throw new Error("Generation not found");
    }

    await ctx.db.patch(args.id, {
      mockApiEnabled: false,
    });
  },
});
