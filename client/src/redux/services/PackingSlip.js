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
    getDocId: builder.query({
      query: ({ companyName, finYear }) => {
        return {
          url: `${PACKINGSLIP}/${companyName}/${finYear}/getDocId`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["packingSlip"],
    }),
    getBarCodeData: builder.query({
      query: ({ companyName, clothName, clothGrade, barCode }) => {
        return {
          url: `${PACKINGSLIP}/${companyName}/${clothName}/${clothGrade}/${barCode}/getBarCodeDetails`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["packingSlip"],
    }),
    getCurrentFinyear: builder.query({
      query: () => {
        return {
          url: `${PACKINGSLIP}/getCurrentFinyear`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["packingSlip"],
    }),
    getClothData: builder.query({
      query: ({ companyName }) => {
        return {
          url: `${PACKINGSLIP}/${companyName}/getCloth`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["packingSlip"],
    }),
    getGradeData: builder.query({
      query: ({ companyName, clothName }) => {
        return {
          url: `${PACKINGSLIP}/${companyName}/${clothName}/getGrade`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["packingSlip"],
    }),
    getLoomData: builder.query({
      query: () => {
        return {
          url: `${PACKINGSLIP}/getLoomData`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["packingSlip"],
    }),
    addPackingSlip: builder.mutation({
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
  }),
});

export const {
  useGetDocIdQuery,
  useGetBarCodeDataQuery,
  useGetCurrentFinyearQuery,
  useGetClothDataQuery,
  useGetGradeDataQuery,
  useGetLoomDataQuery,
  useAddPackingSlipMutation,
} = packingSlipApi;

export default packingSlipApi;
