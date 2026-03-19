import { ArrowLeftOutlined, FilterOutlined, CheckOutlined, CloseOutlined, FilePdfOutlined } from "@ant-design/icons";
import { Row, Col, Spin, Button } from "antd";
import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as _unitOfWork from "../../../api";
import { PAGINATION } from "../../../utils/constant";
import dayjs from "dayjs";
import CardList from "../../../components/Card/CardList";
import CardFilterSparePart from "./CardFilterSparePartReport";
import { staticPath } from "../../../router/RouteConfig";
import { useTranslation } from "react-i18next";

const SparePartsUsageSummaryReport = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [totalRecord, setTotalRecord] = useState(0);
    const contentRef = useRef(null);
    const [valueFilter, setValueFilter] = useState({
        startDate: dayjs().startOf("month")
    });
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const div = contentRef.current;
        if (!div) return;
        const handleScroll = () => {
            const isBottom = div.scrollTop + div.clientHeight >= div.scrollHeight - 10;
            if (isBottom && data.length < totalRecord && !loading) {
                setPage(prev => prev + 1);
            }
        };
        div.addEventListener("scroll", handleScroll);
        return () => div.removeEventListener("scroll", handleScroll);
    }, [data, totalRecord, loading]);

    useEffect(() => {
        fetchData(page, page > 1);
    }, [page, valueFilter]);

    const fetchData = async (currentPage = 1, isLoadMore = false) => {
        if (loading) return;
        setLoading(true);
        try {
            const res = await _unitOfWork.report.getSparePartsUsageSummary({
                page: currentPage,
                limit: PAGINATION.limit,
                ...valueFilter
            });
            if (res && res.code === 1) {
                setTotalRecord(res.data.total);
                if (isLoadMore) {
                    setData(prev => [...prev, ...res.data.data]);
                } else {
                    setData(res.data.data);
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
        setValueFilter([]);
    };

    const onSearchFilter = (_valueFilter) => {
        setValueFilter(_valueFilter);
    };

    const columns = [
        {
            title: t("report.spareUsageSummary.columns.spare_category"),
            dataIndex: "spareCategory",
            key: "spareCategoryId",
            width: 180,
            render: (text) => <span>{text.spareCategoryName}</span>
        },
        {
            title: t("report.spareUsageSummary.columns.manufacturer"),
            dataIndex: "manufacturer",
            key: "manufacturer",
            width: 160,
            render: (text) => <span>{text.manufacturerName}</span>
        },
        {
            title: t("report.spareUsageSummary.columns.spare_part_id"),
            dataIndex: "sparePart",
            key: "code",
            width: 120,
            render: (text) => <span>{text.code}</span>
        },
        {
            title: t("report.spareUsageSummary.columns.spare_part_name"),
            dataIndex: "sparePart",
            key: "sparePartsName",
            width: 200,
            render: (text) => <span>{text.sparePartsName}</span>
        },
        {
            title: t("report.spareUsageSummary.columns.transaction_qty"),
            dataIndex: "qty",
            key: "transactionQty",
            align: "right",
            width: 120,
        },
        {
            title: t("report.spareUsageSummary.columns.uom"),
            dataIndex: "uom",
            key: "uom",
            width: 100,
            render: (text) => <span>{text.uomName}</span>
        },
        {
            title: t("report.spareUsageSummary.columns.action"),
            dataIndex: "action",
            align: "center",
            fixed: "right",
            width: 80,
            disabled: true,
            render: (_, record) => (
                <Button
                    type="primary"
                    icon={<FilePdfOutlined />}
                    size="small"
                    title={t("report.spareUsageSummary.action_goto_detail")}
                    onClick={() => {
                        const params = Object.fromEntries(
                            Object.entries({
                                ...valueFilter,
                                sparePart: record.sparePart._id,
                                startDate: valueFilter.startDate
                                    ? dayjs(valueFilter.startDate).toISOString()
                                    : undefined,
                                endDate: valueFilter.endDate
                                    ? dayjs(valueFilter.endDate).toISOString()
                                    : undefined,
                            }).filter(([_, v]) => v !== undefined && v !== null && v !== "")
                        );
                        const query = new URLSearchParams(params).toString();
                        navigate(`${staticPath.spareMovementReport}?${query}`);
                    }}
                />
            )
        }
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
                            <span style={{ fontSize: 18, fontWeight: 600 }}>{t("report.spareUsageSummary.title")}</span>
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

            <div
                ref={contentRef}
                style={{ height: "calc(100vh - 56px)", overflowY: "auto", padding: 12 }}
            >
                {loading && page === 1 ? (
                    <Spin style={{ display: "flex", justifyContent: "center", marginTop: 50 }} />
                ) : data.length === 0 ? (
                    <div style={{ textAlign: "center", marginTop: 40, color: "#888" }}>
                        {t("report.common.no_data")}
                    </div>
                ) : (
                    <>
                        <Row justify="space-between" align="middle" style={{ marginBottom: 8 }}>
                            <Col>
                                <h3 style={{ margin: 0, fontWeight: "600" }}>{t("report.common.headings.detail_list")}</h3>
                            </Col>
                            <Col style={{ fontWeight: "600", color: "#555" }}>
                                {t("report.common.table.total", { count: totalRecord })}
                            </Col>
                        </Row>
                        <CardList columns={columns} data={data} />
                    </>
                )}
            </div>
            <CardFilterSparePart
                onSearch={onSearchFilter}
                open={open}
                onClose={() => setOpen(false)}
                onReFeshFilter={onRefeshFilter}
                valueFilter={valueFilter}
            />
        </div>
    );
};

export default SparePartsUsageSummaryReport;