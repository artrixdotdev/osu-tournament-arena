// lib/auth/index.ts (server-only file)
import { getRequestEvent } from "$app/server";
import { betterAuth } from "better-auth";
import { sveltekitCookies } from "better-auth/svelte-kit";

import { getAuthConfig } from "@ota/auth";

const plugins = [sveltekitCookies(getRequestEvent)];

export const auth = betterAuth(getAuthConfig(...plugins));

export type Auth = typeof auth;
export type Session = typeof auth.$Infer.Session;
