import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

const app = express();
app.use(cors());
app.use(express.json());
dotenv.config();
const port = 5000;

// array de todos os participantes
let participantes = [];
// cerve pra deixar a aplicação ligada na porta escolhida
app.listen(port, () => console.log(`servidor esta rodando na porta ${port}`));

// conexão com o banco de dados
const mongoClient = new MongoClient(process.env.DATABASE_URL);

let db;
mongoClient.connect()

    .then(() => db = mongoClient.db())
    .catch((err) => console.log(err.massage));

let listaPaticipantes = [];
app.get("/participants", (red, res) => {
    const promise = db.collection("participants").find().toArray()
    promise.then(participants => {
        if (participants.length === 0) {
            return console.log("vazio")
        }
        else {
            listaPaticipantes = participants.slice();
            return res.send(listaPaticipantes);
        }

    })
    promise.catch(err => {
        return res.status(500).send(err.massage);
    })


});


app.post("/participants", (req, res) => {
    const { name } = req.body;


    // verificar se o nome esta como uma estringue vazia
    if (name === "") {
        return res.sendStatus(422);

    }
    // verificar se o nome ja exixte 
    const findParticipantPromise = db.collection("participants").findOne({ name: name });
    findParticipantPromise.then((participant) => {
        if (participant) {
            // existe esse nome cadastrado
            return res.sendStatus(409);

            // se nao exixtir esse nome cadastrado vai fazer isso
        }
        const nomeUsuario = {
            name: req.body.name,
            lastStatus: Date.now()
        }
        const promise = db.collection("participants").insertOne(nomeUsuario);
        promise.then(() => {
            return res.sendStatus(201);
        })
            promise.catch(err => {
                return res.status(500).send(err.massage);
            });

    })
    findParticipantPromise.catch((err) => {
            return res.status(500).send(err.message);
        });

})






