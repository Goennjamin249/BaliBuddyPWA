/**
 * Sync API Endpoint with MongoDB Integration
 * Handles offline-first data synchronization
 */

import { getDatabase } from '../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const { method } = req;

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    switch (method) {
      case 'POST':
        return await handleSyncRequest(req, res);
      case 'GET':
        return await healthCheck(req, res);
      default:
        res.setHeader('Allow', ['POST', 'GET']);
        return res.status(405).json({ 
          error: 'Method not allowed',
          message: `Method ${method} is not supported`
        });
    }
  } catch (error) {
    console.error('Sync API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

async function handleSyncRequest(req, res) {
  const { action, lastPulledAt, changes, batchSize, collection } = req.body;

  try {
    switch (action) {
      case 'pull':
        return await handlePullChanges(req, res, collection, lastPulledAt, batchSize);
      case 'push':
        return await handlePushChanges(req, res, collection, changes);
      default:
        // Auto-detect based on request body
        if (lastPulledAt !== undefined) {
          return await handlePullChanges(req, res, collection, lastPulledAt, batchSize);
        } else if (changes) {
          return await handlePushChanges(req, res, collection, changes);
        } else {
          return res.status(400).json({ 
            error: 'Invalid request',
            message: 'Either action, lastPulledAt, or changes must be provided'
          });
        }
    }
  } catch (error) {
    console.error('Sync request handling error:', error);
    return res.status(500).json({ 
      error: 'Sync failed',
      message: error.message 
    });
  }
}

// Pull changes from MongoDB
async function handlePullChanges(req, res, collection, lastPulledAt, batchSize = 100) {
  try {
    const db = await getDatabase();
    const collectionName = collection || 'default';
    const col = db.collection(collectionName);
    
    console.log('[Sync API] Pull changes requested:', { collection: collectionName, lastPulledAt, batchSize });
    
    // Build query for changes since lastPulledAt
    const query = lastPulledAt 
      ? { updatedAt: { $gt: new Date(lastPulledAt) } }
      : {};
    
    // Fetch documents with limit
    const documents = await col
      .find(query)
      .sort({ updatedAt: 1 })
      .limit(batchSize)
      .toArray();
    
    // Transform MongoDB documents for client sync
    const transformedDocs = documents.map(doc => ({
      ...doc,
      id: doc._id.toString(),
      _id: undefined,
      createdAt: doc.createdAt?.toISOString(),
      updatedAt: doc.updatedAt?.toISOString(),
    }));
    
    const response = {
      changes: {
        [collectionName]: {
          created: transformedDocs.filter(d => d._syncStatus === 'created'),
          updated: transformedDocs.filter(d => d._syncStatus === 'updated'),
          deleted: [],
        }
      },
      timestamp: Date.now(),
      hasMore: documents.length === batchSize,
    };
    
    return res.status(200).json(response);
  } catch (error) {
    console.error('[Sync API] Pull changes error:', error);
    return res.status(500).json({ 
      error: 'Pull changes failed',
      message: error.message 
    });
  }
}

// Push changes to MongoDB
async function handlePushChanges(req, res, collection, changes) {
  try {
    const db = await getDatabase();
    const collectionName = collection || 'default';
    const col = db.collection(collectionName);
    
    console.log('[Sync API] Push changes received:', { collection: collectionName, changes: Object.keys(changes) });
    
    const operations = [];
    const results = { created: 0, updated: 0, deleted: 0 };
    
    // Process created documents
    if (changes.created && Array.isArray(changes.created)) {
      for (const doc of changes.created) {
        const { id, ...docData } = doc;
        operations.push({
          updateOne: {
            filter: { _id: new ObjectId(id) },
            update: { 
              $set: { 
                ...docData,
                _id: new ObjectId(id),
                createdAt: new Date(docData.createdAt || Date.now()),
                updatedAt: new Date(),
                _syncStatus: 'synced'
              } 
            },
            upsert: true
          }
        });
        results.created++;
      }
    }
    
    // Process updated documents
    if (changes.updated && Array.isArray(changes.updated)) {
      for (const doc of changes.updated) {
        const { id, ...docData } = doc;
        operations.push({
          updateOne: {
            filter: { _id: new ObjectId(id) },
            update: { 
              $set: { 
                ...docData,
                updatedAt: new Date(),
                _syncStatus: 'synced'
              } 
            }
          }
        });
        results.updated++;
      }
    }
    
    // Process deleted documents
    if (changes.deleted && Array.isArray(changes.deleted)) {
      for (const doc of changes.deleted) {
        operations.push({
          deleteOne: {
            filter: { _id: new ObjectId(doc.id) }
          }
        });
        results.deleted++;
      }
    }
    
    // Execute bulk write if there are operations
    if (operations.length > 0) {
      await col.bulkWrite(operations, { ordered: false });
    }
    
    return res.status(200).json({ 
      success: true,
      message: 'Changes synced successfully',
      timestamp: Date.now(),
      results
    });
  } catch (error) {
    console.error('[Sync API] Push changes error:', error);
    return res.status(500).json({ 
      error: 'Push changes failed',
      message: error.message 
    });
  }
}

// Health check endpoint
export async function healthCheck(req, res) {
  try {
    const db = await getDatabase();
    
    // Test MongoDB connection
    await db.command({ ping: 1 });
    
    // Get collection stats
    const collections = await db.listCollections().toArray();
    
    return res.status(200).json({ 
      status: 'healthy',
      service: 'sync-api',
      timestamp: Date.now(),
      mongodb: {
        status: 'connected',
        database: db.databaseName,
        collections: collections.map(c => c.name)
      }
    });
  } catch (error) {
    return res.status(500).json({ 
      status: 'unhealthy',
      error: error.message,
      mongodb: {
        status: 'disconnected'
      }
    });
  }
}