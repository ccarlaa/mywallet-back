import express from "express";
import cors from "cors";

import registersRouter from "./Routes/Registers.js"
import signInRouter from "./Routes/SignIn.js"
import signUpRouter from "./Routes/SignUp.js"
import signInMiddlware from "./Middleware/SignInMiddleware.js";

const app = express();
app.use(express.json());
app.use(cors());

app.use(signUpRouter);

app.use(signInRouter);

app.use(registersRouter);


app.listen(5000);
