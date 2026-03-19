import { Modal, Button, Input, Card, Form, Divider, message, Image, Drawer, Row, Col } from "antd";
import * as _unitOfWork from "../../api";
import { useEffect, useRef, useState } from "react";
import React from "react";
import BreakdownAttachmentClose from "./BreakdownAttachmentClose";
import { ArrowLeftOutlined } from "@ant-design/icons";
import SignaturePad from 'react-signature-canvas';
import { useTranslation } from "react-i18next";

export default function ComfirmCloseBreakdown({
    open,
    onCancel,
    breakdown,
    onRefresh,
}) {
    const [form] = Form.useForm();
    const [breakdownAssignUser, setBreakdownAssignUser] = useState([]);
    const [fileList, setFileList] = useState([]);
    const sigPadRef = useRef();
    const { t } = useTranslation();

    useEffect(() => {
        if (open && breakdown) {
            fetchGetBreakdowUserByBreakdownEndWCA();
        }
    }, [open]);

    const fetchGetBreakdowUserByBreakdownEndWCA = async () => {
        let res = await _unitOfWork.breakdownAssignUser.getBreakdowUserByBreakdownEndWCA({
            breakdown: breakdown.id,
        });
        if (res && res.code === 1) {
            setBreakdownAssignUser(res.data);
        }
    };

    const handleSubmit = async (values) => {
        const formValues = form.getFieldsValue();
        const signatureData = sigPadRef.current?.isEmpty()
            ? null
            : sigPadRef.current.getCanvas().toDataURL('image/png');
        formValues.signature = signatureData;

        const newSupportDocuments = [];
        if (fileList) {
            for (let i = 0; i < fileList.length; i++) {
                const file = fileList[i];
                const resUpload = await _unitOfWork.resource.uploadImage({
                    file: file?.originFileObj,
                });
                if (resUpload && resUpload.code === 1) {
                    newSupportDocuments.push({
                        resource: resUpload.resourceId,
                        position: file.position,
                        breakdown: breakdown.id,
                    });
                }
            }
        }

        const repairs = Object.entries(values.repairs || {}).map(([id, val]) => ({
            id,
            ...val,
        }));

        const payload = {
            ...values,
            repairs,
            breakdown: breakdown.id,
            listAttachment: newSupportDocuments,
            closeSignature: formValues.signature
        };
        let res = await _unitOfWork.breakdown.comfirmCloseBreakdown(payload);
        if (res && res.code === 1) {
            onRefresh();
            onCancel();
            message.success(t("breakdown.close.messages.close_success"));
        }
    };

    const onReset = () => {
        form.resetFields();
        onCancel();
    };

    return (
        <Drawer
            open={open}
            onCancel={onReset}
            width="100%"
            footer={false}
            closable={false}
            className="custom-modal"
            bodyStyle={{ padding: 0 }}
        >
            <div
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    width: "100vw",
                    display: 'flex',
                    alignItems: 'center',
                    height: 56,
                    background: '#23457b',
                    color: '#fff',
                    padding: '0 16px',
                    fontWeight: 600,
                    fontSize: 20,
                    boxSizing: 'border-box',
                    zIndex: 1100,
                }}
            >
                <ArrowLeftOutlined
                    style={{ fontSize: 22, marginRight: 16, cursor: 'pointer' }}
                    onClick={onCancel}
                />
                <span style={{ flex: 1 }}>{t("breakdown.close.title")}</span>
            </div>
            <div style={{ padding: 8, marginTop: 40 }}>
                <Form
                    form={form}
                    layout="vertical"
                    style={{ marginTop: 16 }}
                    onFinish={handleSubmit}
                >
                    <Card
                        style={{
                            marginTop: 12,
                            borderRadius: 8,
                            boxShadow: "0 2px 8px #f0f1f2",
                            border: "none",
                            padding: 0,
                        }}
                        bodyStyle={{ padding: 8 }}
                    >
                        {breakdownAssignUser.map((item, idx) => (
                            <React.Fragment key={item.id || idx}>
                                <div
                                    style={{
                                        background: "#f5f7fa",
                                        borderRadius: 6,
                                        padding: 8,
                                        marginBottom: 8,
                                        border: "1px solid #e0e0e0",
                                    }}
                                >
                                    <Row gutter={8} align="middle">
                                        <Col span={24}>
                                            <div style={{ color: "#888", fontSize: 13 }}>{t("breakdown.close.fields.technician")}</div>
                                            <div style={{ fontWeight: 500, fontSize: 15 }}>{item?.user?.fullName || ""}</div>
                                        </Col>
                                        {Array.isArray(item.repairs) && item.repairs.length > 0 ? (
                                            item.repairs.map((repair, rIdx) => (
                                                <React.Fragment key={repair.id || rIdx}>
                                                    <Col span={24}>
                                                        <Form.Item
                                                            label={t("breakdown.close.fields.problem")}
                                                            name={["repairs", repair.id, "problem"]}
                                                            initialValue={repair.problem}
                                                            style={{ marginBottom: 4 }}
                                                        >
                                                            <Input placeholder={t("breakdown.close.fields.problem")} />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={24}>
                                                        <Form.Item
                                                            label={t("breakdown.close.fields.solution")}
                                                            name={["repairs", repair.id, "solution"]}
                                                            initialValue={repair.solution}
                                                            style={{ marginBottom: 4 }}
                                                        >
                                                            <Input placeholder={t("breakdown.close.fields.solution")} />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={24}>
                                                        <Form.Item
                                                            label={t("breakdown.close.fields.root_cause")}
                                                            name={["repairs", repair.id, "rootCause"]}
                                                            initialValue={repair.rootCause}
                                                            style={{ marginBottom: 4 }}
                                                        >
                                                            <Input placeholder={t("breakdown.close.fields.root_cause")} />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={24}>
                                                        <Form.Item
                                                            label={t("breakdown.close.fields.repair_comment")}
                                                            name={["repairs", repair.id, "comment"]}
                                                            initialValue={repair.comment}
                                                            style={{ marginBottom: 4 }}
                                                        >
                                                            <Input placeholder={t("breakdown.close.fields.repair_comment")} />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={24}>
                                                        <Form.Item
                                                            label={t("breakdown.close.fields.signature")}
                                                            name="signature"
                                                            style={{ marginBottom: 4 }}
                                                        >
                                                            <Image
                                                                src={repair?.signature || ""}
                                                                alt={t("breakdown.close.fields.signature")}
                                                                style={{
                                                                    width: 100,
                                                                    height: 50,
                                                                    objectFit: "cover",
                                                                }}
                                                            />
                                                        </Form.Item>
                                                    </Col>
                                                    <Divider style={{ margin: "8px 0" }} />
                                                </React.Fragment>
                                            ))
                                        ) : (
                                            <Col span={24}>
                                                <div style={{ color: "#888", fontSize: 13 }}>{t("breakdown.close.fields.no_repair_data")}</div>
                                            </Col>
                                        )}
                                    </Row>
                                </div>
                            </React.Fragment>
                        ))}
                    </Card>
                    <Row className="mt-3 mb-3">
                        <Col span={24}>
                            <div style={{ color: "#3f51b5", marginBottom: 4 }}>{t("breakdown.close.fields.comment")}</div>
                            <Form.Item name="comment">
                                <Input.TextArea rows={2} placeholder={t("breakdown.close.fields.comment")} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item label={t("breakdown.close.fields.signature")} name="signature" rules={[
                        {
                            required: true,
                            message: t("breakdown.workSession.signature_required"),
                            validator: (_, value) => {
                                if (sigPadRef.current && !sigPadRef.current.isEmpty()) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(t("breakdown.workSession.signature_required"));
                            }
                        }
                    ]}>
                        <div style={{ border: "2px solid #b8aeae", borderRadius: "2px" }}>
                            <SignaturePad
                                ref={sigPadRef}
                                canvasProps={{ width: 320, height: 100, className: 'sigCanvas' }}
                            />
                        </div>
                        <div style={{ textAlign: "end" }}>
                            <Button
                                onClick={() => sigPadRef.current?.clear()}
                                style={{ marginTop: "5px", background: "#23457B", color: "#ffffff" }}
                            >
                                {t("breakdown.workSession.clear_signature")}
                            </Button>
                        </div>
                    </Form.Item>
                    <div style={{ marginTop: 16, marginBottom: 56 }}>
                        <BreakdownAttachmentClose value={fileList} onChange={setFileList} />
                    </div>
                    <div
                        style={{
                            position: "fixed",
                            left: 0,
                            bottom: 0,
                            width: "100vw",
                            background: "#fff",
                            boxShadow: "0 -2px 8px rgba(0,0,0,0.08)",
                            zIndex: 1001,
                            textAlign: "right",
                        }}
                    >
                        <Button
                            key="ok"
                            type="primary"
                            htmlType="submit"
                            style={{
                                width: "100%",
                                fontSize: 18,
                                height: 48,
                                borderRadius: 10,
                                background: "#23457B",
                                color: "#fff",
                            }}
                        >
                            {t("breakdown.close.buttons.submit")}
                        </Button>
                    </div>
                </Form>
            </div>
        </Drawer>
    );
}