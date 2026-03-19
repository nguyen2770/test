import React, { useEffect, useState } from "react";
import {
  FormOutlined,
  HistoryOutlined,
  RedoOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Button,
  Col,
  Form,
  Input,
  Pagination,
  Row,
  Table,
  Tooltip,
} from "antd";
import {
  dateType,
  PAGINATION,
  ScheduleBasedOnType,
} from "../../../utils/constant";
import * as _unitOfWork from "../../../api";
import useHeader from "../../../contexts/headerContext";
import useAuth from "../../../contexts/authContext";
import { checkPermission } from "../../../helper/permission-helper";
import { permissionCodeConstant } from "../../../utils/permissionConstant";
import { useTranslation } from "react-i18next";
import { parseToLabel } from "../../../helper/parse-helper";
import UpdatePreventiveConditionBasedSchedule from "./UpdatePreventiveConditionBasedSchedule";
import ViewPreventiveConditionBasedScheduleHistory from "./ViewPreventiveConditionBasedScheduleHistory";

export default function PreventiveConditionBasedSchedule() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(PAGINATION);
  const [totalRecord, setTotalRecord] = useState(0);
  const [
    preventiveConditionBasedSchedules,
    setPreventiveConditionBasedSchedules,
  ] = useState([]);
  const { setHeaderTitle } = useHeader();
  const [searchForm] = Form.useForm();
  const { permissions } = useAuth();
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [
    preventiveConditionBasedSchedule,
    setPreventiveConditionBasedSchedule,
  ] = useState(null);

  useEffect(() => {
    setHeaderTitle(t("preventiveConditionBased.title"));
  }, [t, setHeaderTitle]);

  useEffect(() => {
    fetchGetPreventiveMonitoring();
  }, [page]);

  const onChangePagination = (value) => {
    setPage(value);
  };

  const fetchGetPreventiveMonitoring = async (_page) => {
    let payload = {
      page: _page || page,
      limit: PAGINATION.limit,
      ...searchForm.getFieldsValue(),
    };
    const res =
      await _unitOfWork.preventive.getPreventiveByConditionBasedSchedule(
        payload
      );
    if (res && res.code === 1) {
      setTotalRecord(res?.totalResults);
      setPreventiveConditionBasedSchedules(res?.results || []);
    }
  };
  const onClickUpdate = (record) => {
    setPreventiveConditionBasedSchedule(record);
    setShowUpdateModal(true);
  };
  const onClickView = (record) => {
    setPreventiveConditionBasedSchedule(record);
    setShowViewModal(true);
  };

  const columns = [
    {
      title: t("STT"),
      dataIndex: "id",
      key: "id",
      width: "60px",
      align: "center",
      render: (_text, _record, index) =>
        (page - 1) * PAGINATION.limit + index + 1,
    },
    {
      title: t("preventiveMonitoring.maintenance"),
      dataIndex: "code",
      key: "code",
      align: "center",
      className: "text-left-column",
    },
    {
      title: t("preventive.start_modal.supervisor"),
      dataIndex: "supervisor",
      render: (text) => {
        return <span>{text?.fullName || []}</span>;
      },
    },
    {
      title: t("preventive.form.frequency"),
      dataIndex: "frequency",
      key: "frequency",
      align: "end",
    },
    {
      title: t("preventive.form.cycle"),
      dataIndex: "cycle",
      key: "cycle",
      render: (text) => t(parseToLabel(dateType.Options, text)),
    },
    // {
    //   title: t("preventive.list.table.asset_style"),
    //   dataIndex: "assetMaintenance",
    //   ellipsis: true,
    //   render: (text) => t(parseToLabel(assetType.Options, text?.assetStyle)),
    // },
    {
      title: t("preventive.list.table.asset_name"),
      dataIndex: "assetMaintenance",
      render: (text) => {
        return <span>{text?.assetModel?.asset?.assetName || []}</span>;
      },
    },
    {
      title: t("preventive.list.table.model"),
      dataIndex: "assetMaintenance",
      ellipsis: true,
      render: (text) => {
        return <span>{text?.assetModel?.assetModelName || []}</span>;
      },
    },
    {
      title: t("preventive.list.table.serial"),
      dataIndex: "assetMaintenance",
      ellipsis: true,
      render: (text) => {
        return <span>{text?.serial || []}</span>;
      },
    },
    {
      title: t("preventive.list.table.customer"),
      dataIndex: "assetMaintenance",
      render: (text) => {
        return <span>{text?.customer?.customerName || []}</span>;
      },
    },
    {
      title: t("preventive.list.table.schedule_based_on"),
      dataIndex: "scheduleType",
      align: "center",
      render: (text) => t(parseToLabel(ScheduleBasedOnType.Option, text)),
    },
    {
      title: t("preventiveMonitoring.action"),
      dataIndex: "action",
      align: "center",
      render: (_, record) => (
        <div>
          {" "}
          {checkPermission(
            permissions,
            permissionCodeConstant.preventive_conditioon_based_schedule_enter_measured_value
          ) && (
            <Tooltip title={t("preventiveConditionBased.enter_measured_value")}>
              <Button
                type="primary"
                icon={<FormOutlined />}
                size="small"
                onClick={() => onClickUpdate(record)}
              />
            </Tooltip>
          )}
          {checkPermission(
            permissions,
            permissionCodeConstant.preventive_conditioon_based_schedule_view_history
          ) && (
            <Tooltip
              title={t("preventiveConditionBased.view_measurement_history")}
            >
              <Button
                icon={<HistoryOutlined />}
                size="small"
                className="ml-2"
                onClick={() => onClickView(record)}
              />
            </Tooltip>
          )}
        </div>
      ),
    },
  ];

  const onSearch = () => {
    pagination.page = 1;
    fetchGetPreventiveMonitoring(1);
  };

  const resetSearch = () => {
    pagination.page = 1;
    searchForm.resetFields();
    fetchGetPreventiveMonitoring(1);
  };

  return (
    <div className="p-3">
      <Form
        className="search-form"
        form={searchForm}
        layout="vertical"
        onFinish={onSearch}
      >
        <Row gutter={32}>
          <Col span={6}>
            <Form.Item label={t("preventiveConditionBased.code")} name="code">
              <Input placeholder={t("preventiveConditionBased.enter_code")} />
            </Form.Item>
          </Col>
        </Row>
        <Row className="mb-1">
          <Col span={12}>
            <Button type="primary" className="mr-2" htmlType="submit">
              <SearchOutlined />
              {t("purchase.buttons.search")}
            </Button>
            <Button className="bt-green mr-2" onClick={resetSearch}>
              <RedoOutlined />
              {t("purchase.buttons.reset")}
            </Button>
          </Col>
          <Col span={12} style={{ fontSize: 16, textAlign: "right" }}>
            <b>{t("asset.list.total", { count: totalRecord || 0 })}</b>
          </Col>
        </Row>

        <Table
          rowKey="id"
          columns={columns}
          key={"id"}
          dataSource={preventiveConditionBasedSchedules}
          bordered
          pagination={false}
        />
        <Pagination
          className="pagination-table mt-2"
          onChange={onChangePagination}
          pageSize={pagination.limit}
          total={totalRecord}
          current={page}
        />
        <UpdatePreventiveConditionBasedSchedule
          open={showUpdateModal}
          handleCancel={() => setShowUpdateModal(false)}
          preventiveConditionBasedSchedule={preventiveConditionBasedSchedule}
          onRefresh={fetchGetPreventiveMonitoring}
        />
        <ViewPreventiveConditionBasedScheduleHistory
          open={showViewModal}
          handleCancel={() => setShowViewModal(false)}
          preventiveConditionBasedSchedule={preventiveConditionBasedSchedule}
        />
      </Form>
    </div>
  );
}
