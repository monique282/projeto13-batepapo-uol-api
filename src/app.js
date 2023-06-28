import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());
const port = 5000;
// cerve pra deixar a aplicação ligada na porta escolhida
app.listen(port, () => console.log(`servidor esta rodando na porta ${port}`));












