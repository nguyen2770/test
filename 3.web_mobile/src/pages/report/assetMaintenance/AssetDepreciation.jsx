import { ArrowLeftOutlined, CalculatorOutlined, CheckOutlined, CloseOutlined, FilterOutlined } from "@ant-design/icons";
import { Col, Row, Form, Spin, Radio } from "antd";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import * as _unitOfWork from "../../../api";
import CardList2 from "../../../components/Card/CardList2";
import { PAGINATION, reportView } from "../../../utils/constant";
import { parseDate } from "../../../helper/date-helper";
import CardFilterAssetDepreciation from "./CardFilterAssetDepreciation";
import { useTranslation } from "react-i18next";
import CardTotalAssetDepreciationReport from "./CardTotalAssetDepreciationReport";

const AssetDepreciationReport = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [valueFilter, setValueFilter] = useState({
        reportCutoffDate: dayjs().endOf("day"),
    });
    const [viewOption, setViewOption] = useState(reportView.summary);
    const [data, setData] = useState([]);
    const [page, setPage] = useState(1);
    const [totalRecord, setTotalRecord] = useState(0);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [openTotal, setOpenTotal] = useState(false);
    const contentRef = useRef(null);
    const [totalValue, setTotalValue] = useState([]);

    useEffect(() => {
        if (page === 1) {
            fetchData(1);
            fetchGetTotalReport();
        }
        else fetchData(page, true);
    }, [page, viewOption, valueFilter]);

    useEffect(() => {
        if (totalRecord > 0)
            fetchGetTotalReport();
    }, [totalRecord]);

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

        setLoading(true);
        try {
            const api =
                viewOption === reportView.summary
                    ? _unitOfWork.reportAssetDepreciation.getAssetDepreciationReport
                    : _unitOfWork.reportAssetDepreciation.getDetailAssetDepreciationReport;

            const res = await api({
                page: currentPage,
                limit: PAGINATION.limit,
                ...value,
                reportCutoffDate: value.reportCutoffDate,
            });

            if (res && res.code === 1) {
                setTotalRecord(res.totalResults);
                const list = res.reports;
                setData(prev => (isLoadMore ? [...prev, ...list] : list));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchGetTotalReport = async () => {
        const payload = {
            page: 1,
            limit: totalRecord,
            ...valueFilter,
        }
        // const t = `Tổng ${totalRecord} bản ghi: `;
        const text = t("report.assetDepreciation.label.total_count", { count: totalRecord });
        if (viewOption === reportView.summary) {
            const res = await _unitOfWork.reportAssetDepreciation.getAssetDepreciationReport(payload);
            if (res && res.code === 1) {
                const fieldsToSum = [
                    'originValue',
                    'depreciableValue',
                    'accumulatedValue'
                ];
                const r = [
                    {
                        text: text,
                        ...calculateTotals(res?.reports, fieldsToSum),
                    }
                ];
                setTotalValue(r);
            }
        } else {
            const res = await _unitOfWork.reportAssetDepreciation.getDetailAssetDepreciationReport(payload);
            if (res && res.code === 1) {
                const fieldsToSum = [
                    'originValue',
                ];
                const filedsMonth = [
                    'month_1',
                    'month_2',
                    'month_3',
                    'month_4',
                    'month_5',
                    'month_6',
                    'month_7',
                    'month_8',
                    'month_9',
                    'month_10',
                    'month_11',
                    'month_12',
                    'total',
                ];
                const monthsData = res?.reports.map(record => record.depreciationMonths)
                    .filter(monthData => monthData !== null && monthData !== undefined);
                const r = [
                    {
                        text: text,
                        ...calculateTotals(res?.reports, fieldsToSum),
                        ...calculateTotals(monthsData, filedsMonth),
                    }
                ];
                setTotalValue(r);
            }
        }
    };

    const calculateTotals = (data, fields) => {
        if (!Array.isArray(data)) {
            return {};
        }
        const grandTotals = data.reduce((acc, record) => {
            fields.forEach(field => {
                const value = Number(record[field]) || 0;
                acc[field] = (acc[field] || 0) + value;
            });
            return acc;
        }, {});
        return grandTotals;
    }

    const onRefeshFilter = () => {
        setOpen(false);
        setValueFilter(
            { reportCutoffDate: dayjs().endOf("day") },
        );
    };

    const onSearchFilter = (_valueFilter) => {
        setPage(1);
        setValueFilter(_valueFilter);
    };

    const formatNumber = (amount) => {
        if (typeof amount !== 'number' && typeof amount !== 'string') return null;
        const numberValue = parseFloat(amount);
        if (isNaN(numberValue)) return null;

        return new Intl.NumberFormat('en-US', {
            style: 'decimal',
            minimumFractionDigits: 0, // Không hiển thị số thập phân
            maximumFractionDigits: 0  // Không hiển thị số thập phân
        }).format(numberValue);
    };

    const columns = viewOption === reportView.summary
        ? [
            { title: t("report.assetDepreciation.columns.asset_name"), key: "assetName", render: (_, item) => item.assetName || "-" },
            { title: t("report.assetDepreciation.columns.serial"), key: "serial", render: (_, item) => item.serial || "-" },
            { title: t("report.assetDepreciation.columns.depreciation_start_date"), key: "depreciationStartDate", render: (_, i) => parseDate(i.depreciationStartDate) || "-" },
            { title: t("report.assetDepreciation.columns.usage_time"), key: "usageTime", render: (_, i) => (i.usageTime + ' ' + t("common.modal.calendarSchedule.fields.month")) || "-" },
            { title: t("report.assetDepreciation.columns.remaining_time"), key: "remainingTime", render: (_, i) => (i.remainingTime + ' ' + t("common.modal.calendarSchedule.fields.month")) || "-" },
            { title: t("report.assetDepreciation.columns.origin_value"), key: "originValue", render: (_, i) => formatNumber(i.originValue) || "-" },
            { title: t("report.assetDepreciation.columns.depreciable_value"), key: "depreciableValue", render: (_, i) => formatNumber(i.depreciableValue) || "-" },
            { title: t("report.assetDepreciation.columns.accumulated_value"), key: "accumulatedValue", render: (_, i) => formatNumber(i.accumulatedValue) || "-" },
        ]
        : [
            { title: t("report.assetDepreciation.columns_detail.asset_name"), key: "assetName", render: (_, i) => i.assetName || "-" },
            { title: t("report.assetDepreciation.columns_detail.serial"), key: "serial", render: (_, i) => i.serial || "-" },
            { title: t("report.assetDepreciation.columns_detail.origin_value"), key: "originValue", render: (_, i) => formatNumber(i.originValue) || "-" },
            {
                title: t("report.assetDepreciation.columns_detail.monthly_depreciation_value"), key: "depreciationMonths",
                children: [
                    { title: t("report.assetDepreciation.columns_detail.month_1"), key: "depreciationMonths", render: (_, i) => formatNumber(i.depreciationMonths?.month_1) || "-" },
                    { title: t("report.assetDepreciation.columns_detail.month_2"), key: "depreciationMonths", render: (_, i) => formatNumber(i.depreciationMonths?.month_2) || "-" },
                    { title: t("report.assetDepreciation.columns_detail.month_3"), key: "depreciationMonths", render: (_, i) => formatNumber(i.depreciationMonths?.month_3) || "-" },
                    { title: t("report.assetDepreciation.columns_detail.month_4"), key: "depreciationMonths", render: (_, i) => formatNumber(i.depreciationMonths?.month_4) || "-" },
                    { title: t("report.assetDepreciation.columns_detail.month_5"), key: "depreciationMonths", render: (_, i) => formatNumber(i.depreciationMonths?.month_5) || "-" },
                    { title: t("report.assetDepreciation.columns_detail.month_6"), key: "depreciationMonths", render: (_, i) => formatNumber(i.depreciationMonths?.month_6) || "-" },
                    { title: t("report.assetDepreciation.columns_detail.month_7"), key: "depreciationMonths", render: (_, i) => formatNumber(i.depreciationMonths?.month_7) || "-" },
                    { title: t("report.assetDepreciation.columns_detail.month_8"), key: "depreciationMonths", render: (_, i) => formatNumber(i.depreciationMonths?.month_8) || "-" },
                    { title: t("report.assetDepreciation.columns_detail.month_9"), key: "depreciationMonths", render: (_, i) => formatNumber(i.depreciationMonths?.month_9) || "-" },
                    { title: t("report.assetDepreciation.columns_detail.month_10"), key: "depreciationMonths", render: (_, i) => formatNumber(i.depreciationMonths?.month_10) || "-" },
                    { title: t("report.assetDepreciation.columns_detail.month_11"), key: "depreciationMonths", render: (_, i) => formatNumber(i.depreciationMonths?.month_11) || "-" },
                    { title: t("report.assetDepreciation.columns_detail.month_12"), key: "depreciationMonths", render: (_, i) => formatNumber(i.depreciationMonths?.month_12) || "-" },
                ]
            },
            { title: t("report.assetDepreciation.columns_detail.total"), key: "depreciationMonths", render: (_, i) => formatNumber(i.depreciationMonths?.total) },
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
                            <span style={{ fontSize: 18, fontWeight: 600 }}>{t("report.assetDepreciation.title")}</span>
                        </Col>
                    </Row>
                </Col>
                <Col
                    span={4}
                    style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        gap: 12,
                        color: "#ffffff",
                    }}
                >
                    <CalculatorOutlined
                        style={{ fontSize: 22 }}
                        onClick={() => setOpenTotal(true)}
                    />
                </Col>
                <Col
                    span={4}
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
                                onChange={(e) => {
                                    setViewOption(e.target.value);
                                    setPage(1);
                                    setData([]);
                                    setTotalValue([]);
                                }}
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
                    <CardList2 columns={columns} data={data} />
                )}
            </div>

            <CardFilterAssetDepreciation
                onSearch={onSearchFilter}
                open={open}
                onClose={() => setOpen(false)}
                onReFeshFilter={onRefeshFilter}
                valueFilter={valueFilter}
                viewOption={viewOption}
            />
            <CardTotalAssetDepreciationReport
                open={openTotal}
                onClose={() => setOpenTotal(false)}
                data={totalValue}
                formatNumber={formatNumber}
                viewOption={viewOption}
                valueFilter={valueFilter}
            />
        </div>
    );
};

export default AssetDepreciationReport;