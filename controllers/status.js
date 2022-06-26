import { getDb } from "../db/db.js";

export async function postStatus(req, res) {
    const { user } = req.headers;

    try {
        const db = getDb();
        const participantsCollection = db.collection("participants");
        const participant = await participantsCollection.findOne({ name: user });

        if (!participant) {
            res.sendStatus(404);
            return;
        }

        await participantsCollection.updateOne(
            { name: user }, 
            { 
                $set: { lastStatus: Date.now() }
            }
        )

        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
}