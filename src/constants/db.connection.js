import { createRequire } from "module";
const require = createRequire(import.meta.url);
const oracledb = require("oracledb");
// oracledb.initOracleClient({ libDir: "C:/oracle/instantclient_19_20" });
oracledb.initOracleClient({ libDir: "/opt/oracle/instantclient_23_6" });

const dbConfig = {
  user: "PSSBRT",
  password: "PSSBRT_JULY2025",
  connectString: "203.95.216.182:1557/avt07p",
};
const brtdbConfig = {
  user: "PSSBRT",
  password: "PSSBRT_JULY2025",
  connectString: "203.95.216.182:1557/avt07p",
  poolMin: 10,         // always keep 10 connections ready
  poolMax: 50,         // handle 40+ users comfortably with buffer
  poolIncrement: 5,    // grow by 5 at a time under load
  poolTimeout: 120,    // close idle connections after 2 minutes
  poolPingInterval: 60, // check connections are alive every 60s
  queueTimeout: 10000, // if no connection free in 10s → throw error
  queueMax: 100,  
};

let pool;

export async function initPool() {
  try {
    pool = await oracledb.createPool(brtdbConfig);
    console.log("Oracle connection pool created successfully");
  } catch (err) {
    console.error("Failed to create Oracle pool:", err);
    process.exit(1); // stop server if DB pool fails at startup
  }
}
// export async function getConnection(res) {
//   let connection;
//   console.log("connection called");
//   try {
//     connection = await oracledb.getConnection({
//       user: dbConfig.user,
//       password: dbConfig.password,
//       connectString: dbConfig.connectString,
//     });
//     return connection;
//   } catch (err) {
//     console.log(err, "err");

//     return res.json({
//       statusCode: 1,
//       message: "Database Connection Failed",
//       err,
//     });
//   }
// }
export async function getConnection() {
  if (!pool) {
    throw new Error("Pool not initialized. Call initPool() first.");
  }
  try {
    return await pool.getConnection();
  } catch (err) {
    // queueTimeout exceeded — too many concurrent users
    if (err.message.includes("NJS-040") || err.message.includes("NJS-076")) {
      throw new Error("Server busy. Please try again shortly.");
    }
    throw err;
  }
}

// Call this when server shuts down
export async function closePool() {
  try {
    await pool.close(10); // wait 10s for active connections to finish
    console.log("Oracle pool closed");
  } catch (err) {
    console.error("Error closing pool:", err);
  }
}