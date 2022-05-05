import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import joi from "joi";
import { MongoClient } from "mongodb";
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import dayjs from "dayjs";

const app = express();
app.use(express.json());
app.use(cors());

dotenv.config()

const mongoClient = new MongoClient(process.env.MONGO_URL);
let database = null;

const signUpRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[$_/*&@#])[0-9a-zA-Z$*&_/@#]{8,}$/;

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

const newEntrySchema = joi.object({
    value: joi.string()
        .required(),
    description: joi.string()
        .required(),
    type: joi.string()
        .valid("entry", "exit")
        .required()
})

app.post('/sign-up', async (req, res) => {
    const { email, name, password, passwordConfirmed } = req.body;
    if(password !== passwordConfirmed) {
        res.status(422).send("Senhas diferentes");
        return;
    }
    const validation = signUpSchema.validate({ email, name, password });
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
        const repetedUser = await database.collection("users").findOne({name});
        if(repetedUser) {
            res.status(422).send("Já existe um usuário com esse nome. Por favor, escolha outro nome.");
            return;
        }
        await database.collection("users").insertOne(signUp); 
        const token = uuid();
        const userInformation = await database.collection("users").findOne({name});
        const { _id } = userInformation
        const keys = {
            _id,
            token
        }
        await database.collection("keys").insertOne(keys); 
        res.status(201).send('Cadastro realizado com sucesso');
    } catch (err) {
        res.status(500).send('Erro');
    }
    mongoClient.close();
})

// {
//     "email": "carlacarlaclementino@gmail.com",
//     "name": "carla clementino",
//     "password": "Carla102545@",
//     "passwordConfirmed": "Carla102545@"
//   }
  

app.post('/sign-in', async (req, res) => {
    const { name, password } = req.headers;
    try {
        await mongoClient.connect();
        database = mongoClient.db('myWallet');
        const user = await database.collection("users").findOne({name});
        if(user && bcrypt.compareSync(password, user.passwordHash)){
            const { _id } = user;
            const userKey = await database.collection("keys").findOne({_id});
            const { token } = userKey;
            const infos = {
                name,
                token
            }
            res.status(201).send(infos);
        }
    } catch (err) {
        res.status(500).send('Erro');
    }
    mongoClient.close();
});

// TESTE (BODY) POST /register

// {
//     "value": "234.54",
//     "description": "blabla",
//     "type": "exit"
//  }

app.post('/register', async (req, res) => {
    const { value, description, type } = req.body;
    const validation = newEntrySchema.validate({ value, description, type });
    if(validation.error){
        res.status(422).send("Preencha os campos corretamente");
        return;
    }
    const register = {
        value,
        description,
        type,
        time: dayjs().format("DD/MM")
    }
    try {
        await mongoClient.connect();
        database = mongoClient.db('myWallet');
        if(type === "entry"){
            const user = await database.collection("entries").insertOne(register);
            res.status(201).send('Entrada salva')
        } else {
            const user = await database.collection("exits").insertOne(register);
            res.status(201).send('Entrada salva')
        }
    } catch (err) {
        res.status(500).send('Erro');
    }
    mongoClient.close();
})

app.listen(5000);
