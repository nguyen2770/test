import { post, get, patch, deleteRequest } from './restApi';

export const getReportAssetMaintenanceRequest = (payload) => {
    return get('reportBreakdownSchedulePreventive/get-report-assetMaintenance-request', { ...payload });
}
