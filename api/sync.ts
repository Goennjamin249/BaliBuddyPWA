/**
 * Sync API Handler for BaliBuddy PWA
 * Handles bidirectional sync between WatermelonDB (client) and MongoDB (server)
 */

import { Db, MongoClient } from "mongodb";

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

// Get MongoDB client
async function getDb(): Promise<Db> {
  if (cachedClient && cachedDb) {
    return cachedDb;
  }

  const uri = process.env.MONGODB_URI || "";
  const dbName = process.env.MONGODB_DATABASE || "balibuddy";

  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not set");
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  cachedClient = client;
  cachedDb = db;

  return db;
}

// Sync request/response types
interface SyncPullRequest {
  collection: string;
  lastPulledTimestamp?: number;
}

interface SyncPullResponse {
  changes: any[];
  timestamp: number;
}

interface SyncPushRequest {
  collection: string;
  changes: {
    type: "created" | "updated" | "deleted";
    id: string;
    data?: any;
  }[];
}

interface SyncPushResponse {
  success: boolean;
  synced: string[];
  errors?: string[];
}

/**
 * Handle PULL sync - Get changes from server
 */
async function handlePull(request: SyncPullRequest): Promise<SyncPullResponse> {
  const db = await getDb();
  const collection = db.collection(request.collection);

  const query = request.lastPulledTimestamp
    ? { updated_at: { $gt: request.lastPulledTimestamp } }
    : {};

  const changes = await collection.find(query).limit(1000).toArray();

  return {
    changes,
    timestamp: Date.now(),
  };
}

/**
 * Handle PUSH sync - Send changes to server
 */
async function handlePush(request: SyncPushRequest): Promise<SyncPushResponse> {
  const db = await getDb();
  const collection = db.collection(request.collection);
  const synced: string[] = [];
  const errors: string[] = [];

  for (const change of request.changes) {
    try {
      switch (change.type) {
        case "created":
          await collection.insertOne({
            _id: change.id,
            ...change.data,
            created_at: Date.now(),
            updated_at: Date.now(),
          });
          synced.push(change.id);
          break;

        case "updated":
          await collection.updateOne(
            { _id: change.id as any },
            {
              $set: {
                ...change.data,
                updated_at: Date.now(),
              },
            },
          );
          synced.push(change.id);
          break;

        case "deleted":
          await collection.deleteOne({ _id: change.id as any });
          synced.push(change.id);
          break;

        default:
          errors.push(`Unknown change type: ${change.type}`);
      }
    } catch (error) {
      errors.push(`Failed to sync ${change.id}: ${error}`);
    }
  }

  return {
    success: errors.length === 0,
    synced,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Initialize database with collections
 */
async function initializeDatabase(): Promise<{
  success: boolean;
  message: string;
}> {
  const db = await getDb();

  const collections = [
    "currencies",
    "phrases",
    "prices",
    "water_stations",
    "atms",
    "laundries",
    "safe_bars",
    "clinics",
    "itinerary_items",
    "squad_members",
    "groups",
    "expenses",
    "expense_splits",
    "packing_items",
    "emergency_contacts",
    "safety_checkins",
    "scooter_inspections",
    "settings",
  ];

  const existingCollections = await db.listCollections().toArray();
  const existingNames = existingCollections.map((c) => c.name);

  for (const collectionName of collections) {
    if (!existingNames.includes(collectionName)) {
      await db.createCollection(collectionName);

    }
  }

  return {
    success: true,
    message: `Database initialized with ${collections.length} collections`,
  };
}

/**
 * Main sync handler
 */
export default async function syncHandler(req: any, res: any): Promise<void> {
  const method = req.method || "GET";

  // Health check
  if (method === "GET") {
    res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      message: "BaliBuddy Sync API is running",
    });
    return;
  }

  // Handle POST requests
  if (method === "POST") {
    const { action, ...data } = req.body || {};

    try {
      switch (action) {
        case "pull":
          const pullResult = await handlePull(data as SyncPullRequest);
          res.status(200).json(pullResult);
          break;

        case "push":
          const pushResult = await handlePush(data as SyncPushRequest);
          res.status(200).json(pushResult);
          break;

        case "init":
          const initResult = await initializeDatabase();
          res.status(200).json(initResult);
          break;

        default:
          res.status(400).json({
            error: "Invalid action",
            validActions: ["pull", "push", "init"],
          });
      }
    } catch (error) {
      console.error("Sync error:", error);
      res.status(500).json({
        error: "Sync failed",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
    return;
  }

  // Method not allowed
  res.status(405).json({ error: "Method not allowed" });
}
