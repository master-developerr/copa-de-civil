import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("matches").collect();
    },
});

export const getLiveOrRecent = query({
    args: {},
    handler: async (ctx) => {
        // Find live match
        const liveMatch = await ctx.db.query("matches").filter(q =>
            q.or(
                q.eq(q.field("status"), 'live'),
                q.eq(q.field("status"), 'half_time'),
                q.eq(q.field("status"), 'extra_time'),
                q.eq(q.field("status"), 'penalties')
            )
        ).first();

        if (liveMatch) return liveMatch;

        // Otherwise return undefined
        return undefined;
    }
})

// Only called initially when tournament starts to generate the 6 round robin matches
export const initializeLeague = mutation({
    args: { pairs: v.array(v.object({ home: v.string(), away: v.string(), matchDay: v.number() })) },
    handler: async (ctx, args) => {
        for (const pair of args.pairs) {
            await ctx.db.insert("matches", {
                homeTeamId: pair.home,
                awayTeamId: pair.away,
                homeScore: 0,
                awayScore: 0,
                status: 'upcoming',
                matchDay: pair.matchDay,
                isFinal: false,
                duration: 45,
                currentHalf: 1,
                events: []
            });
        }
    }
});

export const updateStatus = mutation({
    args: { id: v.id("matches"), status: v.string() },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, { status: args.status });
    }
});

export const updateScore = mutation({
    args: { id: v.id("matches"), homeScore: v.number(), awayScore: v.number() },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, { homeScore: args.homeScore, awayScore: args.awayScore });
    }
});

export const addEvent = mutation({
    args: {
        id: v.id("matches"),
        event: v.object({
            id: v.string(),
            type: v.string(),
            minute: v.number(),
            playerId: v.optional(v.string()),
            playerName: v.string(),
            teamId: v.string(),
            assistPlayerId: v.optional(v.string()),
            assistPlayerName: v.optional(v.string()),
        })
    },
    handler: async (ctx, args) => {
        const match = await ctx.db.get(args.id);
        if (!match) return;

        await ctx.db.patch(args.id, { events: [...match.events, args.event] });
    }
});

export const updateMinute = mutation({
    args: { id: v.id("matches"), minute: v.number() },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, { minute: args.minute });
    }
});

// Timer specific mutations
export const startTimer = mutation({
    args: { id: v.id("matches") },
    handler: async (ctx, args) => {
        const match = await ctx.db.get(args.id);
        if (!match) return;

        // If resuming from pause, adjust timerStartedAt to maintain accumulated time
        if (match.timerPausedAt) {
            const now = Date.now();
            // Start time conceptually shifts forward to pretend the pause never happened
            const newStartedAt = now - match.timerPausedAt;
            await ctx.db.patch(args.id, { timerStartedAt: newStartedAt, timerPausedAt: undefined, status: 'live' });
        } else {
            // Fresh start
            await ctx.db.patch(args.id, { timerStartedAt: Date.now(), timerPausedAt: undefined, status: 'live' });
        }
    }
});

export const pauseTimer = mutation({
    args: { id: v.id("matches") },
    handler: async (ctx, args) => {
        const match = await ctx.db.get(args.id);
        if (!match || !match.timerStartedAt) return;

        const pausedSeconds = Math.floor((Date.now() - match.timerStartedAt) / 1000);
        await ctx.db.patch(args.id, { timerPausedAt: pausedSeconds });
    }
});

export const startSecondHalf = mutation({
    args: { id: v.id("matches") },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, {
            currentHalf: 2,
            status: 'live',
            timerStartedAt: Date.now(),
            timerPausedAt: undefined
        });
    }
});

export const startExtraTime = mutation({
    args: { id: v.id("matches") },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, {
            status: 'extra_time',
            currentHalf: 'et1',
            timerStartedAt: Date.now(),
            timerPausedAt: undefined
        });
    }
});

export const startExtraTimeSecondHalf = mutation({
    args: { id: v.id("matches") },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, {
            currentHalf: 'et2',
            status: 'extra_time',
            timerStartedAt: Date.now(),
            timerPausedAt: undefined
        });
    }
});

export const setDurations = mutation({
    args: { id: v.id("matches"), duration: v.optional(v.number()), extraTimeDuration: v.optional(v.number()) },
    handler: async (ctx, args) => {
        const payload: any = {};
        if (args.duration !== undefined) payload.duration = args.duration;
        if (args.extraTimeDuration !== undefined) payload.extraTimeDuration = args.extraTimeDuration;
        await ctx.db.patch(args.id, payload);
    }
});

export const startPenalties = mutation({
    args: { id: v.id("matches") },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, { status: 'penalties' });
    }
});

export const updatePenaltyScore = mutation({
    args: { id: v.id("matches"), homeScore: v.number(), awayScore: v.number() },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, { homePenaltyScore: args.homeScore, awayPenaltyScore: args.awayScore });
    }
});

export const createFinal = mutation({
    args: { homeTeamId: v.string(), awayTeamId: v.string() },
    handler: async (ctx, args) => {
        // Clear old finals
        const finals = await ctx.db.query("matches").filter(q => q.eq(q.field("isFinal"), true)).collect();
        for (const f of finals) await ctx.db.delete(f._id);

        await ctx.db.insert("matches", {
            homeTeamId: args.homeTeamId,
            awayTeamId: args.awayTeamId,
            homeScore: 0,
            awayScore: 0,
            status: 'upcoming',
            matchDay: 4,
            isFinal: true,
            duration: 45,
            currentHalf: 1,
            events: []
        });
    }
})
