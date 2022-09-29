import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config();

const mongoClient = new MongoClient(process.env.MONGO_URL);
let database = null;
try {
    await mongoClient.connect();
    database = mongoClient.db('myWallet');
    console.log("conectado")
} catch (err) {
    console.log("Falha na conexão");
}

export default database;
