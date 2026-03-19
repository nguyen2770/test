import React, { useState } from 'react';
import { Modal, Input, Form, Button } from 'antd';
import * as _unitOfWork from "../../../api";
import { useTranslation } from 'react-i18next';
export default function ComfirmRefuse({ open, onCancel, refuseBreakAssignUser }) {
    const [form] = Form.useForm();
    const { t } = useTranslation();
    const handleCancel = () => {
        form.resetFields();
        if (onCancel) onCancel();
    };

    const comfirmRefuse = async () => {
        const values = form.getFieldsValue();
        let res = await _unitOfWork.breakdownAssignUser.comfirmRefuseBreakdownAssignUer({
            data: {
                id: refuseBreakAssignUser?.id,
                ...values
            }
        })
        if (res && res.code === 1) {
            handleCancel();
        }
    }

    return (
        <Modal
            open={open}
            onCancel={handleCancel}
            footer={false}
            closable={false}
        >
            <Form layout="vertical" onFinish={comfirmRefuse} form={form}>
                <div style={{ width: "100%", textAlign: "center", fontSize: "18px", fontWeight: "700", marginBottom: '10px' }}>
                    {t("confirmRefuse.title")}
                </div>
                <Form.Item
                    label=""
                    name="reasonCancel"
                    rules={[{ required: true, message: t("confirmRefuse.validation_reason") }]}
                >
                    <Input.TextArea
                        rows={4}
                        placeholder={t("confirmRefuse.placeholder")}
                    />
                </Form.Item>
                <div style={{ textAlign: "center", marginTop: 16, fontWeight: "600" }}>
                    <Button danger style={{ marginRight: 50, fontWeight: "600" }} onClick={handleCancel}>
                        {t("modal.common.buttons.cancel")}
                    </Button>
                    <Button type="primary" htmlType='submit' style={{ fontWeight: "600" }} >
                        {t("confirmRefuse.reject")}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
}