require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wf6wg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    const userCollection = client.db("taskManagement").collection("users");
    const taskCollection = client.db("taskManagement").collection("tasks");

    // user related apis
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "user already exists", insertedId: null });
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    // tasks related apis

    app.get("/tasks/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const tasks = await taskCollection.find(query).toArray();
      res.send(tasks);
    });

    // Create a new task
    app.post("/tasks", async (req, res) => {
      const task = req.body;
      const result = await taskCollection.insertOne(task);
      res.send(result);
    });

    // Edit a task
    app.put("/tasks/:id/move", async (req, res) => {
      const taskId = req.params.id;
      const updatedData = req.body;
      // console.log("Updating task", taskId, "with data:", updatedData);
      const result = await taskCollection.updateOne(
        { _id: new ObjectId(taskId) },
        { $set: updatedData }
      );
      res.send(result);
    });

    app.patch("/tasks/:id", async (req, res) => {
      const task = req.body;
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedData = {
        $set: {
          title: task.title,
          description: task.description,
          timestamp: task.timestamp,
        },
      };
      const result = await taskCollection.updateOne(filter, updatedData);
      res.send(result);
    });

    // Delete a task
    app.delete("/tasks/:id", async (req, res) => {
      const taskId = req.params.id;
      const result = await taskCollection.deleteOne({
        _id: new ObjectId(taskId),
      });
      res.send(result);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
