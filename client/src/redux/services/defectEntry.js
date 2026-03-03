import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { DEFECTENTRY } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const defectEntryApi = createApi({
  reducerPath: "defectEntryApi",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["defectEntryApi"],
  endpoints: (builder) => ({
    getLots: builder.query({
      query: (arg) => {
        const { params, searchParams } = arg || {};

        if (searchParams) {
          return {
            url: DEFECTENTRY + "/search/" + searchParams,
            method: "GET",
            params,
          };
        }

        return {
          url: `${DEFECTENTRY}/getLotNo`,
          method: "GET",
          params,
        };
      },
      providesTags: ["defectEntryApi"],
    }),
    getDefects: builder.query({
      query: (arg) => {
        const { params, searchParams } = arg || {};

        if (searchParams) {
          return {
            url: DEFECTENTRY + "/search/" + searchParams,
            method: "GET",
            params,
          };
        }

        return {
          url: `${DEFECTENTRY}/getDefects`,
          method: "GET",
          params,
        };
      },
      providesTags: ["defectEntryApi"],
    }),
    getPieces: builder.query({
      query: ({ lotId }) => ({
        url: `${DEFECTENTRY}/${lotId}/getPiece`,
        method: "GET",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      providesTags: ["defectEntryApi"],
    }),
    getlotDetails: builder.query({
      query: ({ pieceId }) => ({
        url: `${DEFECTENTRY}/${pieceId}/getLotDetails`,
        method: "GET",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      providesTags: ["defectEntryApi"],
    }),

    updateTableLot: builder.mutation({
      query: (payload) => {
        const { selectedNonGridId, selectedGridId, ...body } = payload;
        return {
          url: `${DEFECTENTRY}/${selectedNonGridId}/${selectedGridId}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["defectEntryApi"],
    }),

    getWorkStatus: builder.query({
      query: (storedUserId) => ({
        url: `${DEFECTENTRY}/${storedUserId}/getWorkStatus`,
        method: "GET",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      providesTags: ["WorkStatus"],
    }),
  }),
});

export const {
  useGetLotsQuery,
  useGetDefectsQuery,
  useGetPiecesQuery,
  useGetlotDetailsQuery,
  useUpdateTableLotMutation,
  useGetWorkStatusQuery,
} = defectEntryApi;

export default defectEntryApi;
