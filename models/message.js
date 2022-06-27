import joi from "joi";

export const messageSchema = joi.object({
    from: joi.string().min(1).required(),
    to: joi.string().min(1).required(),
    type: joi.string().valid("message", "private_message").required(),
    text: joi.string().min(1).required()
}); 
