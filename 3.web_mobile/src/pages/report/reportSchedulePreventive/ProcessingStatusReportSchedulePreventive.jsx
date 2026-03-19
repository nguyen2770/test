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
import { Pie } from "@ant-design/plots";
import CardFilterSchedulePreventiveReport from "./CardFilterSchedulePreventiveReport";
import { frequencyAllOptions, schedulePreventiveStatus } from "../../../utils/schedulePreventive.constant";
import { useTranslation } from "react-i18next";

const ProcessingStatusReportSchedulePreventive = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [valueFilter, setValueFilter] = useState({
        startDate: dayjs().subtract(9, "day").startOf("day"),
        endDate: dayjs().endOf("day"),
    });
    const [viewOption, setViewOption] = useState(reportView.summary);
    const [data, setData] = useState([]);
    const [page, setPage] = useState(1);
    const [totalRecord, setTotalRecord] = useState(0);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const contentRef = useRef(null);
    const [dataConfig, setDataConfig] = useState([]);
    const [consumed, setConsumed] = useState();

    useEffect(() => {
        if (page === 1) fetchData(1);
        else fetchData(page, true);
    }, [page, viewOption, valueFilter]);

    useEffect(() => {
        const div = contentRef.current;
        if (!div) return;
        const handleScroll = () => {
            const isBottom = div.scrollTop + div.clientHeight >= div.scrollHeight - 10;
            if (isBottom && data.length < totalRecord && !loading) setPage(prev => prev + 1);
        };
        div.addEventListener("scroll", handleScroll);
        return () => div.removeEventListener("scroll", handleScroll);
    }, [data, totalRecord, loading]);

    const fetchData = async (currentPage = 1, isLoadMore = false) => {
        if (loading) return;
        const value = valueFilter;
        if (!value.startDate || !value.endDate)
            return ShowError("topRight", t("report.processingSchedulePreventive.title"), t("report.common.validation.dates_required", { defaultValue: "Điền đầy đủ ngày tháng" }));

        setLoading(true);
        if (viewOption === reportView.summary) {
            let res = await _unitOfWork.reportSchedulePreventive.getSumaryProcecssingSattusSchedulePreventive({
                page: currentPage,
                limit: PAGINATION.limit,
                startDate: value.startDate,
                endDate: value.endDate,
            });
            if (res && res.code === 1) {
                setConsumed(res?.data);
                setTotalRecord(res?.data?.totalResults);
                const scheduleGroups = res?.data?.scheduleGroups || [];
                setData(prev => (isLoadMore ? [...prev, ...scheduleGroups] : scheduleGroups));
                const d = res?.data;
                const cfg = [];
                cfg.push({ item: t("report.processingSchedulePreventive.table_headers.new"), percent: (d?.totalSchedulePreventiveNews / d?.totalAllSchedulePreventives) });
                cfg.push({ item: t("report.processingSchedulePreventive.table_headers.in_progress"), percent: (d?.totalSchedulePreventiveInProgress / d?.totalAllSchedulePreventives) });
                cfg.push({ item: t("report.processingSchedulePreventive.table_headers.completed"), percent: (d?.totalSchedulePreventiveCompleteds / d?.totalAllSchedulePreventives) });
                cfg.push({ item: t("report.processingSchedulePreventive.table_headers.cancelled"), percent: (d?.totalSchedulePreventiveCancelleds / d?.totalAllSchedulePreventives) });
                cfg.push({ item: t("report.processingSchedulePreventive.table_headers.skipped"), percent: (d?.totalSchedulePreventiveSkippeds / d?.totalAllSchedulePreventives) });
                setDataConfig(cfg);
            }
        } else {
            let res = await _unitOfWork.reportSchedulePreventive.getDetailsProcecssingSattusSchedulePreventive({
                page: currentPage,
                limit: PAGINATION.limit,
                startDate: value.startDate,
                endDate: value.endDate,
            });
            if (res && res.code === 1) {
                setConsumed(res?.data);
                setTotalRecord(res?.data?.totalResults);
                const schedulePreventives = res?.data?.schedulePreventives || [];
                setData(prev => (isLoadMore ? [...prev, ...schedulePreventives] : schedulePreventives));
                const d = res?.data;
                const cfg = [];
                cfg.push({ item: t("report.processingSchedulePreventive.table_headers.new"), percent: (d?.totalSchedulePreventiveNews / d?.totalAllSchedulePreventives) });
                cfg.push({ item: t("report.processingSchedulePreventive.table_headers.in_progress"), percent: (d?.totalSchedulePreventiveInProgress / d?.totalAllSchedulePreventives) });
                cfg.push({ item: t("report.processingSchedulePreventive.table_headers.completed"), percent: (d?.totalSchedulePreventiveCompleteds / d?.totalAllSchedulePreventives) });
                cfg.push({ item: t("report.processingSchedulePreventive.table_headers.cancelled"), percent: (d?.totalSchedulePreventiveCancelleds / d?.totalAllSchedulePreventives) });
                cfg.push({ item: t("report.processingSchedulePreventive.table_headers.skipped"), percent: (d?.totalSchedulePreventiveSkippeds / d?.totalAllSchedulePreventives) });
                setDataConfig(cfg);
            }
        }
        setLoading(false);
    };

    const config = {
        data: dataConfig,
        angleField: 'percent',
        colorField: 'item',
        radius: 0.6,
        label: {
            position: 'outside',
            text: (d) => d.percent > 0 ? `${d.item}: ${(d.percent * 100).toFixed(2)}%` : '',
        },
        tooltip: {
            items: [
                (d) => ({
                    name: d.item,
                    value: `${(d.percent * 100).toFixed(2)}%`,
                }),
            ],
        },
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
        { title: t("report.processingSchedulePreventive.table_headers.new"), dataIndex: "totalSchedulePreventiveNews", align: "center" },
        { title: t("report.processingSchedulePreventive.table_headers.in_progress"), dataIndex: "totalSchedulePreventiveInProgress", align: "center" },
        { title: t("report.processingSchedulePreventive.table_headers.overdue"), dataIndex: "totalSchedulePreventiveOverdues", align: "center" },
        { title: t("report.processingSchedulePreventive.table_headers.completed"), dataIndex: "totalSchedulePreventiveCompleteds", align: "center" },
        { title: t("report.processingSchedulePreventive.table_headers.cancelled"), dataIndex: "totalSchedulePreventiveCancelleds", align: "center" },
        { title: t("report.processingSchedulePreventive.table_headers.skipped"), dataIndex: "totalSchedulePreventiveSkippeds", align: "center" },
        { title: t("report.processingSchedulePreventive.table_headers.all"), dataIndex: "totalAllSchedulePreventives", align: "center" },
        { title: t("report.processingSchedulePreventive.table_headers.total_planned_hours"), dataIndex: "totalPlannedHours", align: "center", render: (text) => formatMillisToHHMMSS(text) },
        { title: t("report.processingSchedulePreventive.table_headers.total_downtime"), dataIndex: "totalDowntime", align: "center", render: (text) => formatMillisToHHMMSS(text) },
    ];

    const columns =
        viewOption === reportView.summary
            ? [
                { title: t("report.processingSchedulePreventive.summary_columns.customer"), dataIndex: "customer", key: "customer", render: (text) => <span>{text?.customerName}</span> },
                { title: t("report.processingSchedulePreventive.summary_columns.model"), dataIndex: "assetModel", key: "assetModel", render: (text) => <span>{text?.assetModelName}</span> },
                { title: t("report.processingSchedulePreventive.summary_columns.new"), dataIndex: "newCount", key: "newCount", align: 'end' },
                { title: t("report.processingSchedulePreventive.summary_columns.in_progress"), dataIndex: "inProgressCount", key: "inProgressCount", align: 'end' },
                { title: t("report.processingSchedulePreventive.summary_columns.overdue"), dataIndex: "overdueCount", key: "overdueCount", align: 'end' },
                { title: t("report.processingSchedulePreventive.summary_columns.completed"), dataIndex: "completedCount", key: "completedCount", align: 'end' },
                { title: t("report.processingSchedulePreventive.summary_columns.cancelled"), dataIndex: "cancelledCount", key: "cancelledCount", align: 'end' },
                { title: t("report.processingSchedulePreventive.summary_columns.skipped"), dataIndex: "skippedCount", key: "skippedCount", align: 'end' },
                { title: t("report.processingSchedulePreventive.summary_columns.all"), dataIndex: "allCount", key: "allCount", align: 'end' },
                { title: t("report.processingSchedulePreventive.summary_columns.planned_hours"), dataIndex: "plannedHours", key: "plannedHours", align: 'end', render: (text) => formatMillisToHHMMSS(text) },
                { title: t("report.processingSchedulePreventive.summary_columns.downtime"), dataIndex: "downtime", key: "downtime", align: 'end', render: (text) => formatMillisToHHMMSS(text) },
            ]
            : [
                { title: t("report.processingSchedulePreventive.detail_columns.customer"), dataIndex: "customer", key: "customer", render: (text) => <span>{text?.customerName}</span> },
                { title: t("report.processingSchedulePreventive.detail_columns.code"), dataIndex: "code", key: "code" },
                { title: t("report.processingSchedulePreventive.detail_columns.schedule_name"), dataIndex: "preventive", key: "preventive", render: (text) => <span>{text?.preventiveName}</span> },
                {
                    title: t("report.processingSchedulePreventive.detail_columns.frequency"),
                    dataIndex: "preventive",
                    key: "preventiveFrequency",
                    render: (_text, record) => {
                        const label = t(parseToLabel(frequencyAllOptions.Option, _text?.frequencyType));
                        return _text?.calenderFrequencyDuration ? `${_text?.calenderFrequencyDuration} ${label}` : label;
                    },
                },
                { title: t("report.processingSchedulePreventive.detail_columns.asset"), dataIndex: "assetMaintenance", key: "assetMaintenance", render: (text) => <span>{text?.assetModel?.asset?.assetName}</span> },
                { title: t("report.processingSchedulePreventive.detail_columns.model"), dataIndex: "assetMaintenance", key: "assetModelName", render: (text) => <span>{text?.assetModel?.assetModelName}</span> },
                { title: t("report.processingSchedulePreventive.detail_columns.status"), dataIndex: "status", key: "status", render: (text) => t(parseToLabel(schedulePreventiveStatus.Options, text)) },
                { title: t("report.processingSchedulePreventive.detail_columns.start_date"), dataIndex: "startDate", align: 'center', render: (text) => parseDate(text) },
                { title: t("report.processingSchedulePreventive.detail_columns.closing_date"), dataIndex: "closingDate", align: 'center', render: (text) => parseDate(text) },
                { title: t("report.processingSchedulePreventive.detail_columns.planned_hours"), dataIndex: "plannedHours", align: 'center', render: (text) => formatMillisToHHMMSS(text) },
                { title: t("report.processingSchedulePreventive.detail_columns.downtime"), dataIndex: "downtime", align: 'center', render: (text) => formatMillisToHHMMSS(text) },
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
                            <span style={{ fontSize: 18, fontWeight: 600 }}>{t("report.processingSchedulePreventive.title")}</span>
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

                {viewOption === reportView.summary && (
                    <Col span={24}>
                        <Pie {...config} />
                    </Col>
                )}

                {loading && page === 1 ? (
                    <Spin style={{ display: "flex", justifyContent: "center", marginTop: 50 }} />
                ) : data.length === 0 ? (
                    <div style={{ textAlign: "center", marginTop: 40, color: "#888" }}>{t("report.common.no_data")}</div>
                ) : (
                    <>
                        <div style={{ marginBottom: 16 }}>
                            <h3 style={{ marginBottom: 8, fontWeight: "600" }}>{t("report.common.headings.overview")}</h3>
                            <CardList columns={columnsSummary} data={[consumed]} />
                        </div>

                        <div>
                            <Row justify="space-between" align="middle" style={{ marginBottom: 8 }}>
                                <Col>
                                    <h3 style={{ margin: 0, fontWeight: "600" }}>{t("report.common.headings.detail_list")}</h3>
                                </Col>
                                <Col style={{ fontWeight: "600", color: "#555" }}>
                                    {t("report.common.table.total", { count: totalRecord })}
                                </Col>
                            </Row>

                            <CardList columns={columns} data={data} />
                        </div>
                    </>
                )}
            </div>

            <CardFilterSchedulePreventiveReport
                onSearch={onSearchFilter}
                open={open}
                onClose={() => setOpen(false)}
                onReFeshFilter={onRefeshFilter}
                valueFilter={valueFilter}
            />
        </div>
    );
};

export default ProcessingStatusReportSchedulePreventive;