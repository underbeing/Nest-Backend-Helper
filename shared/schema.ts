import { pgTable, text, timestamp, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Issues Table
export const issues = pgTable("issues", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("OPEN"), // OPEN, IN_PROGRESS, DONE
  priority: text("priority").notNull().default("MEDIUM"), // LOW, MEDIUM, HIGH
  assigneeId: text("assignee_id"), // Nullable, userId
  organizationId: text("organization_id").notNull(), // Tenant ID
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Activity Log Table
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  issueId: integer("issue_id").references(() => issues.id).notNull(),
  action: text("action").notNull(), // CREATE, UPDATE_STATUS, UPDATE_ASSIGNEE, DELETE
  oldValue: text("old_value"),
  newValue: text("new_value"),
  actorId: text("actor_id").notNull(),
  organizationId: text("organization_id").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Schemas
export const insertIssueSchema = createInsertSchema(issues).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({ 
  id: true, 
  timestamp: true 
});

// Types
export type Issue = typeof issues.$inferSelect;
export type InsertIssue = z.infer<typeof insertIssueSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;
