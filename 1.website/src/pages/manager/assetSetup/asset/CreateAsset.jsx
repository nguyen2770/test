import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Modal,
  Row
} from "antd";
import React, { useEffect } from "react";
import * as _unitOfWork from "../../../../api";
import {
  LeftCircleOutlined,
  PlusCircleOutlined
} from "@ant-design/icons";
import ShowSuccess from "../../../../components/modal/result/successNotification";
import ShowError from "../../../../components/modal/result/errorNotification";
import { useTranslation } from "react-i18next";

export default function CreateAsset({
  open,
  handleOk,
  handleCancel,
  onRefresh
}) {
  const { t } = useTranslation();
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      // any preload if needed
    }
  }, [open]);

  const onFinish = async () => {
    const values = await form.getFieldsValue();
    const asset = { ...values };
    const response = await _unitOfWork.asset.createAsset({ asset });
    if (response && response.code === 1) {
      onCancel();
      onRefresh();
      ShowSuccess(
        "topRight",
        t("asset.notifications.title"),
        t("asset.notifications.create_success")
      );
    } else {
      ShowError(
        "topRight",
        t("asset.notifications.title"),
        t("asset.notifications.create_error")
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
      width={"40%"}
      destroyOnClose
    >
      <Form
        form={form}
        onFinish={onFinish}
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
      >
        <Card title={t("asset.form.create_title")}>
          <Row gutter={32}>
            <Col span={24}>
              <Form.Item
                name="assetName"
                label={t("asset.form.fields.name")}
                labelAlign="left"
                rules={[
                  {
                    required: true,
                    message: t("asset.form.validation.required_name")
                  }
                ]}
              >
                <Input
                  placeholder={t(
                    "asset.form.fields.name_placeholder"
                  )}
                />
              </Form.Item>
            </Col>
            <div className="modal-footer">
              <Button onClick={onCancel}>
                <LeftCircleOutlined />
                {t("asset.buttons.close")}
              </Button>
              <Button type="primary" htmlType="submit">
                <PlusCircleOutlined />
                {t("asset.buttons.create")}
              </Button>
            </div>
          </Row>
        </Card>
      </Form>
    </Modal>
  );
}