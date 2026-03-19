import React, { useEffect, useState } from "react";
import {
  Button,
  Form,
  Input,
  Select,
  Radio,
  Drawer,
  Row,
  Col,
  Card,
  Image,
  message,
  Divider,
} from "antd";
import { ArrowLeftOutlined, PlusCircleOutlined } from "@ant-design/icons";
import * as _unitOfWork from "../../../api";
import { useTranslation } from "react-i18next";
import { priceFormatter } from "../../../helper/price-helper";
import de from "date-fns/esm/locale/de/index.js";
import { parseToLabel } from "../../../helper/parse-helper";
import {
  schedulePreventiveTaskRequestSparePartDetailStatus,
  schedulePreventiveTaskRequestSparePartStatus,
} from "../../../utils/constant";
import noIamge from "../../../assets/images/noImage.jpg";
export default function DetailSchedulePrevetiveTaskResSparePart({
  open,
  onClose,
  schedulePreventiveTaskRequestSparepart,
}) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  useEffect(() => {
    if (schedulePreventiveTaskRequestSparepart) {
      form.setFieldsValue({
        items:
          schedulePreventiveTaskRequestSparepart?.schedulePrevetiveTaskSparePartRequestDetails?.map(
            (sp) => ({
              spareRequestType: sp.spareRequestType || "spareReplace",
              sparePart: sp.sparePart?.sparePartsName,
              qty: sp.qty || 1,
              unitCost: sp.unitCost || 0,
              resourceId: sp.sparePart?.resourceId,
              requestStatus: t(
                parseToLabel(
                  schedulePreventiveTaskRequestSparePartDetailStatus.Options,
                  sp.requestStatus
                )
              ),
            })
          ),
      });
    }
  }, [open, schedulePreventiveTaskRequestSparepart]);

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
        <span>{t("Chi tiết yêu cầu")}</span>
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
          // onFinish={handleSubmit}
          initialValues={{
            items: [
              { qty: 1, unitCost: 0, spareRequestType: "spareReplace" }, // Bản ghi mặc định
            ],
          }}
        >
          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field, index) => (
                  <>
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
                            {t("Phụ tùng")} #{index + 1}
                          </span>
                        </div>
                      }
                    >
                      <Row gutter={[6]}>
                        <Col span={24}>
                          <Form.Item
                            {...field}
                            name={[field.name, "spareRequestType"]}
                            label={t("Loại yêu cầu")}
                            initialValue="spareReplace"
                          >
                            <Radio.Group style={{ width: "100%" }}>
                              <Radio value="spareReplace">
                                {t(
                                  "breakdown.sparePartForm.options.spareReplace"
                                )}
                              </Radio>
                              <Radio value="spareRequest">
                                {t(
                                  "breakdown.sparePartForm.options.spareRequest"
                                )}
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
                                label={t("Tên phụ tùng")}
                              >
                                <Input />
                              </Form.Item>
                            </Col>
                            <Col span={24} className="mt-2">
                              <Form.Item
                                {...field}
                                name={[field.name, "qty"]}
                                label={t("Số lượng")}
                              >
                                <Input type="number" min={1} />
                              </Form.Item>
                            </Col>

                            <Col span={24} className="mt-2">
                              <Form.Item
                                {...field}
                                name={[field.name, "unitCost"]}
                                label={t("Đơn giá (VND)")}
                              >
                                <Input type="number" min={0} />
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
                                    src={_unitOfWork.resource.getImage(
                                      resourceId
                                    )}
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
                                  src={noIamge}
                                  alt="Spare part"
                                  width={120}
                                  height={120}
                                  style={{
                                    objectFit: "contain",
                                    borderRadius: 8,
                                    border: "1px solid #eee",
                                  }}
                                  fallback="https://via.placeholder.com/200x200?text=No+Image"
                                ></Image>
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
                                  {t("Tổng tiền (VND)")}:{" "}
                                  {total.toLocaleString("vi-VN")}
                                </div>
                              );
                            }}
                          </Form.Item>
                        </Col>
                      </Row>
                    </Card>
                  </>
                ))}
              </>
            )}
          </Form.List>
        </Form>
      </div>
    </Drawer>
  );
}
