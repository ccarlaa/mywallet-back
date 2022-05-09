import database from "../db.js";
import bcrypt from 'bcrypt';

export async function signIn(req, res) {
    const { email, password } = req.body;
    try {
        const user = await database.collection("users").findOne({email});
        if(user && bcrypt.compareSync(password, user.passwordHash)){
            const { _id } = user;
            const userKey = await database.collection("keys").findOne({_id});
            const infos = {
                name: user.name,
                token: userKey.token
            }
            res.status(201).send(infos);
        } else {
            res.status(404).send('Não existe um usuário com esses dados');
        }
    } catch (err) {
        res.status(500).send('Erro');
    }
}