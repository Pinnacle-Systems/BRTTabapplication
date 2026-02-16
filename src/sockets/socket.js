export function socketMain(client) {
    client.on("login", function (data) {
        console.log(data, 'data');
        client.broadcast.emit(`logout/${data.user}`);
    })
}