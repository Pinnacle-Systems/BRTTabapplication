import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { USER_DETAILS } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const userDetailsApi = createApi({
  reducerPath: "userDetails",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["userDetails"],
  endpoints: (builder) => ({
    getActiveUserDetails: builder.query({
      query: (arg) => {
        const { params, searchParams } = arg || {}; // 👈 FIX HERE

        if (searchParams) {
          return {
            url:
              USER_DETAILS +
              "/search/" +
              searchParams +
              "/tableandlot/activeWorkersAndTables",
            method: "GET",
            params,
          };
        }

        return {
          url: USER_DETAILS + "/tableandlot/activeWorkersAndTables",
          method: "GET",
          params,
        };
      },
      providesTags: ["userDetails"],
    }),
  }),
});

export const { useGetActiveUserDetailsQuery } = userDetailsApi;

export default userDetailsApi;
