const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });
const Query = require('./models/Query');

async function checkDuplicates() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/school_ceo_dashboard');
    console.log('Connected to MongoDB');

    const duplicates = await Query.aggregate([
      {
        $group: {
          _id: "$_id",
          count: { $sum: 1 }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ]);

    console.log('Duplicate IDs found:', duplicates);

    if (duplicates.length === 0) {
      console.log('No duplicate IDs found in database.');
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkDuplicates();
