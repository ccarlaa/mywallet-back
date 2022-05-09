export default async function getRegistersMiddleware(req, res, next) {
    const { authorization } = req.headers;
    const token = authorization?.replace('Bearer ', '');
    if(!token){
        res.status(401).send('Token invalido');
        return;
    }
    next();
}