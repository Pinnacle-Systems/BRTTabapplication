import twilio from 'twilio';

const accountSid = process.env.accountSid;
const authToken = process.env.authToken;

const client = twilio(accountSid, authToken);

export async function createMsg(req, res) {
    const { from, toNumbers, body } = req.body;
    console.log(from, toNumbers, body, '134');
    try {
        const results = await Promise.all(toNumbers.map(async (to) => {
            const message = await client.messages.create({
                body,
                from,
                to
            });
            return message.sid;
        }));
        console.log(results, 'result');
        return res.json({ statusCode: 0, data: results });
    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
        return res.status(500).json({ statusCode: 1, error: 'Failed to send messages' });
    }
}
