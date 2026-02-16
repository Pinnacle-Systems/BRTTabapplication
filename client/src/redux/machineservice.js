import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { MACHINE_MASTER, MACHINE_ALLOCATION_API, CREATE_ALLOCATION_ENTRY, DELETE_ALLOCATION } from "../Api";
import baseQuery from "./baseQuery";
const BASE_URL = process.env.REACT_APP_SERVER_URL;

const MachineApi = createApi({
  reducerPath: "machine_Mast",
  baseQuery,
  tagTypes: ["Machine"],
  endpoints: (builder) => ({



    getMachine: builder.query({
      query: () => {

        return {
          url: MACHINE_MASTER,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },

        };
      },
      providesTags: ["Machine_Mast"],
    }),
    getAllocation: builder.query({
      query: ({ params }) => {
        return {
          url: MACHINE_ALLOCATION_API,
          method: "GET",
          params,

          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["Machine_Allocate"],
    }),

    addAllocationEntry: builder.mutation({
      query: (payload) => ({
        url: CREATE_ALLOCATION_ENTRY,
        method: 'POST',
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      providesTags: ["deleteAllocation"],
    }),
    deleteAllocation: builder.mutation({
      query: (params) => ({
        url: DELETE_ALLOCATION,
        method: "PATCH",
        params,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["deleteAllocation"],
    }),
  }),
});

export const {
  useGetMachineQuery,
  useGetAllocationQuery,
  useAddAllocationEntryMutation,
  useDeleteAllocationMutation
} = MachineApi;

export default MachineApi;
