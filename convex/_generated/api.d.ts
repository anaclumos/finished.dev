/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as agentEvents from "../agentEvents.js";
import type * as agents from "../agents.js";
import type * as http from "../http.js";
import type * as notificationJobs from "../notificationJobs.js";
import type * as pushSubscriptions from "../pushSubscriptions.js";
import type * as users from "../users.js";
import type * as webhookInbox from "../webhookInbox.js";
import type * as webhooks from "../webhooks.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  agentEvents: typeof agentEvents;
  agents: typeof agents;
  http: typeof http;
  notificationJobs: typeof notificationJobs;
  pushSubscriptions: typeof pushSubscriptions;
  users: typeof users;
  webhookInbox: typeof webhookInbox;
  webhooks: typeof webhooks;
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
