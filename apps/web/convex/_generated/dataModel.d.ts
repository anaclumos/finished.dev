/* eslint-disable */
/**
 * Generated Convex Data Model types - stub file for development.
 * Run `npx convex dev` to generate real types from your schema.
 */

import type { DataModelFromSchemaDefinition, DocumentByName, TableNamesInDataModel } from "convex/server";
import type schema from "../schema.js";

export type DataModel = DataModelFromSchemaDefinition<typeof schema>;
export type Doc<TableName extends TableNamesInDataModel<DataModel>> = DocumentByName<DataModel, TableName>;
export type Id<TableName extends TableNamesInDataModel<DataModel>> = DocumentByName<DataModel, TableName>["_id"];
