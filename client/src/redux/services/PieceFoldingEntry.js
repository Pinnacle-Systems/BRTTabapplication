import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { PIECEFOLDINGENTRY } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const pieceFoldingEntrygApi = createApi({
  reducerPath: "pieceFoldingEntry",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["pieceFoldingEntry"],
  endpoints: (builder) => ({

    getpieceFoldingEntry: builder.query({
      query: (arg) => {
        const { params, searchParams } = arg || {}; // 👈 FIX HERE

        if (searchParams) {
          return {
            url: PIECEFOLDINGENTRY + "/search/" + searchParams,
            method: "GET",
            params,
          };
        }

        return {
          url: PIECEFOLDINGENTRY,
          method: "GET",
          params,
        };
      },
      providesTags: ["pieceFoldingEntry"],
    }),

    getpieceFoldingEntryById: builder.query({
      query: ({ selectedPiece }) => {
        return {
          url: `${PIECEFOLDINGENTRY}/${selectedPiece}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["pieceFoldingEntry"],
    }),
    getpieceEntryById: builder.query({
      query: ({ selectedLotNo }) => {
        return {
          url: `${PIECEFOLDINGENTRY}/${selectedLotNo}/getPiece`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["pieceFoldingEntry"],
    }),
    addpieceFoldingEntry: builder.mutation({
      query: (payload) => ({
        url: PIECEFOLDINGENTRY,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["pieceFoldingEntry"],
    }),
    updatepieceFoldingEntry: builder.mutation({
      query: (payload) => {
        const { selectedLotId, selectedGridId, ...body } = payload;
        return {
          url: `${PIECEFOLDINGENTRY}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["pieceFoldingEntry"],
    }),
    deletepieceFoldingEntry: builder.mutation({
      query: (id) => ({
        url: `${PIECEFOLDINGENTRY}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["pieceFoldingEntry"],
    }),
  }),
});

export const {
  // useGetLotPieceReceiptQuery,
  // useGetLotPieceReceiptDetailsQuery,
  useGetpieceFoldingEntryQuery,
  useGetpieceFoldingEntryByIdQuery,
  useAddpieceFoldingEntryMutation,
  useUpdatepieceFoldingEntryMutation,
  useDeletepieceFoldingEntryMutation,
  useGetpieceEntryByIdQuery
} = pieceFoldingEntrygApi;

export default pieceFoldingEntrygApi;
