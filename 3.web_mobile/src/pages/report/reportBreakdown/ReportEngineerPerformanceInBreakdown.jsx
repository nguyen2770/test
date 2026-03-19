import { ArrowLeftOutlined, CheckOutlined, CloseOutlined, FilterOutlined } from "@ant-design/icons";
import { Col, Row, Radio, Spin } from "antd";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import * as _unitOfWork from "../../../api";
import ShowError from "../../../components/modal/result/errorNotification";
import CardList from "../../../components/Card/CardList";
import { PAGINATION, reportView } from "../../../utils/constant";
import { formatMillisToHHMMSS, parseDate } from "../../../helper/date-helper";
import { parseToLabel } from "../../../helper/parse-helper";
import CardFilterBreakdown from "./CardFilterBreakdown";
import { useTranslation } from "react-i18next";
import { breakdownUserStatus } from "../../../utils/constant";

const ReportEngineerPerformanceInBreakdown = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [valueFilter, setValueFilter] = useState({
        startDate: dayjs().subtract(9, "day").startOf("day"),
        endDate: dayjs().endOf("day"),
    });
    const [viewOption, setViewOption] = useState(reportView.summary);
    const [dataSummary, setDataSummary] = useState({});
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
            return ShowError("topRight", t("report.engineerBreakdown.title"), t("report.common.validation.dates_required", { defaultValue: "Điền đầy đủ ngày tháng" }));

        setLoading(true);
        try {
            const params = {
                page: currentPage,
                limit: PAGINATION.limit,
                startDate: valueFilter.startDate,
                endDate: valueFilter.endDate,
            };

            const api =
                viewOption === reportView.summary
                    ? _unitOfWork.reportBreakdown.getSummaryReportEngineerPerformanceInBreakdown
                    : _unitOfWork.reportBreakdown.getDetailsReportEngineerPerformanceInBreakdown;

            const res = await api(params);
            if (res && res.code === 1) {
                if (viewOption === reportView.summary) {
                    setRows(prev => (isLoadMore ? [...prev, ...res?.breakdownAssignUsers] : res?.breakdownAssignUsers));
                } else {
                    setRows(prev => (isLoadMore ? [...prev, ...res?.breakdownAssignUsers] : res?.breakdownAssignUsers));
                }
                setTotalRecord(res?.totalResults);
                setDataSummary({
                    new: res?.totalBreakdownAssignUserStatusNews,
                    inProgress: res?.totalBreakdownAssignUserStatusInProgress,
                    rejecteds: res?.totalBreakdownAssignUserStatusRejecteds,
                    close: res?.totalBreakdownAssignUserStatusCloseds,
                    assignUsers: res?.totalBreakdownAssignUsers,
                    consumedMs: res?.totalConsumedMs
                });
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
        { title: t("report.engineerBreakdown.columns.new"), dataIndex: "new", render: (v) => v ?? 0 },
        { title: t("report.engineerBreakdown.columns.in_progress"), dataIndex: "inProgress", render: (v) => v ?? 0 },
        { title: t("report.engineerBreakdown.columns.rejected"), dataIndex: "rejecteds", render: (v) => v ?? 0 },
        { title: t("report.engineerBreakdown.columns.closed"), dataIndex: "close", render: (v) => v ?? 0 },
        { title: t("report.engineerBreakdown.columns.total_tickets"), dataIndex: "assignUsers", render: (v) => v ?? 0 },
        { title: t("report.engineerBreakdown.columns.total_usage_time"), dataIndex: "consumedMs", render: (text) => formatMillisToHHMMSS(text) },
    ];

    const columns =
        viewOption === reportView.summary
            ? [
                { title: t("report.engineerBreakdown.columns.user"), dataIndex: "user", key: "user", render: (text) => <span>{text?.fullName}</span> },
                { title: t("report.engineerBreakdown.columns.total_tickets"), dataIndex: "totalBreakdowns", key: "totalBreakdowns", align: 'end' },
                { title: t("report.engineerBreakdown.columns.new"), dataIndex: "newCount", key: "newCount", align: 'end' },
                { title: t("report.engineerBreakdown.columns.in_progress"), dataIndex: "inProgressCount", key: "inProgressCount", align: 'end' },
                { title: t("report.engineerBreakdown.columns.completed"), dataIndex: "completedCount", key: "completedCount", align: 'right' },
                { title: t("report.engineerBreakdown.columns.rejected"), dataIndex: "rejectedCount", key: "rejectedCount", align: 'right' },
                { title: t("report.engineerBreakdown.columns.closed"), dataIndex: "closedCount", key: "closedCount", align: 'end' },
                { title: t("report.engineerBreakdown.columns.total_usage_time"), dataIndex: "totalUsageTime", align: 'center', render: (text) => formatMillisToHHMMSS(text) },
            ]
            : [
                { title: t("report.engineerBreakdown.columns.code"), dataIndex: "breakdown", key: "breakdown", render: (text) => <span>{text?.code}</span> },
                { title: t("report.engineerBreakdown.columns.opened_at"), dataIndex: "createdAt", align: 'center', render: (text) => parseDate(text) },
                { title: t("report.engineerBreakdown.columns.opened_by"), dataIndex: "breakdown", render: (text) => <span>{text?.createdBy?.fullName}</span> },
                { title: t("report.engineerBreakdown.columns.status"), dataIndex: "status", align: 'center', render: (text) => t(parseToLabel(breakdownUserStatus.Option, text)) },
                { title: t("report.engineerBreakdown.columns.time_used"), dataIndex: "totalTimeCosumed", align: 'center', render: (text) => formatMillisToHHMMSS(text) },
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
                            <span style={{ fontSize: 18, fontWeight: 600 }}>{t("report.engineerBreakdown.title")}</span>
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
                            <CardList columns={columnsSummary} data={[dataSummary]} />
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

            <CardFilterBreakdown onSearch={onSearchFilter} open={open} onClose={() => setOpen(false)} onReFeshFilter={onRefeshFilter} valueFilter={valueFilter} />
        </div>
    );
};

export default ReportEngineerPerformanceInBreakdown;