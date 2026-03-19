import React from "react";
import { Modal, Button, Input, Form, message, Card } from "antd";
import * as _unitOfWork from "../../api";
import { useTranslation } from "react-i18next";

export default function ReopenBreakdown({
  open,
  onCancel,
  breakdown,
  onRefresh
}) {
  const [form] = Form.useForm();
  const { t } = useTranslation();

  const handleFinish = async (values) => {
    const data = {
      breakdown: breakdown.id,
      reasonReopen: values.reasonReopen,
    };
    try {
      const res = await _unitOfWork.breakdown.comfirmReopenBreakdown({ data: data });
      if (res && res.code === 1) {
        onRefresh();
        onCancel();
        message.success(t("breakdown.reopen.messages.success"));
      }
    } catch (error) {
      message.error(t("breakdown.reopen.messages.error"));
      console.error("Error reopening breakdown:", error);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={700}
      closable={false}
      className="custom-modal"
    >
      <Card
        title={t("breakdown.reopen.title")}
        headStyle={{
          background: "#23457b",
          color: "#fff",
          fontWeight: 600,
          fontSize: 20,
        }}
        bodyStyle={{ padding: 24 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
        >
          <Form.Item
            name="reasonReopen"
            label={t("breakdown.reopen.fields.reason")}
            rules={[{ required: true, message: t("breakdown.reopen.validation.reason_required") }]}
          >
            <Input.TextArea rows={3} placeholder={t("breakdown.reopen.fields.reason_placeholder")} />
          </Form.Item>
          <div style={{ textAlign: "right", marginTop: "4px" }}>
            <Button onClick={onCancel} style={{ marginRight: 8 }}>
              {t("breakdown.cancel.buttons.cancel")}
            </Button>
            <Button type="primary" htmlType="submit">
              {t("breakdown.reopen.buttons.submit")}
            </Button>
          </div>
        </Form>
      </Card>
    </Modal>
  );
}