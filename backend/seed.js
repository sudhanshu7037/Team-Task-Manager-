require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/db');

const seedAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = 'admin@example.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('Admin already exists!');
      process.exit();
    }

    const admin = await User.create({
      name: 'System Admin',
      email: adminEmail,
      password: 'adminpassword',
      role: 'Admin'
    });

    console.log(`Admin created successfully! Email: ${admin.email}, Password: adminpassword`);
    process.exit();
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
