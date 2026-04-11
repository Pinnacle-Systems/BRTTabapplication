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
import { pieceReceipt, tableLot,defectEntry, foldingPendinglist, pieceFoldingEntry, pieceVerification, packingSlip } from './src/routes/BRTTab/index.js';

import { initPool, closePool } from "./src/constants/db.connection.js";

const brtconnectionPool = initPool()

const gracefulAppShutdown = async () => {
  console.log('Application shutting down...');

  try {
    console.log("Closing database connections... ");
    await initPool.end();
    console.log("Database connections closed succesfully");
    process.exit(0);
  }
  catch(err) {
    console.error("Error during shutdown... ");
    process.exit(1);
  }
}

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

app.use('/defectEntry',defectEntry)

app.use('/foldingPendinglist',foldingPendinglist)

app.use('/pieceFoldingEntry',pieceFoldingEntry)

app.use('/pieceVerification',pieceVerification)

app.use('/packingSlip',packingSlip)


app.get("/retreiveFile/:fileName", (req, res) => {
  const { fileName } = req.params
  res.sendFile(__dirname + "/uploads/" + fileName);
})

const PORT = 9889;
const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", socketMain);


httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

process.on('SIGINT', gracefulAppShutdown);
process.on('SIGTERM', gracefulAppShutdown);