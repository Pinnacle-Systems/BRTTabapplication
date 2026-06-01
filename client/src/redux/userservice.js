import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { LOGIN_API, USERS_API, USERSLOG_API } from "../Api";
import baseQuery from "./baseQuery";
const BASE_URL = process.env.REACT_APP_SERVER_URL;

const UsersApi = createApi({
  reducerPath: "loginUser",
  baseQuery,
  tagTypes: ["Login"],
  endpoints: (builder) => ({
    loginUser: builder.mutation({
      query: (payload) => ({
        url: LOGIN_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["Login"],
    }),
    getUsers: builder.query({
      query: () => {
        return {
          url: USERS_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["Users"],
    }),
    getRoles: builder.query({
      query: () => {
        return {
          url: `${USERS_API}/getroles`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["Users"],
    }),
    getUserslog: builder.query({
      query: () => {
        return {
          url: USERSLOG_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["Users"],
    }),
    createUser: builder.mutation({
      query: (payload) => ({
        url: USERS_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["Login"],
    }),
    updateUser: builder.mutation({
      query: (data) => ({
        url: `${USERS_API}/${data.userId}/updateUser`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Users"],
    }),
    createRole: builder.mutation({
      query: (payload) => ({
        url: `${USERS_API}/role`,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["Users"],
    }),
    updateRole: builder.mutation({
      query: (data) => ({
        url: `${USERS_API}/${data.roleId}/updateRole`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Users"],
    }),
    getUserMasterById: builder.query({
      query: (id) => {
        return {
          url: `${USERS_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["Users"],
    }),
  }),
});

export const {
  useLoginUserMutation,
  useGetUsersQuery,
  useGetUserslogQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useGetRolesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useGetUserMasterByIdQuery,
} = UsersApi;

export default UsersApi;
