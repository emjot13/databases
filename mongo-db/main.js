const ObjectId = require('mongodb').ObjectId;
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:2000';
const dbName = 'warehouse';
const collectionName = "products";

const express = require('express');
const app = express();
const connection_log = () => console.log("Connected to Mongo")


app.use(express.json());



app.get('/products', async (req, res) => {
  try {
    console.log("get all")
    const client = await MongoClient.connect(url, { useNewUrlParser: true }, connection_log());
    const collection = client.db(dbName).collection(collectionName);
    let filter = {};
    if (req.query.name) {
      filter.name = new RegExp(req.query.name, 'i');
    }
    if (req.query.price) {
      filter.price = parseInt(req.query.price);
    }
    if (req.query.quantity) {
      filter.quantity = parseInt(req.query.quantity);
    }
    let sort = {};
    if (req.query.sort) {
      sort = JSON.parse(req.query.sort);
    }
    const products = await collection.find(filter).sort(sort).toArray();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/products', async (req, res) => {
    try {
      const client = await MongoClient.connect(url, { useNewUrlParser: true });
      const collection = client.db(dbName).collection(collectionName);
      const existingProduct = await collection.findOne({ name: req.body.name });
      if (existingProduct) {
        res.status(400).json({ message: 'Product name must be unique.' });
      } else {
        const result = await collection.insertOne(req.body);
        client.close();
        res.json(result);
      }
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  
app.put('/products/:id', async (req, res) => {
try {
    const client = await MongoClient.connect(url, { useNewUrlParser: true });
    const collection = client.db(dbName).collection(collectionName);
    const result = await collection.updateOne(
    { _id: ObjectId(req.params.id) },
    { $set: req.body }
    );
    client.close();
    res.json(result);
} catch (err) {
    res.status(500).json({ message: err.message });
}
});

app.delete('/products/:id', async (req, res) => {
try {
    console.log("here")
    const client = await MongoClient.connect(url, { useNewUrlParser: true });
    const collection = client.db(dbName).collection(collectionName);
    console.log(req.params.id)
    const result = await collection.deleteOne({ _id: ObjectId(req.params.id) });
    if(result.deletedCount === 0){
    res.status(404).json({ message: 'Product not found or could not be deleted' });
    }
    client.close();
    res.json(result);
} catch (err) {
    res.status(500).json({ message: err.message });
    }});
  



app.get('/products/report', async (req, res) => {
  try {
    const client = await MongoClient.connect(url, { useNewUrlParser: true });
    const collection = client.db(dbName).collection('products');
    const report = await collection.aggregate([
      {
        $group: {
          _id: null,
          totalQuantity: { $sum: '$quantity' },
          totalValue: { $sum: { $multiply: ['$quantity', '$price'] } }
        }
      }, {
        $project: {
          _id: 0
        }
      }
    ]).toArray();
    client.close();
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


app.listen(3000);



// {
//   "_id": "63bec67649d2bc1e245f78ef",
//   "name": "football",
//   "price": 10,
//   "description": "Nike footbal",
//   "quantity": 100,
//   "unit": "items",
//   "__v": 0
// },