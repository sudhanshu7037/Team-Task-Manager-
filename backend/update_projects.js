const mongoose = require('mongoose');
require('dotenv').config();
const Project = require('./models/Project');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const users = await User.find({}, '_id');
    const memberIds = users.map(u => u._id);
    
    await Project.updateMany(
      { $or: [ { members: { $size: 0 } }, { members: { $exists: false } } ] },
      { $set: { members: memberIds } }
    );
    console.log('Updated existing projects successfully');
    mongoose.connection.close();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
