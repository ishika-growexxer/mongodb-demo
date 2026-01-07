const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './config.env' });

const { MONGODB_URI, DB_NAME, COLLECTION_NAME } = process.env;

class MongoDemo {
  constructor() {
    this.client = null;
    this.db = null;
    this.collection = null;
  }

  async connect() {
    try {
      this.client = new MongoClient(MONGODB_URI);
      await this.client.connect();
      console.log('Connected to MongoDB');
      
      this.db = this.client.db(DB_NAME);
      this.collection = this.db.collection(COLLECTION_NAME);
      
      console.log(`Using database: ${DB_NAME}`);
      console.log(`Using collection: ${COLLECTION_NAME}`);
    } catch (error) {
      console.error('Connection error:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      console.log('Disconnected from MongoDB');
    }
  }

  async createIndexes() {
    try {
      await this.collection.createIndex({ email: 1 }, { unique: true });
      await this.collection.createIndex({ age: 1 });
      await this.collection.createIndex({ "address.city": 1 });

      await this.collection.createIndex({ location: "2dsphere" });
      
      console.log('Indexes created successfully');
    } catch (error) {
      console.error('Index creation error:', error);
    }
  }

  async insertDocuments() {
    try {
      const singleUser = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
        address: {
          street: '123 Main St',
          city: 'New York',
          zipCode: '10001'
        },
        location: {
          type: 'Point',
          coordinates: [-74.006, 40.7128]
        },
        hobbies: ['reading', 'swimming'],
        createdAt: new Date()
      };

      const result = await this.collection.insertOne(singleUser);
      console.log('Single document inserted:', result.insertedId);

      const multipleUsers = [
        {
          name: 'Jane Smith',
          email: 'jane@example.com',
          age: 25,
          address: {
            street: '456 Oak Ave',
            city: 'Los Angeles',
            zipCode: '90210'
          },
          location: {
            type: 'Point',
            coordinates: [-118.2437, 34.0522] 
          },
          hobbies: ['painting', 'hiking'],
          createdAt: new Date()
        },
        {
          name: 'Bob Johnson',
          email: 'bob@example.com',
          age: 35,
          address: {
            street: '789 Pine Rd',
            city: 'Chicago',
            zipCode: '60601'
          },
          location: {
            type: 'Point',
            coordinates: [-87.6298, 41.8781]
          },
          hobbies: ['cooking', 'traveling'],
          createdAt: new Date()
        },
        {
          name: 'Alice Brown',
          email: 'alice@example.com',
          age: 28,
          address: {
            street: '321 Elm St',
            city: 'Boston',
            zipCode: '02101'
          },
          location: {
            type: 'Point',
            coordinates: [-71.0589, 42.3601]
          },
          hobbies: ['photography', 'yoga'],
          createdAt: new Date()
        }
      ];

      const bulkResult = await this.collection.insertMany(multipleUsers);
      console.log('Multiple documents inserted:', bulkResult.insertedIds);
      
      return bulkResult.insertedIds;
    } catch (error) {
      console.error('Insert error:', error);
      throw error;
    }
  }

  async readDocuments() {
    try {
      const allUsers = await this.collection.find({}).toArray();
      console.log(`Found ${allUsers.length} users`);

      const youngUsers = await this.collection.find({ age: { $lt: 30 } }).toArray();
      console.log(`Found ${youngUsers.length} users under 30`);

      const userNames = await this.collection.find({}, { name: 1, email: 1, _id: 0 }).toArray();
      console.log('User names and emails:', userNames);

      const oneUser = await this.collection.findOne({ name: 'John Doe' });
      console.log('Found user:', oneUser ? oneUser.name : 'Not found');

      const cityUsers = await this.collection.find({
        'address.city': { $in: ['New York', 'Los Angeles'] },
        age: { $gte: 25 }
      }).toArray();
      console.log(`Found ${cityUsers.length} users in NY/LA aged 25+`);

      const totalCount = await this.collection.countDocuments();
      console.log(`Total users: ${totalCount}`);

      return { allUsers, youngUsers, userNames, oneUser, cityUsers, totalCount };
    } catch (error) {
      console.error('Read error:', error);
      throw error;
    }
    }

  async updateDocuments() {
    try {
      const updateResult = await this.collection.updateOne(
        { email: 'john@example.com' },
        { 
          $set: { 
            age: 31,
            'address.zipCode': '10002',
            updatedAt: new Date()
          },
          $push: { hobbies: 'gaming' }
        }
      );
      console.log('Single document updated:', updateResult.modifiedCount);

      const bulkUpdateResult = await this.collection.updateMany(
        { age: { $lt: 30 } },
        { 
          $set: { 
            category: 'young',
            updatedAt: new Date()
          }
        }
      );
      console.log('Multiple documents updated:', bulkUpdateResult.modifiedCount);

      const upsertResult = await this.collection.updateOne(
        { email: 'newuser@example.com' },
        { 
          $set: { 
            name: 'New User',
            age: 22,
            address: {
              street: '999 New St',
              city: 'Miami',
              zipCode: '33101'
            },
            location: {
              type: 'Point',
              coordinates: [-80.1918, 25.7617]
            },
            hobbies: ['surfing'],
            createdAt: new Date()
          }
        },
        { upsert: true }
      );
      console.log('Upsert result:', upsertResult.upsertedId ? 'Created new user' : 'Updated existing user');

      return { updateResult, bulkUpdateResult, upsertResult };
    } catch (error) {
      console.error('Update error:', error);
      throw error;
    }
  }

  async deleteDocuments() {
    try {
      const deleteResult = await this.collection.deleteOne({ email: 'newuser@example.com' });
      console.log('Single document deleted:', deleteResult.deletedCount);

      const bulkDeleteResult = await this.collection.deleteMany({ category: 'young' });
      console.log('Multiple documents deleted:', bulkDeleteResult.deletedCount);

      return { deleteResult, bulkDeleteResult };
    } catch (error) {
      console.error('Delete error:', error);
      throw error;
    }
  }

  async runAggregation() {
    try {
      const pipeline = [
        { $match: { age: { $gt: 25 } } },
        
        { 
          $group: { 
            _id: '$address.city',
            count: { $sum: 1 },
            avgAge: { $avg: '$age' },
            users: { $push: '$name' }
          } 
        },

        { $sort: { count: -1 } }
      ];

      const aggregationResult = await this.collection.aggregate(pipeline).toArray();
      console.log('Aggregation result:', aggregationResult);

      return aggregationResult;
    } catch (error) {
      console.error('Aggregation error:', error);
      throw error;
    }
  }

  async runGeospatialQueries() {
    try {
      console.log('\n--- Geospatial Queries ---');

      const nycCoordinates = [-74.006, 40.7128];
      const nearbyUsers = await this.collection.find({
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: nycCoordinates
            },
            $maxDistance: 1000000
          }
        }
      }).toArray();
      
      console.log(`Users within 1000km of NYC: ${nearbyUsers.length}`);
      nearbyUsers.forEach(user => {
        console.log(`- ${user.name} in ${user.address.city}`);
      });

     const northeasternPolygon = {
        type: 'Polygon',
        coordinates: [[
          [-80, 35],
          [-60, 35],  
          [-60, 50],
          [-80, 50],
          [-80, 35]
        ]]
      };

      const northeasternUsers = await this.collection.find({
        location: {
          $geoWithin: {
            $geometry: northeasternPolygon
          }
        }
      }).toArray();

      console.log(`\nUsers in northeastern US: ${northeasternUsers.length}`);
      northeasternUsers.forEach(user => {
        console.log(`- ${user.name} in ${user.address.city}`);
      });

      const usersWithDistance = await this.collection.aggregate([
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: nycCoordinates
            },
            distanceField: 'distanceFromNYC',
            spherical: true,
            distanceMultiplier: 0.001
          }
        },
        {
          $project: {
            name: 1,
            city: '$address.city',
            distanceFromNYC: { $round: ['$distanceFromNYC', 2] }
          }
        }
      ]).toArray();

      console.log('\nUsers sorted by distance from NYC:');
      usersWithDistance.forEach(user => {
        console.log(`- ${user.name} in ${user.city}: ${user.distanceFromNYC} km`);
      });

      return { nearbyUsers, northeasternUsers, usersWithDistance };
    } catch (error) {
      console.error('Geospatial query error:', error);
    }
  }

  async runDemo() {
    try {
      console.log('=== MongoDB Demo Started ===\n');

      await this.connect();

      await this.collection.deleteMany({});
      console.log('Cleared existing documents');
      
      await this.createIndexes();

      console.log('\n--- Inserting Documents ---');
      await this.insertDocuments();

      console.log('\n--- Reading Documents ---');
      await this.readDocuments();

      console.log('\n--- Updating Documents ---');
      await this.updateDocuments();

      console.log('\n--- Running Aggregation ---');
      await this.runAggregation();

      console.log('\n--- Running Geospatial Queries ---');
      await this.runGeospatialQueries();

      console.log('\n--- Deleting Documents ---');
      await this.deleteDocuments();

      console.log('\n--- Final Document Count ---');
      const finalCount = await this.collection.countDocuments();
      console.log(`Final user count: ${finalCount}`);

      console.log('\n=== Demo Completed Successfully ===');
    } catch (error) {
      console.error('Demo failed:', error);
    } finally {
      await this.disconnect();
    }
  }
}

if (require.main === module) {
  const demo = new MongoDemo();
  demo.runDemo();
}

module.exports = MongoDemo; 