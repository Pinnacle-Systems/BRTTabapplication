
const myHeaders = new Headers();
myHeaders.append("Authorization", "App 2b6adc380c6649498207f1e1b9385f05-c42b4311-4159-438a-8513-1096c35767d6");
myHeaders.append("Content-Type", "application/json");
myHeaders.append("Accept", "application/json");

const raw = JSON.stringify({
    "messages": [
        {
            "from": "919787291234",
            "to": "919787291234",
            "messageId": "4a3a39e2-7edd-4561-8462-7aa4aba92a92",
            "content": {
                "templateName": "message_test",
                "templateData": {
                    "body": {
                        "placeholders": ["Pinnacle"]
                    }
                },
                "language": "en"
            }
        }
    ]
});

const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow"
};

fetch("https://6gkl15.api.infobip.com/whatsapp/1/message/template", requestOptions)
    .then((response) => response.text())
    .then((result) => console.log(result))
    .catch((error) => console.error(error));