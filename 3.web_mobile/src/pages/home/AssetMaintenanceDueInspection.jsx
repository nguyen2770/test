import { useEffect, useRef, useState } from "react";
import {
  RedoOutlined,
  SearchOutlined,
  RightSquareOutlined,
  ArrowLeftOutlined,
  FilterOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  Pagination,
  Row,
  Spin,
  Table,
  Tooltip,
} from "antd";
import { assetStyle, assetType } from "../../utils/constant";
import * as _unitOfWork from "../../api";
import { parseDate } from "../../helper/date-helper";
import { parseToLabel } from "../../helper/parse-helper";
import { useNavigate } from "react-router-dom";
import { staticPath } from "../../router/RouteConfig";
import CardFilterAssetMaintenanceDueInspection from "./CardFilterAssetMaintenanceDueInspection";
import CardList from "../../components/Card/CardList";
import { useTranslation } from "react-i18next";
export default function AssetMaintenanceDueInspection() {
  const [totalRecord, setTotalRecord] = useState(0);
  const [page, setPage] = useState(1);
  const [assetMaintenances, setAssetMaintenances] = useState([]);
  const [form] = Form.useForm();
  const [valueFilter, setValueFilter] = useState([]);
  const [open, setOpen] = useState(false);
  const contentRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (page > 1) {
      fetchAssetMaintenanceDueInspections();
    } else {
      fetchAssetMaintenanceDueInspections(1);
    }
  }, [page]);

  useEffect(() => {
    setPage(1);
    fetchAssetMaintenanceDueInspections(1);
  }, [valueFilter]);

  useEffect(() => {
    const div = contentRef.current;
    if (!div) return;
    const handleScroll = () => {
      const isBottom =
        div.scrollTop + div.clientHeight >= div.scrollHeight - 10;
      if (isBottom && assetMaintenances.length < totalRecord && !loading)
        setPage((prev) => prev + 1);
    };
    div.addEventListener("scroll", handleScroll);
    return () => div.removeEventListener("scroll", handleScroll);
  }, [assetMaintenances, totalRecord, loading]);

  const fetchAssetMaintenanceDueInspections = async (_page) => {
    if (loading) return;
    setLoading(true);
    const value = form.getFieldsValue();
    const payload = {};
    if (value.serial) {
      payload.serial = value.serial;
    }
    if (value.assetNumber) {
      payload.assetNumber = value.assetNumber;
    }
    if (value.nextInspectionDate) {
      payload.nextInspectionDate = value.nextInspectionDate;
    }
    try {
      let res =
        await _unitOfWork.assetMaintenance.getAssetMaintenanceDueInspections({
          page: _page || page,
          limit: 5,
          ...payload,
          ...valueFilter,
        });
      if (res && res.code === 1) {
        if ((_page || page) > 1) {
          setAssetMaintenances((prev) => [...prev, ...res?.data?.results]);
        } else {
          setAssetMaintenances(res?.data?.results);
        }
        setTotalRecord(res?.data?.totalResults || 0);
      }
    } finally {
      setLoading(false);
    }
  };
  const onClickView = (record) => {
    window.open(staticPath.assetMaintenanceDetail + "/" + record.id, "_blank");
  };

  const onSearchFilter = (value) => {
    setValueFilter(value);
  };

  const columns = [
    {
      dataIndex: "asset",
      key: "asset",
      title: t("dashboard.inspection_calibration_due_date.table.asset_name"),
      render: (_text, record) => <span>{record?.asset?.assetName}</span>,
    },
    {
      dataIndex: "assetNumber",
      key: "assetNumber",
      title: t("dashboard.inspection_calibration_due_date.table.asset_number"),
    },
    {
      dataIndex: t("dashboard.inspection_calibration_due_date.table.serial"),
      dataIndex: "serial",
      key: "serial",
      title: "Số serial",
    },
    {
      dataIndex: "assetModel",
      key: "assetModel",
      title: t("dashboard.inspection_calibration_due_date.table.model"),
      title: "Model",
      render: (_text, record) => (
        <span>{record?.assetModel?.assetModelName}</span>
      ),
    },
    {
      title: t("dashboard.inspection_calibration_due_date.table.asset_style"),
      dataIndex: "assetStyle",
      align: "center",
      className: "text-left-column",
      render: (text, record) => t(parseToLabel(assetStyle.Options, text)),
    },
    {
      title: t("dashboard.inspection_calibration_due_date.table.customer"),
      dataIndex: "customer",
      align: "center",
      className: "text-left-column",
      render: (text, record) => parseToLabel(assetType.Options, text),
    },
    {
      dataIndex: "nextInspectionDate",
      key: "nextInspectionDate",
      title: t(
        "dashboard.inspection_calibration_due_date.table.inspection_date_next"
      ),
      align: "center",
      render: (_text, record) => (
        <span style={{ fontWeight: 600 }}>
          {parseDate(record?.nextInspectionDate)}
        </span>
      ),
    },
    {
      title: t("dashboard.inspection_calibration_due_date.table.action"),
      dataIndex: "action",
      align: "center",
      fixed: "right",
      render: (_, record) => (
        <div>
          <Tooltip
            title={t(
              "dashboard.inspection_calibration_due_date.table.detail_button"
            )}
          >
            <Button
              type="primary"
              icon={<RightSquareOutlined />}
              size="small"
              onClick={() => onClickView(record)}
            />
          </Tooltip>
        </div>
      ),
    },
  ];
  const onSearch = (value) => {
    setPage(value);
  };
  const resetSearch = () => {
    form.resetFields();
    setPage(1);
    fetchAssetMaintenanceDueInspections(1);
  };
  return (
    <div>
      <div
        style={{
          alignItems: "center",
          background: "#23457b",
          color: "#fff",
          padding: "15px",
          fontWeight: 600,
          fontSize: 20,
          position: "sticky",
          top: 0,
          right: 0,
          left: 0,
          zIndex: 1000,
        }}
      >
        <Row gutter={[16, 16]}>
          <Col span={16}>
            <ArrowLeftOutlined
              style={{ fontSize: 22, marginRight: 16, cursor: "pointer" }}
              onClick={() => navigate(-1)}
            />
            {t("dashboard.inspection_calibration_due_date.com_back")}
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
      </div>
      <div
        className="p-1"
        ref={contentRef}
        style={{
          height: "calc(100vh - 118px)",
          overflowY: "auto",
          padding: 12,
        }}
      >
        <Form
          form={form}
          layout="vertical"
          className="mb-2"
          onFinish={onSearch}
        >
          <Row gutter={[16, 16]} style={{ width: "100%" }} className="mt-2">
            <Col span={18}>
              {/* <Button type="primary" className="mr-2" htmlType="submit">
                <SearchOutlined />
                Tìm kiếm
              </Button>
              <Button className="bt-green mr-2" onClick={resetSearch}>
                <RedoOutlined />
                Làm mới
              </Button> */}
            </Col>
            <Col span={6} style={{ textAlign: "end" }}>
              <span style={{ fontWeight: 600, fontSize: "16px" }}>
                {t("dashboard.inspection_calibration_due_date.total", {
                  count: totalRecord,
                })}
              </span>
            </Col>
          </Row>
        </Form>
        {!loading && page >= 1 ? (
          <CardList columns={columns} data={assetMaintenances} />
        ) : assetMaintenances.length === 0 ? (
          <div style={{ textAlign: "center", marginTop: 40, color: "#888" }}>
            {t("dashboard.inspection_calibration_due_date.no_data")}
          </div>
        ) : (
          ""
        )}
      </div>
      <CardFilterAssetMaintenanceDueInspection
        open={open}
        onClose={() => setOpen(false)}
        onReFeshFilter={() => fetchAssetMaintenanceDueInspections(1)}
        valueFilter={valueFilter}
        onSearch={onSearchFilter}
      />
    </div>
  );
}
