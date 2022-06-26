import dayjs from "dayjs";
import { ObjectId } from "mongodb";

import { getDb } from "../db/db.js";

import { messageSchema, validateMessageSender } from "../models/message.js";

export async function getMessages(req, res) {
    const { limit } = req.query;
    const { user } = req.headers;

    const start = Number(limit) * (-1);

    try {
        const db = getDb();
        const dbMessages = db.collection("messages");
        const messages = await dbMessages.find().toArray();

        const allowedMessages = messages.filter(message => {
            const isNotPrivateMessageFromUser = message.type === "private_message" && message.from !== user;
            const isNotPrivateMessageToUser = message.type === "private_message" && message.to !== user;
            
            return (!isNotPrivateMessageFromUser || !isNotPrivateMessageToUser);
        }).slice(start);

        res.send(allowedMessages);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
};

export async function postMessage(req, res) {
    const { user } = req.headers;
    const { to, text, type} = req.body

    try {
        const db = getDb();
        const messagesCollection = db.collection("messages");

        const isSenderOnline = await validateMessageSender(db, user, res);

        const messageValidation = messageSchema.validate({
            from: user,
            to,
            text,
            type
        }, { abortEarly: false });

        if (!isSenderOnline || messageValidation.error) {
            res.sendStatus(422);
            return;
        }

        await messagesCollection.insertOne({ 
            from: user, 
            to, 
            text, 
            type, 
            time: dayjs().format("HH:mm:ss") 
        });

        res.sendStatus(201);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
};

export async function editMessage(req, res) {
    const { ID } = req.params;
    const { user } = req.headers;
    const { to, text, type } = req.body;

    try {
        const db = getDb();
        const messagesCollection = db.collection("messages");
        const message = await messagesCollection.findOne({ _id: ObjectId(ID) });

        const validation = messageSchema.validate({
            from: user,
            to,
            text,
            type
        }, { abortEarly: false });

        if (message.from !== user) {
            res.sendStatus(401);
            return;
        }

        if (!message) {
            res.sendStatus(404);
            return;
        }

        if (validation.error) {
            res.sendStatus(422);
            return;
        }

        await messagesCollection.updateOne(
            { _id: ObjectId(ID) }, 
            { 
                $set: { text: text }
            }
        )

        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
};

export async function deleteMessage(req, res) {
    const { user } = req.headers;
    const { ID } = req.params;

    try {
        const db = getDb();
        const messagesCollection = db.collection("messages");
        const message = await messagesCollection.findOne({ _id: ObjectId(ID) });

        if (!message) {
            res.sendStatus(404);
            return;
        }

        if (message.from !== user) {
            res.sendStatus(401);
            return;
        }

        await messagesCollection.deleteOne( { _id: ObjectId(ID) } );

        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
};