import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Rooms table: stores game room information
 */
export const rooms = mysqlTable("rooms", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 10 }).notNull().unique(), // Unique room code
  ownerId: int("ownerId").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: mysqlEnum("status", ["waiting", "playing", "finished"]).default("waiting").notNull(),
  currentQuestionIndex: int("currentQuestionIndex").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Room = typeof rooms.$inferSelect;
export type InsertRoom = typeof rooms.$inferInsert;

/**
 * Room members table: tracks which players are in which rooms
 */
export const roomMembers = mysqlTable("roomMembers", {
  id: int("id").autoincrement().primaryKey(),
  roomId: int("roomId").notNull().references(() => rooms.id, { onDelete: "cascade" }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
});

export type RoomMember = typeof roomMembers.$inferSelect;
export type InsertRoomMember = typeof roomMembers.$inferInsert;

/**
 * Questions table: stores all questions (both shared and personal)
 */
export const questions = mysqlTable("questions", {
  id: int("id").autoincrement().primaryKey(),
  createdBy: int("createdBy").notNull().references(() => users.id, { onDelete: "cascade" }),
  roomId: int("roomId").references(() => rooms.id, { onDelete: "cascade" }), // null for solo mode
  questionText: text("questionText").notNull(),
  correctAnswer: varchar("correctAnswer", { length: 255 }).notNull(),
  wrongAnswer1: varchar("wrongAnswer1", { length: 255 }).notNull(),
  wrongAnswer2: varchar("wrongAnswer2", { length: 255 }).notNull(),
  wrongAnswer3: varchar("wrongAnswer3", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Question = typeof questions.$inferSelect;
export type InsertQuestion = typeof questions.$inferInsert;

/**
 * Game sessions table: tracks individual game instances
 */
export const gameSessions = mysqlTable("gameSessions", {
  id: int("id").autoincrement().primaryKey(),
  roomId: int("roomId").references(() => rooms.id, { onDelete: "cascade" }),
  userId: int("userId").references(() => users.id, { onDelete: "cascade" }), // For solo mode
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  endedAt: timestamp("endedAt"),
  finalScore: int("finalScore").default(0).notNull(),
});

export type GameSession = typeof gameSessions.$inferSelect;
export type InsertGameSession = typeof gameSessions.$inferInsert;

/**
 * Player answers table: tracks individual answers during gameplay
 */
export const playerAnswers = mysqlTable("playerAnswers", {
  id: int("id").autoincrement().primaryKey(),
  gameSessionId: int("gameSessionId").notNull().references(() => gameSessions.id, { onDelete: "cascade" }),
  questionId: int("questionId").notNull().references(() => questions.id, { onDelete: "cascade" }),
  selectedAnswer: varchar("selectedAnswer", { length: 255 }).notNull(),
  isCorrect: int("isCorrect").default(0).notNull(), // 0 or 1 for boolean
  pointsEarned: int("pointsEarned").default(0).notNull(),
  timeToAnswer: int("timeToAnswer").default(0).notNull(), // milliseconds
  answeredAt: timestamp("answeredAt").defaultNow().notNull(),
});

export type PlayerAnswer = typeof playerAnswers.$inferSelect;
export type InsertPlayerAnswer = typeof playerAnswers.$inferInsert;