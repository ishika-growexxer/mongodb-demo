const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './config.env' });

const { MONGODB_URI, DB_NAME, COLLECTION_NAME, CITY_COLLECTION_NAME } = process.env;

class CustomerProfileDemo {
  constructor() {
    this.client = null;
    this.db = null;
    this.collection = null;
    this.cityCollection = null;
  }

  async connect() {
    try {
      this.client = new MongoClient(MONGODB_URI);
      await this.client.connect();
      console.log('Connected to MongoDB');

      this.db = this.client.db(DB_NAME);
      this.collection = this.db.collection(COLLECTION_NAME);

      this.cityCollection = this.db.collection(CITY_COLLECTION_NAME);

      console.log(`Database selected: ${DB_NAME}`);
      console.log(`Collection selected: ${COLLECTION_NAME}`);
      console.log(`City collection selected: ${CITY_COLLECTION_NAME}`); 
    } catch (error) {
      console.error('MongoDB connection failed:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      console.log('MongoDB connection closed');
    }
  }

  async createIndexes() {
    try {
      await this.collection.createIndex({ email: 1 }, { unique: true });
      await this.collection.createIndex({ age: 1 });
      await this.collection.createIndex({ 'address.city': 1 });
      await this.collection.createIndex({ location: '2dsphere' });

      // ✅ ADDITION
      await this.collection.createIndex({ cityId: 1 });
      await this.cityCollection.createIndex({ name: 1 }, { unique: true });
      await this.cityCollection.createIndex({ location: '2dsphere' });

      console.log('Indexes ensured');
    } catch (error) {
      console.error('Index creation failed:', error);
    }
  }

  async seedCities() {
    console.log('Seeding city master data');

    const cities = [
      {
        name: 'Bengaluru',
        state: 'Karnataka',
        country: 'India',
        location: { type: 'Point', coordinates: [77.5946, 12.9716] }
      },
      {
        name: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        location: { type: 'Point', coordinates: [72.8777, 19.076] }
      },
      {
        name: 'Noida',
        state: 'Uttar Pradesh',
        country: 'India',
        location: { type: 'Point', coordinates: [77.391, 28.5355] }
      },
      {
        name: 'Chennai',
        state: 'Tamil Nadu',
        country: 'India',
        location: { type: 'Point', coordinates: [80.2707, 13.0827] }
      },
      {
        name: 'Pune',
        state: 'Maharashtra',
        country: 'India',
        location: { type: 'Point', coordinates: [73.8567, 18.5204] }
      }
    ];

    await this.cityCollection.deleteMany({});
    const result = await this.cityCollection.insertMany(cities);

    console.log('City master data inserted');
    return result.insertedIds;
  }

  async insertDocuments() {
    try {
      const bengaluruCity = await this.cityCollection.findOne({ name: 'Bengaluru' });

      const primaryCustomer = {
        name: 'Amit Sharma',
        email: 'amit.sharma@example.com',
        age: 32,
        cityId: bengaluruCity?._id,

        address: {
          street: '12 MG Road',
          city: 'Bengaluru',
          zipCode: '560001'
        },
        location: {
          type: 'Point',
          coordinates: [77.5946, 12.9716]
        },
        hobbies: ['cycling', 'blogging'],
        createdAt: new Date()
      };

      const singleResult = await this.collection.insertOne(primaryCustomer);
      console.log('Primary record inserted:', singleResult.insertedId);

      const mumbai = await this.cityCollection.findOne({ name: 'Mumbai' });
      const noida = await this.cityCollection.findOne({ name: 'Noida' });
      const chennai = await this.cityCollection.findOne({ name: 'Chennai' });

      const additionalCustomers = [
        {
          name: 'Neha Verma',
          email: 'neha.verma@example.com',
          age: 26,
          cityId: mumbai?._id,
          address: {
            street: '88 Link Road',
            city: 'Mumbai',
            zipCode: '400050'
          },
          location: {
            type: 'Point',
            coordinates: [72.8777, 19.076]
          },
          hobbies: ['yoga', 'reading'],
          createdAt: new Date()
        },
        {
          name: 'Rahul Mehta',
          email: 'rahul.mehta@example.com',
          age: 38,
          cityId: noida?._id,
          address: {
            street: '45 Sector 18',
            city: 'Noida',
            zipCode: '201301'
          },
          location: {
            type: 'Point',
            coordinates: [77.391, 28.5355]
          },
          hobbies: ['traveling', 'photography'],
          createdAt: new Date()
        },
        {
          name: 'Sneha Iyer',
          email: 'sneha.iyer@example.com',
          age: 29,
          cityId: chennai?._id,
          address: {
            street: '10 Anna Salai',
            city: 'Chennai',
            zipCode: '600002'
          },
          location: {
            type: 'Point',
            coordinates: [80.2707, 13.0827]
          },
          hobbies: ['painting', 'meditation'],
          createdAt: new Date()
        }
      ];

      await this.collection.insertMany(additionalCustomers);
      console.log('Additional records inserted');
    } catch (error) {
      console.error('Insert operation failed:', error);
      throw error;
    }
  }

  async readDocuments() {
    try {
      const allRecords = await this.collection.find({}).toArray();
      console.log(`Records found: ${allRecords.length}`);

      const youngerRecords = await this.collection.find({ age: { $lt: 30 } }).toArray();
      console.log(`Records under age 30: ${youngerRecords.length}`);

      const projectedRecords = await this.collection
        .find({}, { name: 1, email: 1, _id: 0 })
        .toArray();
      console.log('Projection query executed');

      const singleRecord = await this.collection.findOne({ name: 'Amit Sharma' });
      console.log(`Single record lookup: ${singleRecord ? 'found' : 'not found'}`);

      const filteredRecords = await this.collection.find({
        'address.city': { $in: ['Bengaluru', 'Mumbai'] },
        age: { $gte: 25 }
      }).toArray();
      console.log(`City-based filter result: ${filteredRecords.length}`);

      const totalCount = await this.collection.countDocuments();
      console.log(`Total records in collection: ${totalCount}`);
    } catch (error) {
      console.error('Read operation failed:', error);
      throw error;
    }
  }

  async updateDocuments() {
    try {
      const singleUpdate = await this.collection.updateOne(
        { email: 'amit.sharma@example.com' },
        {
          $set: {
            age: 33,
            'address.zipCode': '560002',
            updatedAt: new Date()
          },
          $push: { hobbies: 'gaming' }
        }
      );
      console.log(`Single record updated: ${singleUpdate.modifiedCount}`);

      const bulkUpdate = await this.collection.updateMany(
        { age: { $lt: 30 } },
        {
          $set: {
            category: 'young',
            updatedAt: new Date()
          }
        }
      );
      console.log(`Bulk records updated: ${bulkUpdate.modifiedCount}`);

      const upsertResult = await this.collection.updateOne(
        { email: 'new.customer@example.com' },
        {
          $set: {
            name: 'New Customer',
            age: 24,
            address: {
              street: '99 New Street',
              city: 'Pune',
              zipCode: '411001'
            },
            location: {
              type: 'Point',
              coordinates: [73.8567, 18.5204]
            },
            hobbies: ['running'],
            createdAt: new Date()
          }
        },
        { upsert: true }
      );

      console.log(
        `Upsert operation: ${upsertResult.upsertedId ? 'inserted' : 'updated'}`
      );
    } catch (error) {
      console.error('Update operation failed:', error);
      throw error;
    }
  }

  async deleteDocuments() {
    try {
      const singleDelete = await this.collection.deleteOne({
        email: 'new.customer@example.com'
      });
      console.log(`Single record deleted: ${singleDelete.deletedCount}`);

      const bulkDelete = await this.collection.deleteMany({ category: 'young' });
      console.log(`Bulk records deleted: ${bulkDelete.deletedCount}`);
    } catch (error) {
      console.error('Delete operation failed:', error);
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

      const result = await this.collection.aggregate(pipeline).toArray();
      return result;
      console.log('Aggregation pipeline executed');
    } catch (error) {
      console.error('Aggregation failed:', error);
      throw error;
    }
  }

  async runGeospatialQueries() {
    try {
      console.log('Executing geospatial queries');

      const referencePoint = [77.5946, 12.9716];

      const nearbyRecords = await this.collection.find({
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: referencePoint },
            $maxDistance: 1000000
          }
        }
      }).toArray();

      console.log(`Nearby records found: ${nearbyRecords.length}`);

      const regionPolygon = {
        type: 'Polygon',
        coordinates: [[
          [68, 8],
          [98, 8],
          [98, 35],
          [68, 35],
          [68, 8]
        ]]
      };

      const regionalRecords = await this.collection.find({
        location: { $geoWithin: { $geometry: regionPolygon } }
      }).toArray();

      console.log(`Regional records found: ${regionalRecords.length}`);

      const distanceResults = await this.collection.aggregate([
        {
          $geoNear: {
            near: { type: 'Point', coordinates: referencePoint },
            distanceField: 'distanceFromReference',
            spherical: true,
            distanceMultiplier: 0.001
          }
        },
        {
          $project: {
            name: 1,
            city: '$address.city',
            distanceFromReference: { $round: ['$distanceFromReference', 2] }
          }
        }
      ]).toArray();

      console.log('Distance calculation completed');
    } catch (error) {
      console.error('Geospatial queries failed:', error);
    }
  }

  async getCustomersWithCity() {
    return await this.collection.aggregate([
      {
        $lookup: {
          from: CITY_COLLECTION_NAME,
          localField: "cityId",
          foreignField: "_id",
          as: "city"
        }
      },
      { $unwind: "$city" },
      {
        $project: {
          name: 1,
          email: 1,
          city: "$city.name",
          state: "$city.state"
        }
      }
    ]).toArray();
  }

  async runDemo() {
    try {
      console.log('MongoDB demo started');

      await this.connect();

      await this.collection.deleteMany({});
      await this.cityCollection.deleteMany({});
      console.log('Collection cleared');

      await this.createIndexes();

      console.log('\n--- Seeding Documents ---');
      await this.seedCities();

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
      console.log(`Final record count: ${finalCount}`);

      console.log('\n=== MongoDB demo completed ===');
    } catch (error) {
      console.error('Demo execution failed:', error);
    } finally {
      await this.disconnect();
    }
  }
}

if (require.main === module) {
  new CustomerProfileDemo().runDemo();
}

module.exports = CustomerProfileDemo;
