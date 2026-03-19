import { Button, Card, Col, Form, Input, message, Modal, Row } from "antd";
import React, { useEffect } from "react";
import Confirm from "../../../../components/modal/Confirm";
import * as _unitOfWork from "../../../../api";
import { useTranslation } from "react-i18next";

export default function UpdateDepartment({
    open,
    handleOk,
    handleCancel,
    id,
    onRefresh,
}) {
    const { t } = useTranslation();
    const [form] = Form.useForm();

    useEffect(() => {
        if (open && id) {
            fetchGetDepartmentById();
        }
    }, [open, id]);

    const fetchGetDepartmentById = async () => {
        const res = await _unitOfWork.department.getDepartmentById({
            id: id,
        });
        if (res) {
            form.setFieldsValue({ ...res });
        }
    };

    const onFinish = async () => {
        const response = await _unitOfWork.department.updateDepartment({
            Department: {
                id: id,
                ...form.getFieldsValue(),
            },
        });
        if (response && response.code === 1) {
            message.success(t("department.update.success_message"));
            handleCancel();
            form.resetFields();
            onRefresh();
        } else {
            message.error(t("department.messages.update_error"));
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
            <Form form={form} onFinish={() => onFinish()}>
                <Card title={t("department.update.title")}>
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
                            <Button
                                key="button"
                                type="primary"
                                onClick={() =>
                                    Confirm(
                                        t("department.messages.confirm_update"),
                                        () => onFinish()
                                    )
                                }
                            >
                                {t("department.form.buttons.submit_update")}
                            </Button>
                        </div>
                    </Row>
                </Card>
            </Form>
        </Modal>
    );
}