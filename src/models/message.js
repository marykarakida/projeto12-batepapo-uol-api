import joi from "joi";

export const messageSchema = joi.object({
    from: joi.string().required(),
    to: joi.string().required(),
    type: joi.string().valid("message", "private_message").required(),
    text: joi.string().required()
}); 

export async function validateMessageSender(db, user, res) {
    try {
        const dbParticipants = db.collection("participants");
        const participant = await dbParticipants.findOne({ name: user });

        if (participant) {
            return true
        } else {
            return false;
        }
    } catch (err) {
        console.error(err)
        res.sendStatus(500);
    }
}
