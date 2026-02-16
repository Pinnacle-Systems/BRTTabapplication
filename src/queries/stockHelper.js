export async function deleteYarnStock(connection, docId) {
    return await connection.execute(`
        delete from gtyarnstockmast where docId='${docId}'`)
}