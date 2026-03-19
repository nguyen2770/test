import { post, get, patch, deleteRequest } from "./restApi";
import { base_api } from "./config";

export const createSchedulePreventiveSparePartRequest = (payload) => {
  return post(`schedulePreventiveTaskRequestSparepart/create`, {
    ...payload,
  });
};
export const getListSchedulePrevetiveTaskSparePartRequests = (payload) => {
  return patch(`schedulePreventiveTaskRequestSparepart/get-list`, {
    ...payload,
  });
};
