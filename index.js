import cors from "cors";
import dayjs from "dayjs";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const UPDATE_PATICIPANTS_TIME = 15000;
const participants = [];
const messages = [];

app.post("/participants", (req, res) => {
    const { name } = req.body;

    // validate format using joi

    if (participants.some((participant) => participant.name === name)) {
        res.sendStatus(409);
        return;
    }

    participants.push({ name, lastStatus: Date.now() });
    messages.push({ from: name, to: 'Todos', text: 'entra na sala...', type: 'status', time: dayjs().format("HH:mm:ss") });

    res.sendStatus(201);
});

app.get("/participants", (req, res) => {
    res.send(participants);
});

app.post("/messages", (req, res) => {
    const { user } = req.headers;
    const { to, text, type} = req.body;

    // validate format using joi

    messages.push({ from: user, to, text, type, time: dayjs().format("HH:mm:ss") });

    res.sendStatus(201);
});

app.get("/messages", (req, res) => {
    const { limit } = req.query.limit;
    const { user } = req.headers;

    const start = Number(limit) * (-1);

    const allowedMessages = messages.filter(message => {
        const isNotPrivateMessageFromUser = message.type === "private_message" && message.from !== user;
        const isNotPrivateMessageToUser = message.type === "private_message" && message.to !== user;
        
        return (!isNotPrivateMessageFromUser || !isNotPrivateMessageToUser);
    });

    res.send(allowedMessages.slice(start));
});

app.post("/status", (req, res) => {
    const { user } = req.headers;

    const participant = participants.find(participant => participant.name === user);

    if (!participant) {
        res.sendStatus(404);
        return;
    }

    participant.lastStatus = Date.now();

    res.sendStatus(200);
});

app.listen(process.env.PORT, () => {
    console.log("Listening on port", process.env.PORT);
});

setInterval(removerParticipantesInativos, UPDATE_PATICIPANTS_TIME);

function removerParticipantesInativos() {
    const time = Date.now();

    for (let i = 0 ; i < participants.length ; i ++) {
        const participant = participants[i];

        if (time - participant.lastStatus > 10000) {
            participants.splice(i, 1);
            messages.push({from: participant.name, to: 'Todos', text: 'sai da sala...', type: 'status', time: dayjs().format("HH:mm:ss")})
        }
    }
}