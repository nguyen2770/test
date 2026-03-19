import { post, get, patch, deleteRequest } from "./restApi";
import { base_api } from "./config";
export const getAllAssetMaintenance = (payload) => {
  return get(`assetMaintenance/get-all`, { ...payload });
};
export const getAssetMaintenanceById = (payload) => {
  return get(`assetMaintenance/get-by-id`, { ...payload });
};
export const getAssetMaintenance = (payload) => {
  return get(`assetMaintenance/get`, { ...payload });
};
export const getListAssetMaintenances = (payload) => {
  return patch(`assetMaintenance/get-list`, { ...payload });
};
export const getListAssetMaintenanceMobile = (payload) => {
  return patch(`assetMaintenance/get-list-mobile`, { ...payload });
};
export const getAssetSummary = () => {
  return get(`assetMaintenance/get-asset-summary`, {});
};
export const getAssetMaintenanceDueInspections = (payload) => {
  return get(
    `assetMaintenance/get-asset-maintenance-due-inspections`,
    { ...payload }
  );
};
