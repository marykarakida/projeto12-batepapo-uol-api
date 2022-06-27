import { getDb } from "../db/db.js";

export async function postStatus(req, res) {
    const { user } = req.headers;

    try {
        const db = getDb();
        const participantsCollection = db.collection("participants");
        
        const sameNameParticipant = await participantsCollection.findOne({ name: user });

        if (!sameNameParticipant) {
            res.status(404).send();
            return;
        };

        await participantsCollection.updateOne(
            { name: user }, 
            { $set: { lastStatus: Date.now() } }
        );

        res.status(200).send();
    } catch (err) {
        console.error(err);
        res.status(500).send();
    }
}