/* eslint-disable */
/**
 * Generated Convex API types - stub file for development.
 * Run `npx convex dev` to generate real types from your schema.
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

// Import all modules that define Convex functions
import type * as agentHooks from "../agentHooks.js";
import type * as agentTasks from "../agentTasks.js";
import type * as apiKeys from "../apiKeys.js";
import type * as apiKeysInternal from "../apiKeysInternal.js";
import type * as http from "../http.js";
import type * as pushSubscriptions from "../pushSubscriptions.js";
import type * as userSettings from "../userSettings.js";
import type * as userSettingsInternal from "../userSettingsInternal.js";

declare const fullApi: ApiFromModules<{
  agentHooks: typeof agentHooks;
  agentTasks: typeof agentTasks;
  apiKeys: typeof apiKeys;
  apiKeysInternal: typeof apiKeysInternal;
  http: typeof http;
  pushSubscriptions: typeof pushSubscriptions;
  userSettings: typeof userSettings;
  userSettingsInternal: typeof userSettingsInternal;
}>;

export declare const api: FilterApi<typeof fullApi, FunctionReference<any, "public">>;
export declare const internal: FilterApi<typeof fullApi, FunctionReference<any, "internal">>;
