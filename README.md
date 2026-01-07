# MongoDB Demo

A comprehensive JavaScript demo covering MongoDB basic and intermediate concepts using the MongoDB Node.js driver.

## Features

- **Connection Management**: Connect to MongoDB with proper error handling
- **Document Operations**: Insert, read, update, and delete documents
- **Indexing**: Create indexes for better query performance
- **Aggregation**: Basic aggregation pipeline examples
- **Environment Configuration**: Use config file for database settings
- **Clean Code**: Simple, readable implementation without unnecessary complexity

## Prerequisites

- Node.js (v14 or higher)
- MongoDB running locally or accessible via connection string

## Setup

1. Install dependencies:
   ```bash
   npm install
   npm install express
   ```

2. Configure database connection in `config.env`:
   ```
   MONGODB_URI=mongodb://localhost:27017
   DB_NAME=customer_demo_db
   COLLECTION_NAME=customer_profiles
   CITY_COLLECTION_NAME=cities
   ```

3. Ensure MongoDB is running on your system

## Usage

Run the demo:
```bash
npm start
```

Or run with watch mode for development:
```bash
npm run dev
```

## What the Demo Covers

### Relational Data Modeling
- **Multiple Collections**: Separate collections for customers, cities, and APIs
- **One-to-Many Relationships**: Cities linked to customers via references
- **Foreign Key Pattern**: Using city IDs to establish relationships
- **$lookup Aggregation**: Joining data across collections
- **Embedded vs Referenced Data**: Examples of both approaches

### Geospatial Features
- **2dsphere indexes** for location-based queries
- **GeoJSON Point objects** with longitude/latitude coordinates
- **$near queries** to find users within specific distances
- **$geoWithin queries** to find users in geographic polygons
- **$geoNear aggregation** to calculate distances and sort by proximity
- **Real-world coordinates** for major US cities (NYC, LA, Chicago, Boston, Miami)

### API Collection Management
- **Structured API metadata** storage
- **Endpoint documentation** with method, path, and description
- **API versioning** tracking
- **Query examples** and use cases
- **Response format** documentation

### Basic Operations
- Connecting to MongoDB
- Creating databases and collections
- Inserting single and multiple documents
- Reading documents with filters and projections
- Updating documents (single, multiple, upsert)
- Deleting documents

### Intermediate Concepts
- Creating indexes for performance
- Basic aggregation pipelines
- Complex queries with operators
- **Geospatial operations and queries**
- Error handling and connection management

## Collections Schema

### Customer Profiles
- Customer information with contact details
- City reference (foreign key to cities collection)
- Purchase history and preferences
- Timestamps and metadata

### Cities
- City name, state, and country
- Geographic coordinates (GeoJSON format)
- Population and timezone data
- Related customers via reverse lookups

### API Collections
- API endpoint definitions
- HTTP methods and paths
- Request/response schemas
- Usage examples and descriptions

### MongoDB Operators Used
- `$set`, `$push` for updates
- `$lt`, `$gte`, `$in` for queries
- `$sum`, `$avg`, `$push` for aggregation
- **`$near`, `$geoWithin`, `$geoNear` for geospatial queries**
- Projection and sorting options

## Project Structure

```
mongo-db-demo/
├── api.js           # Main api script
├── demo.js          # Main demo script
├── config.env       # Database configuration
├── package.json     # Dependencies and scripts
└── README.md        # This file
```

## Customization

Modify the `config.env` file to point to your MongoDB instance. The demo will create a new database and collection as specified in the configuration. 