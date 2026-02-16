import axios from "axios";

export async function getSubscriptionDetails() {
    try {
        const response = await axios.get("https://license.pinnaclesystems.co.in/project/getSubscriptionDetails", {
            params: {
                name: 'PSSINC'
            }
        })
        const result = response.data;
        if (result.statusCode === 1) {
            return result;
        }
    } catch (e) {
        return { statusCode: 1, message: "Licensing Server is Down...!!!" }
    }
}