import bcrypt from "bcrypt";
import { getConnection } from "../constants/db.connection.js";
import jwt from "jsonwebtoken";
import { getSubscriptionDetails } from "../utils/subscriptionCall.js";
import oracledb from "oracledb";

export async function login(req, res) {
  console.log(req.body, "body");
  // const returnData = await getSubscriptionDetails()
  const connection = await getConnection(res);
  const { username, password } = req.body;
  if (!username)
    return res.json({ statusCode: 1, message: "Username is Required" });
  if (!password)
    return res.json({ statusCode: 1, message: "Password is Required" });

  const result = await connection.execute(
    `SELECT * FROM TABUSER where  UPPER(USERNAME) = UPPER(:username)`,
    { username },
  );
  if (result.rows.length === 0)
    return res.json({ statusCode: 1, message: "Username Doesn't Exist" });
  let storedPassword = result.rows[0][2];
  console.log(result, "resultuser");
  console.log(password, storedPassword, "storedPassword");
  // let user = result.rows[0][0];
  const user = result.rows.map((row) => {
    let obj = {};
    result.metaData.forEach(({ name }, idx) => {
      obj[name] = row[idx];
    });
    return obj;
  });
  console.log(user, "user");

  const isMatched = await bcrypt.compare(password, storedPassword);
  if (!isMatched)
    return res.json({ statusCode: 1, message: "Password Doesn't Match" });
  const token = jwt.sign(
    {
      user: user,
    },
    "RANDOM-TOKEN",
    { expiresIn: "24h" },
  );
  console.log(token, "token");

  await connection.close();
  return res.json({ statusCode: 0, message: "Login Successful", token, user });
}

export async function create(req, res) {
  const connection = await getConnection();
  const { username, password, roleId ,companyList } = req.body;
  // const roles = checkboxes?.map((item) => item.label.toUpperCase());

  if (!username || !password) {
    return res.json({
      statusCode: 1,
      message: "Username and Password are Required",
    });
  }

  try {
    const userNameResult = await connection.execute(
      "SELECT COUNT(*) as count FROM TABUSER WHERE username = :username",
      { username },
    );

    if (userNameResult.rows[0][0] > 0) {
      await connection.close();
      return res.json({ statusCode: 1, message: "UserName Already Exists" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log(username, hashedPassword, "username,hashedPassword");
    const result = await connection.execute(
      `INSERT INTO TABUSER (USERNAME, PASSWORD,ROLEID)
       VALUES (:username, :password,:roleId)
       `,
      {
        username,
        password: hashedPassword,
        roleId,
      },
      { autoCommit: false } 
    );


    const userResult = await connection.execute(
  `SELECT USERID FROM TABUSER WHERE USERNAME = :username`,
  { username }
);

const userId = userResult.rows[0][0];

const companyInserts = companyList.map((comp) =>
  connection.execute(
    `INSERT INTO TABUSERGRID (USERID, COMPCODE)
     VALUES (:userId, :companyId)`,
    { userId, companyId: comp.value },
    { autoCommit: false }
  )
);
await Promise.all(companyInserts);

    await connection.commit();
    await connection.close();

    return res.json({ statusCode: 0, message: "User created successfully" });
  } catch (error) {
    console.error(error);
    await connection.close();
    return res.json({
      statusCode: 1,
      message: "An error occurred while creating the user",
    });
  }
}
// export async function update(req, res) {
//   const connection = await getConnection();
//   const { userId } = req.params;
//   const { username, password, roleId } = req.body;

//   if (!username || !roleId) {
//     return res.json({
//       statusCode: 1,
//       message: "Username and Role are Required",
//     });
//   }

//   try {
//     // Check if username already exists for a DIFFERENT user
//     const userNameResult = await connection.execute(
//       "SELECT COUNT(*) as count FROM TABUSER WHERE USERNAME = :username AND USERID != :userId",
//       { username, userId },
//     );

//     if (userNameResult.rows[0][0] > 0) {
//       await connection.close();
//       return res.json({ statusCode: 1, message: "Username Already Exists" });
//     }

//     // If password provided, hash it; otherwise keep existing
//     if (password) {
//       const saltRounds = 10;
//       const hashedPassword = await bcrypt.hash(password, saltRounds);

//       await connection.execute(
//         `UPDATE TABUSER 
//          SET USERNAME = :username, 
//              PASSWORD = :password, 
//              ROLEID = :roleId 
//          WHERE USERID = :userId`,
//         { username, password: hashedPassword, roleId, userId },
//       );
//     } else {
//       // ← No password change
//       await connection.execute(
//         `UPDATE TABUSER 
//          SET USERNAME = :username, 
//              ROLEID = :roleId 
//          WHERE USERID = :userId`,
//         { username, roleId, userId },
//       );
//     }

//     await connection.commit();
//     await connection.close();

//     return res.json({ statusCode: 0, message: "User updated successfully" });
//   } catch (error) {
//     console.error(error);
//     await connection.close();
//     return res.json({
//       statusCode: 1,
//       message: "An error occurred while updating the user",
//     });
//   }
// }


export async function update(req, res) {
  const connection = await getConnection();
  const { userId } = req.params;
  const { username, password, roleId, companyList } = req.body; // ← added companyArray

  if (!username || !roleId) {
    return res.json({
      statusCode: 1,
      message: "Username and Role are Required",
    });
  }

  try {
    // Check if username already exists for a DIFFERENT user
    const userNameResult = await connection.execute(
      "SELECT COUNT(*) as count FROM TABUSER WHERE USERNAME = :username AND USERID != :userId",
      { username, userId },
    );

    if (userNameResult.rows[0][0] > 0) {
      await connection.close();
      return res.json({ statusCode: 1, message: "Username Already Exists" });
    }

    // If password provided, hash it; otherwise keep existing
    if (password) {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      await connection.execute(
        `UPDATE TABUSER 
         SET USERNAME = :username, 
             PASSWORD = :password, 
             ROLEID = :roleId 
         WHERE USERID = :userId`,
        { username, password: hashedPassword, roleId, userId },
        { autoCommit: false }, // ← keep transaction open
      );
    } else {
      await connection.execute(
        `UPDATE TABUSER 
         SET USERNAME = :username, 
             ROLEID = :roleId 
         WHERE USERID = :userId`,
        { username, roleId, userId },
        { autoCommit: false }, // ← keep transaction open
      );
    }

    // Update TABUSERGRID — delete old companies then re-insert
    if (companyList && companyList.length > 0) {
      // Delete existing company records for this user
      await connection.execute(
        `DELETE FROM TABUSERGRID WHERE USERID = :userId`,
        { userId },
        { autoCommit: false },
      );

      // Re-insert updated company list
      for (const companyId of companyList) {
        await connection.execute(
          `INSERT INTO TABUSERGRID (USERID, COMPCODE)
           VALUES (:userId, :companyId)`,
          { userId, companyId : companyId.value },
          { autoCommit: false },
        );
      }
    }

    await connection.commit();
    await connection.close();

    return res.json({ statusCode: 0, message: "User updated successfully" });
  } catch (error) {
    console.error(error);
    await connection.rollback(); // ← rollback on error
    await connection.close();
    return res.json({
      statusCode: 1,
      message: "An error occurred while updating the user",
    });
  }
}

// export async function get(req, res) {
//   const connection = await getConnection(res);
//   try {
//     const sql = `  
// select A.USERNAME,B.ROLENAME,A.ROLEID,A.USERID from  TABUSER A
//  left join roletab B ON A.ROLEID = B.ROLEID`;

//     const result = await connection.execute(sql);

//     const resp = result.rows.map((row) => {
//       let obj = {};
//       result.metaData.forEach(({ name }, idx) => {
//         obj[name] = row[idx];
//       });
//       return obj;
//     });
//     return res.json({ statusCode: 0, data: resp });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ error: "Internal Server Error" });
//   } finally {
//     await connection.close();
//   }
// }

export async function get(req, res) {
  const connection = await getConnection(res);
  try {
    const sql = `
      SELECT 
        A.USERNAME,
        B.ROLENAME,
        A.ROLEID,
        A.USERID,
        C.COMPCODE,
        C.TABUSERGRIDID,
        D.COMPCODE AS COMPANYCODE
      FROM TABUSER A
      LEFT JOIN ROLETAB B ON A.ROLEID = B.ROLEID
      LEFT JOIN TABUSERGRID C ON A.USERID = C.USERID
      LEFT JOIN GTCOMPMAST D ON C.COMPCODE = D.GTCOMPMASTID
    `;

    const result = await connection.execute(sql);

    // Map rows using metaData
    const rows = result.rows.map((row) => {
      let obj = {};
      result.metaData.forEach(({ name }, idx) => {
        obj[name] = row[idx];
      });
      return obj;
    });



    // Group COMPANYID array under each user
    const usersMap = {};

    for (const row of rows) {
      const uid = row.USERID;

      if (!usersMap[uid]) {
        usersMap[uid] = {
          USERID: row.USERID,
          USERNAME: row.USERNAME,
          ROLEID: row.ROLEID,
          ROLENAME: row.ROLENAME,
          companyList: [],
        };
      }

      if (row.COMPCODE) {
        usersMap[uid].companyList.push({  label: row.COMPANYCODE, value: row.COMPCODE }); 
      }
    }

    return res.json({ statusCode: 0, data: Object.values(usersMap) });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await connection.close();
  }
}

export async function getOne(req, res) {
  const connection = await getConnection(res);
  try {
    const { gtCompMastId } = req.query;
    console.log(gtCompMastId, "id");

    const result = await connection.execute(
      `
    select userName from spuserlog where gtcompmastid = :gtcompmastid
    `,
      { gtCompMastId },
    );
    const resp = result.rows.map((user) => ({ userName: user[0] }));
    console.log(resp, " resp");
    return res.json({ statusCode: 0, data: resp });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await connection.close();
  }
}

export async function getUserDet(req, res) {
  const connection = await getConnection(res);

  try {
    const { gtCompMastId } = req.query;
    const result = await connection.execute(`
      SELECT spuserlog.userName, spuserlog.gtCompMastId, gtCompMast.compname, pcategory
      FROM spuserlog
      JOIN gtCompMast ON gtCompMast.gtCompMastId = spuserlog.gtCompMastId
      JOIN (
        SELECT pcategory, gtcompprodet.gtCompMastId
        FROM gtcompprodet
        JOIN gtpartycatmast ON gtcompprodet.partycat = gtpartycatmast.gtpartycatmastid
      ) partyCat ON gtCompMast.gtCompMastId = partyCat.gtCompMastId
      WHERE gtCompMast.gtCompMastId = :gtCompMastId
    `, { gtCompMastId });
    const resp = result.rows.map(user => ({
      userName: user[0], gtCompMastId: user[1], compName: user[2], pCategory: user[3]
    }));

    return res.json({ statusCode: 0, data: resp });
  } catch (err) {
    console.error('Error retrieving data:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await connection.close();
  }
}

export async function remove(req, res) {
  const connection = await getConnection.apply(res);
  try {
  } catch (err) {}
}

export async function createRole(req, res) {
  const connection = await getConnection();
  const { rolename, checkboxes } = req.body;
  const roles = checkboxes?.map((item) => item.label.toUpperCase());

  if (!rolename) {
    return res.json({
      statusCode: 1,
      message: "RoleName is Required",
    });
  }

  try {
    const roleNameResult = await connection.execute(
      "SELECT COUNT(*) as count FROM roletab WHERE rolename = :rolename",
      { rolename },
    );

    if (roleNameResult.rows[0][0] > 0) {
      await connection.close();
      return res.json({ statusCode: 1, message: "RoleName Already Exists" });
    }

    const result = await connection.execute(
      `INSERT INTO ROLETAB (ROLENAME)
       VALUES (:rolename)
       RETURNING ROLEID INTO :roleId`,
      {
        rolename,
        roleId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      },
    );

    // ⭐ Generated USERID
    const roleId = result.outBinds.roleId[0];

    console.log("New ROLEID:", roleId);

    const userLogValues = {
      roleId,

      pieceReceipt: roles.includes("PIECE RECEIPT") ? "Yes" : "No",

      tableAndLotAllocation: roles.includes("TABLE AND LOT ALLOCATION")
        ? "Yes"
        : "No",

      defectEntry: roles.includes("DEFECT ENTRY") ? "Yes" : "No",

      foldingPendingList: roles.includes("FOLDING PENDING LIST") ? "Yes" : "No",

      pieceFoldingEntry: roles.includes("PIECE FOLDING ENTRY") ? "Yes" : "No",

      packingSlip: roles.includes("PACKING SLIP") ? "Yes" : "No",

      pieceVerification: roles.includes("PIECE VERIFICATION") ? "Yes" : "No",

      clothDelivery: roles.includes("CLOTH DELIVERY") ? "Yes" : "No", // ← add
      stockVerification: roles.includes("STOCK VERIFICATION") ? "Yes" : "No", // ← add
      dispatchVerification: roles.includes("DISPATCH VERIFICATION")
        ? "Yes"
        : "No", // ← add
    };

    const tabpagetableSql = `
      INSERT INTO TABPAGE (
        ROLEID, PIECERECEIPT, TABLEANDLOTALLOCATION, DEFECTENTRY, FOLDINGPENDINGLIST, PIECEFOLDINGENTRY, PACKINGSLIP, PIECEVERIFICATION,CLOTHDELIVERY, STOCKVERIFICATION, DISPATCHVERIFICATION
      ) VALUES (
        :roleId, :pieceReceipt,:tableAndLotAllocation,:defectEntry,:foldingPendingList, :pieceFoldingEntry, :packingSlip, :pieceVerification,
        :clothDelivery, :stockVerification, :dispatchVerification
      )
    `;

    await connection.execute(tabpagetableSql, userLogValues);

    await connection.commit();
    await connection.close();

    return res.json({ statusCode: 0, message: "Role created successfully" });
  } catch (error) {
    console.error(error);
    await connection.close();
    return res.json({
      statusCode: 1,
      message: "An error occurred while creating the role",
    });
  }
}

export async function getRoles(req, res) {

  console.log("Fetching roles with permissions...",);

  const connection = await getConnection();
  try {
    const result = await connection.execute(
      `SELECT 
        r.ROLEID, 
        r.ROLENAME,
        p.PIECERECEIPT,
        p.TABLEANDLOTALLOCATION,
        p.DEFECTENTRY,
        p.FOLDINGPENDINGLIST,
        p.PIECEFOLDINGENTRY,
        p.PACKINGSLIP,
        p.PIECEVERIFICATION,
         p.CLOTHDELIVERY, p.STOCKVERIFICATION, p.DISPATCHVERIFICATION 
      FROM ROLETAB r
      LEFT JOIN TABPAGE p ON p.ROLEID = r.ROLEID
      ORDER BY r.ROLEID`,
    );

    const rows = result.rows.map((row) => ({
      ROLEID: row[0],
      ROLENAME: row[1],
      PIECERECEIPT: row[2],
      TABLEANDLOTALLOCATION: row[3],
      DEFECTENTRY: row[4],
      FOLDINGPENDINGLIST: row[5],
      PIECEFOLDINGENTRY: row[6],
      PACKINGSLIP: row[7],
      PIECEVERIFICATION: row[8],
      CLOTHDELIVERY: row[9], // ← add
      STOCKVERIFICATION: row[10], // ← add
      DISPATCHVERIFICATION: row[11],
    }));

    await connection.close();
    return res.json({ statusCode: 0, data: rows });
  } catch (error) {
    console.error(error);
    await connection.close();
    return res.json({ statusCode: 1, message: "Error fetching roles" });
  }
}

export async function updateRole(req, res) {
  const connection = await getConnection();
  const { roleId } = req.params;
  const { rolename, checkboxes } = req.body;
  const roles = checkboxes?.map((item) => item.label.toUpperCase());

  if (!rolename) {
    return res.json({ statusCode: 1, message: "RoleName is Required" });
  }

  try {
    const roleNameResult = await connection.execute(
      "SELECT COUNT(*) as count FROM ROLETAB WHERE ROLENAME = :rolename AND ROLEID != :roleId",
      { rolename, roleId },
    );

    if (roleNameResult.rows[0][0] > 0) {
      await connection.close();
      return res.json({ statusCode: 1, message: "RoleName Already Exists" });
    }

    await connection.execute(
      `UPDATE ROLETAB SET ROLENAME = :rolename WHERE ROLEID = :roleId`,
      { rolename, roleId },
    );

    await connection.execute(
      `UPDATE TABPAGE SET
        PIECERECEIPT          = :pieceReceipt,
        TABLEANDLOTALLOCATION = :tableAndLotAllocation,
        DEFECTENTRY           = :defectEntry,
        FOLDINGPENDINGLIST    = :foldingPendingList,
        PIECEFOLDINGENTRY     = :pieceFoldingEntry,
        PACKINGSLIP           = :packingSlip,
        PIECEVERIFICATION     = :pieceVerification,
        CLOTHDELIVERY         = :clothDelivery,
        STOCKVERIFICATION     = :stockVerification,
        DISPATCHVERIFICATION  = :dispatchVerification
      WHERE ROLEID = :roleId`,
      {
        roleId,
        pieceReceipt: roles.includes("PIECE RECEIPT") ? "Yes" : "No",
        tableAndLotAllocation: roles.includes("TABLE AND LOT ALLOCATION")
          ? "Yes"
          : "No",
        defectEntry: roles.includes("DEFECT ENTRY") ? "Yes" : "No",
        foldingPendingList: roles.includes("FOLDING PENDING LIST")
          ? "Yes"
          : "No",
        pieceFoldingEntry: roles.includes("PIECE FOLDING ENTRY") ? "Yes" : "No",
        packingSlip: roles.includes("PACKING SLIP") ? "Yes" : "No",
        pieceVerification: roles.includes("PIECE VERIFICATION") ? "Yes" : "No",
        clothDelivery: roles.includes("CLOTH DELIVERY") ? "Yes" : "No", // ← was missing
        stockVerification: roles.includes("STOCK VERIFICATION") ? "Yes" : "No", // ← was missing
        dispatchVerification: roles.includes("DISPATCH VERIFICATION")
          ? "Yes"
          : "No", // ← was missing
      },
    );

    await connection.commit();
    await connection.close();
    return res.json({ statusCode: 0, message: "Role updated successfully" });
  } catch (error) {
    console.error(error);
    await connection.close();
    return res.json({ statusCode: 1, message: "Error updating role" });
  }
}

export async function getOneUser(req, res) {
  const connection = await getConnection(res);
  try {
    const  userId = req.params.id;
    console.log(userId, "userIdddd");






    const result = await connection.execute(
      `
      SELECT 
        A.USERID,
        A.USERNAME,
        A.ROLEID,
        B.ROLENAME,
        B.ROLENAME,
        D.COMPCODE AS COMPNAME,
        D.GTCOMPMASTID AS COMPCODE
      FROM TABUSER A
      LEFT JOIN ROLETAB B ON A.ROLEID = B.ROLEID
      LEFT JOIN TABUSERGRID C ON C.USERID = A.USERID
      LEFT JOIN GTCOMPMAST D ON D.GTCOMPMASTID = C.COMPCODE
      WHERE A.USERID = :userId
      `,
      { userId },
    );

    const rows = result.rows.map((row) => {
      let obj = {};
      result.metaData.forEach(({ name }, idx) => {
        obj[name] = row[idx];
      });
      return obj;
    });

    console.log(rows, "resultuser");

    // Group companies under single user object
    const user = {
      USERID: rows[0].USERID,
      USERNAME: rows[0].USERNAME,
      ROLEID: rows[0].ROLEID,
      ROLENAME: rows[0].ROLENAME,
      COMPANIES: rows
        .filter((row) => row.COMPCODE !== null)
        .map((row) => ({ COMPCODE: row.COMPCODE ,COMPNAME : row.COMPNAME , GTCOMPMASTID : row.COMPCODE })),
    };

    console.log(user, "resp");
    return res.json({ statusCode: 0, data: user });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await connection.close();
  }
}