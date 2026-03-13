import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { FOLDINGPENINDAPI } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const foldingPendingApi = createApi({
  reducerPath: "foldingPending",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["foldingPending"],
  endpoints: (builder) => ({
    getGradeMaster: builder.query({
      query: (arg) => {
        const { params, searchParams } = arg || {}; // 👈 FIX HERE

        if (searchParams) {
          return {
            url: FOLDINGPENINDAPI + "/search/" + searchParams,
            method: "GET",
            params,
          };
        }

        return {
          url: `${FOLDINGPENINDAPI}/getGrade`,
          method: "GET",
          params,
        };
      },
      providesTags: ["foldingPending"],
    }),
    // getLotPieceReceiptDetails: builder.query({
    //   query: (selectedLotId) => ({
    //     url: `${FOLDINGPENINDAPI}/${selectedLotId}/lotReceiptDetails`,
    //     method: "GET",
    //     headers: {
    //       "Content-type": "application/json; charset=UTF-8",
    //     },
    //   }),
    //   providesTags: ["foldingPending"],
    // }),

    getFoldingPending: builder.query({
      query: (arg) => {
        const { params, searchParams } = arg || {}; // 👈 FIX HERE

        if (searchParams) {
          return {
            url: FOLDINGPENINDAPI + "/search/" + searchParams,
            method: "GET",
            params,
          };
        }

        return {
          url: FOLDINGPENINDAPI,
          method: "GET",
          params,
        };
      },
      providesTags: ["foldingPending"],
    }),

    getFoldingPendingById: builder.query({
      query: ({ lotNo }) => {
        return {
          url: `${FOLDINGPENINDAPI}/${lotNo}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["foldingPending"],
    }),
    addFoldingPending: builder.mutation({
      query: (payload) => ({
        url: FOLDINGPENINDAPI,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["foldingPending"],
    }),
    updateFoldingPending: builder.mutation({
      query: (payload) => {
        const { selectedLotId, selectedGridId, ...body } = payload;
        return {
          url: `${FOLDINGPENINDAPI}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["foldingPending"],
    }),
    getDefects: builder.query({
      query: ({ subGridId }) => {
        return {
          url: `${FOLDINGPENINDAPI}/${subGridId}/getDefects`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["foldingPending"],
    }),
    deleteFoldingPending: builder.mutation({
      query: (id) => ({
        url: `${FOLDINGPENINDAPI}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["foldingPending"],
    }),
  }),
});

export const {
  useGetFoldingPendingQuery,
  useGetFoldingPendingByIdQuery,
  useAddFoldingPendingMutation,
  useUpdateFoldingPendingMutation,
  useGetDefectsQuery,
  useDeleteFoldingPendingMutation,

  useGetGradeMasterQuery,
} = foldingPendingApi;

export default foldingPendingApi;
