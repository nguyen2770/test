import React from "react";
import { Modal, Button, Input, Form, Card, message } from "antd";
import * as _unitOfWork from "../../api";
import { useTranslation } from "react-i18next";

export default function ComfirmCancelBreakdown({
    open,
    onCancel,
    breakdown,
    onRefresh,
}) {
    const [form] = Form.useForm();
    const { t } = useTranslation();

    const handleFinish = async () => {
        const values = form.getFieldsValue();
        let res = await _unitOfWork.breakdown.comfirmCancelBreakdown({
            data: {
                breakdown: breakdown.id || breakdown._id,
                reasonCancel: values.reasonCancel,
            }
        });
        if (res && res.code === 1) {
            form.resetFields();
            onCancel();
            onRefresh();
            message.success(t("breakdown.cancel.messages.cancel_success"));
        } else {
            message.error(t("breakdown.cancel.messages.cancel_error"));
        }
    };

    return (
        <Modal
            open={open}
            onCancel={onCancel}
            footer={null}
            width={800}
            closable={false}
            className="custom-modal"
        >
            <Card title={t("breakdown.cancel.title")}>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleFinish}
                >
                    <Form.Item
                        name="reasonCancel"
                        rules={[
                            { required: true, message: t("breakdown.cancel.validation.reason_required") }
                        ]}
                    >
                        <Input.TextArea
                            rows={6}
                            placeholder={t("breakdown.cancel.placeholders.reason")}
                        />
                    </Form.Item>
                    <div style={{ textAlign: "right" }}>
                        <Button onClick={onCancel} style={{ marginRight: 8 }}>
                            {t("breakdown.common.no")}
                        </Button>
                        <Button type="primary" htmlType="submit" style={{ padding: "0 30px" }}>
                            {t("breakdown.common.yes")}
                        </Button>
                    </div>
                </Form>
            </Card>
        </Modal>
    );
}