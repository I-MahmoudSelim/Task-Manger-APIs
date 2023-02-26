const mongodb = require("mongodb")
const { MongoClient, ObjectId } = require("mongodb");

// Connection URI
const uri = "mongodb://127.0.0.1:27017";

// Create a new MongoClient
const client = new MongoClient(uri);

async function run() {
    try {
        // Connect the client to the server (optional starting in v4.7)
        await client.connect();

        // Establish and verify connection
        const taskMangerdb = await client.db("task-manger")//.command({ ping: 1 });
        console.log("Connected successfully to server");
        const user_Collection = taskMangerdb.collection("user")
        const tasks_Collection = taskMangerdb.collection("task")

        const result = await tasks_Collection.updateMany({ completed: false }, { $set: { completed: true } })

        console.log(result)

    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}
run().catch(console.dir);
