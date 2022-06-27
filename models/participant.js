import joi from "joi";

export const participantSchema = joi.object({
    name: joi.string().min(1).required()
});