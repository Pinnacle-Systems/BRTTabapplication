import bcrypt from "bcrypt"
import { getConnection } from "../constants/db.connection.js";
import jwt from "jsonwebtoken";
import { getSubscriptionDetails } from "../utils/subscriptionCall.js";


// export async function login(req, res) {
//   console.log(req.body,"body")
//   const returnData = await getSubscriptionDetails()
//    console.log(returnData,"returnData")
//   const connection = await getConnection(res)
//   const { username, password } = req.body
//   if (!username) return res.json({ statusCode: 1, message: "Username is Required" })
//   if (!password) return res.json({ statusCode: 1, message: "Password is Required" });

//   const result = await connection.execute(`SELECT * FROM SPUSERLOG where username=:username`, { username })
//   if (result.rows.length === 0) return res.json({ statusCode: 1, message: "Username Doesn't Exist" })
//   let storedPassword = result.rows[0][1]
//   let user = result.rows[0][0]
//   console.log(user, 'user');

//   const isMatched = await bcrypt.compare(password, storedPassword)
//   if (!isMatched) return res.json({ statusCode: 1, message: "Password Doesn't Match" })
//    const token = jwt.sign(
//     {
//       user: user,
//     },
//     "RANDOM-TOKEN",
//     { expiresIn: "24h" }
//   );
//   console.log(token, 'token');

//   await connection.close()
//   return res.json({ statusCode: 0, message: "Login Successful", token, user })

// }
export async function login(req, res) {
  const token = jwt.sign(
    { user: "demo" },
    "RANDOM-TOKEN",
    { expiresIn: "24h" }
  );

  return res.json({
    statusCode: 0,
    message: "Login Successful",
    token,
    user: "demo",
  });
}

export async function create(req, res) {
  const connection = await getConnection();
  const { username, password, checkboxes } = req.body;
  const roles = checkboxes.map((item) => item.label.toUpperCase());
  const createdDate = new Date();

  if (!username || !password) {
    return res.json({ statusCode: 1, message: 'Username and Password are Required' });
  }

  try {
    const userNameResult = await connection.execute(
      'SELECT COUNT(*) as count FROM SPUSERLOG WHERE username = :username',
      { username }
    );

    if (userNameResult.rows[0][0] > 0) {
      await connection.close();
      return res.json({ statusCode: 1, message: 'UserName Already Exists' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const userInsertSql = 'INSERT INTO SPUSERLOG(username, password) VALUES (:username, :hashedPassword)';
    await connection.execute(userInsertSql, { username, hashedPassword });

    const userLogValues = {
      username,
      lotPreparation: roles.includes('LOT PREPARATION') ? 1 : 0,
      loading: roles.includes('LOADING') ? 1 : 0,
      unloading: roles.includes('UNLOADING') ? 1 : 0,
      approve: roles.includes('APPROVE') ? 1 : 0,
      revert: roles.includes('REVERT') ? 1 : 0,
      user6: roles.includes('USER') ? 1 : 0,
      createdDate
    };

    const userLogSql = `
      INSERT INTO USERLOG (
        USERNAME, LOTPREPARATION, LOADING, UNLOADING, APPROVE, REVERT, USER6, CREATEDDATE
      ) VALUES (
        :username, :lotPreparation, :loading, :unloading, :approve, :revert, :user6, :createdDate
      )
    `;

    await connection.execute(userLogSql, userLogValues);

    await connection.commit();
    await connection.close();

    return res.json({ statusCode: 0, message: 'User created successfully' });
  } catch (error) {
    console.error(error);
    await connection.close();
    return res.json({ statusCode: 1, message: 'An error occurred while creating the user' });
  }
}


export async function get(req, res) {

  const connection = await getConnection(res)
  try {
    const result = await connection.execute(`
  select *
from spuserlog 
    `)
    const resp = result.rows.map(user => ({ userName: user[0], role: user[1] }))
    return res.json({ statusCode: 0, data: resp })
  }
  catch (err) {
    console.log(err)
    res.status(500).json({ error: 'Internal Server Error' });
  }
  finally {
    await connection.close()
  }
}

export async function getOne(req, res) {
  const connection = await getConnection(res)
  try {
    const { gtCompMastId } = req.query;
    console.log(gtCompMastId, 'id');

    const result = await connection.execute(`
    select userName from spuserlog where gtcompmastid = :gtcompmastid
    `, { gtCompMastId })
    const resp = result.rows.map(user => ({ userName: user[0] }))
    console.log(resp, ' resp');
    return res.json({ statusCode: 0, data: resp })

  }
  catch (err) {
    console.log(err)
    res.status(500).json({ error: 'Internal Server Error' });
  }
  finally {
    await connection.close()
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
  }
  catch (err) {
  }
}











