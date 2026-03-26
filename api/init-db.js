/**
 * MongoDB Database Initialization Script
 * Creates necessary collections and indexes for BaliBuddy
 */

import { getDatabase } from '../lib/mongodb';

export default async function handler(req, res) {
  // Only allow POST method for security
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only POST method is supported'
    });
  }

  // Simple auth check (you should add proper authentication)
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.INIT_DB_SECRET}`) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Invalid or missing authorization'
    });
  }

  try {
    const db = await getDatabase();
    
    console.log('[Init DB] Starting database initialization...');
    
    // Define collections with their schemas
    const collections = [
      { name: 'currencies', indexes: [['code', { unique: true }], ['updatedAt']] },
      { name: 'phrases', indexes: [['category'], ['language'], ['updatedAt']] },
      { name: 'prices', indexes: [['category'], ['location'], ['updatedAt']] },
      { name: 'water_stations', indexes: [['location'], ['isActive'], ['updatedAt']] },
      { name: 'atms', indexes: [['bank'], ['location'], ['updatedAt']] },
      { name: 'laundries', indexes: [['location'], ['isActive'], ['updatedAt']] },
      { name: 'safe_bars', indexes: [['location'], ['rating'], ['updatedAt']] },
      { name: 'clinics', indexes: [['specialty'], ['location'], ['isActive'], ['updatedAt']] },
      { name: 'itinerary_items', indexes: [['day'], ['order'], ['updatedAt']] },
      { name: 'squad_members', indexes: [['name'], ['updatedAt']] },
      { name: 'expenses', indexes: [['date'], ['category'], ['updatedAt']] },
      { name: 'expense_splits', indexes: [['expenseId'], ['memberId'], ['updatedAt']] },
      { name: 'packing_items', indexes: [['category'], ['isPacked'], ['updatedAt']] },
      { name: 'emergency_contacts', indexes: [['category'], ['isPrimary'], ['updatedAt']] },
      { name: 'safety_checkins', indexes: [['timestamp'], ['userId']] },
      { name: 'scooter_inspections', indexes: [['timestamp'], ['userId'], ['location']] },
      { name: 'settings', indexes: [['key', { unique: true }]] },
      { name: 'users', indexes: [['email', { unique: true }], ['deviceId']] },
      { name: 'devices', indexes: [['deviceId', { unique: true }], ['userId']] },
    ];
    
    const results = {
      created: [],
      existing: [],
      errors: []
    };
    
    // Create collections and indexes
    for (const { name, indexes } of collections) {
      try {
        // Check if collection exists
        const existingCollections = await db.listCollections({ name }).toArray();
        
        if (existingCollections.length === 0) {
          // Create collection
          await db.createCollection(name);
          results.created.push(name);
          console.log(`[Init DB] Created collection: ${name}`);
        } else {
          results.existing.push(name);
          console.log(`[Init DB] Collection already exists: ${name}`);
        }
        
        // Create indexes
        const col = db.collection(name);
        for (const index of indexes) {
          const [field, options = {}] = index;
          try {
            await col.createIndex({ [field]: 1 }, options);
          } catch (indexError) {
            // Index might already exist, that's okay
            if (!indexError.message.includes('already exists')) {
              console.warn(`[Init DB] Warning creating index on ${name}.${field}:`, indexError.message);
            }
          }
        }
      } catch (error) {
        results.errors.push({ collection: name, error: error.message });
        console.error(`[Init DB] Error with collection ${name}:`, error);
      }
    }
    
    // Create sync metadata collection
    try {
      await db.createCollection('_sync_metadata');
      await db.collection('_sync_metadata').createIndex({ collection: 1 });
      await db.collection('_sync_metadata').createIndex({ lastSyncAt: 1 });
      results.created.push('_sync_metadata');
    } catch (error) {
      // Collection might already exist
    }
    
    console.log('[Init DB] Database initialization complete');
    
    return res.status(200).json({
      success: true,
      message: 'Database initialized successfully',
      timestamp: Date.now(),
      database: db.databaseName,
      results: {
        created: results.created.length,
        existing: results.existing.length,
        errors: results.errors.length,
        details: results
      }
    });
  } catch (error) {
    console.error('[Init DB] Database initialization error:', error);
    return res.status(500).json({
      error: 'Database initialization failed',
      message: error.message
    });
  }
}