import { configureStore } from "@reduxjs/toolkit";

import {
  UsersApi,
  LabApi,
  MachineApi,
  LotDetailApi,
  ProductionEntry,
  WhatsAppApi,
  pieceReceiptApi,
  tableLotApi,
  defectEntryApi,
  foldingPendingApi,
  pieceVerificationApi,
  packingSlipApi,
  userDetailsApi,
} from "../redux";

import { setupListeners } from "@reduxjs/toolkit/query";
import { openTabs } from "./features";
import pieceFoldingEntrygApi from "./services/PieceFoldingEntry";

export const store = configureStore({
  reducer: {
    openTabs,
    [UsersApi.reducerPath]: UsersApi.reducer,
    [LabApi.reducerPath]: LabApi.reducer,
    [MachineApi.reducerPath]: MachineApi.reducer,
    [LotDetailApi.reducerPath]: LotDetailApi.reducer,
    [ProductionEntry.reducerPath]: ProductionEntry.reducer,
    [WhatsAppApi.reducerPath]: WhatsAppApi.reducer,
    [pieceReceiptApi.reducerPath]: pieceReceiptApi.reducer,
    [tableLotApi.reducerPath]: tableLotApi.reducer,
    [defectEntryApi.reducerPath]: defectEntryApi.reducer,
    [foldingPendingApi.reducerPath]: foldingPendingApi.reducer,
    [pieceFoldingEntrygApi.reducerPath]: pieceFoldingEntrygApi.reducer,
    [pieceVerificationApi.reducerPath]: pieceVerificationApi.reducer,
    [packingSlipApi.reducerPath]: packingSlipApi.reducer,
    [userDetailsApi.reducerPath]: userDetailsApi.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([
      UsersApi.middleware,
      LabApi.middleware,
      MachineApi.middleware,
      LotDetailApi.middleware,
      ProductionEntry.middleware,
      WhatsAppApi.middleware,
      pieceReceiptApi.middleware,
      tableLotApi.middleware,
      defectEntryApi.middleware,
      foldingPendingApi.middleware,
      pieceFoldingEntrygApi.middleware,
      pieceVerificationApi.middleware,
      packingSlipApi.middleware,
      userDetailsApi.middleware,
    ]),
});
setupListeners(store.dispatch);
