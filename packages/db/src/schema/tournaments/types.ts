/**
 * @fileoverview
 * Type definitions and enums for the tournament system.
 * Contains all shared interfaces and enumerations used across the schema.
 */

// ============================================================================
// DISCORD INTEGRATION TYPES
// ============================================================================

/**
 * Discord integration configuration for tournaments.
 * Stores server ID, channel mappings, and role assignments for automated features.
 *
 * @example
 * ```ts
 * const discord: TournamentDiscord = {
 *   serverId: "123456789",
 *   channels: {
 *     matchResults: "987654321",
 *     matchPings: "111222333"
 *   },
 *   roles: {
 *     ADMIN: "444555666",
 *     REFEREE: "777888999",
 *     PLAYER: "000111222"
 *   }
 * };
 * ```
 */
export interface TournamentDiscord {
   serverId: string;
   channels: TournamentDiscordChannels;
   roles: Record<StaffRole | "SPECTATOR" | "PLAYER" | "CAPTAIN", string>;
}

/**
 * Discord channel IDs for automated notifications.
 */
export interface TournamentDiscordChannels {
   matchResults: string;
   matchPings: string;
}

/**
 * Discord integration for individual teams.
 * Links teams to dedicated channels and roles.
 */
export interface TeamDiscord {
   channelId: string;
   roleId: string;
}

/**
 * Time slot for availability tracking.
 * Uses ISO 8601 format for timezone flexibility.
 *
 * @example
 * ```ts
 * const slot: TimeSlot = {
 *   start: "2026-02-15T14:00:00Z",
 *   end: "2026-02-15T18:00:00Z"
 * };
 * ```
 */
export interface TimeSlot {
   start: string;
   end: string;
}

// ============================================================================
// BRACKET & MATCH ENUMS
// ============================================================================

/**
 * Supported tournament bracket formats.
 * Determines match generation and progression logic.
 */
export enum BracketType {
   /** Teams are eliminated after one loss */
   SINGLE_ELIMINATION = "SINGLE_ELIMINATION",
   /** Teams drop to losers bracket after first loss */
   DOUBLE_ELIMINATION = "DOUBLE_ELIMINATION",
   /** Every team plays every other team */
   ROUND_ROBIN = "ROUND_ROBIN",
   /** Teams are matched based on similar records */
   SWISS = "SWISS",
}

/**
 * Bracket side for double elimination tournaments.
 * Tracks which bracket a match belongs to.
 */
export enum BracketSide {
   /** Main bracket */
   WINNERS = "WINNERS",
   /** Elimination bracket for teams with one loss */
   LOSERS = "LOSERS",
   /** Final match between winners and losers bracket champions */
   GRAND_FINALS = "GRAND_FINALS",
}

/**
 * Match lifecycle states.
 * Drives UI state and workflow automation.
 */
export enum MatchStatus {
   /** Match is scheduled but not started */
   PENDING = "PENDING",
   /** Match is currently being played */
   IN_PROGRESS = "IN_PROGRESS",
   /** Match has finished with a result */
   COMPLETED = "COMPLETED",
   /** One or both teams did not show up */
   NO_SHOW = "NO_SHOW",
   /** Match result is being contested */
   DISPUTED = "DISPUTED",
}

/**
 * Actions during pick and ban phase.
 */
export enum PickBanAction {
   BAN = "BAN",
   PROTECT = "PROTECT",
   PICK = "PICK",
}

/**
 * Team color assignments for matches.
 * Maps to osu! multiplayer lobby team colors.
 */
export enum TeamColor {
   RED = "RED",
   BLUE = "BLUE",
}

// ============================================================================
// STAFF & PLAYER ENUMS
// ============================================================================

/**
 * Staff roles with different permissions.
 * Staff members can have multiple roles simultaneously.
 */
export enum StaffRole {
   /** Provides match commentary for streams */
   COMMENTATOR = "COMMENTATOR",
   /** Oversees matches and enforces rules */
   REFEREE = "REFEREE",
   /** Tests maps before release */
   PLAYTESTER = "PLAYTESTER",
   /** Selects and manages beatmaps */
   POOLER = "POOLER",
   /** Administrative access to tournament */
   ADMIN = "ADMIN",
   /** Tournament organizer with full access */
   HOST = "HOST",
}

/**
 * Player screening workflow states.
 * Used to verify player eligibility before tournament participation.
 */
export enum ScreeningStatus {
   /** Awaiting staff review */
   PENDING = "PENDING",
   /** Player is eligible to compete */
   APPROVED = "APPROVED",
   /** Player is not eligible to compete */
   REJECTED = "REJECTED",
}

// ============================================================================
// QUALIFIER & MAP ENUMS
// ============================================================================

/**
 * Qualifier lobby lifecycle states.
 */
export enum QualifierLobbyStatus {
   /** Lobby is scheduled but not started */
   SCHEDULED = "SCHEDULED",
   /** Lobby is currently in progress */
   IN_PROGRESS = "IN_PROGRESS",
   /** All maps have been played */
   COMPLETED = "COMPLETED",
   /** Lobby was cancelled */
   CANCELLED = "CANCELLED",
}

/**
 * osu! game modifiers for beatmaps.
 * Affects scoring multipliers and gameplay mechanics.
 */
export enum Mods {
   NM = "NM",
   HD = "HD",
   HR = "HR",
   DT = "DT",
   EZ = "EZ",
   FL = "FL",
   HT = "HT",
   RX = "RX",
   AP = "AP",
}
