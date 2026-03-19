import Modal from "antd/es/modal/Modal";
import React, { useEffect, useState } from "react";
import {
  ArrowLeftOutlined,
  CloseCircleOutlined,
  SearchOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import {
  Drawer,
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
import { assetType, PAGINATION } from "../../utils/constant";
import * as _unitOfWork from "../../api";
import { filterOption } from "../../helper/search-select-helper";
import { parseToLabel } from "../../helper/parse-helper";
import CardItemAssetMaintenance from "../../pages/assetMaintenance/CardItemAssetMaintenance";
import { useTranslation } from "react-i18next"; // Thêm import

export default React.memo(function AssetMaintenanceDrawer({
  open,
  handleCancel,
  onSelectAssetMaintenance,
  assetChange,
}) {
  const [formSearchAsset] = Form.useForm();
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(PAGINATION);
  const [totalRecord, setTotalRecord] = useState(0);
  const [assetMaintenances, setAssetMaintenances] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [assetModels, setAssetModels] = useState([]);
  const [assets, setAssets] = useState([]);
  const [selectedAssetMaintenance, setSelectedAssetMaintenance] =
    useState(null);
  const { t } = useTranslation(); // Thêm hook

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
    Object.keys(payload).forEach((key) => {
      if (!payload[key]) {
        delete payload[key];
      }
    });
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
  const handleClose = () => {
    formSearchAsset.resetFields(); // Reset form
    setPage(1); // Reset trang về 1
    fetchGetListAsset(); // Lấy lại danh sách tài sản
    handleCancel(); // Đóng modal
  };
  // Khi bấm xác nhận
  const handleConfirm = () => {
    if (onSelectAssetMaintenance && selectedAssetMaintenance) {
      onSelectAssetMaintenance(selectedAssetMaintenance); // Gửi dữ liệu về cha
    }
    handleClose();
  };
  const onChangeAssetMaintence = (_item) => {
    setSelectedAssetMaintenance(_item);
    return true;
  };
  return (
    <Drawer
      open={open}
      closable={false}
      className="drawer-custom"
      footer={false}
      width={"100%"}
    >
      <Form form={formSearchAsset} layout="vertical">
        <Row className="ml-0 mr-0 p-2">
          <Col span={24}>
            <Form.Item
              label={t("assetMaintenance.list.search.serial_label")}
              name="serial"
              labelAlign="left"
            >
              <Input
                placeholder={t(
                  "assetMaintenance.list.search.placeholder_serial"
                )}
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label={t("assetMaintenance.list.search.asset_style_label")}
              name="assetStyle"
              labelAlign="left"
            >
              <Select
                placeholder={t(
                  "assetMaintenance.list.search.placeholder_asset_style"
                )}
                options={
                  assetType.Options ||
                  [].map((item) => ({
                    value: item.value,
                    label: t(item.label),
                  }))
                }
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label={t("assetMaintenance.list.search.manufacturer_label")}
              name="manufacturer"
              labelAlign="left"
            >
              <Select
                placeholder={t(
                  "assetMaintenance.list.search.placeholder_manufacturer"
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
          <Col span={24}>
            <Form.Item
              label={t("assetMaintenance.list.search.category_label")}
              name="category"
              labelAlign="left"
            >
              <Select
                placeholder={t(
                  "assetMaintenance.list.search.placeholder_category"
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
          <Col span={24}>
            <Form.Item
              label={t("assetMaintenance.form.fields.sub_category")}
              name="subcCategory"
              labelAlign="left"
            >
              <Select
                placeholder={t(
                  "assetMaintenance.form.placeholders.sub_category"
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
          <Col span={24}>
            <Form.Item
              label={t("assetMaintenance.list.search.asset_label")}
              name="customer"
              labelAlign="left"
            >
              <Select
                placeholder={t(
                  "assetMaintenance.list.search.placeholder_asset"
                )}
                showSearch
                allowClear
                options={(customers || []).map((item) => ({
                  value: item.id,
                  label:
                    item.customerName +
                    (item.contactNumber ? ` - ( ${item.contactNumber} )` : ""),
                }))}
                filterOption={filterOption}
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label={t("assetMaintenance.list.search.asset_label")}
              name="asset"
              labelAlign="left"
            >
              <Select
                placeholder={t(
                  "assetMaintenance.list.search.placeholder_asset"
                )}
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
          <Col span={24}>
            <Form.Item
              label={t("assetMaintenance.list.search.model_label")}
              name="assetModel"
              labelAlign="left"
            >
              <Select
                placeholder={t(
                  "assetMaintenance.list.search.placeholder_model"
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
        <Row className="mb-2 p-2">
          <Col flex="auto" style={{ textAlign: "left" }}>
            <Button type="primary" onClick={onSearch}>
              <SearchOutlined />
              {t("assetMaintenance.actions.search")}
            </Button>
            <Button
              className="ml-3"
              type="primary"
              onClick={handleConfirm} // Sửa ở đây
              disabled={!selectedAssetMaintenance}
            >
              <CloseCircleOutlined />
              {t("assetMaintenance.actions.accept")}
            </Button>{" "}
            <Button onClick={handleClose} className="ml-3">
              <CloseCircleOutlined />
              {t("assetMaintenance.actions.cancel")}
            </Button>
          </Col>
        </Row>

        {assetMaintenances.map((_item) => {
          return (
            <CardItemAssetMaintenance
              assetMaintenceChamge={selectedAssetMaintenance}
              onClickItem={onChangeAssetMaintence}
              key={_item.id}
              data={_item}
            />
          );
        })}
        <Pagination
          className="pagination-table mt-2 mb-3"
          onChange={onChangePagination}
          pageSize={pagination.limit}
          total={totalRecord}
          current={page}
        />
      </Form>
    </Drawer>
  );
});
