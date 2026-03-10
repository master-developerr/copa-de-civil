import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("teams").collect();
    },
});

export const add = mutation({
    args: {
        name: v.string(),
        description: v.optional(v.string()),
        logo: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const teams = await ctx.db.query("teams").collect();
        if (teams.length >= 4) {
            throw new Error("Maximum of 4 teams allowed");
        }

        return await ctx.db.insert("teams", {
            name: args.name,
            description: args.description,
            logo: args.logo,
            players: [],
        });
    },
});

export const remove = mutation({
    args: { id: v.id("teams") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});

export const addPlayer = mutation({
    args: {
        teamId: v.id("teams"),
        player: v.object({
            id: v.string(),
            name: v.string(),
            jerseyNumber: v.number(),
            position: v.string(),
            isCaptain: v.boolean(),
            photo: v.optional(v.string())
        })
    },
    handler: async (ctx, args) => {
        const team = await ctx.db.get(args.teamId);
        if (!team) throw new Error("Team not found");

        // Check if max 15 players reached
        if (team.players.length >= 15) {
            throw new Error("Team maximum roster size reached");
        }

        const updatedPlayers = [...team.players, args.player];
        await ctx.db.patch(args.teamId, { players: updatedPlayers });
        return true;
    },
});

export const removePlayer = mutation({
    args: {
        teamId: v.id("teams"),
        playerId: v.string(),
    },
    handler: async (ctx, args) => {
        const team = await ctx.db.get(args.teamId);
        if (!team) throw new Error("Team not found");

        const updatedPlayers = team.players.filter(p => p.id !== args.playerId);
        await ctx.db.patch(args.teamId, { players: updatedPlayers });
    },
});

export const setCaptain = mutation({
    args: {
        teamId: v.id("teams"),
        playerId: v.string(),
    },
    handler: async (ctx, args) => {
        const team = await ctx.db.get(args.teamId);
        if (!team) throw new Error("Team not found");

        const updatedPlayers = team.players.map(p => ({
            ...p,
            isCaptain: p.id === args.playerId
        }));
        await ctx.db.patch(args.teamId, { players: updatedPlayers });
    }
});
