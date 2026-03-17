import { ConvexHttpClient } from "convex/browser";
import { api } from "./convex/_generated/api.js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
const client = new ConvexHttpClient(process.env.VITE_CONVEX_URL);
async function seedTeams() {
    console.log("Seeding teams...");
    const teamsData = [
        {
            name: "Tm kaatakada",
            players: [
                { name: "Nasi", jerseyNumber: 1, position: "GK" },
                { name: "Riswan", jerseyNumber: 2, position: "CB" },
                { name: "Adhi", jerseyNumber: 3, position: "CM" },
                { name: "Rizwan", jerseyNumber: 4, position: "ST" },
                { name: "Afnas", jerseyNumber: 5, position: "RW" },
                { name: "Afthab", jerseyNumber: 6, position: "LW" },
                { name: "Fayis", jerseyNumber: 7, position: "CDM" },
                { name: "Adhilriby", jerseyNumber: 8, position: "CAM" },
                { name: "Abhiraj", jerseyNumber: 9, position: "LM" },
                { name: "Abhinand", jerseyNumber: 10, position: "RM" },
            ]
        },
        {
            name: "KUBABA FC",
            players: [
                { name: "Emad", jerseyNumber: 1, position: "GK" },
                { name: "suranjal", jerseyNumber: 2, position: "CB" },
                { name: "Ishan", jerseyNumber: 3, position: "CM" },
                { name: "Irfan", jerseyNumber: 4, position: "ST" },
                { name: "Azim", jerseyNumber: 5, position: "RW" },
                { name: "Bharath", jerseyNumber: 6, position: "LW" },
                { name: "Fidel", jerseyNumber: 7, position: "CDM" },
                { name: "shaan", jerseyNumber: 8, position: "CAM" },
                { name: "gaganjith", jerseyNumber: 9, position: "LM" },
                { name: "Abhinav Shaji", jerseyNumber: 10, position: "RM" },
            ]
        },
        {
            name: "Al REEM FC",
            players: [
                { name: "Anzil", jerseyNumber: 1, position: "GK" },
                { name: "Joshua", jerseyNumber: 2, position: "CB" },
                { name: "Ashwin kishore", jerseyNumber: 3, position: "CM" },
                { name: "Naveed", jerseyNumber: 4, position: "ST" },
                { name: "Yaseen", jerseyNumber: 5, position: "RW" },
                { name: "aadhinadh", jerseyNumber: 6, position: "LW" },
                { name: "kannan K kamal", jerseyNumber: 7, position: "CDM" },
                { name: "sarinraj", jerseyNumber: 8, position: "CAM" },
                { name: "anoj", jerseyNumber: 9, position: "LM" },
                { name: "sidharth", jerseyNumber: 10, position: "RM" },
            ]
        },
        {
            name: "Al sheba Fc",
            players: [
                { name: "Ablin", jerseyNumber: 1, position: "GK" },
                { name: "Fayiz", jerseyNumber: 2, position: "CB" },
                { name: "Hanish", jerseyNumber: 3, position: "CM" },
                { name: "Nihal", jerseyNumber: 4, position: "ST" },
                { name: "Bullo tani", jerseyNumber: 5, position: "RW" },
                { name: "Tamchi", jerseyNumber: 6, position: "LW" },
                { name: "Chriswin", jerseyNumber: 7, position: "CDM" },
                { name: "amaldas", jerseyNumber: 8, position: "CAM" },
                { name: "aswin KA", jerseyNumber: 9, position: "LM" },
            ]
        }
    ];
    for (const teamInfo of teamsData) {
        const teamId = await client.mutation(api.teams.addTeam, {
            name: teamInfo.name,
            logo: undefined
        });
        console.log(`Created ${teamInfo.name}:`, teamId);
        for (const player of teamInfo.players) {
            await client.mutation(api.teams.addPlayer, {
                teamId: teamId,
                player: {
                    id: crypto.randomUUID(),
                    name: player.name,
                    jerseyNumber: player.jerseyNumber,
                    position: player.position,
                    teamId: teamId,
                    isCaptain: player.jerseyNumber === 1 // Set first player as captain
                }
            });
        }
    }
    console.log("Finished seeding teams and players.");
}
seedTeams().catch(console.error);
