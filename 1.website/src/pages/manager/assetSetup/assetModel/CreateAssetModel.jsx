import { Button, Card, Col, Form, Input, Modal, Row, Select } from "antd";
import React, { useEffect, useState } from "react";
import * as _unitOfWork from "../../../../api";
import {
  filterOption,
  dropdownRender,
} from "../../../../helper/search-select-helper";
import { LeftCircleOutlined, PlusCircleOutlined } from "@ant-design/icons";
import ShowSuccess from "../../../../components/modal/result/successNotification";
import ShowError from "../../../../components/modal/result/errorNotification";
import { useTranslation } from "react-i18next";

export default function CreateAssetModel({
  open,
  handleOk,
  handleCancel,
  onRefresh,
}) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [subCategories, setSubCategories] = useState([]);
  const [loadingSub, setLoadingSub] = useState(false);
  const [manufacturers, setManufacturers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [assetTypeCategorys, setAssetTypeCategories] = useState([]);
  const [assets, setAssets] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    if (open) {
      fetchManufacturers();
      fetchCategories();
      fetchAssetTypeCats();
      fetchAssets();
      fetchSuppliers();
    }
  }, [open]);

  const fetchSuppliers = async () => {
    let res = await _unitOfWork.supplier.getAllSupplier();
    if (res?.code === 1) setSuppliers(res.data);
  };

  const fetchAssets = async () => {
    let res = await _unitOfWork.asset.getAllAsset({});
    if (res?.code === 1) setAssets(res.data);
  };

  const fetchAssetTypeCats = async () => {
    let res = await _unitOfWork.assetTypeCategory.getAllAssetTypeCategory();
    if (res?.code === 1) setAssetTypeCategories(res.data);
  };

  const fetchManufacturers = async () => {
    let res = await _unitOfWork.manufacturer.getAllManufacturer();
    if (res?.code === 1) setManufacturers(res.data);
  };

  const fetchCategories = async () => {
    let res = await _unitOfWork.category.getAllCategory();
    if (res?.code === 1) setCategories(res.data);
  };

  const fetchSubCategories = async (categoryId) => {
    try {
      setLoadingSub(true);
      const response = await _unitOfWork.subCategory.getByCategoryId({
        categoryId,
      });
      if (response?.code === 1) {
        setSubCategories(response.data || []);
      }
    } finally {
      setLoadingSub(false);
    }
  };

  const onChangeCategory = (value) => {
    form.setFieldsValue({ subCategory: null });
    if (value) fetchSubCategories(value);
    else setSubCategories([]);
  };

  const onFinish = async () => {
    const values = form.getFieldsValue();
    const res = await _unitOfWork.assetModel.createAssetModel(values);
    if (res && res.code === 1) {
      handleCancel();
      form.resetFields();
      onRefresh();
      ShowSuccess(
        "topRight",
        t("common.notifications"),
        t("assetModel.common.messages.create_success")
      );
    } else {
      ShowError(
        "topRight",
        t("common.notifications"),
        t("assetModel.common.messages.create_error")
      );
    }
  };

  const onCancel = () => {
    handleCancel();
    form.resetFields();
  };

  return (
    <Modal
      open={open}
      onOk={handleOk}
      closable={false}
      className="custom-modal"
      footer={false}
      width={"80%"}
      destroyOnClose
    >
      <Form
        form={form}
        onFinish={onFinish}
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
      >
        <Card title={t("assetModel.model.create_title")}>
          <Row gutter={32}>
            <Col span={12}>
              <Form.Item
                label={t("assetModel.model.fields.asset")}
                name="asset"
                labelAlign="left"
                rules={[
                  {
                    required: true,
                    message: t("assetModel.model.validation.required_asset"),
                  },
                ]}
              >
                <Select
                  allowClear
                  placeholder={t("assetModel.model.fields.asset_placeholder")}
                  showSearch
                  options={assets?.map((item) => ({
                    value: item.id,
                    label: item.assetName,
                  }))}
                  filterOption={filterOption}
                  dropdownStyle={dropdownRender}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t("assetModel.model.fields.model_name")}
                name="assetModelName"
                labelAlign="left"
                rules={[
                  {
                    required: true,
                    message: t("assetModel.model.validation.required_model"),
                  },
                ]}
              >
                <Input
                  placeholder={t(
                    "assetModel.model.fields.model_name_placeholder"
                  )}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t("assetModel.model.fields.manufacturer")}
                name="manufacturer"
                labelAlign="left"
              >
                <Select
                  allowClear
                  placeholder={t(
                    "assetModel.model.fields.manufacturer_placeholder"
                  )}
                  showSearch
                  options={manufacturers?.map((item) => ({
                    value: item.id,
                    label: item.manufacturerName,
                  }))}
                  filterOption={filterOption}
                  dropdownStyle={dropdownRender}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t("assetModel.model.fields.supplier")}
                name="supplier"
                labelAlign="left"
              >
                <Select
                  allowClear
                  placeholder={t(
                    "assetModel.model.fields.supplier_placeholder"
                  )}
                  showSearch
                  options={suppliers?.map((item) => ({
                    value: item.id,
                    label: item.supplierName,
                  }))}
                  filterOption={filterOption}
                  dropdownStyle={dropdownRender}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t("assetModel.model.fields.asset_type_category")}
                name="assetTypeCategory"
                labelAlign="left"
              >
                <Select
                  allowClear
                  placeholder={t(
                    "assetModel.model.fields.asset_type_category_placeholder"
                  )}
                  showSearch
                  options={assetTypeCategorys?.map((item) => ({
                    value: item.id,
                    label: item.name,
                  }))}
                  filterOption={filterOption}
                  dropdownStyle={dropdownRender}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t("assetModel.model.fields.category")}
                name="category"
                labelAlign="left"
                rules={[
                  {
                    required: true,
                    message: t("assetModel.model.validation.required_category"),
                  },
                ]}
              >
                <Select
                  allowClear
                  placeholder={t(
                    "assetModel.model.fields.category_placeholder"
                  )}
                  showSearch
                  options={categories?.map((item) => ({
                    value: item.id,
                    label: item.categoryName,
                  }))}
                  filterOption={filterOption}
                  dropdownStyle={dropdownRender}
                  onChange={onChangeCategory}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t("assetModel.model.fields.sub_category")}
                name="subCategory"
                labelAlign="left"
              >
                <Select
                  allowClear
                  placeholder={t(
                    "assetModel.model.fields.sub_category_placeholder"
                  )}
                  showSearch
                  loading={loadingSub}
                  disabled={!subCategories.length}
                  options={subCategories?.map((item) => ({
                    value: item.id,
                    label: item.subCategoryName,
                  }))}
                  filterOption={filterOption}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col
              span={24}
              style={{ textAlign: "end" }}
              className="modal-footer"
            >
              <Button onClick={onCancel}>
                <LeftCircleOutlined /> {t("assetModel.common.buttons.close")}
              </Button>
              <Button type="primary" htmlType="submit" className="ml-2">
                <PlusCircleOutlined /> {t("assetModel.common.buttons.create")}
              </Button>
            </Col>
          </Row>
        </Card>
      </Form>
    </Modal>
  );
}
