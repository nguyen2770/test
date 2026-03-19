import { Button, Card, Col, Form, Input, message, Modal, Row } from "antd";
import React from "react";
import * as _unitOfWork from "../../../../api";
import { useTranslation } from "react-i18next";

export default function CreateDepartment({
    open,
    handleOk,
    handleCancel,
    onRefresh,
}) {
    const { t } = useTranslation();
    const [form] = Form.useForm();

    const onFinish = async () => {
        const values = await form.getFieldsValue();
        const response = await _unitOfWork.department.createDepartment(values);
        if (response && response.code === 1) {
            message.success(t("department.create.success_message"));
            handleCancel();
            form.resetFields();
            onRefresh();
        } else {
            message.error(t("department.messages.create_error"));
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
        >
            <Form form={form} onFinish={onFinish}>
                <Card title={t("department.create.title")}>
                    <Row>
                        <Col span={24}>
                            <Form.Item
                                name="departmentName"
                                labelAlign="left"
                                rules={[
                                    {
                                        required: true,
                                        message: t("department.validation.required_name"),
                                    },
                                ]}
                            >
                                <Input
                                    placeholder={t(
                                        "department.form.placeholders.department_name"
                                    )}
                                />
                            </Form.Item>
                        </Col>
                        <div className="modal-footer">
                            <Button key="back" onClick={onCancel}>
                                {t("department.form.buttons.back")}
                            </Button>
                            <Button key="button" type="primary" htmlType="submit">
                                {t("department.form.buttons.submit_create")}
                            </Button>
                        </div>
                    </Row>
                </Card>
            </Form>
        </Modal>
    );
}