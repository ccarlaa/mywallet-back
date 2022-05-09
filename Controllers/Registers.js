import database from "../db.js";
import dayjs from "dayjs";

export async function postRegisters(req, res) {
    const { value, description, type} = req.body;
    const { authorization } = req.headers;
    const token = authorization?.replace('Bearer ', '');
    const register = {
        token,
        value,
        description,
        type,
        date: dayjs().format("DD/MM")
    }
    try {
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
}

export async function getRegisters(req, res) {
    const { authorization } = req.headers;
    const token = authorization?.replace('Bearer ', '');
    try {
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
}