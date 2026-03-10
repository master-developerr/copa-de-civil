import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    teams: defineTable({
        name: v.string(),
        description: v.optional(v.string()),
        logo: v.optional(v.string()),
        players: v.array(v.object({
            id: v.string(),
            name: v.string(),
            jerseyNumber: v.number(),
            position: v.string(),
            isCaptain: v.boolean(),
            photo: v.optional(v.string())
        }))
    }),
    matches: defineTable({
        homeTeamId: v.string(),
        awayTeamId: v.string(),
        homeScore: v.number(),
        awayScore: v.number(),
        status: v.string(), // upcoming, live, half_time, extra_time, penalties, completed
        matchDay: v.number(),
        minute: v.optional(v.number()),
        isFinal: v.boolean(),
        duration: v.optional(v.number()),
        timerStartedAt: v.optional(v.number()),
        timerPausedAt: v.optional(v.number()),
        currentHalf: v.optional(v.union(v.number(), v.string())), // 1, 2, 'et1', 'et2' - numbers initially, string for ET
        extraTimeDuration: v.optional(v.number()),
        homePenaltyScore: v.optional(v.number()),
        awayPenaltyScore: v.optional(v.number()),
        events: v.array(v.object({
            id: v.string(),
            type: v.string(), // goal, yellow_card, red_card
            minute: v.number(),
            playerId: v.optional(v.string()),
            playerName: v.string(),
            teamId: v.string(),
            assistPlayerId: v.optional(v.string()),
            assistPlayerName: v.optional(v.string()),
        }))
    }),
    predictions: defineTable({
        createdAt: v.number(),
        userName: v.string(),
        finalist1Id: v.string(),
        finalist2Id: v.string(),
        predictedWinnerId: v.string(),
        homeScore: v.number(),
        awayScore: v.number(),
    }),
    settings: defineTable({
        adminCode: v.string(),
        tournamentStarted: v.boolean()
    })
});
