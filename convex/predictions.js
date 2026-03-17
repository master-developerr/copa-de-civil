import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
export const get = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("predictions").order("desc").collect();
    },
});
export const add = mutation({
    args: {
        userName: v.string(),
        finalist1Id: v.string(),
        finalist2Id: v.string(),
        predictedWinnerId: v.string(),
        homeScore: v.number(),
        awayScore: v.number(),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("predictions", {
            createdAt: Date.now(),
            userName: args.userName,
            finalist1Id: args.finalist1Id,
            finalist2Id: args.finalist2Id,
            predictedWinnerId: args.predictedWinnerId,
            homeScore: args.homeScore,
            awayScore: args.awayScore,
        });
    },
});
