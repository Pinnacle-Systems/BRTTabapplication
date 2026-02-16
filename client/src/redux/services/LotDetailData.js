import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  LOTPREPERATION,
  LOADINGPREPERATION,
  CONTRACTOR,
  MACHINE,
  UNLOADINGPREPERATION,
  APPROVALPREPERATION,
  REVERTPREPERATION,
  INSPECTION,
  BRANCHQUERY,
  STOPDETAIL
} from "../../Api";
import secureLocalStorage from "react-secure-storage";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const LotDetailApi = createApi({
  reducerPath: "lotDetail",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["LotDetail"],
  endpoints: (builder) => ({
getLotDetail: builder.query({
  query: () => {
    const selectedBranch = secureLocalStorage.getItem("selectedBranch");
    return {
      url: LOTPREPERATION,
      method: "GET",
      params: { branch: selectedBranch },
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    };
  },
  providesTags: ["LotDetail"],
}),

getLotPrepareDetail: builder.query({
  query: () => {
    const selectedBranch = secureLocalStorage.getItem("selectedBranch");
    return {
      url: `${LOTPREPERATION}/prepare`, // 👈 make sure backend handles this
      method: "GET",
      params: { branch: selectedBranch },
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    };
  },
  providesTags: ["LotPrepareDetail"],
}),


    updateLotDetail: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${LOTPREPERATION}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["LotDetail"],
    }),
    
    getLoadingDetail: builder.query({
      query: () => {
         const selectedBranch = secureLocalStorage.getItem("selectedBranch"); 

        return {
          url: LOADINGPREPERATION,
          method: "GET",
          params: { branch: selectedBranch },
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["LotDetail"],
    }),
    
    updateLoadingDetail: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${LOADINGPREPERATION}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["LotDetail"],
    }),
    
    getContractorDetail: builder.query({
      query: () => {
         const selectedBranch = secureLocalStorage.getItem("selectedBranch"); 

        return {
          url: CONTRACTOR,
          method: "GET",
          params: { branch: selectedBranch },
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["LotDetail"],
    }),
    
    getMachineDetail: builder.query({
      query: ({ params }) => {
         const selectedBranch = secureLocalStorage.getItem("selectedBranch"); 

        return {
          url: MACHINE,
          method: "GET",
          params: { ...params, branch: selectedBranch },
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["LotDetail"],
    }),
    
    getUnLoadingDetail: builder.query({
      query: () => {
         const selectedBranch = secureLocalStorage.getItem("selectedBranch"); 

        return {
          url: UNLOADINGPREPERATION,
          method: "GET",
          params: { branch: selectedBranch },
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["LotDetail"],
    }),
      getStopDetail: builder.query({
      query: () => {
         const selectedBranch = secureLocalStorage.getItem("selectedBranch"); 

        return {
          url: STOPDETAIL,
          method: "GET",
          params: { branch: selectedBranch },
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["LotDetail"],
    }),
    updateUnLoadingDetail: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${UNLOADINGPREPERATION}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["LotDetail"],
    }),
    updateStopDetail: builder.mutation({
        query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${STOPDETAIL}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["LotDetail"],
    })
    ,
    getApprovalDetail: builder.query({
      query: () => {
         const selectedBranch = secureLocalStorage.getItem("selectedBranch"); 

        return {
          url: APPROVALPREPERATION,
          method: "GET",
          params: { branch: selectedBranch },
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["LotDetail"],
    }),
    
    updateApprovalDetail: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${APPROVALPREPERATION}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["LotDetail"],
    }),
    
    getRevertDetail: builder.query({
      query: () => {
         const selectedBranch = secureLocalStorage.getItem("selectedBranch"); 

        return {
          url: REVERTPREPERATION,
          method: "GET",
          params: { branch: selectedBranch },
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["LotDetail"],
    }),
    
    updateRevertDetail: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${REVERTPREPERATION}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["LotDetail"],
    }),
     getInspectionDetail: builder.query({
      query: () => {
         const selectedBranch = secureLocalStorage.getItem("selectedBranch"); 

        return {
          url: INSPECTION,
          method: "GET",
          params: { branch: selectedBranch },
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["LotDetail"],
    }),
     updateInspectionDetail: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${INSPECTION}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["LotDetail"],
    }),
    
    
 getBranchDetail: builder.query({
  query: ({ params }) => ({
    url: BRANCHQUERY,
    method: "GET",
    params: { username: params }, 
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
  }),
}),
  }),
});

export const {
  useGetLotDetailQuery,
  useGetLotPrepareDetailQuery,
  useUpdateLotDetailMutation,
  useGetLoadingDetailQuery,
  useUpdateLoadingDetailMutation,
  useGetContractorDetailQuery,
  useGetMachineDetailQuery,
  useGetUnLoadingDetailQuery,
  useGetStopDetailQuery,
  useUpdateUnLoadingDetailMutation,
  useUpdateStopDetailMutation,
  useGetApprovalDetailQuery,
  useUpdateApprovalDetailMutation,
  useGetRevertDetailQuery,
  useUpdateRevertDetailMutation,
  useGetInspectionDetailQuery,
  useUpdateInspectionDetailMutation, 
  useGetBranchDetailQuery
} = LotDetailApi;

export default LotDetailApi;