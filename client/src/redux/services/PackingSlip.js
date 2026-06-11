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
  }),
});

export const {
  useGetBarCodeDataQuery,
  useGetCurrentFinyearQuery,
  useGetClothDataQuery,
  useGetGradeDataQuery,
} = packingSlipApi;

export default packingSlipApi;
