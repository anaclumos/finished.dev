/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as agentHooks from "../agentHooks.js";
import type * as agentTasks from "../agentTasks.js";
import type * as apiKeys from "../apiKeys.js";
import type * as apiKeysInternal from "../apiKeysInternal.js";
import type * as http from "../http.js";
import type * as pushSubscriptions from "../pushSubscriptions.js";
import type * as userSettings from "../userSettings.js";
import type * as userSettingsInternal from "../userSettingsInternal.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

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

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
