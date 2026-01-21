import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// TODO: add feature queries here as your schema grows.

import { rooms, roomMembers, questions, gameSessions, playerAnswers } from "../drizzle/schema";

/**
 * Room Management Helpers
 */
export async function createRoom(ownerId: number, code: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(rooms).values({
    code,
    ownerId,
    status: "waiting",
  });
  
  return result;
}

export async function getRoomByCode(code: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(rooms).where(eq(rooms.code, code)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getRoomById(roomId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(rooms).where(eq(rooms.id, roomId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function addPlayerToRoom(roomId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(roomMembers).values({
    roomId,
    userId,
  });
}

export async function getRoomMembers(roomId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db
    .select({
      id: roomMembers.id,
      userId: roomMembers.userId,
      name: users.name,
      joinedAt: roomMembers.joinedAt,
    })
    .from(roomMembers)
    .innerJoin(users, eq(roomMembers.userId, users.id))
    .where(eq(roomMembers.roomId, roomId));
}

/**
 * Question Management Helpers
 */
export async function addQuestion(
  createdBy: number,
  questionText: string,
  correctAnswer: string,
  wrongAnswer1: string,
  wrongAnswer2: string,
  wrongAnswer3: string,
  roomId?: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(questions).values({
    createdBy,
    roomId,
    questionText,
    correctAnswer,
    wrongAnswer1,
    wrongAnswer2,
    wrongAnswer3,
  });
}

export async function getRoomQuestions(roomId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(questions).where(eq(questions.roomId, roomId));
}

export async function getUserQuestions(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(questions).where(eq(questions.createdBy, userId));
}

/**
 * Game Session Helpers
 */
export async function createGameSession(roomId?: number, userId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(gameSessions).values({
    roomId,
    userId,
  });
}

export async function recordPlayerAnswer(
  gameSessionId: number,
  questionId: number,
  selectedAnswer: string,
  isCorrect: boolean,
  pointsEarned: number,
  timeToAnswer: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(playerAnswers).values({
    gameSessionId,
    questionId,
    selectedAnswer,
    isCorrect: isCorrect ? 1 : 0,
    pointsEarned,
    timeToAnswer,
  });
}

export async function getGameLeaderboard(roomId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db
    .select({
      userId: gameSessions.userId,
      userName: users.name,
      finalScore: gameSessions.finalScore,
    })
    .from(gameSessions)
    .innerJoin(users, eq(gameSessions.userId, users.id))
    .where(eq(gameSessions.roomId, roomId));
}
