import { ArrowLeftOutlined, FilterOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { Row, Col, Spin } from "antd";
import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as _unitOfWork from "../../../api";
import { PAGINATION } from "../../../utils/constant";
import dayjs from "dayjs";
import CardList from "../../../components/Card/CardList";
import { parseDate } from "../../../helper/date-helper";
import CardFilterSparePart from "./CardFilterSparePartReport";
import { useTranslation } from "react-i18next";

const SparePartsUsage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const [data, setData] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [totalRecord, setTotalRecord] = useState(0);
    const contentRef = useRef(null);
    const [valueFilter, setValueFilter] = useState({
        spareSubCategoryId:
            query.get("spareSubCategoryId") && query.get("spareSubCategoryId") !== "undefined"
                ? query.get("spareSubCategoryId").split(",")
                : undefined,
        sparePart:
            query.get("sparePart") && query.get("sparePart") !== "undefined"
                ? query.get("sparePart")
                : undefined,
        spareCategoryId:
            query.get("spareCategoryId") && query.get("spareCategoryId") !== "undefined"
                ? query.get("spareCategoryId").split(",")
                : undefined,
        startDate:
            query.get("startDate") && query.get("startDate") !== "undefined"
                ? dayjs(query.get("startDate"))
                : dayjs().startOf("month"),
        endDate:
            query.get("endDate") && query.get("endDate") !== "undefined"
                ? dayjs(query.get("endDate"))
                : undefined,
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

    const cleanObject = (obj) => {
        return Object.fromEntries(
            Object.entries(obj).filter(([_, v]) => v !== undefined && v !== null)
        );
    };
    const fetchData = async (currentPage = 1, isLoadMore = false) => {
        if (loading) return;
        setLoading(true);
        try {
            const payload = cleanObject({
                page: currentPage,
                limit: PAGINATION.limit,
                ...valueFilter,
            });
            const res = await _unitOfWork.report.spareMovementReport(payload);
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
        setPage(1);
        setData([]);
        setValueFilter(_valueFilter);
    };

    const columns = [
        {
            title: t("report.spareUsageDetail.columns.transaction_date"),
            dataIndex: "assignUserDate",
            key: "assignUserDate",
            width: 120,
            disabled: true,
            render: (text) => <span>{parseDate(text)}</span>
        },
        {
            title: t("report.spareUsageDetail.columns.spare_category"),
            dataIndex: "spareCategory",
            key: "spareCategoryId",
            width: 180,
            render: (text) => <span>{text.spareCategoryName}</span>
        },
        {
            title: t("report.spareUsageDetail.columns.manufacturer"),
            dataIndex: "manufacturer",
            key: "manufacturer",
            width: 160,
            render: (text) => <span>{text.manufacturerName}</span>
        },
        {
            title: t("report.spareUsageDetail.columns.spare_part_id"),
            dataIndex: "sparePart",
            key: "code",
            width: 120,
            render: (text) => <span>{text.code}</span>
        },
        {
            title: t("report.spareUsageDetail.columns.spare_part_name"),
            dataIndex: "sparePart",
            key: "sparePartsName",
            width: 200,
            render: (text) => <span>{text.sparePartsName}</span>
        },
        {
            title: t("report.spareUsageDetail.columns.transaction_qty"),
            dataIndex: "qty",
            key: "transactionQty",
            align: "right",
            width: 120,
        },
        {
            title: t("report.spareUsageDetail.columns.uom"),
            dataIndex: "uom",
            key: "uom",
            width: 100,
            render: (text) => <span>{text.uomName}</span>
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
                            <span style={{ fontSize: 18, fontWeight: 600 }}>{t("report.spareUsageDetail.title")}</span>
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

export default SparePartsUsage;