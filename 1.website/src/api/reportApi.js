import { post, get, patch, deleteRequest } from "./restApi";

export const getBreakdownChart = (payload) => {
  return get("report/get-breakdown-chart", { ...payload });
};
export const spareMovementReport = (payload) => {
  return get("report/get-spare-movement", { ...payload });
};
export const getSchedulePreventiveChart = (payload) => {
  return get("report/get-schedule-preventive-chart", { ...payload });
};
export const getDataKPBIndicators = (payload) => {
  return get("report/get-data-kpb-indicators", { ...payload });
};
export const getApproveWorks = (payload) => {
  return get("report/get-approve-work", { ...payload });
};
export const getSchedulePreventiveCompliance = (payload) => {
  return get("report/get-schedule-preventive-compliance", { ...payload });
};
export const getBreakdownCompliance = (payload) => {
  return get("report/get-breakdown-compliance", { ...payload });
};
export const getUpTimeAssetMaintenance = (payload) => {
  return get("report/get-upTime-assetMaintenance", { ...payload });
};
export const getSchedulePreventiveVsAssignUser = (payload) => {
  return get("report/get-schedule-preventive-vs-assignUser", { ...payload });
};
export const getAverageResponseTimeBreakdown = (payload) => {
  return get("report/get-average-response-time", { ...payload });
};
export const getAverageResolutionTimeBreakdown = (payload) => {
  return get("report/get-average-resolution-time", { ...payload });
};
export const compareStatusSchedulePreventiveAndBreakdownByCustomer = (
  payload
) => {
  return patch(
    "report/compare-status-schedule-preventive-and-breakdown-by-customer",
    { ...payload }
  );
};
export const totalOperationalMetrics = (payload) => {
  return get("report/total-operational-metrics", { ...payload });
};
export const getSparePartsUsageSummary = (payload) => {
  return get("report/get-spare-usage-summary", { ...payload });
};
export const getAssetMaintenanceReport = (payload) => {
  return get("report/get-assetMaintenance-report", { ...payload });
};
export const getMyTicketCalender = (payload) => {
  return get("report/get-my-ticket-calender", { ...payload });
};
export const getMyTaskCalender = (payload) => {
  return get("report/get-my-task-calender", { ...payload });
};
export const updateApprovalTaskStatusProcessed = (
  payload
) => {
  return patch(
    "report/update-approval-task-status-processed",
    { ...payload }
  );
};
