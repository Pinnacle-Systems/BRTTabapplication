import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import {

  createMsg,
  labApproval,
  productionEntry,
  users,lotprepare,loading,contractor,machine,unloading,stop,approval,revert,branch,userslog,inspection

} from "./src/routes/index.js"
import { Server } from 'socket.io';
import { createServer } from 'http';
import { socketMain } from './src/sockets/socket.js';
import { pieceReceipt, tableLot } from './src/routes/BRTTab/index.js';
const app = express()
app.use(express.json())

app.use(cors())

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const path = __dirname + '/client/build/';

app.use(express.static(path));

app.get('/', function (req, res) {
  res.sendFile(path + "index.html");
});

BigInt.prototype['toJSON'] = function () {
  return parseInt(this.toString());
};

app.use("/users", users)

app.use("/userslog", userslog)


app.use("/labApproval", labApproval)

app.use("/msg", createMsg)

app.use('/productionEntry', productionEntry)

app.use('/lotprepare',lotprepare)

app.use('/loading',loading)

app.use('/stop',stop)

app.use('/unloading',unloading)

app.use ('/approval',approval)

app.use ('/revert',revert)

app.use('/inspection',inspection)


app.use('/contractor',contractor)
app.use('/machine',machine)

app.use('/branch',branch)
app.use('/pieceReceipt',pieceReceipt)
app.use('/tableLot',tableLot)

app.get("/retreiveFile/:fileName", (req, res) => {
  const { fileName } = req.params
  res.sendFile(__dirname + "/uploads/" + fileName);
})

const PORT = 9889;
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", socketMain);


httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
