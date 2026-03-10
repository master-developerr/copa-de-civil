import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("settings").first();
    },
});

export const updateAdminCode = mutation({
    args: { code: v.string() },
    handler: async (ctx, args) => {
        const settings = await ctx.db.query("settings").first();
        if (settings) {
            await ctx.db.patch(settings._id, { adminCode: args.code });
        } else {
            await ctx.db.insert("settings", { adminCode: args.code, tournamentStarted: false });
        }
    },
});

export const toggleTournamentStarted = mutation({
    args: { started: v.boolean() },
    handler: async (ctx, args) => {
        const settings = await ctx.db.query("settings").first();
        if (settings) {
            await ctx.db.patch(settings._id, { tournamentStarted: args.started });
        } else {
            await ctx.db.insert("settings", { adminCode: "TOURNEY2024", tournamentStarted: args.started });
        }
    },
});

export const initialize = mutation({
    args: {},
    handler: async (ctx) => {
        // Run once on load if no settings exist
        const settings = await ctx.db.query("settings").first();
        if (!settings) {
            await ctx.db.insert("settings", { adminCode: "TOURNEY2024", tournamentStarted: false });
        }
    }
})
