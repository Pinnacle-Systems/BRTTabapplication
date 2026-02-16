import { createRequire } from "module";
const require = createRequire(import.meta.url);
const oracledb = require('oracledb');
// oracledb.initOracleClient({ libDir: process.env.ORACLE_CLIENT_PATH });
oracledb.initOracleClient({ libDir: "C:/oracle/instantclient_19_20" });
// oracledb.initOracleClient({ libDir: "/opt/oracle/instantclient_23_6" });
//alagendra
// const dbConfig = {
//       user: "PSSAGD",
//       password: "PSSAGD_JAN2026",
//       // connectString: "203.95.216.155:1555/AVT05p",
//       connectString: "120.138.14.169:1555/Alg01p",

// };
//BRT
const dbConfig = {
      user: "PSSBRT",
      password: "PSSBRT_JULY2025",
      // connectString: "203.95.216.155:1555/AVT05p",
      connectString: "203.95.216.182:1557/avt07p",

};
export async function getConnection(res) {
      let connection;
      console.log("connection called")
      try {
            connection = await oracledb.getConnection({
                  user: dbConfig.user,
                  password: dbConfig.password,
                  connectString: dbConfig.connectString
            });
            return connection
      } catch (err) {
            console.log(err, 'err');

            return res.json({ statusCode: 1, message: "Database Connection Failed", err })

      }
}
