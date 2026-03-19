import { post, get, patch, deleteRequest } from './restApi';


export const getActivityReportBreakdown = (payload) => {
    return get('reportBreakdown/get-activity-report-breakdown', { ...payload });
}
export const getDetailsReportEngineerPerformanceInBreakdown = (payload) => {
    return get('reportBreakdown/get-details-report-engineer-performance-in-breakdown', { ...payload });
}
export const getSummaryReportEngineerPerformanceInBreakdown = (payload) => {
    return get('reportBreakdown/get-summary-report-engineer-performance-in-breakdown', { ...payload });
}