import dayjs from "dayjs";
import { ObjectId } from "mongodb";

import { getDb } from "../db/db.js";

import { stripHTMLFromMessage } from "../services/sanitization.js";
import { validateMessage } from "../services/validation.js";

export async function getMessages(req, res) {
    const { limit } = req.query;
    const { user } = req.headers;

    const start = Number(limit) * (-1);

    try {
        const db = getDb();
        const messagesCollection = db.collection("messages");
        const messages = await messagesCollection.find().toArray();

        const allowedMessages = messages.filter(message => {
            const isNotPrivateMessageFromUser = message.type === "private_message" && message.from !== user;
            const isNotPrivateMessageToUser = message.type === "private_message" && message.to !== user;
            
            return (!isNotPrivateMessageFromUser || !isNotPrivateMessageToUser);
        }).slice(start);

        res.status(200).send(allowedMessages);
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
};

export async function postMessage(req, res) {
    const { user, to, text, type } = stripHTMLFromMessage({ ...req.body, ...req.headers});

    const newMessage = {
        from: user,
        to,
        text,
        type
    };

    try {
        const db = getDb();
        const messagesCollection = db.collection("messages");
        const participantsCollection = db.collection("participants");

        const userOnline = await participantsCollection.findOne({ name: user });
        const messageValidation = validateMessage(newMessage);

        if (!userOnline) {
            res.status(422).send();
            return;
        } 
        if (messageValidation.error) {
            res.status(422).send();
            return;
        }

        await messagesCollection.insertOne({
            ...newMessage,
            time: dayjs().format("HH:mm:ss")
        });

        res.status(201).send();
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
};

export async function editMessage(req, res) {
    const { ID } = req.params;
    const { user, to, text, type } = stripHTMLFromMessage({ ...req.body, ...req.headers});

    const editedMessage = {
        from: user,
        to,
        text,
        type
    };

    try {
        const db = getDb();
        const messagesCollection = db.collection("messages");

        const sameIdMessage = await messagesCollection.findOne({ _id: ObjectId(ID) });
        const messageValidation = validateMessage(editedMessage);

        if (!sameIdMessage) {
            res.status(404).send();
            return;
        }
        if (sameIdMessage.from !== user) {
            console.log("entrou")
            res.status(401).send();
            return;
        };
        if (messageValidation.error) {
            res.status(422).send();
            return;
        };

        await messagesCollection.updateOne(
            { _id: ObjectId(ID) }, 
            { 
                $set: { text: text }
            }
        );

        res.status(200).send();
    } catch (err) {
        console.error(err);
        res.status(500).send();
    }
};

export async function deleteMessage(req, res) {
    const { user } = req.headers;
    const { ID } = req.params;

    try {
        const db = getDb();
        const messagesCollection = db.collection("messages");
        
        const sameIdMessage = await messagesCollection.findOne({ _id: ObjectId(ID) });

        if (!sameIdMessage) {
            res.status(404).send();
            return;
        }
        if (sameIdMessage.from !== user) {
            res.status(401).send();
            return;
        }

        await messagesCollection.deleteOne({ _id: ObjectId(ID) });

        res.status(200).send();
    } catch (err) {
        console.error(err);
        res.status(500).send();
    }
};