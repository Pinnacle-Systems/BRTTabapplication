import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { TABLELOTAPI } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const tableLotApi = createApi({
  reducerPath: "tableLot",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["tableLotApi"],
  endpoints: (builder) => ({
    getTables: builder.query({
      query: (arg) => {
        const { params, searchParams } = arg || {};

        if (searchParams) {
          return {
            url: TABLELOTAPI + "/search/" + searchParams,
            method: "GET",
            params,
          };
        }

        return {
          url: `${TABLELOTAPI}/getTable`,
          method: "GET",
          params,
        };
      },
      providesTags: ["tableLotApi"],
    }),
    getLots: builder.query({
      query: (arg) => {
        const { params, searchParams } = arg || {};

        if (searchParams) {
          return {
            url: TABLELOTAPI + "/search/" + searchParams,
            method: "GET",
            params,
          };
        }

        return {
          url: `${TABLELOTAPI}/getLotNo`,
          method: "GET",
          params,
        };
      },
      providesTags: ["tableLotApi"],
    }),
    getCheckingSection: builder.query({
      query: (arg) => {
        const { params, searchParams } = arg || {}; // 👈 FIX HERE

        if (searchParams) {
          return {
            url: TABLELOTAPI + "/search/" + searchParams,
            method: "GET",
            params,
          };
        }

        return {
          url: `${TABLELOTAPI}/getCheckingSection`,
          method: "GET",
          params,
        };
      },
      providesTags: ["tableLotApi"],
    }),
    getTableLot: builder.query({
      query: (arg) => {
        const { params, searchParams } = arg || {}; // 👈 FIX HERE

        if (searchParams) {
          return {
            url: TABLELOTAPI + "/search/" + searchParams,
            method: "GET",
            params,
          };
        }

        return {
          url: TABLELOTAPI,
          method: "GET",
          params,
        };
      },
      providesTags: ["tableLotApi"],
    }),

    getCloth: builder.query({
      query: (selectedLotNo) => ({
        url: `${TABLELOTAPI}/${encodeURIComponent(selectedLotNo)}/getCloth`,
        method: "GET",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      providesTags: ["pieceReceipt"],
    }),
    getPieces: builder.query({
      query: ({ selectedClothId, selectedLotNo, lotCheckingNoId }) => ({
        url: `${TABLELOTAPI}/${lotCheckingNoId}/${selectedLotNo}/${selectedClothId}/getPiece`,
        method: "GET",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      providesTags: ["pieceReceipt"],
    }),
    getTableLotById: builder.query({
      query: ({ selectedLotId, selectedGridId }) => {
        return {
          url: `${TABLELOTAPI}/${selectedLotId}/${selectedGridId}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["tableLotApi"],
    }),
    addTableLot: builder.mutation({
      query: (payload) => ({
        url: TABLELOTAPI,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["tableLotApi"],
    }),
    updateTableLot: builder.mutation({
      query: (payload) => {
        const { selectedNonGridId, selectedGridId, ...body } = payload;
        return {
          url: `${TABLELOTAPI}/${selectedNonGridId}/${selectedGridId}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["tableLotApi"],
    }),
    deleteTableLot: builder.mutation({
      query: (id) => ({
        url: `${TABLELOTAPI}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["tableLotApi"],
    }),
  }),
});

export const {
  useGetTablesQuery,
  useGetLotsQuery,
  useGetClothQuery,
  useGetPiecesQuery,
  useGetCheckingSectionQuery,
  useGetTableLotQuery,
  useGetTableLotByIdQuery,
  useAddTableLotMutation,
  useUpdateTableLotMutation,
  useDeleteTableLotMutation,
} = tableLotApi;

export default tableLotApi;
