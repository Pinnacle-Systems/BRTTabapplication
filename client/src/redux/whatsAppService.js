// src/features/whatsapp/whatsappApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = 'https://bot.brandlabindia.com/api/rest/send_message';

const WhatsAppApi = createApi({
    reducerPath: 'WhatsAppApi',
    baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
    endpoints: (builder) => ({
        sendWhatsAppMessage: builder.mutation({
            query: ({ phoneNumber, message }) => ({
                url: '',
                method: 'GET',
                params: {
                    method: 'SendMessage',
                    format: 'json',
                    v: '1.1',
                    auth_scheme: 'plain',
                    msg_type: 'Text',
                    send_to: phoneNumber,
                    msg: message,
                    Authorization: 'a0b44b56c2ed46ae8d8d78eb967f3ee9ba860202881f3621d79ffa55ce66af28',
                },
            }),
        }),
    }),
});

export const { useSendWhatsAppMessageMutation } = WhatsAppApi;

export default WhatsAppApi;
