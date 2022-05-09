import joi from "joi";

export default async function signUpMiddleware(req, res, next) {
    const { name, email, password, passwordConfirmed } = req.body;
    if(password !== passwordConfirmed) {
        res.status(422).send("Senhas diferentes");
        return;
    }
    const signUpSchema = joi.object({
        email: joi.string() 
            .email()
            .required(),
        name: joi.string() 
            .required(),
        password: joi.string()
            .min(8)
            .pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[$_/*&@#])[0-9a-zA-Z$*&_/@#]{8,}$/)
            .required()
    })
    const validation = signUpSchema.validate({ email, name, password });
    if(validation.error){
        res.status(422).send("Confira se todos os campos foram preenchidos corretamente. A senha deve conter no mínimo 8 caractéres e 1 número");
        return;
    }
    next();
}