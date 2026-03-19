import { base_api } from './config';
import { post, get, patch, deleteRequest } from './restApi';


export const getDetailsProcecssingSattusSchedulePreventive = (payload) => {
    return get(`reportSchedulePreventive/get-details-procecssing-sattus-schedule-preventive`, { ...payload });
}
export const getSumaryProcecssingSattusSchedulePreventive = (payload) => {
    return get(`reportSchedulePreventive/get-sumary-procecssing-sattus-schedule-preventive`, { ...payload });
}
export const getDetailsReportEngineerPerformanceInSchedulePreventive = (payload) => {
    return get(`reportSchedulePreventive/get-details-report-enginee-performancein-schedulePreventive`, { ...payload });
}
export const getSummaryReportEngineerPerformanceInSchedulePreventive = (payload) => {
    return get(`reportSchedulePreventive/get-summary-report-enginee-performancein-schedulePreventive`, { ...payload });
}
