import { relations } from "drizzle-orm";
import {
   index,
   integer,
   sqliteTable,
   text,
   unique,
} from "drizzle-orm/sqlite-core";

import { array, boolean, enumurate, json, timestamp } from "../util";
import { user } from "./auth";

export interface TournamentDiscord {
   serverId: string;
   channels: TournamentDiscordChannels;
   roles: Record<StaffRole | "SPECTATOR" | "PLAYER" | "CAPTAIN", string>;
}

export interface TeamDiscord {
   channelId: string;
   roleId: string;
}

export interface TournamentDiscordChannels {
   matchResults: string;
   matchPings: string;
}

export enum BracketType {
   SINGLE_ELIMINATION = "SINGLE_ELIMINATION",
   DOUBLE_ELIMINATION = "DOUBLE_ELIMINATION",
   ROUND_ROBIN = "ROUND_ROBIN",
   SWISS = "SWISS",
}

export enum BracketSide {
   WINNERS = "WINNERS",
   LOSERS = "LOSERS",
   GRAND_FINALS = "GRAND_FINALS",
}

export enum MatchStatus {
   PENDING = "PENDING",
   IN_PROGRESS = "IN_PROGRESS",
   COMPLETED = "COMPLETED",
   NO_SHOW = "NO_SHOW",
   DISPUTED = "DISPUTED",
}

export enum StaffRole {
   COMMENTATOR = "COMMENTATOR",
   REFEREE = "REFEREE",
   PLAYTESTER = "PLAYTESTER",
   POOLER = "POOLER",
   ADMIN = "ADMIN",
   HOST = "HOST",
}

export enum Mods {
   NM = "NM",
   HD = "HD",
   HR = "HR",
   DT = "DT",
   HT = "HT",
   RX = "RX",
   AP = "AP",
}

export enum ScreeningStatus {
   PENDING = "PENDING",
   APPROVED = "APPROVED",
   REJECTED = "REJECTED",
}

export enum QualifierLobbyStatus {
   SCHEDULED = "SCHEDULED",
   IN_PROGRESS = "IN_PROGRESS",
   COMPLETED = "COMPLETED",
   CANCELLED = "CANCELLED",
}

export interface TimeSlot {
   start: string;
   end: string;
}

export const tournament = sqliteTable("tournament", {
   id: text().primaryKey(),
   name: text().notNull(),
   acronym: text({ length: 4 }),
   rendition: integer(),
   description: text({ length: 255 }).notNull(),
   startDate: timestamp().notNull(),
   endDate: timestamp().notNull(),
   isPublic: boolean().notNull(),
   isArchived: boolean().notNull(),
   isDeleted: boolean().notNull(),
   createdAt: timestamp().notNull(),
   updatedAt: timestamp().notNull(),

   lobbySize: integer().notNull(),
   teamSize: integer().notNull(),

   discord: json<TournamentDiscord>(),
});

export const tournamentRelations = relations(tournament, ({ many }) => ({
   teams: many(team),
   players: many(player),
   brackets: many(bracket),
   mappools: many(mappool),
   staff: many(staff),
   screenings: many(screening),
   qualifierLobbies: many(qualifierLobby),
}));

export const playerAvailability = sqliteTable(
   "player_availability",
   {
      id: text().primaryKey(),
      playerId: text().notNull(),
      roundId: text().notNull(),
      timeSlots: json<TimeSlot[]>().notNull().default([]),
      timezone: text().notNull().default("UTC"),
      createdAt: timestamp().notNull(),
      updatedAt: timestamp().notNull(),
   },
   (table) => [
      index("player_availability_player_idx").on(table.playerId),
      index("player_availability_round_idx").on(table.roundId),
      unique("player_availability_unique").on(table.playerId, table.roundId),
   ],
);

export const playerAvailabilityRelations = relations(
   playerAvailability,
   ({ one }) => ({
      player: one(player, {
         fields: [playerAvailability.playerId],
         references: [player.id],
      }),
      round: one(round, {
         fields: [playerAvailability.roundId],
         references: [round.id],
      }),
   }),
);

export const player = sqliteTable(
   "player",
   {
      id: text().primaryKey(),
      name: text().notNull(),
      createdAt: timestamp().notNull(),
      updatedAt: timestamp().notNull(),
      tournamentId: text().notNull(),
      teamId: text(),
      userId: text().notNull(),
      isCaptain: boolean().notNull().default(false),
   },
   (table) => [
      index("player_tournament_idx").on(table.tournamentId),
      index("player_team_idx").on(table.teamId),
      index("player_user_idx").on(table.userId),
      index("player_tournament_team_idx").on(table.tournamentId, table.teamId),
      unique("player_user_tournament_unique").on(
         table.userId,
         table.tournamentId,
      ),
   ],
);

export const playerRelations = relations(player, ({ one, many }) => ({
   tournament: one(tournament, {
      fields: [player.tournamentId],
      references: [tournament.id],
   }),
   team: one(team, {
      fields: [player.teamId],
      references: [team.id],
   }),
   user: one(user, {
      fields: [player.userId],
      references: [user.id],
   }),
   availability: many(playerAvailability),
   screening: one(screening),
}));

export const screening = sqliteTable(
   "screening",
   {
      id: text().primaryKey(),
      playerId: text().notNull(),
      tournamentId: text().notNull(),
      status: enumurate(ScreeningStatus)
         .notNull()
         .default(ScreeningStatus.PENDING),

      rejectionReason: text(),
      isAppealable: boolean().notNull().default(false),

      reviewedBy: text(),
      reviewedAt: timestamp(),

      createdAt: timestamp().notNull(),
      updatedAt: timestamp().notNull(),
   },
   (table) => [
      index("screening_player_idx").on(table.playerId),
      index("screening_tournament_idx").on(table.tournamentId),
      index("screening_status_idx").on(table.status),
      unique("screening_player_tournament_unique").on(
         table.playerId,
         table.tournamentId,
      ),
   ],
);

export const screeningRelations = relations(screening, ({ one }) => ({
   player: one(player, {
      fields: [screening.playerId],
      references: [player.id],
   }),
   tournament: one(tournament, {
      fields: [screening.tournamentId],
      references: [tournament.id],
   }),
   reviewer: one(staff, {
      fields: [screening.reviewedBy],
      references: [staff.id],
   }),
}));

export const staff = sqliteTable(
   "staff",
   {
      id: text().primaryKey(),
      name: text().notNull(),
      createdAt: timestamp().notNull(),
      updatedAt: timestamp().notNull(),
      tournamentId: text().notNull(),
      userId: text().notNull(),
      roles: array<StaffRole>().notNull().default([]),
   },
   (table) => [
      index("staff_tournament_idx").on(table.tournamentId),
      index("staff_user_idx").on(table.userId),
      unique("staff_tournament_user_unique").on(
         table.tournamentId,
         table.userId,
      ),
   ],
);

export const staffRelations = relations(staff, ({ one, many }) => ({
   tournament: one(tournament, {
      fields: [staff.tournamentId],
      references: [tournament.id],
   }),
   user: one(user, {
      fields: [staff.userId],
      references: [user.id],
   }),
   refereeAvailability: many(refereeAvailability),
}));

export const mappool = sqliteTable(
   "mappool",
   {
      id: text().primaryKey(),
      tournamentId: text().notNull(),
      createdAt: timestamp().notNull(),
      updatedAt: timestamp().notNull(),
   },
   (table) => [index("mappool_tournament_idx").on(table.tournamentId)],
);

export const mappoolRelations = relations(mappool, ({ one, many }) => ({
   tournament: one(tournament, {
      fields: [mappool.tournamentId],
      references: [tournament.id],
   }),
   maps: many(map),
   rounds: many(round),
   qualifierLobbies: many(qualifierLobby),
}));

export const map = sqliteTable(
   "map",
   {
      id: text().primaryKey(),
      mappoolId: text().notNull(),
      mapId: integer().notNull(),
      poolerId: text(),
      slot: text(),
      rendition: integer().notNull().default(1),
      mod: enumurate(Mods).notNull().default(Mods.NM),
      multipliers: json<Record<keyof typeof Mods, number>>(),
   },
   (table) => [
      index("map_mappool_idx").on(table.mappoolId),
      index("map_pooler_idx").on(table.poolerId),
   ],
);

export const mapRelations = relations(map, ({ one }) => ({
   mappool: one(mappool, {
      fields: [map.mappoolId],
      references: [mappool.id],
   }),
   pooler: one(staff, {
      fields: [map.poolerId],
      references: [staff.id],
   }),
}));

export const team = sqliteTable(
   "team",
   {
      id: text().primaryKey(),
      name: text().notNull(),
      seed: integer(),
      isEliminated: boolean().notNull().default(false),
      createdAt: timestamp().notNull(),
      updatedAt: timestamp().notNull(),
      tournamentId: text().notNull(),
      discord: json<TeamDiscord>(),
   },
   (table) => [
      index("team_tournament_idx").on(table.tournamentId),
      index("team_seed_idx").on(table.seed),
      unique("team_name_tournament_unique").on(table.name, table.tournamentId),
   ],
);

export const teamRelations = relations(team, ({ one, many }) => ({
   tournament: one(tournament, {
      fields: [team.tournamentId],
      references: [tournament.id],
   }),
   players: many(player),
   qualifierParticipants: many(qualifierParticipant),
}));

export const qualifierLobby = sqliteTable(
   "qualifier_lobby",
   {
      id: text().primaryKey(),
      tournamentId: text().notNull(),
      mappoolId: text().notNull(),
      name: text().notNull(),
      scheduledAt: timestamp().notNull(),
      status: enumurate(QualifierLobbyStatus)
         .notNull()
         .default(QualifierLobbyStatus.SCHEDULED),

      refereeId: text(),
      osuMatchId: integer(),
      maxParticipants: integer().notNull().default(16),

      notes: text(),

      startedAt: timestamp(),
      completedAt: timestamp(),
      createdAt: timestamp().notNull(),
      updatedAt: timestamp().notNull(),
   },
   (table) => [
      index("qualifier_lobby_tournament_idx").on(table.tournamentId),
      index("qualifier_lobby_mappool_idx").on(table.mappoolId),
      index("qualifier_lobby_scheduled_idx").on(table.scheduledAt),
   ],
);

export const qualifierLobbyRelations = relations(
   qualifierLobby,
   ({ one, many }) => ({
      tournament: one(tournament, {
         fields: [qualifierLobby.tournamentId],
         references: [tournament.id],
      }),
      mappool: one(mappool, {
         fields: [qualifierLobby.mappoolId],
         references: [mappool.id],
      }),
      referee: one(staff, {
         fields: [qualifierLobby.refereeId],
         references: [staff.id],
      }),
      participants: many(qualifierParticipant),
   }),
);

export const qualifierParticipant = sqliteTable(
   "qualifier_participant",
   {
      id: text().primaryKey(),
      lobbyId: text().notNull(),
      teamId: text().notNull(),
      attended: boolean().notNull().default(false),
      createdAt: timestamp().notNull(),
   },
   (table) => [
      index("qualifier_participant_lobby_idx").on(table.lobbyId),
      index("qualifier_participant_team_idx").on(table.teamId),
      unique("qualifier_participant_lobby_team_unique").on(
         table.lobbyId,
         table.teamId,
      ),
   ],
);

export const qualifierParticipantRelations = relations(
   qualifierParticipant,
   ({ one }) => ({
      lobby: one(qualifierLobby, {
         fields: [qualifierParticipant.lobbyId],
         references: [qualifierLobby.id],
      }),
      team: one(team, {
         fields: [qualifierParticipant.teamId],
         references: [team.id],
      }),
   }),
);

export const refereeAvailability = sqliteTable(
   "referee_availability",
   {
      id: text().primaryKey(),
      refereeId: text().notNull(),
      roundId: text(),
      weekStart: timestamp(),
      timeSlots: json<TimeSlot[]>().notNull().default([]),
      timezone: text().notNull().default("UTC"),
      maxMatches: integer(),
      createdAt: timestamp().notNull(),
      updatedAt: timestamp().notNull(),
   },
   (table) => [
      index("referee_availability_referee_idx").on(table.refereeId),
      index("referee_availability_round_idx").on(table.roundId),
   ],
);

export const refereeAvailabilityRelations = relations(
   refereeAvailability,
   ({ one }) => ({
      referee: one(staff, {
         fields: [refereeAvailability.refereeId],
         references: [staff.id],
      }),
      round: one(round, {
         fields: [refereeAvailability.roundId],
         references: [round.id],
      }),
   }),
);

export const bracket = sqliteTable(
   "bracket",
   {
      id: text().primaryKey(),
      tournamentId: text().notNull(),
      name: text().notNull(),
      type: enumurate(BracketType).notNull(),
      isActive: boolean().notNull().default(true),
      grandFinalsReset: boolean().notNull().default(true),
      createdAt: timestamp().notNull(),
      updatedAt: timestamp().notNull(),
   },
   (table) => [index("bracket_tournament_idx").on(table.tournamentId)],
);

export const bracketRelations = relations(bracket, ({ one, many }) => ({
   tournament: one(tournament, {
      fields: [bracket.tournamentId],
      references: [tournament.id],
   }),
   matches: many(match),
   rounds: many(round),
}));

export const round = sqliteTable(
   "round",
   {
      id: text().primaryKey(),
      bracketId: text().notNull(),
      mappoolId: text(),
      name: text().notNull(),
      order: integer().notNull(),
      bestOf: integer().notNull().default(1),
      weekStart: timestamp(),
      createdAt: timestamp().notNull(),
      updatedAt: timestamp().notNull(),
   },
   (table) => [
      index("round_bracket_idx").on(table.bracketId),
      index("round_mappool_idx").on(table.mappoolId),
      index("round_bracket_order_idx").on(table.bracketId, table.order),
   ],
);

export const roundRelations = relations(round, ({ one, many }) => ({
   bracket: one(bracket, {
      fields: [round.bracketId],
      references: [bracket.id],
   }),
   mappool: one(mappool, {
      fields: [round.mappoolId],
      references: [mappool.id],
   }),
   matches: many(match),
   playerAvailability: many(playerAvailability),
   refereeAvailability: many(refereeAvailability),
}));

export const match = sqliteTable(
   "match",
   {
      id: text().primaryKey(),
      bracketId: text().notNull(),
      tournamentId: text().notNull(),
      roundId: text(),

      roundNumber: integer().notNull(),
      matchNumber: integer().notNull(),
      bracketSide: enumurate(BracketSide).notNull(),

      team1Id: text(),
      team2Id: text(),
      team1Name: text(),
      team2Name: text(),
      team1Score: integer().default(0),
      team2Score: integer().default(0),
      winnerId: text(),

      bestOf: integer().notNull().default(1),
      status: enumurate(MatchStatus).notNull().default(MatchStatus.PENDING),

      team1FromMatchId: text(),
      team2FromMatchId: text(),
      team1FromMatchIsWinner: boolean(),
      team2FromMatchIsWinner: boolean(),

      winnerToMatchId: text(),
      loserToMatchId: text(),

      refereeId: text(),
      streamUrl: text(),
      multiplayerLobbyId: text(),

      scheduledAt: timestamp(),
      startedAt: timestamp(),
      completedAt: timestamp(),

      createdAt: timestamp().notNull(),
      updatedAt: timestamp().notNull(),
   },
   (table) => [
      index("match_bracket_idx").on(table.bracketId),
      index("match_tournament_idx").on(table.tournamentId),
      index("match_round_idx").on(table.roundId),
      index("match_status_idx").on(table.status),
      index("match_scheduled_idx").on(table.scheduledAt),
      index("match_bracket_round_idx").on(table.bracketId, table.roundNumber),
      index("match_status_scheduled_idx").on(table.status, table.scheduledAt),
      index("match_team1_idx").on(table.team1Id),
      index("match_team2_idx").on(table.team2Id),
      index("match_referee_idx").on(table.refereeId),
   ],
);

export const matchRelations = relations(match, ({ one }) => ({
   bracket: one(bracket, {
      fields: [match.bracketId],
      references: [bracket.id],
   }),
   tournament: one(tournament, {
      fields: [match.tournamentId],
      references: [tournament.id],
   }),
   round: one(round, {
      fields: [match.roundId],
      references: [round.id],
   }),
   team1: one(team, {
      fields: [match.team1Id],
      references: [team.id],
   }),
   team2: one(team, {
      fields: [match.team2Id],
      references: [team.id],
   }),
   winner: one(team, {
      fields: [match.winnerId],
      references: [team.id],
   }),
   referee: one(staff, {
      fields: [match.refereeId],
      references: [staff.id],
   }),
}));
