import joi from "joi";

export default async function signInMiddleware(req, res, next) {
    const { email, password } = req.body;
    const signUpSchema = joi.object({
        email: joi.string() 
            .email()
            .required(),
        password: joi.string()
            .min(8)
            .pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[$_/*&@#])[0-9a-zA-Z$*&_/@#]{8,}$/)
            .required()
    })
    
    const validation = signUpSchema.validate({ email, password });
    if(validation.error){
        res.status(422).send("Confira se todos os campos foram preenchidos corretamente. A senha deve conter no mínimo 8 caractéres e 1 número");
        return;
    }
    next();
}