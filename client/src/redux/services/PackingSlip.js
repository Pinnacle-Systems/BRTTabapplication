import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { PACKINGSLIP } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const packingSlipApi = createApi({
  reducerPath: "packingSlip",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["packingSlip"],
  endpoints: (builder) => ({
    getLotPieceReceipt: builder.query({
      query: (arg) => {
        const { params, searchParams } = arg || {}; // 👈 FIX HERE

        if (searchParams) {
          return {
            url: PACKINGSLIP + "/search/" + searchParams,
            method: "GET",
            params,
          };
        }

        return {
          url: `${PACKINGSLIP}/getLot`,
          method: "GET",
          params,
        };
      },
      providesTags: ["packingSlip"],
    }),
    getLotPieceReceiptDetails: builder.query({
      query: (selectedLotId) => ({
        url: `${PACKINGSLIP}/${selectedLotId}/lotReceiptDetails`,
        method: "GET",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      providesTags: ["packingSlip"],
    }),

    getPieceReceipt: builder.query({
      query: (arg) => {
        const { params, searchParams } = arg || {}; // 👈 FIX HERE

        if (searchParams) {
          return {
            url: PACKINGSLIP + "/search/" + searchParams,
            method: "GET",
            params,
          };
        }

        return {
          url: PACKINGSLIP,
          method: "GET",
          params,
        };
      },
      providesTags: ["packingSlip"],
    }),

    getBarCodeData: builder.query({
      query: ({ barCode }) => {
        return {
          url: `${PACKINGSLIP}/${barCode}/getBarCodeDetails`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["packingSlip"],
    }),
   
    addPieceReceipt: builder.mutation({
      query: (payload) => ({
        url: PACKINGSLIP,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["packingSlip"],
    }),
    updatePieceReceipt: builder.mutation({
      query: (payload) => {
        const { selectedLotId, selectedGridId, ...body } = payload;
        return {
          url: `${PACKINGSLIP}/${selectedLotId}/${selectedGridId}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["packingSlip"],
    }),
    deletePieceReceipt: builder.mutation({
      query: (id) => ({
        url: `${PACKINGSLIP}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["packingSlip"],
    }),
  }),
});

export const {
  useGetLotPieceReceiptQuery,
  useGetLotPieceReceiptDetailsQuery,
  useGetPieceReceiptQuery,
  useGetBarCodeDataQuery,
  useAddPieceReceiptMutation,
  useUpdatePieceReceiptMutation,
  useDeletePieceReceiptMutation,
} = packingSlipApi;

export default packingSlipApi;
