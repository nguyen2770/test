import React, { useEffect, useState } from "react";
import {
  Button,
  Form,
  InputNumber,
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
import {
  ArrowLeftOutlined,
  PlusCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import * as _unitOfWork from "../../../api";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "../../../helper/price-helper";
import noIamge from "../../../assets/images/noImage.jpg";
export default function CreateRequestSparePartSchedule({
  open,
  onClose,
  assetModelId,
  schedulePreventive,
  schedulePreventiveTask,
  onReset,
  spareParts,
}) {
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    if (!values?.items?.length) {
      message.warning(
        t("schedulePreventive.spareRequest.selectNothingWarning")
      );
      return;
    }

    const invalidItem = values.items.some(
      (item) => !item?.sparePart || !item?.qty
    );
    if (invalidItem) {
      message.warning(t("schedulePreventive.spareRequest.fillItemsWarning"));
      return;
    }

    const res =
      await _unitOfWork.schedulePreventiveTaskRequestSparepart.createSchedulePreventiveSparePartRequest(
        {
          data: {
            schedulePreventiveTask,
            schedulePreventive,
            schedulePreventiveRequestSpareParts: values.items,
          },
        }
      );

    if (res?.code === 1) {
      message.success(t("schedulePreventive.spareRequest.submitSuccess"));
      onReset();
      onRefesh();
    } else {
      message.error(t("schedulePreventive.spareRequest.submitFailed"));
    }
  };

  const onRefesh = () => {
    form.resetFields();
    onClose();
  };

  const getSparePartImage = (sparePartId) => {
    const found = spareParts.find((sp) => sp.sparePart.id === sparePartId);
    return found?.sparePart?.resourceId || null;
  };

  return (
    <Drawer
      placement="right"
      closable={false}
      open={open}
      onClose={onRefesh}
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
          onClick={onRefesh}
        />
        <span>{t("schedulePreventive.spareRequest.title")}</span>
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
          onFinish={handleSubmit}
          initialValues={{
            items: [{ qty: 1, unitCost: 0, spareRequestType: "spareReplace" }],
          }}
        >
          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field, index) => (
                  <React.Fragment key={field.key}>
                    <Card
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
                            {t("schedulePreventive.spareRequest.sparePart")} #
                            {index + 1}
                          </span>
                          <Button
                            type="primary"
                            className="p-2 pl-3 pr-3"
                            onClick={() => remove(field.name)}
                            style={{
                              padding: 0,
                              alignItems: "center",
                              display: "flex",
                            }}
                          >
                            {t("schedulePreventive.spareRequest.delete")}
                          </Button>
                        </div>
                      }
                    >
                      <Row gutter={[6]}>
                        <Col span={24}>
                          <Form.Item
                            {...field}
                            name={[field.name, "spareRequestType"]}
                            label={t(
                              "schedulePreventive.spareRequest.requestTypeLabel"
                            )}
                            rules={[
                              {
                                required: true,
                                message: t(
                                  "schedulePreventive.spareRequest.requestTypeRequired"
                                ),
                              },
                            ]}
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
                          <Row gutter={16}>
                            <Col span={24}>
                              <Form.Item
                                {...field}
                                name={[field.name, "sparePart"]}
                                label={t(
                                  "schedulePreventive.spareRequest.sparePartName"
                                )}
                                rules={[
                                  {
                                    required: true,
                                    message: t(
                                      "schedulePreventive.spareRequest.selectSparePartRequired"
                                    ),
                                  },
                                ]}
                              >
                                <Select
                                  showSearch
                                  placeholder={t(
                                    "schedulePreventive.spareRequest.selectSparePartPlaceholder"
                                  )}
                                  optionFilterProp="children"
                                  style={{ width: "100%" }}
                                >
                                  {spareParts.map((sp) => (
                                    <Select.Option
                                      key={sp.sparePart.id}
                                      value={sp.sparePart.id}
                                    >
                                      {sp.sparePart.sparePartsName}
                                    </Select.Option>
                                  ))}
                                </Select>
                              </Form.Item>
                            </Col>
                            <Col span={24} className="mt-1">
                              <Form.Item
                                {...field}
                                name={[field.name, "qty"]}
                                label={t(
                                  "schedulePreventive.spareRequest.qtyLabel"
                                )}
                                rules={[
                                  {
                                    required: true,
                                    message: t(
                                      "schedulePreventive.spareRequest.qtyRequired"
                                    ),
                                  },
                                ]}
                              >
                                <InputNumber
                                  style={{ width: "100%" }}
                                  formatter={formatCurrency}
                                  min={1}
                                />
                              </Form.Item>
                            </Col>

                            <Col span={24} className="mt-1">
                              <Form.Item
                                {...field}
                                name={[field.name, "unitCost"]}
                                label={t(
                                  "schedulePreventive.spareRequest.unitCostLabel"
                                )}
                                rules={[
                                  {
                                    required: true,
                                    message: t(
                                      "schedulePreventive.spareRequest.unitCostRequired"
                                    ),
                                  },
                                ]}
                              >
                                <InputNumber
                                  style={{ width: "100%" }}
                                  formatter={formatCurrency}
                                  min={0}
                                />
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
                              const sparePartId = form.getFieldValue([
                                "items",
                                field.name,
                                "sparePart",
                              ]);
                              const imageUrl = getSparePartImage(sparePartId);
                              return imageUrl ? (
                                <div style={{ textAlign: "center" }}>
                                  <Image
                                    src={_unitOfWork.resource.getImage(
                                      imageUrl
                                    )}
                                    alt={t(
                                      "schedulePreventive.spareRequest.sparePartImageAlt"
                                    )}
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
                                  alt={t(
                                    "schedulePreventive.spareRequest.sparePartImageAlt"
                                  )}
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
                                  {t(
                                    "schedulePreventive.spareRequest.totalLabel"
                                  )}
                                  : {total.toLocaleString("vi-VN")}
                                </div>
                              );
                            }}
                          </Form.Item>
                        </Col>
                      </Row>
                    </Card>
                    <div
                      style={{
                        position: "absolute",
                        top: 12,
                        right: 20,
                        zIndex: 3000,
                        width: 32,
                        height: 32,
                      }}
                    >
                      <Button
                        shape="circle"
                        icon={
                          <PlusOutlined
                            style={{ fontSize: 18, color: "#23457b" }}
                          />
                        }
                        size="large"
                        onClick={() =>
                          add({
                            qty: 1,
                            unitCost: 0,
                            spareRequestType: "spareReplace",
                          })
                        }
                      />
                    </div>
                  </React.Fragment>
                ))}
              </>
            )}
          </Form.List>
          {/* Nút gửi cố định */}
          <div
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              background: "#fff",
              borderTop: "1px solid #eee",
              padding: "10px 20px",
              zIndex: 20,
            }}
          >
            <Button
              type="primary"
              htmlType="submit"
              block
              style={{
                background: "#00b050",
                borderColor: "#00b050",
                height: 48,
                fontSize: 16,
                fontWeight: 500,
              }}
            >
              {t("schedulePreventive.spareRequest.submitButton")}
            </Button>
          </div>
        </Form>
      </div>
    </Drawer>
  );
}
