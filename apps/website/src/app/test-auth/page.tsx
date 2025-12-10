"use client";

import { useEffect, useState } from "react";

import { Button } from "@ota/ui/button";

import { authClient } from "~/auth/client";

export default function TestAuthPage() {
   const [session, setSession] = useState<any>(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [accounts, setAccounts] = useState<any[]>([]);

   useEffect(() => {
      loadSession();
   }, []);

   async function loadSession() {
      try {
         setLoading(true);
         const data = await authClient.getSession();
         const sessionData = data.data?.session ?? null;
         setSession(sessionData);

         // Fetch accounts separately if user is logged in
         if (sessionData?.userId) {
            try {
               const accountsData = await authClient.listAccounts();
               setAccounts(accountsData.data ?? []);
            } catch (err) {
               console.error("Error loading accounts:", err);
               setAccounts([]);
            }
         } else {
            setAccounts([]);
         }

         setError(null);
      } catch (err) {
         console.error("Error loading session:", err);
         setError(
            err instanceof Error ? err.message : "Failed to load session",
         );
      } finally {
         setLoading(false);
      }
   }

   async function signInWithOsu() {
      try {
         setError(null);
         await authClient.signIn.oauth2({
            providerId: "osu",
            callbackURL: "/test-auth",
            errorCallbackURL: "/test-auth?error=osu",
         });
      } catch (err) {
         console.error("Error signing in with osu!:", err);
         setError(
            err instanceof Error ? err.message : "Failed to sign in with osu!",
         );
      }
   }

   async function signInWithDiscord() {
      try {
         setError(null);
         await authClient.signIn.social({
            provider: "discord",
            callbackURL: "/test-auth",
            errorCallbackURL: "/test-auth?error=discord",
         });
      } catch (err) {
         console.error("Error signing in with Discord:", err);
         setError(
            err instanceof Error
               ? err.message
               : "Failed to sign in with Discord",
         );
      }
   }

   async function linkDiscord() {
      try {
         setError(null);
         // For linking, we use the same signIn method but it should work if user is already logged in
         await authClient.signIn.social({
            provider: "discord",
            callbackURL: "/test-auth",
            errorCallbackURL: "/test-auth?error=discord",
         });
      } catch (err) {
         console.error("Error linking Discord:", err);
         setError(
            err instanceof Error ? err.message : "Failed to link Discord",
         );
      }
   }

   async function signOut() {
      try {
         setError(null);
         await authClient.signOut({
            fetchOptions: {
               onSuccess: () => {
                  loadSession();
               },
            },
         });
      } catch (err) {
         console.error("Error signing out:", err);
         setError(err instanceof Error ? err.message : "Failed to sign out");
      }
   }

   // Check for error in URL params
   useEffect(() => {
      const params = new URLSearchParams(window.location.search);
      const errorParam = params.get("error");
      if (errorParam) {
         if (errorParam === "discord") {
            setError(
               "Account creation with Discord is not allowed. Please sign up with osu! first, then you can link your Discord account.",
            );
         } else {
            setError(`Authentication error: ${errorParam}`);
         }
         // Clean up URL
         window.history.replaceState({}, "", "/test-auth");
      }
   }, []);

   const hasOsuAccount = accounts.some((acc) => acc.providerId === "osu");
   const hasDiscordAccount = accounts.some(
      (acc) => acc.providerId === "discord",
   );

   if (loading) {
      return (
         <main className="container mx-auto p-8">
            <div className="flex min-h-screen items-center justify-center">
               <p>Loading...</p>
            </div>
         </main>
      );
   }

   return (
      <main className="container mx-auto max-w-4xl p-8">
         <div className="space-y-6">
            <div>
               <h1 className="mb-2 text-4xl font-bold">OAuth Test Page</h1>
               <p className="text-muted-foreground">
                  Test osu! and Discord OAuth authentication and account linking
               </p>
            </div>

            {error && (
               <div className="bg-destructive/10 border-destructive/20 rounded-md border p-4">
                  <p className="text-destructive font-medium">Error:</p>
                  <p className="text-destructive/80 text-sm">{error}</p>
               </div>
            )}

            <div className="bg-card space-y-4 rounded-lg border p-6">
               <h2 className="text-2xl font-semibold">Session Status</h2>
               {session ? (
                  <div className="space-y-2">
                     <p>
                        <span className="font-medium">User ID:</span>{" "}
                        {session.userId}
                     </p>
                     <p>
                        <span className="font-medium">Session ID:</span>{" "}
                        {session.id}
                     </p>
                  </div>
               ) : (
                  <p className="text-muted-foreground">Not logged in</p>
               )}
            </div>

            <div className="bg-card space-y-4 rounded-lg border p-6">
               <h2 className="text-2xl font-semibold">Linked Accounts</h2>
               {accounts.length > 0 ? (
                  <div className="space-y-2">
                     {accounts.map((acc) => (
                        <div key={acc.id} className="flex items-center gap-2">
                           <span className="font-medium capitalize">
                              {acc.providerId}:
                           </span>
                           <span className="text-muted-foreground">
                              {acc.accountId}
                           </span>
                        </div>
                     ))}
                  </div>
               ) : (
                  <p className="text-muted-foreground">No linked accounts</p>
               )}
            </div>

            <div className="bg-card space-y-4 rounded-lg border p-6">
               <h2 className="text-2xl font-semibold">
                  Authentication Actions
               </h2>
               <div className="flex flex-wrap gap-4">
                  {!session ? (
                     <>
                        <Button onClick={signInWithOsu} size="lg">
                           Sign In with osu!
                        </Button>
                        <Button
                           onClick={signInWithDiscord}
                           variant="outline"
                           size="lg"
                        >
                           Sign In with Discord
                        </Button>
                        <p className="text-muted-foreground mt-2 w-full text-sm">
                           Note: Discord sign-in will fail if you don't have an
                           account. Try signing up with osu! first.
                        </p>
                     </>
                  ) : (
                     <>
                        {!hasOsuAccount && (
                           <Button onClick={signInWithOsu} size="lg">
                              Link osu! Account
                           </Button>
                        )}
                        {hasOsuAccount && !hasDiscordAccount && (
                           <Button
                              onClick={linkDiscord}
                              variant="outline"
                              size="lg"
                           >
                              Link Discord Account
                           </Button>
                        )}
                        {hasOsuAccount && hasDiscordAccount && (
                           <p className="text-muted-foreground text-sm">
                              Both accounts are linked. You can sign in with
                              either provider.
                           </p>
                        )}
                        <Button
                           onClick={signOut}
                           variant="destructive"
                           size="lg"
                        >
                           Sign Out
                        </Button>
                     </>
                  )}
               </div>
            </div>

            <div className="bg-card space-y-4 rounded-lg border p-6">
               <h2 className="text-2xl font-semibold">Test Scenarios</h2>
               <div className="space-y-2 text-sm">
                  <div>
                     <p className="font-medium">1. Create Account with osu!:</p>
                     <p className="text-muted-foreground">
                        Click "Sign In with osu!" when not logged in. This
                        should create a new account.
                     </p>
                  </div>
                  <div>
                     <p className="font-medium">
                        2. Try Creating Account with Discord:
                     </p>
                     <p className="text-muted-foreground">
                        Click "Sign In with Discord" when not logged in. This
                        should fail with an error message.
                     </p>
                  </div>
                  <div>
                     <p className="font-medium">
                        3. Link Discord After osu! Signup:
                     </p>
                     <p className="text-muted-foreground">
                        After signing up with osu!, click "Link Discord
                        Account". This should successfully link your Discord
                        account.
                     </p>
                  </div>
                  <div>
                     <p className="font-medium">
                        4. Login with Discord (After Linking):
                     </p>
                     <p className="text-muted-foreground">
                        After linking Discord, sign out and try signing in with
                        Discord. This should work since the account already
                        exists.
                     </p>
                  </div>
               </div>
            </div>
         </div>
      </main>
   );
}
