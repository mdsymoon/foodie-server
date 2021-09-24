const express = require("express");
require("dotenv").config();
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;
const { MongoClient } = require("mongodb");
const app = express();
const fileUpload = require("express-fileupload");

const port = process.env.PORT || 5000;

// midleWare

app.use(cors());
app.use(fileUpload());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.o8cqw.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const productCollection = client.db("foodie").collection("items");
  const orderCollection = client.db("foodie").collection("order");

  app.post("/addProduct", (req, res) => {
    const { title, price, category } = req.body;
    const file = req.files.file;

    const newImg = file.data;
    const encImg = newImg.toString("base64");

    const img = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, "base64"),
    };
    productCollection
      .insertOne({ title, price, category, img })
      .then((result) => {
        res.send(result.insertedCount > 0);
      });
  });

  app.post("/items", (req, res) => {
    const category = req.body.category;
    productCollection.find(category).toArray((err, result) => res.send(result));
  });

  app.get("/allItems", (req, res) => {
    productCollection.find().toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.delete("/deleteItems", (req, res) => {
    productCollection.deleteOne({_id: ObjectId(req.body._id) })
      .then((result) => {
        res.send(true);
      });
  });

  app.post("/order", (req, res) => {
    const { title, price ,email, category, img  } = req.body;
    orderCollection.insertOne({ title, price, email,category, img   }).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.post("/orderItem", (req, res) => {
    const email = req.body.email;
    orderCollection.find({ email }).toArray((err, result) => {
      res.send(result);
    });
  });

  app.delete("/deleteOrder", (req, res) => {
    orderCollection.deleteOne({_id: ObjectId(req.body._id) })
    
      .then((result) => {
        res.send(true);
        
      });
  });

});

app.get("/", (req, res) => {
  res.send("Hello my World!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
