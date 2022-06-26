import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config();

let db;

export function connectToDb(startServer) {
	const mongoClient = new MongoClient(process.env.MONGO_URI);
	
	mongoClient.connect()
	.then(() => {
		db = mongoClient.db("bate_papo_uol");
		startServer();
	})
	.catch(err => {
		console.error(err);
	});
};

export function getDb() {
	return db;
};
