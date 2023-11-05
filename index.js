const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const port = process.env.PORT || 9000;
require("dotenv").config();

// middleware
app.use(express.json());
app.use(cors());
// console.log(process.env.DB_USER, process.env.DB_PASS);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fgalepw.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const bookCollection = client.db("libraryManagement").collection("books");
    const categoryCollection = client
      .db("libraryManagement")
      .collection("categories");

    // category related api
    app.get("/api/v1/categories", async (req, res) => {
      const result = await categoryCollection.find().toArray();
      res.send(result);
    });

    /////Books related api
    // get data method
    app.get("/api/v1/books", async (req, res) => {
      let query = {};

      const category = req.query.category;
      if (category) {
        query.category = category;
      }
      console.log(query);
      const result = await bookCollection.find({ query }).toArray();
      res.send(result);
    });

    // post data method
    app.post("/api/v1/books", async (req, res) => {
      const book = req.body;
      // console.log(book);
      const result = await bookCollection.insertOne(book);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Library Management is running");
});

app.listen(port, () => {
  console.log(`Library Management server listening on port ${port}`);
});
