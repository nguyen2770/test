import { ArrowLeftOutlined, CheckOutlined, CloseOutlined, FilterOutlined } from "@ant-design/icons";
import { Col, Row, Radio, Spin } from "antd";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import * as _unitOfWork from "../../../api";
import ShowError from "../../../components/modal/result/errorNotification";
import CardList from "../../../components/Card/CardList";
import { FORMAT_DATE, PAGINATION, reportView } from "../../../utils/constant";
import { formatMillisToHHMMSS, parseDate } from "../../../helper/date-helper";
import { parseToLabel } from "../../../helper/parse-helper";
import { Pie } from "@ant-design/plots";
import CardFilterBreakdown from "./CardFilterBreakdown";
import { useTranslation } from "react-i18next";
import { priorityLevelStatus, breakdownStatus } from "../../../utils/constant";

const ProcessingStatusReportBreakdown = () => {
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
    const [activityBreakdowns, setActivityBreakdowns] = useState([]);

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
            return ShowError("topRight", t("report.processingBreakdown.title"), t("report.common.validation.dates_required", { defaultValue: "Điền đầy đủ ngày tháng" }));

        setLoading(true);
        try {
            const res = await _unitOfWork.reportBreakdown.getActivityReportBreakdown({
                page: currentPage,
                limit: PAGINATION.limit,
                startDate: value.startDate,
                endDate: value.endDate,
                reportView: viewOption,
            });

            if (res && res.code === 1) {
                setTotalRecord(res?.data?.totalResults || 0);
                setActivityBreakdowns(res?.data);
                const breakdowns = res?.data?.breakdowns || [];
                setData(prev => (isLoadMore ? [...prev, ...breakdowns] : breakdowns));
                const d = res?.data;
                const cfg = [];
                cfg.push({ item: t("report.processingBreakdown.table_headers.new"), percent: (d?.totalBreakdownNews / d?.totalAllBreakdowns) });
                cfg.push({ item: t("report.processingBreakdown.table_headers.in_progress"), percent: (d?.totalBreakdownInProgress / d?.totalAllBreakdowns) });
                cfg.push({ item: t("report.processingBreakdown.table_headers.completed"), percent: (d?.totalBreakdownCompleted / d?.totalAllBreakdowns) });
                cfg.push({ item: t("report.processingBreakdown.table_headers.closed"), percent: (d?.totalBreakdownClosed / d?.totalAllBreakdowns) });
                cfg.push({ item: t("report.processingBreakdown.table_headers.cancelled"), percent: (d?.totalBreakdownCancelled / d?.totalAllBreakdowns) });
                setDataConfig(cfg);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const config = {
        data: dataConfig,
        angleField: 'percent',
        colorField: 'item',
        radius: 0.8,
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
        {
            title: t("report.processingBreakdown.table_headers.new"),
            dataIndex: "totalBreakdownNews",
            render: (value) => value ?? 0,
        },
        {
            title: t("report.processingBreakdown.table_headers.in_progress"),
            dataIndex: "totalBreakdownInProgress",
            render: (value) => value ?? 0,
        },
        {
            title: t("report.processingBreakdown.table_headers.overdue"),
            dataIndex: "totalBreakdownOverdues",
            render: (value) => value ?? 0,
        },
        {
            title: t("report.processingBreakdown.table_headers.completed"),
            dataIndex: "totalBreakdownCompleted",
            render: (value) => value ?? 0,
        },
        {
            title: t("report.processingBreakdown.table_headers.closed"),
            dataIndex: "totalBreakdownClosed",
            render: (value) => value ?? 0,
        },
        {
            title: t("report.processingBreakdown.table_headers.cancelled"),
            dataIndex: "totalBreakdownCancelled",
            render: (value) => value ?? 0,
        },
        {
            title: t("report.processingBreakdown.table_headers.all"),
            dataIndex: "totalAllBreakdowns",
            render: (value) => value ?? 0,
        },
        {
            title: t("report.processingBreakdown.table_headers.inactive"),
            dataIndex: "totalBreakdownIsNotActives",
            render: (value) => value ?? 0,
        },
        {
            title: t("report.processingBreakdown.table_headers.active"),
            dataIndex: "totalBreakdownIsActives",
            render: (value) => value ?? 0,
        },
        {
            title: t("report.processingBreakdown.table_headers.total_downtime"),
            dataIndex: "totalDownTimeBreakdown",
            render: (value) => formatMillisToHHMMSS(value),
        },
    ];

    const columns =
        viewOption === reportView.summary
            ? [
                { title: t("report.processingBreakdown.summary_columns.priority"), key: "priorityLevel", render: (_, i) => t(parseToLabel(priorityLevelStatus.Options, i.priorityLevel)) },
                { title: t("report.processingBreakdown.summary_columns.total_tickets"), key: "total", render: (_, i) => i.total },
                { title: t("report.processingBreakdown.summary_columns.downtime"), key: "downtime", render: (_, i) => formatMillisToHHMMSS(i.downtime) },
            ]
            : [
                { title: t("report.processingBreakdown.detail_columns.code"), key: "code", render: (_, i) => i.code },
                { title: t("report.processingBreakdown.detail_columns.opened_date"), key: "createdAt", render: (_, i) => parseDate(i.createdAt) },
                { title: t("report.processingBreakdown.detail_columns.opened_by"), key: "createdBy", render: (_, i) => i.createdBy?.fullName },
                { title: t("report.processingBreakdown.detail_columns.priority"), key: "priorityLevel", render: (_, i) => t(parseToLabel(priorityLevelStatus.Options, i.priorityLevel)) },
                { title: t("report.processingBreakdown.detail_columns.description"), key: "defectDescription", render: (_, i) => i.defectDescription },
                { title: t("report.processingBreakdown.detail_columns.status"), key: "status", render: (_, i) => t(parseToLabel(breakdownStatus.Option, i.status)) },
                { title: t("report.processingBreakdown.detail_columns.closing_date"), key: "closingDate", render: (_, i) => parseDate(i.closingDate) },
                { title: t("report.processingBreakdown.detail_columns.downtime"), key: "downtime", render: (_, i) => formatMillisToHHMMSS(i.downtime?.time) },
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
                            <span style={{ fontSize: 18, fontWeight: 600 }}>{t("report.processingBreakdown.title")}</span>
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
                            <CardList columns={columnsSummary} data={[activityBreakdowns]} />
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

            <CardFilterBreakdown onSearch={onSearchFilter} open={open} onClose={() => setOpen(false)} onReFeshFilter={onRefeshFilter} valueFilter={valueFilter} />
        </div>
    );
};

export default ProcessingStatusReportBreakdown;