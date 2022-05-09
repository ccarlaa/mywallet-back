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
        .pattern(/^[0-9]{0,10}[.]{1,1}[0-9]{0,2}$/)
        .required(),
    description: joi.string()
        .required(),
    type: joi.string()
        .valid("entry", "exit")
        .required()
})

app.post('/sign-up', async (req, res) => {
    console.log(req.body)
    const { name, email, password, passwordConfirmed } = req.body;
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
        const repetedUser = await database.collection("users").findOne({email});
        if(repetedUser) {
            res.status(422).send("Já existe um usuário cadastrado com esse email");
            return;
        }
        await database.collection("users").insertOne(signUp); 
        const token = uuid();
        const userInformation = await database.collection("users").findOne({email});
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

app.post('/sign-in', async (req, res) => {
    console.log(req.body)
    const { email, password } = req.body;
    try {
        await mongoClient.connect();
        database = mongoClient.db('myWallet');
        const user = await database.collection("users").findOne({email});
        if(user && bcrypt.compareSync(password, user.passwordHash)){
            const { _id } = user;
            const userKey = await database.collection("keys").findOne({_id});
            console.log(userKey);
            const infos = {
                name: user.name,
                token: userKey.token
            }
            res.status(201).send(infos);
            console.log("hey" + infos);
        }
    } catch (err) {
        res.status(500).send('Erro');
        console.log("erro" + infos);
    }
    mongoClient.close();

});

// TESTE (BODY) POST /register

// (BODY)

// {
//     "value": "234.54",
//     "description": "blabla",
//     "type": "exit"
//  }

//  (HEADER)

// authorization: Bearer 39163183-3a2b-4722-bdd2-7657f14b6e8d

app.post('/register', async (req, res) => {
    const { value, description, type} = req.body;
    const { authorization } = req.headers;
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
    const register = {
        token,
        value,
        description,
        type,
        date: dayjs().format("DD/MM")
    }
    try {
        await mongoClient.connect();
        database = mongoClient.db('myWallet');
        const tokenValidation = await database.collection("keys").findOne({token});
        if(!tokenValidation){
            res.status(401).send('Token invalido');
            return;
        }
        if(type === "entry"){
            const user = await database.collection("registers").insertOne(register);
            res.status(201).send('Entrada salva')
        } else {
            const user = await database.collection("registers").insertOne(register);
            res.status(201).send('Entrada salva')
        }
    } catch (err) {
        res.status(500).send('Erro');
    }
    mongoClient.close();
})

// TESTE (HEADER) GET /register

// authorization: Bearer 39163183-3a2b-4722-bdd2-7657f14b6e8d

app.get('/register', async (req, res) => {
    const { authorization } = req.headers;
    const token = authorization?.replace('Bearer ', '');
    if(!token){
        res.status(401).send('Token invalido');
        return;
    }
    try {
        await mongoClient.connect();
        database = mongoClient.db('myWallet');
        const tokenValidation = await database.collection("keys").findOne({token});
        if(!tokenValidation){
            res.status(401).send('Token invalido');
            return;
        }
        const registers = await database.collection("registers").find({token}).toArray(); 
        const reverseRegisters = registers.slice(0).reverse();
        res.status(200).send(reverseRegisters);
    } catch (err) {
        res.status(500).send('Erro');
    }
    mongoClient.close();
})


app.listen(5000);
