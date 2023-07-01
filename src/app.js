import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import dayjs from "dayjs";
import joi from "joi";

const app = express();
app.use(cors());
app.use(express.json());
dotenv.config();
const port = 5000;

let nomePessoaLogada = "";
let participantes = [];
// cerve pra deixar a aplicação ligada na porta escolhida
app.listen(port, () => console.log(`servidor esta rodando na porta ${port}`));
// conexão com o banco de dados
const mongoClient = new MongoClient(process.env.DATABASE_URL);
let db;
mongoClient.connect()
    .then(() => db = mongoClient.db())
    .catch((err) => console.log(err.message));
let listaPaticipantes = [];
//buscando a lista de participantes
app.get("/participants", (red, res) => {
    const promise = db.collection("participants").find().toArray()
    promise.then(participants => {
        if (participants.length === 0) {
            return res.send([]);
        } else {
            listaPaticipantes = participants.slice();
            return res.send(listaPaticipantes);
        }
    })
    promise.catch(err => {
        return res.status(500).send(err.message);
    })
});

// adicionar participantes
app.post("/participants", async (req, res) => {
    const { name } = req.body;

    // verificar se o nome esta como uma estringue vazia
    const seNaoTemNome = joi.object({
        name: joi.string().min(1).required()
    })
    const validarNome = seNaoTemNome.validate(req.body, { abortEarly: false });
    // o abortEarly ser pra procurar todos os requisitos que nao passou no joi
    if (validarNome.error) {
        const erroNome = validarNome.error.details.map(qual => qual.message);
        return res.status(422).send(erroNome);
    }

    // esse try serve pra requisições, se a requisição deu certo roda o try se nao roda o catch
    try {
        // verificar se o nome ja exixte 
        const participantPromise = await db.collection("participants").findOne({ name: name });

        // existe esse nome cadastrado
        if (participantPromise) return res.sendStatus(409);

        // se nao exixtir esse nome cadastrado vai fazer isso
        const nomeUsuario = {
            name: req.body.name,
            lastStatus: Date.now()
        };
        nomePessoaLogada = req.body.name;
        const promise = await db.collection("participants").insertOne(nomeUsuario);

        // adicionar a massages em massages
        const messages = {
            from: name,
            to: 'Todos',
            text: 'entra na sala...',
            type: 'status',
            time: dayjs().format('HH:mm:ss')
        }
        await db.collection("messages").insertOne(messages);
        return res.sendStatus(201);

        // esse catch serve pra qualquer requisição que deu erro 
    } catch (err) {
        res.status(500).send(err.message);
    }
});


app.post("/messages", async (req, res) => {

    const { to, text, type } = req.body;
    const { user } = req.headers;

    // verificar se os estao validos
    const camposDasMensagens = joi.object({
        to: joi.string().min(1).required(),
        text: joi.string().min(1).required(),
        type: joi.valid('message', 'private_message').required()
    })

    const validarCamposDasMensagens = camposDasMensagens.validate(req.body, { abortEarly: false });
    // o abortEarly ser pra procurar todos os requisitos que nao passou no joi
    if (validarCamposDasMensagens.error) {
        const errocamposDasMensagens = validarCamposDasMensagens.error.details.map(qual => qual.message);
        return res.status(422).send(errocamposDasMensagens);
    }

    try {
        //pega a lista de participantes
        const participantsCollection = db.collection('participants');

        // verifica se o participante existe na lista de participantes
        const participantExists = await participantsCollection.findOne({ participantsCollection: { $in: [user] } });

        // ele nao ta na lista
        if (!participantExists) {
            return res.status(422).send({ error: 'Remetente não encontrado na lista de participantes.' });
        }

        // ele ta na lista
        const listaParaEnviar = {
            from: participantExists.name,
            to: to,
            text: text,
            type: type,
            time: dayjs().format('HH:mm:ss')
        }

        await db.collection("messages").insertOne(listaParaEnviar);
        return res.sendStatus(201);


    } catch (err) {
        res.status(500).send(err.message);
    }
})

app.get("/messages", (red, res) => {

    // so vai aparecer na tela dele 
    // o que for todos
    // o que for private_message que foi enviado por ele e o que que foi recebido pra ele

    const promise = db.collection("messages").find().toArray()
    promise.then(mensagens => {
        if (mensagens.length === 0) {
            return res.send([]);
        } else {
            // Filtrar os objetos com "type" igual a "status"
            const statusMessagens = mensagens.filter(obj => obj.to === "todos");
            const messagensPrivadasEnviadasPorLogado = statusMessagens.filter(obj => obj.from === nomePessoaLogada);
            // listaPaticipantes = participants.slice();
            // console.log(listaPaticipantes);
            // console.log(statusMessages);
            return res.send(messagensPrivadasEnviadasPorLogado);
        }
    })
    promise.catch(err => {
        return res.status(500).send(err.message);
    })

});




