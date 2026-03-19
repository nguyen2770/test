import { ArrowLeftOutlined, CheckOutlined, CloseOutlined, FilterOutlined } from "@ant-design/icons";
import { Col, Row, Form, Spin, Radio } from "antd";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import * as _unitOfWork from "../../../api";
import ShowError from "../../../components/modal/result/errorNotification";
import CardList from "../../../components/Card/CardList";
import { PAGINATION, reportView } from "../../../utils/constant";
import { formatMillisToHHMM, formatMillisToHHMMSS, parseDateHH } from "../../../helper/date-helper";
import CardFilterAssetPrtforMance from "./CardFilterAssetPrtforMance";
import { useTranslation } from "react-i18next";

const AssetPerformance = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [form] = Form.useForm();
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
            return ShowError("topRight", t("report.assetPerformance.title"), t("report.common.validation.dates_required", { defaultValue: "Điền đầy đủ ngày tháng" }));

        setLoading(true);
        try {
            const api =
                viewOption === reportView.summary
                    ? _unitOfWork.reportAssetMaintenance.getSummaryReportAssetPerformance
                    : _unitOfWork.reportAssetMaintenance.getDetailsReportAssetPerformance;

            const res = await api({
                page: currentPage,
                limit: PAGINATION.limit,
                ...value,
                startDate: value.startDate,
                endDate: value.endDate,
            });

            if (res && res.code === 1) {
                setTotalRecord(res.totalResults);
                const list = res.assetMaintenanceSummarys || res.assetMaintenances;
                setData(prev => (isLoadMore ? [...prev, ...list] : list));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const onRefeshFilter = () => {
        setOpen(false);
        setValueFilter([]);
    };

    const onSearchFilter = (_valueFilter) => {
        setPage(1);
        setValueFilter(_valueFilter);
    };

    const columns =
        viewOption === reportView.summary
            ? [
                { title: t("report.assetPerformance.columns_summary.customer"), key: "customer", render: (_, item) => item.customer?.customerName || "-" },
                { title: t("report.assetPerformance.columns_summary.total_assets"), key: "totalAssetmaintenances", render: (_, i) => i.totalAssetmaintenances },
                { title: t("report.assetPerformance.columns_summary.hours_available"), key: "totalHoursAvailable", render: (_, i) => formatMillisToHHMMSS(i.totalHoursAvailable) },
                { title: t("report.assetPerformance.columns_summary.actual_project_hours"), key: "totalDowntimeCheckinCheckout", render: (_, i) => formatMillisToHHMM(i.totalDowntimeCheckinCheckout) },
                { title: t("report.assetPerformance.columns_summary.breakdowns"), key: "totalBreakdowns", render: (_, i) => i.totalBreakdowns },
                { title: t("report.assetPerformance.columns_summary.downtime_card"), key: "totalDowntime", render: (_, i) => formatMillisToHHMM(i.totalDowntime) },
                { title: t("report.assetPerformance.columns_summary.availability"), key: "totalAvailability", render: (_, i) => (i.totalAvailability ? i.totalAvailability.toFixed(2) : "0.00") },
                { title: t("report.assetPerformance.columns_summary.mttr"), key: "totalMTTR", render: (_, i) => formatMillisToHHMM(i.totalMTTR) },
                { title: t("report.assetPerformance.columns_summary.mtbf"), key: "totalMTBF", render: (_, i) => formatMillisToHHMM(i.totalMTBF) },
            ]
            : [
                { title: t("report.assetPerformance.columns_detail.asset_name"), key: "asset", render: (_, i) => i.asset?.assetName },
                { title: t("report.assetPerformance.columns_detail.model"), key: "assetModel", render: (_, i) => i.assetModel?.assetModelName },
                { title: t("report.assetPerformance.columns_detail.serial"), key: "serial", render: (_, i) => i.serial },
                { title: t("report.assetPerformance.columns_detail.asset_number"), key: "assetNumber", render: (_, i) => i.assetNumber },
                { title: t("report.assetPerformance.columns_detail.ref_date"), key: "installationDate", render: (_, i) => i.installationDate ? parseDateHH(i.installationDate) : parseDateHH(i.createdAt) },
                { title: t("report.assetPerformance.columns_summary.hours_available"), key: "totalHoursAvailable", render: (_, i) => formatMillisToHHMMSS(i.totalHoursAvailable) },
                { title: t("report.assetPerformance.columns_summary.actual_project_hours"), key: "totalDowntimeCheckinCheckout", render: (_, i) => formatMillisToHHMM(i.totalDowntimeCheckinCheckout) },
                { title: t("report.assetPerformance.columns_summary.breakdowns"), key: "totalBreakdowns", render: (_, i) => i.totalBreakdowns },
                { title: t("report.assetPerformance.columns_summary.downtime_card"), key: "totalDowntime", render: (_, i) => formatMillisToHHMM(i.totalDowntime) },
                { title: t("report.assetPerformance.columns_summary.availability"), key: "totalAvailability", render: (_, i) => (i.totalAvailability ? i.totalAvailability.toFixed(2) : "0.00") },
                { title: t("report.assetPerformance.columns_summary.mttr"), key: "totalMTTR", render: (_, i) => formatMillisToHHMM(i.totalMTTR) },
                { title: t("report.assetPerformance.columns_summary.mtbf"), key: "totalMTBF", render: (_, i) => formatMillisToHHMM(i.totalMTBF) },
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
                            <span style={{ fontSize: 18, fontWeight: 600 }}>{t("report.assetPerformance.title")}</span>
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
                        <FilterOutlined
                            style={{ fontSize: 22, marginRight: 12, cursor: "pointer" }}
                            onClick={() => setOpen(true)}
                            title={t("report.filter.title")}
                        />
                        {valueFilter ? (
                            <CheckOutlined
                                style={{
                                    position: "absolute",
                                    top: -5,
                                    right: 0,
                                    fontSize: 12,
                                    color: "green",
                                }}
                            />
                        ) : (
                            <CloseOutlined
                                style={{
                                    position: "absolute",
                                    top: -5,
                                    right: 0,
                                    fontSize: 12,
                                    color: "red",
                                }}
                            />
                        )}
                    </div>
                </Col>
            </Row>

            <div ref={contentRef} style={{ height: "calc(100vh - 56px)", overflowY: "auto", padding: 12 }}>
                <Form
                    form={form}
                    onFinish={() => {
                        setPage(1);
                        fetchData(1);
                    }}
                >
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
                        <Col span={12} style={{ textAlign: "end", fontWeight: 600 }}>
                            {t("report.common.table.total", { count: totalRecord })}
                        </Col>
                    </Row>
                </Form>

                {loading && page === 1 ? (
                    <Spin style={{ display: "flex", justifyContent: "center", marginTop: 50 }} />
                ) : data.length === 0 ? (
                    <div style={{ textAlign: "center", marginTop: 40, color: "#888" }}>{t("report.common.no_data")}</div>
                ) : (
                    <CardList columns={columns} data={data} />
                )}
            </div>

            <CardFilterAssetPrtforMance
                onSearch={onSearchFilter}
                open={open}
                onClose={() => setOpen(false)}
                onReFeshFilter={onRefeshFilter}
                valueFilter={valueFilter}
            />
        </div>
    );
};

export default AssetPerformance;