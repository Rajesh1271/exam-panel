const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

let mongod = null;

const connectdb = async () => {
  const primaryUri = process.env.MONGO_URI;

  // 1. Try Primary URI (Atlas or custom)
  if (primaryUri) {
    try {
      console.log('🔄 Connecting to primary MongoDB...');
      await mongoose.connect(primaryUri, {
        serverSelectionTimeoutMS: 5000
      });
      console.log('✅ Connected to Primary MongoDB (Atlas)!');
      return;
    } catch (err) {
      console.warn('⚠️ Primary MongoDB connection failed:', err.message);
    }
  }

  // 2. Try Local MongoDB instance
  try {
    console.log('🔄 Checking local MongoDB instance (127.0.0.1:27017)...');
    await mongoose.connect('mongodb://127.0.0.1:27017/exampanel', {
      serverSelectionTimeoutMS: 2000
    });
    console.log('✅ Connected to Local MongoDB!');
    return;
  } catch (localErr) {
    console.log('ℹ️ Local MongoDB instance not active. Launching Embedded MongoDB Server with Permanent Disk Storage...');
  }

  // 3. Launch Embedded MongoDB Server with Permanent Disk Storage (wiredTiger)
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const dbDir = path.resolve(__dirname, '../data/db');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    mongod = await MongoMemoryServer.create({
      instance: {
        dbName: 'exampanel',
        dbPath: dbDir,
        storageEngine: 'wiredTiger'
      }
    });
    const memoryUri = mongod.getUri();
    await mongoose.connect(memoryUri);
    console.log('✅ Embedded MongoDB Server Started & Connected with Permanent Disk Storage at:', dbDir);
    console.log(`📡 MongoDB URI: ${memoryUri}`);
  } catch (memErr) {
    console.error('❌ Could not start MongoDB connection:', memErr.message);
  }
};

module.exports = connectdb;

