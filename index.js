import express from "express";
import cors from "cors";
import dayjs from "dayjs";

const app = express();
const PORT = 5000;

const participants = [];
const messages = [];

app.use(express.json());
app.use(cors());

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
})

app.post("/messages", (req, res) => {
    const { user } = req.headers;
    const { to, text, type} = req.body;

    // validate format using joi

    messages.push({ from: user, to, text, type, time: dayjs().format("HH:mm:ss") });

    res.sendStatus(201);
})

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
})

app.listen(5000, () => {
    console.log("Listening on port", PORT);
});