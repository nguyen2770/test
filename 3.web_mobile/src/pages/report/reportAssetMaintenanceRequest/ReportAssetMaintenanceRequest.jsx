import { ArrowLeftOutlined, CheckOutlined, CloseOutlined, FilterOutlined } from "@ant-design/icons";
import { Col, Row, Spin } from "antd";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import * as _unitOfWork from "../../../api";
import ShowError from "../../../components/modal/result/errorNotification";
import CardList from "../../../components/Card/CardList";
import { FORMAT_DATE, PAGINATION, reportView, typeReportAssetMaintenanceResquest } from "../../../utils/constant";
import { formatMillisToHHMM, formatMillisToHHMMSS, parseDate } from "../../../helper/date-helper";
import { parseToLabel } from "../../../helper/parse-helper";
import { schedulePreventiveStatus, schedulePreventiveTaskAssignUserStatus, frequencyAllOptions } from "../../../utils/schedulePreventive.constant";
import CardFilterReportAssetMaintenanceRequest from "./CardFilterReportAssetMaintenanceRequest";
import { useTranslation } from "react-i18next";
import { priorityLevelStatus, breakdownStatus } from "../../../utils/constant";

const ReportAssetMaintenanceRequest = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [valueFilter, setValueFilter] = useState({
        startDate: dayjs().subtract(9, "day").startOf("day"),
        endDate: dayjs().endOf("day"),
    });
    const [viewOption] = useState(reportView.summary); // (only summary used here)
    const [data, setData] = useState([]);
    const [page, setPage] = useState(1);
    const [totalRecord, setTotalRecord] = useState(0);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const contentRef = useRef(null);
    const [consumed, setConsumed] = useState([]);

    useEffect(() => {
        if (page === 1) fetchRequests(1);
        else fetchRequests(page, true);
    }, [page, valueFilter]);

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

    const fetchRequests = async (currentPage = 1, isLoadMore = false) => {
        if (loading) return;
        const value = valueFilter;
        if (!value.startDate || !value.endDate)
            return ShowError("topRight", t("report.maintenanceRequest.title"), t("report.common.validation.dates_required", { defaultValue: "Điền đầy đủ ngày tháng" }));

        setLoading(true);
        let res = await _unitOfWork.reportAssetMaintenanceRequest.getReportAssetMaintenanceRequest({
            page: currentPage,
            limit: PAGINATION.limit,
            startDate: value.startDate,
            endDate: value.endDate,
        });
        if (res && res.code === 1) {
            setData(prev => (isLoadMore ? [...prev, ...res?.data] : res?.data));
            setTotalRecord(res?.totalResults);
            setConsumed({
                totalRecord: res?.totalResults,
                totalBreakdown: res?.totalBreakdown,
                totalSchedulePreventive: res?.totalSchedulePreventive,
            });
        }
        setLoading(false);
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
            title: t("report.maintenanceRequest.summary_card.est_total"),
            dataIndex: "totalRecord",
            render: (value) => value ?? 0,
        },
        {
            title: t("report.maintenanceRequest.summary_card.total_jobs"),
            dataIndex: "totalSchedulePreventive",
            render: (value) => value ?? 0,
        },
        {
            title: t("report.maintenanceRequest.summary_card.total_breakdowns"),
            dataIndex: "totalBreakdown",
            render: (value) => value ?? 0,
        },
    ];

    const columns = [
        {
            title: t("report.maintenanceRequest.columns.code"),
            dataIndex: "code",
            key: "code",
        },
        {
            title: t("report.maintenanceRequest.columns.type"),
            dataIndex: "type",
            key: "type",
            render: (text) => t(parseToLabel(typeReportAssetMaintenanceResquest.Options, text)),
        },
        {
            title: t("report.maintenanceRequest.columns.priority_or_name"),
            key: "priority_or_name",
            render: (_, record) => {
                if (record.type === typeReportAssetMaintenanceResquest.schedulePreventive) {
                    return <span>{record?.preventive?.preventiveName || "-"}</span>;
                }
                return <span>{t(parseToLabel(priorityLevelStatus.Options, record?.priorityLevel)) || "-"}</span>;
            },
        },
        {
            title: t("report.maintenanceRequest.columns.status"),
            dataIndex: "status",
            align: "center",
            render: (_, record) => {
                const statusOptions =
                    record.type === typeReportAssetMaintenanceResquest.schedulePreventive
                        ? schedulePreventiveStatus.Options
                        : breakdownStatus.Option;

                return t(parseToLabel(statusOptions, record.status));
            },
        },
        {
            title: t("report.maintenanceRequest.columns.work_order_date"),
            dataIndex: "startDate",
            align: "center",
            render: (_, record) => parseDate(record.startDate || record.createdAt),
        },
        {
            title: t("report.maintenanceRequest.columns.closing_date"),
            dataIndex: "closingDate",
            align: "center",
            render: (text) => parseDate(text),
        },
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
                            <span style={{ fontSize: 18, fontWeight: 600 }}>{t("report.maintenanceRequest.title")}</span>
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
                                    {totalRecord > 0 ? t("report.common.table.total", { count: totalRecord }) : null}
                                </Col>
                            </Row>

                            <CardList columns={columns} data={data} />
                        </div>
                    </>
                )}
            </div>

            <CardFilterReportAssetMaintenanceRequest
                onSearch={onSearchFilter}
                open={open}
                onClose={() => setOpen(false)}
                onReFeshFilter={onRefeshFilter}
                valueFilter={valueFilter}
            />
        </div>
    );
};

export default ReportAssetMaintenanceRequest;