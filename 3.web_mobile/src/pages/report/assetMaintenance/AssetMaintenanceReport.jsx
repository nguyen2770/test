import { ArrowLeftOutlined, CheckOutlined, CloseOutlined, FilterOutlined } from "@ant-design/icons";
import { Row, Col, Spin } from "antd";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as _unitOfWork from "../../../api";
import dayjs from "dayjs";
import { FORMAT_DATE, PAGINATION } from "../../../utils/constant";
import CardList from "../../../components/Card/CardList";
import CardFilterAssetMaintenanceReport from "./CardFilterAssetMaintenanceReport";
import { useTranslation } from "react-i18next";

const AssetMaintenanceReport = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [valueFilter, setValueFilter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [totalRecord, setTotalRecord] = useState(0);
  const contentRef = useRef(null);
  const [summary, setSummary] = useState([]);

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

  useEffect(() => {
    if (totalRecord > 0) {
      getTotal();
    }
  }, [valueFilter, totalRecord]);

  const fetchData = async (currentPage = 1, isLoadMore = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await _unitOfWork.report.getAssetMaintenanceReport({
        page: currentPage,
        limit: PAGINATION.limit,
        ...valueFilter,
      });
      if (res && res.code === 1) {
        setTotalRecord(res.totalResults);
        if (isLoadMore) {
          setData(prev => [...prev, ...res.results]);
        } else {
          setData(res.results);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getTotal = async () => {
    const payload = {
      page: page,
      limit: PAGINATION.limit,
      ...valueFilter,
    };
    const summaryRes = await _unitOfWork.report.getAssetMaintenanceReport({ ...payload, limit: totalRecord });
    if (summaryRes && summaryRes.code === 1) {
      setSummary(summaryRes.summary);
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

  const columns = [
    { title: t("report.assetMaintenanceReport.columns.customer_name"), key: "customerName", render: (_, item) => item.customer?.customerName || "-" },
    { title: t("report.assetMaintenanceReport.columns.building"), key: "buildingName", render: (_, item) => item.building?.buildingName || "-" },
    { title: t("report.assetMaintenanceReport.columns.department"), key: "departmentName", render: (_, item) => item.department?.departmentName || "-" },
    { title: t("report.assetMaintenanceReport.columns.asset_model"), key: "modelName", render: (_, item) => item.assetModel?.assetModelName || "-" },
    { title: t("report.assetMaintenanceReport.columns.purchase_date"), key: "purchaseDate", render: (_, item) => item.purchaseDate ? dayjs(item.purchaseDate).format(FORMAT_DATE) : "-" },
    { title: t("report.assetMaintenanceReport.columns.configured_count"), key: "configuredCount", render: (_, item) => item.counts?.configuredCount || 0 },
  ];

  const columnsSummary = [
    {
      title: t("report.assetMaintenanceReport.summary_headers.customer"),
      dataIndex: "customerCount",
      key: "customerCount",
    },
    {
      title: t("report.assetMaintenanceReport.summary_headers.building"),
      dataIndex: "buildingCount",
      key: "buildingCount",
    },
    {
      title: t("report.assetMaintenanceReport.summary_headers.department"),
      dataIndex: "departmentCount",
      key: "departmentCount",
    },
    {
      title: t("report.assetMaintenanceReport.summary_headers.floor"),
      dataIndex: "floorCount",
      key: "floorCount",
    },
    {
      title: t("report.assetMaintenanceReport.summary_headers.configured"),
      dataIndex: "totalConfigured",
      key: "totalConfigured",
    },
    {
      title: t("report.assetMaintenanceReport.summary_headers.created"),
      dataIndex: "totalCreated",
      key: "totalCreated",
    },
    {
      title: t("report.assetMaintenanceReport.summary_headers.assigned"),
      dataIndex: "totalAssigned",
      key: "totalAssigned",
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5" }}>
      <Row
        style={{
          display: "flex",
          alignItems: "center",
          height: 56,
          background: "#23457b",
          color: "#fff",
          padding: "0 16px",
          fontWeight: 600,
          fontSize: 20,
          boxSizing: "border-box",
        }}
      >
        <Col span={16}>
          <ArrowLeftOutlined
            style={{ fontSize: 22, marginRight: 16, cursor: "pointer" }}
            onClick={() => navigate(-1)}
          />
          <span style={{ flex: 1, fontSize: 20 }}>{t("report.assetMaintenanceReport.title")}</span>
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
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ marginBottom: 8, fontWeight: "600" }}>{t("report.common.headings.overview")}</h3>
              <CardList columns={columnsSummary} data={[summary]} />
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
      <CardFilterAssetMaintenanceReport
        onSearch={onSearchFilter}
        open={open}
        onClose={() => setOpen(false)}
        onReFeshFilter={onRefeshFilter}
      />
    </div>
  );
};

export default AssetMaintenanceReport;