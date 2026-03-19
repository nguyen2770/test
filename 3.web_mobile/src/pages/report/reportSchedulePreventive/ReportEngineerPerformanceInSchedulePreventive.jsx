import { ArrowLeftOutlined, CheckOutlined, CloseOutlined, FilterOutlined } from "@ant-design/icons";
import { Col, Row, Radio, Spin } from "antd";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import * as _unitOfWork from "../../../api";
import ShowError from "../../../components/modal/result/errorNotification";
import CardList from "../../../components/Card/CardList";
import { PAGINATION, reportView } from "../../../utils/constant";
import { formatMillisToHHMM, formatMillisToHHMMSS, parseDate } from "../../../helper/date-helper";
import { parseToLabel } from "../../../helper/parse-helper";
import CardFilterSchedulePreventiveReport from "./CardFilterSchedulePreventiveReport";
import { frequencyAllOptions, schedulePreventiveTaskAssignUserStatus } from "../../../utils/schedulePreventive.constant";
import { useTranslation } from "react-i18next";

const ReportEngineerPerformanceInSchedulePreventive = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [valueFilter, setValueFilter] = useState({
        startDate: dayjs().subtract(9, "day").startOf("day"),
        endDate: dayjs().endOf("day"),
    });
    const [viewOption, setViewOption] = useState(reportView.summary);
    const [summaryData, setSummaryData] = useState({});
    const [rows, setRows] = useState([]);
    const [page, setPage] = useState(1);
    const [totalRecord, setTotalRecord] = useState(0);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const contentRef = useRef(null);

    useEffect(() => {
        if (page === 1) fetchData(1);
        else fetchData(page, true);
    }, [page, viewOption, valueFilter]);

    useEffect(() => {
        const div = contentRef.current;
        if (!div) return;
        const handleScroll = () => {
            const isBottom = div.scrollTop + div.clientHeight >= div.scrollHeight - 10;
            if (isBottom && rows.length < totalRecord && !loading) setPage(prev => prev + 1);
        };
        div.addEventListener("scroll", handleScroll);
        return () => div.removeEventListener("scroll", handleScroll);
    }, [rows, totalRecord, loading]);

    const fetchData = async (currentPage = 1, isLoadMore = false) => {
        if (loading) return;
        if (!valueFilter.startDate || !valueFilter.endDate)
            return ShowError("topRight", t("report.engineerSchedulePreventive.title"), t("report.common.validation.dates_required", { defaultValue: "Điền đầy đủ ngày tháng" }));

        setLoading(true);
        try {
            if (viewOption === reportView.summary) {
                let res = await _unitOfWork.reportSchedulePreventive.getSummaryReportEngineerPerformanceInSchedulePreventive({
                    page: currentPage,
                    limit: PAGINATION.limit,
                    startDate: valueFilter.startDate,
                    endDate: valueFilter.endDate,
                });
                if (res && res.code === 1) {
                    setRows(prev => (isLoadMore ? [...prev, ...res?.scheduleGroups] : res?.scheduleGroups));
                    setTotalRecord(res?.totalResults);
                    setSummaryData({
                        new: res?.totalSchedulePreventiveTaskAssignUserNew,
                        inProgress: res?.totalSchedulePreventiveTaskAssignUserInProgess,
                        rejecteds: res?.totalSchedulePreventiveTaskAssignUserRejected,
                        close: res?.totalSchedulePreventiveTaskAssignUserClosed,
                        assignUsers: res?.totalSchedulePreventiveTaskAssignUsers,
                        consumedMs: res?.totalTimeConsumed
                    });
                }
            } else {
                let res = await _unitOfWork.reportSchedulePreventive.getDetailsReportEngineerPerformanceInSchedulePreventive({
                    page: currentPage,
                    limit: PAGINATION.limit,
                    startDate: valueFilter.startDate,
                    endDate: valueFilter.endDate,
                });
                if (res && res.code === 1) {
                    setRows(prev => (isLoadMore ? [...prev, ...res?.schedulePreventiveTaskAssignUsers] : res?.schedulePreventiveTaskAssignUsers));
                    setTotalRecord(res?.totalResults);
                    setSummaryData({
                        new: res?.totalSchedulePreventiveTaskAssignUserNew,
                        inProgress: res?.totalSchedulePreventiveTaskAssignUserInProgess,
                        rejecteds: res?.totalSchedulePreventiveTaskAssignUserRejected,
                        close: res?.totalSchedulePreventiveTaskAssignUserClosed,
                        assignUsers: res?.totalSchedulePreventiveTaskAssignUsers,
                        consumedMs: res?.totalTimeConsumed
                    });
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const onRefeshFilter = () => {
        setOpen(false);
        setValueFilter({
            startDate: dayjs().subtract(9, "day").startOf("day"),
            endDate: dayjs().endOf("day"),
        });
    };

    const onSearchFilter = (_valueFilter) => {
        setValueFilter(_valueFilter);
        setPage(1);
    };

    const columnsSummary = [
        { title: t("report.engineerSchedulePreventive.columns.new"), dataIndex: "new", render: (value) => value ?? 0 },
        { title: t("report.engineerSchedulePreventive.columns.in_progress"), dataIndex: "inProgress", render: (value) => value ?? 0 },
        { title: t("report.engineerSchedulePreventive.columns.rejected"), dataIndex: "rejecteds", render: (value) => value ?? 0 },
        { title: t("report.engineerSchedulePreventive.columns.closed"), dataIndex: "close", render: (value) => value ?? 0 },
        { title: t("report.engineerSchedulePreventive.columns.total_jobs"), dataIndex: "assignUsers", render: (value) => value ?? 0 },
        { title: t("report.engineerSchedulePreventive.columns.total_usage_time"), dataIndex: "consumedMs", render: (text) => formatMillisToHHMMSS(text) },
    ];

    const columns =
        viewOption === reportView.summary
            ? [
                { title: t("report.engineerSchedulePreventive.columns.user"), dataIndex: "user", key: "user", render: (text) => <span>{text?.fullName}</span> },
                { title: t("report.engineerSchedulePreventive.columns.total_jobs"), dataIndex: "total", key: "total", align: 'end' },
                { title: t("report.engineerSchedulePreventive.columns.new"), dataIndex: "totalNew", key: "totalNew", align: 'end' },
                { title: t("report.engineerSchedulePreventive.columns.in_progress"), dataIndex: "totalInProgress", key: "totalInProgress", align: 'end' },
                { title: t("report.engineerSchedulePreventive.columns.rejected"), dataIndex: "totalRejected", key: "totalRejected", align: 'right' },
                { title: t("report.engineerSchedulePreventive.columns.closed"), dataIndex: "totalClosed", key: "totalClosed", align: 'right' },
                { title: t("report.engineerSchedulePreventive.columns.total_usage_time"), dataIndex: "totalTimeConsumed", align: 'center', render: (text) => formatMillisToHHMMSS(text) },
            ]
            : [
                { title: t("report.engineerSchedulePreventive.columns.code"), dataIndex: "schedulePreventive", key: "schedulePreventive", render: (text) => <span>{text?.code}</span> },
                {
                    title: t("report.engineerSchedulePreventive.columns.frequency"),
                    dataIndex: "schedulePreventive",
                    render: (_text, record) => {
                        const label = t(parseToLabel(
                            frequencyAllOptions.Option,
                            _text?.preventive?.frequencyType
                        ));
                        return _text?.preventive?.calenderFrequencyDuration
                            ? `${_text?.preventive?.calenderFrequencyDuration} ${label}`
                            : label;
                    },
                },
                { title: t("report.engineerSchedulePreventive.columns.schedule_date"), dataIndex: "schedulePreventive", align: 'center', render: (text) => parseDate(text?.startDate) },
                { title: t("report.engineerSchedulePreventive.columns.status"), dataIndex: "status", align: 'center', render: (text) => t(parseToLabel(schedulePreventiveTaskAssignUserStatus.Options, text)) },
                { title: t("report.engineerSchedulePreventive.columns.time_used"), dataIndex: "totalTimeConsumed", align: 'center', render: (text) => formatMillisToHHMMSS(text) },
                { title: t("report.engineerSchedulePreventive.columns.planned_time"), dataIndex: "totalPlanningHours", align: 'center', render: (text) => formatMillisToHHMM(text) },
            ];

    return (
        <div style={{ minHeight: "100vh", background: "#f5f5f5" }}>
            <Row style={{ display: "flex", alignItems: "center", height: 56, background: "#23457b", color: "#fff", padding: "0 16px" }}>
                <Col span={16}>
                    <Row>
                        <Col span={4} style={{ display: "flex", alignItems: "center" }}>
                            <ArrowLeftOutlined style={{ fontSize: 22, marginRight: 16, cursor: "pointer" }} onClick={() => navigate(-1)} />
                        </Col>
                        <Col span={20}>
                            <span style={{ fontSize: 18, fontWeight: 600 }}>{t("report.engineerSchedulePreventive.title")}</span>
                        </Col>
                    </Row>
                </Col>
                <Col
                    span={8}
                    style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        gap: 12,
                        color: "#ffffff",
                    }}
                >
                    <div style={{ position: "relative" }}>
                        <FilterOutlined style={{ fontSize: 22, marginRight: 12, cursor: "pointer" }} onClick={() => setOpen(true)} title={t("report.filter.title")} />
                        {valueFilter ? (
                            <CheckOutlined style={{ position: "absolute", top: -5, right: 0, fontSize: 12, color: "green" }} />
                        ) : (
                            <CloseOutlined style={{ position: "absolute", top: -5, right: 0, fontSize: 12, color: "red" }} />
                        )}
                    </div>
                </Col>
            </Row>

            <div ref={contentRef} style={{ height: "calc(100vh - 56px)", overflowY: "auto", padding: 12 }}>
                <Row className="mb-2" style={{ display: "flex", alignItems: "flex-end" }}>
                    <Col span={12}>
                        <Radio.Group
                            options={reportView.Options.map(opt => ({
                                ...opt,
                                label: t(opt.label)
                            }))}
                            value={viewOption}
                            onChange={(e) => setViewOption(e.target.value)}
                            optionType="button"
                            buttonStyle="solid"
                        />
                    </Col>
                </Row>

                {loading && page === 1 ? (
                    <Spin style={{ display: "flex", justifyContent: "center", marginTop: 50 }} />
                ) : rows.length === 0 ? (
                    <div style={{ textAlign: "center", marginTop: 40, color: "#888" }}>{t("report.common.no_data")}</div>
                ) : (
                    <>
                        <div style={{ marginBottom: 16 }}>
                            <h3 style={{ marginBottom: 8, fontWeight: "600" }}>{t("report.common.headings.overview")}</h3>
                            <CardList columns={columnsSummary} data={[summaryData]} />
                        </div>

                        <div>
                            <Row justify="space-between" align="middle" style={{ marginBottom: 8 }}>
                                <Col>
                                    <h3 style={{ margin: 0, fontWeight: "600" }}>{t("report.common.headings.detail_list")}</h3>
                                </Col>
                                <Col style={{ fontWeight: "600", color: "#555" }}>
                                    {totalRecord > 0 ? t("report.common.table.total", { count: totalRecord }) : null}
                                </Col>
                            </Row>

                            <CardList columns={columns} data={rows} />
                        </div>
                    </>
                )}
            </div>

            <CardFilterSchedulePreventiveReport onSearch={onSearchFilter} open={open} onClose={() => setOpen(false)} onReFeshFilter={onRefeshFilter} valueFilter={valueFilter} />
        </div>
    );
};

export default ReportEngineerPerformanceInSchedulePreventive;