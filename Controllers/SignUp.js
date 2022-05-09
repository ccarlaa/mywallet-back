import database from "../db.js"
import { v4 as uuid } from 'uuid';
import bcrypt from 'bcrypt';

export async function signUp(req, res) {
    const { name, email, password, passwordConfirmed } = req.body;
    const passwordHash = bcrypt.hashSync(password,10);
    const passwordConfirmedHash = bcrypt.hashSync(passwordConfirmed, 10);
    const signUp = {
        name,
        email,
        passwordHash,
        passwordConfirmedHash
    }
    try {
        const repetedUser = await database.collection("users").findOne({email});
        if(repetedUser) {
            res.status(422).send("Já existe um usuário cadastrado com esse email");
            return;
        }
        await database.collection("users").insertOne(signUp); 
        const token = uuid();
        const userInformation = await database.collection("users").findOne({email});
        const { _id } = userInformation;
        const keys = {
            _id,
            token
        }
        await database.collection("keys").insertOne(keys); 
        res.status(201).send('Cadastro realizado com sucesso');
    } catch (err) {
        res.status(500).send('Erro');
    }
}