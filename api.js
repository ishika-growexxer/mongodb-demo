const express = require('express');
const MongoDemo = require('./demo');

const app = express();
const demo = new MongoDemo();

app.get('/customers', async (req, res) => {
  try {
    await demo.connect();
    const data = await demo.getCustomersWithCity();
    await demo.disconnect();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/cities', async (req, res) => {
    try {
      await demo.connect();
      const cities = await demo.cityCollection.find({}).toArray();
      await demo.disconnect();
      res.json(cities);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

app.get('/customers/aggregation/city', async (req, res) => {
    try {
        await demo.connect();
        const data = await demo.runAggregation();
        await demo.disconnect();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(3000, () => {
  console.log('API running at http://localhost:3000');
});
