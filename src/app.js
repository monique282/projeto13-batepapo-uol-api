import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";

const app = express();
app.use(cors());
app.use(express.json());
const port = 5000;

// array de todos os participantes
let participantes = [];
// cerve pra deixar a aplicação ligada na porta escolhida
app.listen(port, () => console.log(`servidor esta rodando na porta ${port}`));

// conexão com o banco de dados
const mongoClient = new MongoClient("mongodb://localhost:27017/");

let db;
mongoClient.connect()

.then(() => db = mongoClient.db())
.catch ((err) => console.log(err.massage));

let listaPaticipantes = [];
app.get("/participants", (red, res) => {
    db.collection("participants").find().toArray()
    .then(participants => {
        return res.send(participants)
    })
    .catch( err => {
        return res.status(500).send(err.massage);
    })


    if (participantes.length === 0) {
        return res.send([])
    }
    else{
listaPaticipantes = participantes.slice();
    }
 res.send(listaPaticipantes);
});









