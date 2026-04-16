import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { PIECEVERIFICATIONAPI } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const pieceVerificationApi = createApi({
  reducerPath: "pieceVerificationApi",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["pieceVerificationApi"],
  endpoints: (builder) => ({
    getLots: builder.query({
      query: (arg) => {
        const { params, searchParams } = arg || {};

        if (searchParams) {
          return {
            url: PIECEVERIFICATIONAPI + "/search/" + searchParams,
            method: "GET",
            params,
          };
        }

        return {
          url: `${PIECEVERIFICATIONAPI}/getLotNo`,
          method: "GET",
          params,
        };
      },
      providesTags: ["pieceVerificationApi"],
    }),

    getFold: builder.query({
      query: ({ lotNo }) => ({
        url: `${PIECEVERIFICATIONAPI}/${lotNo}/getFold`,
        method: "GET",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      providesTags: ["pieceVerificationApi"],
    }),
    getlotDetails: builder.query({
      query: ({ pieceId }) => ({
        url: `${PIECEVERIFICATIONAPI}/${pieceId}/getLotDetails`,
        method: "GET",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      providesTags: ["pieceVerificationApi"],
    }),

    updatePieceVerification: builder.mutation({
      query: (payload) => {
        const { lotNo, ...body } = payload;
        return {
          url: `${PIECEVERIFICATIONAPI}/update/${lotNo}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["pieceVerificationApi"],
    }),

    getWorkStatus: builder.query({
      query: (storedUserId) => ({
        url: `${PIECEVERIFICATIONAPI}/${storedUserId}/getWorkStatus`,
        method: "GET",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      providesTags: ["WorkStatus"],
    }),
    getDefectDetails: builder.query({
      query: ({ lotId, pieceId }) => ({
        url: `${PIECEVERIFICATIONAPI}/${lotId}/${pieceId}/getDefectDetails`,
        method: "GET",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      providesTags: ["defectEntryApi"],
    }),
    deleteFoldingItem: builder.mutation({
      query: (body) => ({
        url: `${PIECEVERIFICATIONAPI}/deleteFoldingItem`,
        method: "DELETE",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
        body,
      }),
      invalidatesTags: ["pieceVerificationApi"],
    }),
  }),
});

export const {
  useGetLotsQuery,
  useGetFoldQuery,
  useGetlotDetailsQuery,
  useUpdatePieceVerificationMutation,
  useGetWorkStatusQuery,
  useGetDefectDetailsQuery,
  useDeleteFoldingItemMutation,
} = pieceVerificationApi;

export default pieceVerificationApi;
