const mongoose = require('mongoose');
const MONGO_DB_URI = process.env.MONGO_DB_URI || 'mongodb://localhost:27017/MERN_TEST';

async function testRegistration() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_DB_URI);
    console.log('Connected to MongoDB successfully');

    const User = require('../src/models/user');
    const testUser = {
      username: "znareakd",
      email: "libardojesusrengifo1293@gmail.com",
      password: "hashedpassword123"
    };

    console.log('\n=== Testing user registration ===');
    console.log('Test payload:', testUser);

    const newUser = new User(testUser);
    const savedUser = await newUser.save();
    
    console.log('✅ User created successfully!');
    console.log('Created user ID:', savedUser._id);
    console.log('Username:', savedUser.username);
    console.log('Email:', savedUser.email);

    console.log('\n=== Checking indexes ===');
    const collection = mongoose.connection.db.collection('users');
    const indexes = await collection.indexes();
    indexes.forEach(index => {
      console.log(`Index: ${index.name}`, index.key);
    });

    console.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.code === 11000) {
      console.log('This is a duplicate key error. Details:', error.keyPattern, error.keyValue);
    }
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testRegistration();
