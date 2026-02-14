/**
 * Possible steps in the signup flow.
 *
 * The steps are executed in order:
 * 1. osu - Connect osu! account (required)
 * 2. discord - Link Discord account (optional)
 * 3. timezone - Set timezone preference
 */
export type SignupStep = "osu" | "discord" | "timezone";

/**
 * Status data returned from the server about the user's signup progress.
 */
export interface SignupStatus {
   /** Whether the user has linked their Discord account */
   hasDiscord: boolean;
   /** User's timezone as UTC offset (-12 to +14) */
   timezone: number;
   /** Whether the entire signup flow has been completed */
   signupCompleted: boolean;
}

/**
 * Represents a timezone option in the timezone selector.
 */
export interface TimezoneOption {
   /** UTC offset value */
   value: number;
   /** Human-readable label with examples */
   label: string;
}

/**
 * Step configuration for the Stepper component.
 * Defines the three-step signup flow.
 */
export const SIGNUP_STEPS: {
   id: SignupStep;
   label: string;
   optional?: boolean;
}[] = [
   { id: "osu", label: "Connect osu!" },
   { id: "discord", label: "Link Discord", optional: true },
   { id: "timezone", label: "Set Timezone" },
];

/**
 * Available timezone options for the signup flow.
 * Covers UTC-12 through UTC+14 with representative locations.
 */
export const TIMEZONE_OPTIONS: TimezoneOption[] = [
   { value: -12, label: "UTC-12 (Baker Island)" },
   { value: -11, label: "UTC-11 (American Samoa)" },
   { value: -10, label: "UTC-10 (Hawaii)" },
   { value: -9, label: "UTC-9 (Alaska)" },
   { value: -8, label: "UTC-8 (Pacific Time)" },
   { value: -7, label: "UTC-7 (Mountain Time)" },
   { value: -6, label: "UTC-6 (Central Time)" },
   { value: -5, label: "UTC-5 (Eastern Time)" },
   { value: -4, label: "UTC-4 (Atlantic Time)" },
   { value: -3, label: "UTC-3 (Brazil, Argentina)" },
   { value: -2, label: "UTC-2 (Mid-Atlantic)" },
   { value: -1, label: "UTC-1 (Azores)" },
   { value: 0, label: "UTC+0 (London, Dublin)" },
   { value: 1, label: "UTC+1 (Berlin, Paris)" },
   { value: 2, label: "UTC+2 (Cairo, Athens)" },
   { value: 3, label: "UTC+3 (Moscow, Istanbul)" },
   { value: 4, label: "UTC+4 (Dubai)" },
   { value: 5, label: "UTC+5 (Pakistan)" },
   { value: 6, label: "UTC+6 (Bangladesh)" },
   { value: 7, label: "UTC+7 (Bangkok, Jakarta)" },
   { value: 8, label: "UTC+8 (Singapore, Hong Kong)" },
   { value: 9, label: "UTC+9 (Japan, Korea)" },
   { value: 10, label: "UTC+10 (Sydney, Melbourne)" },
   { value: 11, label: "UTC+11 (Solomon Islands)" },
   { value: 12, label: "UTC+12 (Auckland, Fiji)" },
   { value: 13, label: "UTC+13 (Phoenix Islands)" },
   { value: 14, label: "UTC+14 (Line Islands)" },
];
