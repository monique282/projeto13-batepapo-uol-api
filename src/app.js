import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import dayjs from "dayjs"

const app = express();
app.use(cors());
app.use(express.json());
dotenv.config();
const horario = dayjs().format('HH:mm:ss');
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
            return console.log([])
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

// adicionar participantes
app.post("/participants", async (req, res) => {

    const { name } = req.body;
    // verificar se o nome esta como uma estringue vazia
    if (!name) return res.sendStatus(422);

    // esse try serve pra requisições se a requisição deu certo roda o try se nao roda o catch
    try {
        // verificar se o nome ja exixte 
        const participantPromise = await db.collection("participants").findOne({ name: name });

        // existe esse nome cadastrado
        if (participantPromise) return res.sendStatus(409);

        // se nao exixtir esse nome cadastrado vai fazer isso
        const nomeUsuario = {
            name: req.body.name,
            lastStatus: Date.now()
        }
        const promise = await db.collection("participants").insertOne(nomeUsuario);
        // adicionar a mensagem em massages
        const messages = {
            from: name,
            to: 'Todos',
            text: 'entra na sala...',
            type: 'status',
            time: horario
        }
        const mensagePromise = await db.collection("messages").insertOne(messages);
        return res.sendStatus(201);

    // esse catch serve pra qualquer requisição que deu erro 
    } catch (err) {
        res.status(500).send(err.massage);
    }

});




// app.post("/messages", (req, res) => {

//     const { to } = req.body;
//     const { text } = req.body;
//     const { type } = req.body;

// })




