import { Button, Card, Col, Form, Input, Modal, Row, Select } from "antd";
import React from "react";
import Confirm from "../../../components/modal/Confirm";
import * as _unitOfWork from "../../../api";
import { useTranslation } from "react-i18next";
import { CloseCircleOutlined, PlusCircleOutlined } from "@ant-design/icons";

export default function CreateSpareSubCategory({
  open,
  handleOk,
  handleCancel,
  spareCategories,
}) {
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const onFinish = async () => {
    const payload = {
      ...form.getFieldsValue(),
    };
    const res = await _unitOfWork.spareSubCategory.createSpareSubCategory(
      payload
    );
    if (res) {
      form.resetFields();
      handleOk();
    }
  };

  return (
    <Modal
      open={open}
      onOk={handleOk}
      closable={false}
      className="custom-modal"
      footer={false}
      width={"40%"}
    >
      <Form
        form={form}
        labelCol={{
          span: 8,
        }}
        wrapperCol={{
          span: 16,
        }}
      >
        <Card title={t("spareSubCategory.create.title")}>
          <Row>
            <Col span={24}>
              <Form.Item
                name="spareCategory"
                label={t("spareSubCategory.form.fields.parent")}
                labelAlign="left"
              >
                <Select
                  allowClear
                  placeholder={t("spareSubCategory.form.placeholders.parent")}
                  showSearch
                  options={(spareCategories || []).map((item) => ({
                    value: item.id,
                    label: item.spareCategoryName,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="spareSubCategoryName"
                label={t("spareSubCategory.form.fields.sub")}
                labelAlign="left"
                rules={[
                  {
                    required: true,
                    message: t("spareSubCategory.validation.required_sub"),
                  },
                ]}
              >
                <Input
                  placeholder={t("spareSubCategory.form.placeholders.sub")}
                />
              </Form.Item>
            </Col>
            <div className="modal-footer">
              <Button key="back" onClick={handleCancel}>
                <CloseCircleOutlined /> {t("common_buttons.cancel")}
              </Button>
              <Button
                key="button"
                type="primary"
                onClick={() =>
                  Confirm(t("spareSubCategory.create.confirm"), () =>
                    onFinish()
                  )
                }
              >
                <PlusCircleOutlined />{" "}
                {t("spareSubCategory.form.buttons.submit_create")}
              </Button>
            </div>
          </Row>
        </Card>
      </Form>
    </Modal>
  );
}
