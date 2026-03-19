import { Button, Card, Col, Form, Input, Modal, Row, Select } from "antd";
import React, { useEffect, useState } from "react";
import * as _unitOfWork from "../../../../api";
import {
  filterOption,
  dropdownRender,
} from "../../../../helper/search-select-helper";
import { useTranslation } from "react-i18next";
import { CloseCircleOutlined, PlusCircleOutlined } from "@ant-design/icons";

export default function CreateSubCategory({
  open,
  handleOk,
  handleCancel,
  onRefresh,
}) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [categorys, setCategorys] = useState([]);

  useEffect(() => {
    if (open) {
      fetchGetAllCategory();
    }
  }, [open]);

  const fetchGetAllCategory = async () => {
    const res = await _unitOfWork.category.getAllCategory();
    if (res && res.code === 1) {
      setCategorys(res.data);
    }
  };

  const onFinish = async () => {
    const values = await form.getFieldsValue();
    const response = await _unitOfWork.subCategory.createSubCategory(values);
    if (response && response.code === 1) {
      handleCancel();
      form.resetFields();
      onRefresh();
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
      destroyOnClose
      width={"40%"}
    >
      <Form
        form={form}
        onFinish={onFinish}
        labelCol={{
          span: 8,
        }}
        wrapperCol={{
          span: 16,
        }}
      >
        <Card title={t("subCategory.form.create_title")}>
          <Row>
            <Col span={24}>
              <Form.Item
                name="categoryId"
                label={t("subCategory.form.fields.parent")}
                labelAlign="left"
                rules={[
                  {
                    required: true,
                    message: t("subCategory.form.validation.required_parent"),
                  },
                ]}
              >
                <Select
                  allowClear
                  placeholder={t("subCategory.form.fields.parent_placeholder")}
                  showSearch
                  options={categorys.map((item) => ({
                    value: item.id,
                    label: item.categoryName,
                  }))}
                  filterOption={filterOption}
                  dropdownStyle={dropdownRender}
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="subCategoryName"
                label={t("subCategory.form.fields.name")}
                labelAlign="left"
                rules={[
                  {
                    required: true,
                    message: t("subCategory.form.validation.required_name"),
                  },
                ]}
              >
                <Input
                  placeholder={t("subCategory.form.fields.name_placeholder")}
                />
              </Form.Item>
            </Col>
            <div className="modal-footer">
              <Button onClick={onCancel}>
                <CloseCircleOutlined />
                {t("subCategory.buttons.close")}
              </Button>
              <Button type="primary" htmlType="submit">
                <PlusCircleOutlined /> {t("subCategory.buttons.create")}
              </Button>
            </div>
          </Row>
        </Card>
      </Form>
    </Modal>
  );
}
