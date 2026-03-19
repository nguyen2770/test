import React, { useEffect } from "react";
import {
    Button,
    Form,
    Input,
    Radio,
    Drawer,
    Row,
    Col,
    Card,
    Image,
    Divider,
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import * as _unitOfWork from "../../../api";
import { useTranslation } from "react-i18next";
import { assetModelSpareRequestCategory } from "../../../utils/constant";
import noImage from "../../../assets/images/noImage.jpg";

export default function DetailBreakdownSpareRequest({
    open,
    onClose,
    request,
}) {
    const { t } = useTranslation();
    const [form] = Form.useForm();

    useEffect(() => {
        if (request) {
            form.setFieldsValue({
                items: request?.details?.map((detail) => ({
                    spareRequestType: detail.spareRequestType || "spareReplace",
                    sparePart: detail.assetModelSparePart?.sparePart?.sparePartsName,
                    qty: detail.qty || 1,
                    unitCost: detail.unitCost || 0,
                    resourceId: detail.sparePart?.resourceId,
                    requestStatus: t(
                        assetModelSpareRequestCategory[detail.requestStatus]
                    ),
                })),
            });
        }
    }, [open, request]);

    return (
        <Drawer
            placement="right"
            closable={false}
            open={open}
            onClose={onClose}
            maskClosable
            width="100%"
            bodyStyle={{
                padding: 0,
                background: "#f0f2f5",
                display: "flex",
                flexDirection: "column",
                height: "100vh",
            }}
        >
            {/* Header cố định */}
            <div
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 64,
                    display: "flex",
                    alignItems: "center",
                    background: "#23457b",
                    color: "#fff",
                    padding: "0 20px",
                    fontWeight: 600,
                    fontSize: 18,
                    zIndex: 10,
                    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                }}
            >
                <ArrowLeftOutlined
                    style={{ fontSize: 20, marginRight: 16, cursor: "pointer" }}
                    onClick={onClose}
                />
                <span>{t("breakdown.sparePartList.labels.detail_title")}</span>
            </div>

            {/* Nội dung form */}
            <div
                style={{
                    padding: "72px 10px 80px",
                    overflowY: "auto",
                    flex: 1,
                    background: "#fafafa",
                }}
            >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{
                        items: [{ qty: 1, unitCost: 0, spareRequestType: "spareReplace" }],
                    }}
                >
                    <Form.List name="items">
                        {(fields) => (
                            <>
                                {fields.map((field, index) => (
                                    <Card
                                        key={field.key}
                                        bordered
                                        style={{
                                            marginBottom: 10,
                                            borderRadius: 10,
                                            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                                            background: "#fff",
                                        }}
                                        title={
                                            <div
                                                style={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "center",
                                                }}
                                            >
                                                <span>
                                                    {t("breakdown.sparePartForm.fields.spare_part")} #
                                                    {index + 1}
                                                </span>
                                            </div>
                                        }
                                    >
                                        <Row gutter={[6]}>
                                            <Col span={24}>
                                                <Form.Item
                                                    {...field}
                                                    name={[field.name, "spareRequestType"]}
                                                    label={t("breakdown.sparePartForm.fields.request_type")}
                                                    initialValue="spareReplace"
                                                >
                                                    <Radio.Group style={{ width: "100%" }} disabled>
                                                        <Radio value="spareReplace">
                                                            {t("breakdown.sparePartForm.options.spareReplace")}
                                                        </Radio>
                                                        <Radio value="spareRequest">
                                                            {t("breakdown.sparePartForm.options.spareRequest")}
                                                        </Radio>
                                                    </Radio.Group>
                                                </Form.Item>
                                            </Col>
                                            <Col span={14}>
                                                <Row>
                                                    <Col span={24}>
                                                        <Form.Item
                                                            {...field}
                                                            name={[field.name, "sparePart"]}
                                                            label={t("breakdown.sparePartForm.fields.spare_part")}
                                                        >
                                                            <Input disabled />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={24} className="mt-2">
                                                        <Form.Item
                                                            {...field}
                                                            name={[field.name, "qty"]}
                                                            label={t("breakdown.sparePartForm.fields.quantity")}
                                                        >
                                                            <Input type="number" min={1} disabled />
                                                        </Form.Item>
                                                    </Col>

                                                    <Col span={24} className="mt-2">
                                                        <Form.Item
                                                            {...field}
                                                            name={[field.name, "unitCost"]}
                                                            label={t("breakdown.sparePartForm.fields.unit_cost_vnd")}
                                                        >
                                                            <Input type="number" min={0} disabled />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={24} className="mt-2">
                                                        <Form.Item
                                                            {...field}
                                                            name={[field.name, "requestStatus"]}
                                                            label={t("breakdown.sparePartList.labels.status")}
                                                        >
                                                            <Input disabled />
                                                        </Form.Item>
                                                    </Col>
                                                </Row>
                                            </Col>
                                            <Col
                                                span={10}
                                                style={{
                                                    display: "flex",
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                    flexDirection: "column",
                                                }}
                                                className="mt-4"
                                            >
                                                <Form.Item shouldUpdate noStyle>
                                                    {() => {
                                                        const resourceId = form.getFieldValue([
                                                            "items",
                                                            field.name,
                                                            "resourceId",
                                                        ]);
                                                        return resourceId ? (
                                                            <div style={{ textAlign: "center" }}>
                                                                <Image
                                                                    src={_unitOfWork.resource.getImage(resourceId)}
                                                                    alt="Spare part"
                                                                    width={120}
                                                                    height={120}
                                                                    style={{
                                                                        objectFit: "contain",
                                                                        borderRadius: 8,
                                                                        border: "1px solid #eee",
                                                                    }}
                                                                    fallback="https://via.placeholder.com/200x200?text=No+Image"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <Image
                                                                src={noImage}
                                                                alt="Spare part"
                                                                width={120}
                                                                height={120}
                                                                style={{
                                                                    objectFit: "contain",
                                                                    borderRadius: 8,
                                                                    border: "1px solid #eee",
                                                                }}
                                                                fallback="https://via.placeholder.com/200x200?text=No+Image"
                                                            />
                                                        );
                                                    }}
                                                </Form.Item>
                                            </Col>
                                            <Col span={24}>
                                                <Divider style={{ margin: "10px 0" }} />
                                                <Form.Item shouldUpdate noStyle>
                                                    {() => {
                                                        const values =
                                                            form.getFieldValue(["items", field.name]) || {};
                                                        const total =
                                                            (Number(values.qty) || 0) *
                                                            (Number(values.unitCost) || 0);
                                                        return (
                                                            <div
                                                                style={{
                                                                    textAlign: "right",
                                                                    fontWeight: 600,
                                                                    color: "#23457b",
                                                                }}
                                                            >
                                                                {t("breakdown.sparePartList.labels.total")}:{" "}
                                                                {total.toLocaleString("vi-VN")}
                                                            </div>
                                                        );
                                                    }}
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    </Card>
                                ))}
                            </>
                        )}
                    </Form.List>
                </Form>
            </div>
        </Drawer>
    );
}