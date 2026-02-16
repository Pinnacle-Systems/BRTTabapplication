import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL, CREATE_PRO_ENTRY, IMAGE_UPLOAD, PPRODUCTION_ENTRY, } from "../Api";

import baseQuery from "./baseQuery";

const MachineApi = createApi({
    reducerPath: "ProductionEntry",
    baseQuery,
    tagTypes: ["ProductionEntry"],
    endpoints: (builder) => ({



        getProductionDet: builder.query({
            query: ({ params }) => {

                return {
                    url: PPRODUCTION_ENTRY,
                    method: "GET",
                    params,
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },

                };
            },
            providesTags: ["ProductionEntry"],
        }),

        addProductionEntry: builder.mutation({
            query: (payload) => ({
                url: CREATE_PRO_ENTRY,
                method: 'POST',
                body: payload,
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            }),
            providesTags: ["Lab"],
        }),

        addImageFileName: builder.mutation({
            query: (payload) => {
                const { id, body } = payload;
                return {
                    url: IMAGE_UPLOAD,
                    method: "PATCH",
                    body, id

                }
            },
            invalidatesTags: ["Lab"],
        }),


    }),
});

export const {
    useGetProductionDetQuery,
    useAddProductionEntryMutation,
    useAddImageFileNameMutation
} = MachineApi;

export default MachineApi;
