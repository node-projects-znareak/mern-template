const mongoose = require('mongoose');
const MONGO_DB_URI = process.env.MONGO_DB_URI || 'mongodb://localhost:27017/MERN_TEST';

async function migrateDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_DB_URI);
    console.log('Connected to MongoDB successfully');

    const db = mongoose.connection.db;
    const collection = db.collection('users');

    console.log('\n=== Current Indexes ===');
    const indexes = await collection.indexes();
    indexes.forEach(index => {
      console.log(`Index: ${index.name}`, index.key);
    });

    try {
      console.log('\n=== Dropping old name_1 index ===');
      await collection.dropIndex('name_1');
      console.log('Successfully dropped name_1 index');
    } catch (error) {
      if (error.code === 27) {
        console.log('name_1 index does not exist, skipping...');
      } else {
        console.log('Error dropping name_1 index:', error.message);
      }
    }

    const documentCount = await collection.countDocuments();
    console.log(`\n=== Found ${documentCount} existing documents ===`);

    if (documentCount > 0) {
      const docsWithName = await collection.countDocuments({ name: { $exists: true } });
      const docsWithUsername = await collection.countDocuments({ username: { $exists: true } });
      
      console.log(`Documents with 'name' field: ${docsWithName}`);
      console.log(`Documents with 'username' field: ${docsWithUsername}`);

      if (docsWithName > 0 && docsWithUsername === 0) {
        console.log('\n=== Migrating name to username ===');
        const result = await collection.updateMany(
          { name: { $exists: true } },
          { $rename: { name: 'username' } }
        );
        console.log(`Migrated ${result.modifiedCount} documents`);
      } else if (docsWithName > 0 && docsWithUsername > 0) {
        console.log('\n=== Both name and username fields exist ===');
        console.log('Manual intervention required. Options:');
        console.log('1. Delete all documents and start fresh');
        console.log('2. Manually merge the fields');
        
        const result = await collection.updateMany(
          { 
            name: { $exists: true }, 
            username: { $exists: true } 
          },
          { $unset: { name: 1 } }
        );
        console.log(`Removed 'name' field from ${result.modifiedCount} documents that already have username`);
      }

      console.log('\n=== Cleaning up null/missing usernames ===');
      const cleanupResult = await collection.deleteMany({
        $or: [
          { username: null },
          { username: { $exists: false } }
        ]
      });
      console.log(`Deleted ${cleanupResult.deletedCount} documents with null/missing username`);
    }

    console.log('\n=== Creating username_1 index ===');
    try {
      await collection.createIndex({ username: 1 }, { unique: true });
      console.log('Successfully created username_1 index');
    } catch (error) {
      console.log('Error creating username index:', error.message);
    }

    console.log('\n=== Final Indexes ===');
    const finalIndexes = await collection.indexes();
    finalIndexes.forEach(index => {
      console.log(`Index: ${index.name}`, index.key);
    });

    console.log('\n✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

async function clearDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_DB_URI);
    console.log('Connected to MongoDB successfully');

    const db = mongoose.connection.db;
    
    console.log('\n=== Dropping users collection ===');
    try {
      await db.collection('users').drop();
      console.log('Successfully dropped users collection');
    } catch (error) {
      if (error.code === 26) {
        console.log('Users collection does not exist, nothing to drop');
      } else {
        throw error;
      }
    }

    console.log('✅ Database cleared successfully!');
    console.log('The collection will be recreated automatically with correct indexes when you create the first user.');
    
  } catch (error) {
    console.error('❌ Clear database failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

const command = process.argv[2];

if (command === 'migrate') {
  migrateDatabase();
} else if (command === 'clear') {
  clearDatabase();
} else {
  console.log('Usage:');
  console.log('  node migrate-username.js migrate  # Migrate existing data');
  console.log('  node migrate-username.js clear    # Clear all data (recommended for development)');
}
