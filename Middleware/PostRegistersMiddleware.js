import joi from "joi";

export default async function postRegistersMiddleware(req, res,next) {
    const { value, description, type} = req.body;
    const { authorization } = req.headers;
    const newEntrySchema = joi.object({
        value: joi.string()
            .pattern(/^[0-9]{0,10}[.]{1,1}[0-9]{0,2}$/)
            .required(),
        description: joi.string()
            .required(),
        type: joi.string()
            .valid("entry", "exit")
            .required()
    })
    const validation = newEntrySchema.validate({ value, description, type });
    const token = authorization?.replace('Bearer ', '');
    if(!token){
        res.status(401).send('Token invalido');
        return;
    }
    if(validation.error){
        res.status(422).send("Preencha os campos corretamente");
        return;
    }
    next();
}