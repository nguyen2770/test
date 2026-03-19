import Modal from "antd/es/modal/Modal";
import React, { useEffect, useState } from "react";
import {
  CloseCircleOutlined,
  SearchOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import {
  Button,
  Col,
  Form,
  Input,
  Pagination,
  Row,
  Select,
  Table,
  Card,
} from "antd";
import { assetType, PAGINATION } from "../../../utils/constant";
import * as _unitOfWork from "../../../api";
import { filterOption } from "../../../helper/search-select-helper";
import { parseToLabel } from "../../../helper/parse-helper";
import { useTranslation } from "react-i18next";

export default function AssetMaintenanceModel({
  open,
  handleCancel,
  onSelectAssetMaintenance,
  assetChange,
}) {
  const { t } = useTranslation();
  const [formSearchAsset] = Form.useForm();
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(PAGINATION);
  const [totalRecord, setTotalRecord] = useState(0);
  const [assetMaintenances, setAssetMaintenances] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedRowKey, setSelectedRowKey] = useState();
  const [assetModels, setAssetModels] = useState([]);
  const [assets, setAssets] = useState([]);

  useEffect(() => {
    if (assetChange) {
      setSelectedRowKey(assetChange.id);
    }
  }, [assetChange]);

  useEffect(() => {
    if (open) {
      fetchGetAllManfacturers();
      fetchGetAllCategorys();
      fetchGetAllCustomers();
      fetchGetAllAssetModels();
      fetchGetAllAssets();
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      fetchGetListAsset();
    }
  }, [page, open]);

  const fetchGetAllAssets = async () => {
    let res = await _unitOfWork.asset.getAllAsset();
    if (res && res.code === 1) {
      setAssets(res.data);
    }
  };
  const fetchGetAllAssetModels = async () => {
    let res = await _unitOfWork.assetModel.getAllAssetModel();
    if (res && res.code === 1) {
      setAssetModels(res.data);
    }
  };

  const fetchGetAllCustomers = async () => {
    let res = await _unitOfWork.customer.getAllCustomer();
    if (res && res.code === 1) {
      setCustomers(res.data);
    }
  };

  const fetchGetAllManfacturers = async () => {
    let res = await _unitOfWork.manufacturer.getAllManufacturer();
    if (res && res.code === 1) {
      setManufacturers(res.data);
    }
  };
  const fetchGetAllCategorys = async () => {
    let res = await _unitOfWork.category.getAllCategory();
    if (res && res.code === 1) {
      setCategories(res.data);
    }
  };
  const onSearch = () => {
    const values = formSearchAsset.getFieldsValue();
    fetchGetListAsset(values);
  };
  const onRefresh = () => {
    formSearchAsset.resetFields();
    setPage(1);
    fetchGetListAsset();
  };

  const fetchGetListAsset = async (values) => {
    let payload = {
      page: page,
      limit: PAGINATION.limit,
      ...values,
    };
    const res = await _unitOfWork.assetMaintenance.getListAssetMaintenances(
      payload
    );

    if (res && res.results && res.results?.results) {
      setAssetMaintenances(res.results?.results);
      setTotalRecord(res.results.totalResults);
    }
  };

  const onChangePagination = (value) => {
    setPage(value);
  };
  const selectedAssetMaintenance = assetMaintenances.find(
    (item) => item.id === selectedRowKey
  );
  const handleClose = () => {
    formSearchAsset.resetFields();
    setPage(1);
    setSelectedRowKey(null);
    fetchGetListAsset();
    handleCancel();
  };
  const handleConfirm = () => {
    if (onSelectAssetMaintenance && selectedAssetMaintenance) {
      onSelectAssetMaintenance(selectedAssetMaintenance);
    }
    handleClose();
  };

  const columns = [
    {
      title: t("modal.assetSelect.table.serial"),
      dataIndex: "serial",
      align: "center",
      className: "text-left-column",
    },
    {
      title: t("modal.assetSelect.table.asset_name"),
      dataIndex: "assetModel",
      align: "center",
      className: "text-left-column",
      render: (text) => <span>{text?.asset?.assetName}</span>,
    },
    {
      title: t("modal.assetSelect.table.asset_style"),
      dataIndex: "assetStyle",
      align: "center",
      className: "text-left-column",
      render: (text) => t(parseToLabel(assetType.Options, text)),
    },
    {
      title: t("modal.assetSelect.table.model"),
      dataIndex: "assetModel",
      align: "center",
      className: "text-left-column",
      render: (_text, record) => (
        <span>{record?.assetModel?.assetModelName || []}</span>
      ),
    },
    {
      title: t("modal.assetSelect.table.manufacturer"),
      dataIndex: "assetModel",
      align: "center",
      className: "text-left-column",
      render: (text) => <span>{text?.manufacturer?.manufacturerName}</span>,
    },
    {
      title: t("modal.assetSelect.table.category"),
      dataIndex: "assetModel",
      align: "center",
      className: "text-left-column",
      render: (text) => <span>{text?.category?.categoryName}</span>,
    },
    {
      title: t("modal.assetSelect.table.customer"),
      dataIndex: "customer",
      align: "center",
      className: "text-left-column",
      render: (text) => <span>{text?.customerName || []}</span>,
    },
  ];

  return (
    <Modal
      open={open}
      closable={false}
      className="custom-modal"
      footer={false}
      width={"85%"}
    >
      <Form form={formSearchAsset} layout="vertical">
        <Card title={t("modal.assetSelect.title")}>
          <Row className="mb-3" gutter={32}>
            <Col span={6}>
              <Form.Item
                label={t("modal.assetSelect.search.serial")}
                name="serial"
                labelAlign="left"
              >
                <Input
                  placeholder={t("modal.assetSelect.search.serial_placeholder")}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label={t("modal.assetSelect.search.asset_style")}
                name="assetStyle"
                labelAlign="left"
              >
                <Select
                  placeholder={t(
                    "modal.assetSelect.search.asset_style_placeholder"
                  )}
                  options={(assetType.Options || []).map((item) => ({
                    value: item.value,
                    label: t(item.label),
                  }))}
                  allowClear
                  filterOption={filterOption}
                  showSearch={true}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label={t("modal.assetSelect.search.manufacturer")}
                name="manufacturer"
                labelAlign="left"
              >
                <Select
                  placeholder={t(
                    "modal.assetSelect.search.manufacturer_placeholder"
                  )}
                  showSearch
                  allowClear
                  options={(manufacturers || []).map((item) => ({
                    value: item.id,
                    label: item.manufacturerName,
                  }))}
                  filterOption={filterOption}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label={t("modal.assetSelect.search.category")}
                name="category"
                labelAlign="left"
              >
                <Select
                  placeholder={t(
                    "modal.assetSelect.search.category_placeholder"
                  )}
                  showSearch
                  allowClear
                  options={(categories || []).map((item) => ({
                    value: item.id,
                    label: item.categoryName,
                  }))}
                  filterOption={filterOption}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label={t("modal.assetSelect.search.sub_category")}
                name="subcCategory"
                labelAlign="left"
              >
                <Select
                  placeholder={t(
                    "modal.assetSelect.search.sub_category_placeholder"
                  )}
                  showSearch
                  allowClear
                  options={(categories || []).map((item) => ({
                    value: item.id,
                    label: item.categoryName,
                  }))}
                  filterOption={filterOption}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label={t("modal.assetSelect.search.customer")}
                name="customer"
                labelAlign="left"
              >
                <Select
                  placeholder={t(
                    "modal.assetSelect.search.customer_placeholder"
                  )}
                  showSearch
                  allowClear
                  options={(customers || []).map((item) => ({
                    value: item.id,
                    label:
                      item.customerName +
                      (item.contactNumber
                        ? ` - ( ${item.contactNumber} )`
                        : ""),
                  }))}
                  filterOption={filterOption}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label={t("modal.assetSelect.search.asset")}
                name="asset"
                labelAlign="left"
              >
                <Select
                  placeholder={t("modal.assetSelect.search.asset_placeholder")}
                  showSearch
                  allowClear
                  options={(assets || []).map((item) => ({
                    value: item.id,
                    label: item.assetName,
                  }))}
                  filterOption={filterOption}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label={t("modal.assetSelect.search.asset_model")}
                name="assetModel"
                labelAlign="left"
              >
                <Select
                  placeholder={t(
                    "modal.assetSelect.search.asset_model_placeholder"
                  )}
                  showSearch
                  allowClear
                  options={(assetModels || []).map((item) => ({
                    value: item.id,
                    label: item.assetModelName,
                  }))}
                  filterOption={filterOption}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col flex="auto" style={{ textAlign: "left" }}>
              <Button
                className="mr-2"
                type="primary"
                onClick={onRefresh}
                style={{ background: "#008444" }}
              >
                <SyncOutlined />
                {t("modal.assetSelect.buttons.refresh")}
              </Button>
              <Button type="primary" onClick={onSearch}>
                <SearchOutlined />
                {t("modal.assetSelect.buttons.search")}
              </Button>
            </Col>
            <Col span={12} style={{ textAlign: "right" }}>
              <Button onClick={handleClose} className="ml-3">
                <CloseCircleOutlined />
                {t("modal.assetSelect.buttons.cancel")}
              </Button>
              <Button
                className="ml-3"
                type="primary"
                onClick={handleConfirm}
                disabled={!selectedAssetMaintenance}
              >
                <CloseCircleOutlined />
                {t("modal.assetSelect.buttons.confirm")}
              </Button>
            </Col>
          </Row>

          <Table
            rowKey="id"
            columns={columns}
            key={"id"}
            dataSource={assetMaintenances}
            bordered
            pagination={false}
            rowSelection={{
              type: "radio",
              selectedRowKeys: selectedRowKey ? [selectedRowKey] : [],
              onChange: (selectedKeys) => setSelectedRowKey(selectedKeys[0]),
            }}
          ></Table>
          <Pagination
            className="pagination-table mt-2"
            onChange={onChangePagination}
            pageSize={pagination.limit}
            total={totalRecord}
            current={page}
          />
        </Card>
      </Form>
    </Modal>
  );
}
