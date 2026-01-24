/* eslint-disable */
/**
 * Generated API stub.
 * Run `bunx convex dev` to generate the actual types.
 */
import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

import type * as agentEvents from "../agentEvents";
import type * as agents from "../agents";
import type * as notificationJobs from "../notificationJobs";
import type * as pushSubscriptions from "../pushSubscriptions";
import type * as users from "../users";
import type * as webhookInbox from "../webhookInbox";
import type * as webhooks from "../webhooks";

declare const fullApi: ApiFromModules<{
  agentEvents: typeof agentEvents;
  agents: typeof agents;
  notificationJobs: typeof notificationJobs;
  pushSubscriptions: typeof pushSubscriptions;
  users: typeof users;
  webhookInbox: typeof webhookInbox;
  webhooks: typeof webhooks;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
