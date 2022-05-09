import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import registersRouter from "./Routes/Registers.js";
import signInRouter from "./Routes/SignIn.js";
import signUpRouter from "./Routes/SignUp.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

app.use(signUpRouter);

app.use(signInRouter);

app.use(registersRouter);

app.listen(process.env.PORT);
