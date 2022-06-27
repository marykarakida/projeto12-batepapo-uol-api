import { messageSchema } from "../models/message.js";
import { participantSchema } from "../models/participant.js";

export function validateParticipant(participant) {
    const validation = participantSchema.validate(participant,
        {abortEarly: false}
    );

    if (validation.error) console.log(validation.error);

    return validation;
};

export function validateMessage(message) {
    const validation = messageSchema.validate(message,
        {abortEarly: false}
    );

    if (validation.error) console.log(validation.error);

    return validation;
};