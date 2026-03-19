const { reportSchedulePreventiveService, schedulePreventiveService } = require('../../services');
const catchAsync = require('../../utils/catchAsync');
const { schedulePreventiveStatus } = require('../../utils/constant');
const pick = require('../../utils/pick');

const getSumaryProcecssingSattusSchedulePreventive = catchAsync(async (req, res) => {
    const { startDate, endDate } = req.query;
    const data = await reportSchedulePreventiveService.getTotalParameterSchedulePreventive(startDate, endDate);
    const schedulePreventives = await reportSchedulePreventiveService.getSumaryProcecssingSattusSchedulePreventive(startDate, endDate, pick(req.query, ['sortBy', 'sortOrder', 'limit', 'page']));
    res.send({ code: 1, data: { ...data, ...schedulePreventives } });
});

const getDetailsProcecssingSattusSchedulePreventive = catchAsync(async (req, res) => {
    const { startDate, endDate } = req.query;
    const options = pick(req.query, ['sortBy', 'sortOrder', 'limit', 'page']);
    const data = await reportSchedulePreventiveService.getTotalParameterSchedulePreventive(startDate, endDate);
    const schedulePreventives = await reportSchedulePreventiveService.getDetailsProcecssingSattusSchedulePreventive(startDate, endDate, options);

    const breakdownsWithDownTime = await Promise.all(
        schedulePreventives.results.map(async (_data) => {
            const plainBreakdown = _data.toObject ? _data.toObject() : _data;
            return {
                ...plainBreakdown,
                id: _data._id,
                plannedHours: (_data.status !== schedulePreventiveStatus.cancelled) ? (_data.maintenanceDurationHr * 60 * 60 * 1000 + _data.maintenanceDurationMin * 60 * 1000) : 0,
                downtime: (_data.status !== schedulePreventiveStatus.cancelled) ? (_data.downtimeHr * 60 * 60 * 1000 + _data.downtimeMin * 60 * 1000) : 0,
            };
        })
    );

    res.send({
        code: 1, data: {
            ...data,
            schedulePreventives: breakdownsWithDownTime,
            totalResults: schedulePreventives.totalResults,
            totalPages: schedulePreventives.totalPages,
            page: schedulePreventives.page,
            limit: schedulePreventives.limit,
        }
    });
});
const getSummaryReportEngineerPerformanceInSchedulePreventive = catchAsync(async (req, res) => {
    const { startDate, endDate } = req.query;
    const options = pick(req.query, ['sortBy', 'sortOrder', 'limit', 'page']);
    const { allTotalStatusScheduleAssignUser, scheduleGroups, totalResults } = await reportSchedulePreventiveService.getSummaryReportEngineerPerformanceInSchedulePreventive(startDate, endDate, options);
    res.send({
        code: 1,
        ...allTotalStatusScheduleAssignUser,
        totalResults,
        scheduleGroups
    });
});
const getDetailsReportEngineerPerformanceInSchedulePreventive = catchAsync(async (req, res) => {
    const { startDate, endDate } = req.query;
    const options = pick(req.query, ['sortBy', 'sortOrder', 'limit', 'page']);
    const { allTotalStatusScheduleAssignUser, schedulePreventiveTaskAssignUsers, totalResults } = await reportSchedulePreventiveService.getDetailsReportEngineerPerformanceInSchedulePreventive(startDate, endDate, options);
    const _schedulePreventiveTaskAssignUsers = await Promise.all(
        schedulePreventiveTaskAssignUsers.map(async (schedulePreventiveTaskAssignUser) => {
            let totalTimeConsumed = 0;
            let totalPlanningHours = 0;
            if (schedulePreventiveTaskAssignUser.schedulePreventiveTask) {
                totalTimeConsumed = await schedulePreventiveService.totalTimeConsumedSchedulePrevenTask(schedulePreventiveTaskAssignUser.schedulePreventiveTask);
                totalPlanningHours = await schedulePreventiveService.totalPlanningHours(schedulePreventiveTaskAssignUser.schedulePreventiveTask);
            } return {
                ...schedulePreventiveTaskAssignUser,
                id: schedulePreventiveTaskAssignUser._id,
                totalTimeConsumed,
                totalPlanningHours,
            };
        })
    );
    res.send({
        code: 1,
        ...allTotalStatusScheduleAssignUser,
        ...totalResults,
        schedulePreventiveTaskAssignUsers: _schedulePreventiveTaskAssignUsers
    });
});
module.exports = {
    getSumaryProcecssingSattusSchedulePreventive,
    getDetailsProcecssingSattusSchedulePreventive,
    getSummaryReportEngineerPerformanceInSchedulePreventive,
    getDetailsReportEngineerPerformanceInSchedulePreventive,
};
