import { configureStore } from "@reduxjs/toolkit";



import {
  UsersApi,
  LabApi,
  MachineApi,
  LotDetailApi,
  ProductionEntry,
  WhatsAppApi,
  pieceReceiptApi,
  tableLotApi
} from "../redux";

import { setupListeners } from "@reduxjs/toolkit/query";
import { openTabs } from "./features";



export const store = configureStore({
  reducer: {
    openTabs,
    [UsersApi.reducerPath]: UsersApi.reducer,
    [LabApi.reducerPath]: LabApi.reducer,
    [MachineApi.reducerPath]: MachineApi.reducer,
    [LotDetailApi.reducerPath]:  LotDetailApi.reducer,
    [ProductionEntry.reducerPath]: ProductionEntry.reducer,
    [WhatsAppApi.reducerPath]: WhatsAppApi.reducer,
    [pieceReceiptApi.reducerPath]:pieceReceiptApi.reducer,
    [tableLotApi.reducerPath]:tableLotApi.reducer,

  }

  ,
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
    ]),
});
setupListeners(store.dispatch);