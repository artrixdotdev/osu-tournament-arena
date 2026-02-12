import { getRequestEvent } from "$app/server";
import { sveltekitCookies } from "better-auth/svelte-kit";

import { auth as baseAuth } from "@ota/auth";

// Some dumb hacks to allow us to have an independant auth instance
baseAuth.options.baseURL = "http://localhost:5173";
baseAuth.options.plugins.push(sveltekitCookies(getRequestEvent));

export const auth = baseAuth;

export type Auth = typeof auth;
export type Session = typeof auth.$Infer.Session;
