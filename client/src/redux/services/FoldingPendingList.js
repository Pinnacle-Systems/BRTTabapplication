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
    // getLotPieceReceipt: builder.query({
    //   query: (arg) => {
    //     const { params, searchParams } = arg || {}; // 👈 FIX HERE

    //     if (searchParams) {
    //       return {
    //         url: FOLDINGPENINDAPI + "/search/" + searchParams,
    //         method: "GET",
    //         params,
    //       };
    //     }

    //     return {
    //       url: `${FOLDINGPENINDAPI}/getLot`,
    //       method: "GET",
    //       params,
    //     };
    //   },
    //   providesTags: ["foldingPending"],
    // }),
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
      query: ({ foldingId }) => {
        return {
          url: `${FOLDINGPENINDAPI}/${foldingId}`,
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
  // useGetLotPieceReceiptQuery,
  // useGetLotPieceReceiptDetailsQuery,
  useGetFoldingPendingQuery,
  useGetFoldingPendingByIdQuery,
  useAddFoldingPendingMutation,
  useUpdateFoldingPendingMutation,
  useDeleteFoldingPendingMutation,
} = foldingPendingApi;

export default foldingPendingApi;
