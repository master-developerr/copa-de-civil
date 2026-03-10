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

export const deleteTournament = mutation({
    args: {},
    handler: async (ctx) => {
        // Delete all matches
        const matches = await ctx.db.query("matches").collect();
        for (const match of matches) {
            await ctx.db.delete(match._id);
        }

        // Delete all predictions
        const predictions = await ctx.db.query("predictions").collect();
        for (const pred of predictions) {
            await ctx.db.delete(pred._id);
        }

        // Delete all teams
        const teams = await ctx.db.query("teams").collect();
        for (const team of teams) {
            await ctx.db.delete(team._id);
        }

        // Reset Settings
        const settings = await ctx.db.query("settings").first();
        if (settings) {
            await ctx.db.patch(settings._id, { tournamentStarted: false });
        }
    }
});
