require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/db');

const checkAdmin = async () => {
  try {
    await connectDB();
    const admin = await User.findOne({ email: 'admin@example.com' });
    if (!admin) {
      console.log('Admin not found in DB');
    } else {
      console.log('Admin found:', admin.email);
      console.log('Password hash in DB:', admin.password);
      
      const isMatch = await admin.matchPassword('adminpassword');
      console.log('Does password match? :', isMatch);
    }
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkAdmin();
