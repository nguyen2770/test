import { base_api } from './config';
import { get } from './restApi';

export const getSummaryReportAssetPerformance = (payload) => {
    return get(`reportAssetMaintenance/get-summary-report-asset-performance`, { ...payload });
}
export const getDetailsReportAssetPerformance = (payload) => {
    return get(`reportAssetMaintenance/get-details-report-asset-performance`, { ...payload });
}
