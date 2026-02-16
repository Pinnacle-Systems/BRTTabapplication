import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ATER_PRODATA, CREATE_ALLOC_API, CREATE_APPROVAL_ENTRY, GET_LAB_ITEM, LAB_API, LAB_API_PO } from "../Api";
import baseQuery from "./baseQuery";
const BASE_URL = process.env.REACT_APP_SERVER_URL;

const LabApi = createApi({
  reducerPath: "LabReport",
  baseQuery,
  tagTypes: ["LabReport"],
  endpoints: (builder) => ({


    AddLab: builder.mutation({
      query: (payload) => ({
        url: LAB_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["Lab"],
    }),
    getLAb: builder.query({
      query: ({ params }) => {

        return {
          url: LAB_API,
          method: "GET",
          params,
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },

        };
      },
      providesTags: ["Lab"],
    }),
    getLabItem: builder.query({
      query: ({ params }) => {

        return {
          url: GET_LAB_ITEM,
          method: "GET",
          params,
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },

        };
      },
      providesTags: ["Lab"],
    }),
    patchLab: builder.mutation({
      query: (params) => ({
        url: LAB_API_PO,
        method: "PATCH",
        params,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["Lab"],
    }),

    createAllocation: builder.mutation({
      query: (payload) => ({
        url: CREATE_ALLOC_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["CreateAllocation"],
    }),
    getAfter: builder.query({
      query: ({ params }) => {

        return {
          url: ATER_PRODATA,
          method: "GET",
          params,
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },

        };
      },
      providesTags: ["Lab"],
    }),
    addApprovalEntry: builder.mutation({
      query: (payload) => ({
        url: CREATE_APPROVAL_ENTRY,
        method: 'POST',
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      providesTags: ["Lab"],
    }),
  }),
});

export const {
  useAddLabMutation,
  useGetLAbQuery,
  useGetLabItemQuery,
  usePatchLabMutation,
  useCreateAllocationMutation,
  useGetAfterQuery,
  useAddApprovalEntryMutation
} = LabApi;

export default LabApi;
