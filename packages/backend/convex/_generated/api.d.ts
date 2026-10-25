/* eslint-disable */
  /**
   * Generated `api` utility.
   *
   * THIS CODE IS AUTOMATICALLY GENERATED.
   *
   * To regenerate, run `npx convex dev`.
   * @module
   */
  
  import type { ApiFromModules, FilterApi, FunctionReference } from "convex/server";
  import type * as auth from "../auth.js";
import type * as favorites from "../favorites.js";
import type * as files from "../files.js";
import type * as healthCheck from "../healthCheck.js";
import type * as http from "../http.js";
import type * as lib_cards from "../lib/cards.js";
import type * as lib_constants from "../lib/constants.js";
import type * as lib_session from "../lib/session.js";
import type * as listings from "../listings.js";
import type * as messages from "../messages.js";
import type * as seed from "../seed.js";

  /**
   * A utility for referencing Convex functions in your app's API.
   *
   * Usage:
   * ```js
   * const myFunctionReference = api.myModule.myFunction;
   * ```
   */
  declare const fullApi: ApiFromModules<{
    "auth": typeof auth,
"favorites": typeof favorites,
"files": typeof files,
"healthCheck": typeof healthCheck,
"http": typeof http,
"lib/cards": typeof lib_cards,
"lib/constants": typeof lib_constants,
"lib/session": typeof lib_session,
"listings": typeof listings,
"messages": typeof messages,
"seed": typeof seed,
  }>;
  export declare const api: FilterApi<typeof fullApi, FunctionReference<any, "public">>;
  export declare const internal: FilterApi<typeof fullApi, FunctionReference<any, "internal">>;
  
export declare const components: {
  betterAuth: import("@convex-dev/better-auth/_generated/component.js").ComponentApi<"betterAuth">;
};
