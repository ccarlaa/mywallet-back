import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import joi from "joi";
import { MongoClient } from "mongodb";
import bcrypt from 'bcrypt';

const app = express();
app.use(express.json());
app.use(cors());

dotenv.config()

const mongoClient = new MongoClient(process.env.MONGO_URL);
let database = null;

const signUpRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[$*&@#])[0-9a-zA-Z$*&@#]{8,}$/;

const signUpSchema = joi.object({
    email: joi.string() 
        .email()
        .required(),
    name: joi.string() 
        .required(),
    password: joi.string()
        .min(8)
        .pattern(signUpRegex)
        .required()
})

app.post('/sign-up', async (req, res) => {
    const {email, name, password, passwordConfirmed} = req.body;
    if(password !== passwordConfirmed) {
        res.status(422).send("Senhas diferentes");
        return;
    }
    const validation = signUpSchema.validate({email, name, password});
    if(validation.error){
        res.status(422).send("Confira se todos os campos foram preenchidos corretamente. A senha deve conter no mínimo 8 caractéres e 1 número");
        return;
    }
    const passwordHash = bcrypt.hashSync(password,10);
    const passwordConfirmedHash = bcrypt.hashSync(passwordConfirmed, 10);
    const signUp = {
        name,
        email,
        passwordHash,
        passwordConfirmedHash
    }
    try {
        await mongoClient.connect();
        database = mongoClient.db('myWallet');
        await database.collection("users").insertOne(signUp);
        res.status(201).send('ok');
    } catch (err) {
        res.status(500).send('Erro');
    }
    mongoClient.close();
})

app.listen(5000);
