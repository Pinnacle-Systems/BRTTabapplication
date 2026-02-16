import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { PIECERECEIPT } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const pieceReceiptApi = createApi({
  reducerPath: "pieceReceipt",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["pieceReceipt"],
  endpoints: (builder) => ({
    getLotPieceReceipt: builder.query({
      query: (arg) => {
        const { params, searchParams } = arg || {}; // 👈 FIX HERE

        if (searchParams) {
          return {
            url: PIECERECEIPT + "/search/" + searchParams,
            method: "GET",
            params,
          };
        }

        return {
          url: `${PIECERECEIPT}/getLot`,
          method: "GET",
          params,
        };
      },
      providesTags: ["pieceReceipt"],
    }),
    getLotPieceReceiptDetails: builder.query({
      query: (selectedLotId) => ({
        url: `${PIECERECEIPT}/${selectedLotId}/lotReceiptDetails`,
        method: "GET",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      providesTags: ["pieceReceipt"],
    }),

    getPieceReceipt: builder.query({
      query: (arg) => {
        const { params, searchParams } = arg || {}; // 👈 FIX HERE

        if (searchParams) {
          return {
            url: PIECERECEIPT + "/search/" + searchParams,
            method: "GET",
            params,
          };
        }

        return {
          url: PIECERECEIPT,
          method: "GET",
          params,
        };
      },
      providesTags: ["pieceReceipt"],
    }),

    getPieceReceiptById: builder.query({
      query: ({ selectedLotId, selectedGridId }) => {
        return {
          url: `${PIECERECEIPT}/${selectedLotId}/${selectedGridId}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["pieceReceipt"],
    }),
    addPieceReceipt: builder.mutation({
      query: (payload) => ({
        url: PIECERECEIPT,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["pieceReceipt"],
    }),
    updatePieceReceipt: builder.mutation({
      query: (payload) => {
        const { selectedLotId, selectedGridId, ...body } = payload;
        return {
          url: `${PIECERECEIPT}/${selectedLotId}/${selectedGridId}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["pieceReceipt"],
    }),
    deletePieceReceipt: builder.mutation({
      query: (id) => ({
        url: `${PIECERECEIPT}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["pieceReceipt"],
    }),
  }),
});

export const {
  useGetLotPieceReceiptQuery,
  useGetLotPieceReceiptDetailsQuery,
  useGetPieceReceiptQuery,
  useGetPieceReceiptByIdQuery,
  useAddPieceReceiptMutation,
  useUpdatePieceReceiptMutation,
  useDeletePieceReceiptMutation,
} = pieceReceiptApi;

export default pieceReceiptApi;
