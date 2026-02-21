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
  const { username, password, roleId } = req.body;
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
    );

    // ⭐ Generated USERID


    // const userLogValues = {
    //   userId,

    //   pieceReceipt: roles.includes("PIECE RECEIPT") ? "Yes" : "No",

    //   tableAndLotAllocation: roles.includes("TABLE AND LOT ALLOCATION")
    //     ? "Yes"
    //     : "No",

    //   defectEntry: roles.includes("DEFECT ENTRY") ? "Yes" : "No",

    //   foldingPendingList: roles.includes("FOLDING PENDING LIST") ? "Yes" : "No",

    //   pieceFoldingEntry: roles.includes("PIECE FOLDING ENTRY") ? "Yes" : "No",

    //   packingSlip: roles.includes("PACKING SLIP") ? "Yes" : "No",

    //   pieceVerification: roles.includes("PIECE VERIFICATION") ? "Yes" : "No",

    // };

    // const tabpagetableSql = `
    //   INSERT INTO TABPAGE (
    //     userId, PIECERECEIPT, TABLEANDLOTALLOCATION, DEFECTENTRY, FOLDINGPENDINGLIST, PIECEFOLDINGENTRY, PACKINGSLIP, PIECEVERIFICATION
    //   ) VALUES (
    //     :userId, :pieceReceipt,:tableAndLotAllocation,:defectEntry,:foldingPendingList, :pieceFoldingEntry, :packingSlip, :pieceVerification
    //   )
    // `;

    // await connection.execute(tabpagetableSql, userLogValues);

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

export async function get(req, res) {
  const connection = await getConnection(res);
  try {
    const sql = `  
 select * from TABUSER
`;

    const result = await connection.execute(sql);


    const resp = result.rows.map((row) => {
      let obj = {};
      result.metaData.forEach(({ name }, idx) => {
        obj[name] = row[idx];
      });
      return obj;
    });
    return res.json({ statusCode: 0, data: resp });
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

// export async function getUserDet(req, res) {
//   const connection = await getConnection(res);

//   try {
//     const { gtCompMastId } = req.query;
//     const result = await connection.execute(`
//       SELECT spuserlog.userName, spuserlog.gtCompMastId, gtCompMast.compname, pcategory
//       FROM spuserlog
//       JOIN gtCompMast ON gtCompMast.gtCompMastId = spuserlog.gtCompMastId
//       JOIN (
//         SELECT pcategory, gtcompprodet.gtCompMastId
//         FROM gtcompprodet
//         JOIN gtpartycatmast ON gtcompprodet.partycat = gtpartycatmast.gtpartycatmastid
//       ) partyCat ON gtCompMast.gtCompMastId = partyCat.gtCompMastId
//       WHERE gtCompMast.gtCompMastId = :gtCompMastId
//     `, { gtCompMastId });
//     const resp = result.rows.map(user => ({
//       userName: user[0], gtCompMastId: user[1], compName: user[2], pCategory: user[3]
//     }));

//     return res.json({ statusCode: 0, data: resp });
//   } catch (err) {
//     console.error('Error retrieving data:', err);
//     res.status(500).json({ error: 'Internal Server Error' });
//   } finally {
//     await connection.close();
//   }
// }

export async function remove(req, res) {
  const connection = await getConnection.apply(res);
  try {
  } catch (err) {}
}

export async function getRoles(req, res) {
  const connection = await getConnection(res);
  try {
    const sql = `  
 select * from roletab
`;

    const result = await connection.execute(sql);


    const resp = result.rows.map((row) => {
      let obj = {};
      result.metaData.forEach(({ name }, idx) => {
        obj[name] = row[idx];
      });
      return obj;
    });
    return res.json({ statusCode: 0, data: resp });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await connection.close();
  }
}

export async function createRole(req, res) {
  const connection = await getConnection();
  const { rolename, checkboxes } = req.body;
  const roles = checkboxes?.map((item) => item.label.toUpperCase());

  if (!rolename ) {
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

    };

    const tabpagetableSql = `
      INSERT INTO TABPAGE (
        ROLEID, PIECERECEIPT, TABLEANDLOTALLOCATION, DEFECTENTRY, FOLDINGPENDINGLIST, PIECEFOLDINGENTRY, PACKINGSLIP, PIECEVERIFICATION
      ) VALUES (
        :roleId, :pieceReceipt,:tableAndLotAllocation,:defectEntry,:foldingPendingList, :pieceFoldingEntry, :packingSlip, :pieceVerification
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