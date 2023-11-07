const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
    const borrowBookCollection = client
      .db("libraryManagement")
      .collection("borrowedBooks");

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
      // console.log(query);
      const result = await bookCollection.find(query).toArray();
      res.send(result);
    });

    // get specific id book data
    app.get("/api/v1/books/:id", async (req, res) => {
      const id = req.params;
      // console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await bookCollection.findOne(query);
      res.send(result);
    });

    // get borrowed books
    app.get("/api/v1/borrowedbooks", async (req, res) => {
      const { email } = req.query;
      // console.log(email);
      let query = {};
      if (req.query?.email) {
        query = { userEmail: email };
      }
      const result = await borrowBookCollection.find(query).toArray();
      res.send(result);
    });

    // get single Borrowed Book
    app.get("/api/v1/borrowedbooks/check", async (req, res) => {
      const email = req.query.email;
      const bookName = req.query.bookName;
      console.log(email, bookName);

      const filter = {
        $and: [{ userEmail: email }, { bookName: bookName }],
      };
      const result = await borrowBookCollection.find(filter).toArray();
      res.send(result);
    });

    // Update Book
    app.put("/api/v1/books/:id", async (req, res) => {
      const { id } = req.params;
      const book = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          bookName: book.bookName,
          authorName: book.authorName,
          category: book.category,
          quantity: book.quantity,
          rating: book.rating,
          photoUrl: book.photoUrl,
          description: book.description,
        },
      };
      const result = await bookCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    });

    // Update book data
    app.patch("/api/v1/books/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      const { quantity } = req.body;
      // console.log(id, quantity);
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          quantity: quantity,
        },
      };

      const result = await bookCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    // post borrowed book api
    app.post("/api/v1/borrowedbooks", async (req, res) => {
      const borrowedBooks = req.body;
      const result = await borrowBookCollection.insertOne(borrowedBooks);
      // console.log(req.body);
      res.send(result);
    });

    // post book data method
    app.post("/api/v1/books", async (req, res) => {
      const book = req.body;
      // console.log(book);
      const result = await bookCollection.insertOne(book);
      res.send(result);
    });

    // Delete borrowed books
    app.delete("/api/v1/borrowedbooks/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await borrowBookCollection.deleteOne(query);
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
