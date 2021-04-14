require("dotenv").config();
const MongoClient = require("mongodb").MongoClient;

const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  poolSize: 50,
});

module.exports = async function connect() {
  try {
    await client.connect();
    const main = client.db("main");
    const issues = main.collection("issues");

    console.log("Database connected successfully.");

    return issues;
  } catch (err) {
    console.error("Database connection has been failed.");
    console.log(err);
  }
};
