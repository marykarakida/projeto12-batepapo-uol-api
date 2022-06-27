import { stripHtml } from "string-strip-html";

export function stripHTMLFromParticipant(participant) {
    let { name } = participant;

    name = stripHtml(name).result.trim();

    return { name };
};

export function stripHTMLFromMessage(message) {
    let { user, to, text, type } = message;

    user = stripHtml(user).result.trim();
    to = stripHtml(to).result.trim();
    text = stripHtml(text).result.trim();
    type = stripHtml(type).result.trim();

    return { user, to, text, type };
};