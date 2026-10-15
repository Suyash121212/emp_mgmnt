import { MongoClient } from 'mongodb';

// Try direct connection to bypass SRV DNS lookup
const client = new MongoClient("mongodb://suyash22310483_db_user:guEuEi6PoAZr95kR@ac-jdrb0tn-shard-00-00.4r2plvn.mongodb.net:27017,ac-jdrb0tn-shard-00-01.4r2plvn.mongodb.net:27017,ac-jdrb0tn-shard-00-02.4r2plvn.mongodb.net:27017/emp-mngt?replicaSet=atlas-7p1mjp-shard-0&ssl=true&authSource=admin");

export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}

// Call this only when your application terminates
export async function disconnectFromMongoDB() {
  await client.close();
}
connectToMongoDB();
