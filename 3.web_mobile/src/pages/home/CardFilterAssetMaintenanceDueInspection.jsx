import React, { useEffect, useRef, useState } from "react";
import {
  Row,
  Col,
  message,
  Form,
  Select,
  Button,
  Input,
  DatePicker,
  Divider,
  Drawer,
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { FORMAT_DATE } from "../../utils/constant";
import { useTranslation } from "react-i18next";

const CardFilterAssetMaintenanceDueInspection = ({
  open,
  onClose,
  onSearch,
  onReFeshFilter,
}) => {
  const [filterForm] = Form.useForm();
  const { t } = useTranslation();

  useEffect(() => {
    filterForm.setFieldsValue({
      nextInspectionDate: filterForm?.nextInspectionDate
        ? dayjs(filterForm?.nextInspectionDate)
        : null,
      serial: filterForm?.serial,
      assetNumber: filterForm?.assetNumber,
    });
  }, [filterForm]);

  const handleSubmit = () => {
    const values = filterForm.getFieldsValue();
    if (!values.nextInspectionDate) delete values?.nextInspectionDate;
    if (!values?.serial) {
      delete values?.serial;
    }
    if (!values?.assetNumber) {
      delete values?.assetNumber;
    }
    if (values.nextInspectionDate)
      values.nextInspectionDate =
        values.nextInspectionDate.format("YYYY-MM-DD");
    onSearch(values); // Gửi về cha
    onClose();
  };
  const handleReset = () => {
    filterForm.resetFields();
    onReFeshFilter();
  };
  return (
    <div style={{ background: "#f8f8f8" }}>
      <Drawer
        placement="right"
        closable={false}
        open={open}
        width="100%"
        bodyStyle={{ padding: 0 }}
      >
        <Form className="search-form" form={filterForm} layout="vertical">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              height: 56,
              background: "#23457b",
              color: "#fff",
              padding: "0 16px",
              fontWeight: 600,
              fontSize: 20,
              boxSizing: "border-box",
            }}
          >
            <ArrowLeftOutlined
              style={{ fontSize: 22, marginRight: 16, cursor: "pointer" }}
              onClick={onClose}
            />
            <span style={{ flex: 1 }}>
              {t("dashboard.inspection_calibration_due_date.card_filter")}
            </span>
          </div>

          {/* Chọn ngày */}
          <div style={{ padding: 16, background: "#fff" }}>
            <Row>
              {/* <Divider>Chọn ngày</Divider> */}
              <Row gutter={[16, 16]} style={{ width: "100%" }}>
                <Col span={24}>
                  <Form.Item
                    label={t(
                      "dashboard.inspection_calibration_due_date.asset_number"
                    )}
                    name="assetNumber"
                    labelAlign="left"
                  >
                    <Input
                      placeholder={t(
                        "dashboard.inspection_calibration_due_date.enter_asset_number"
                      )}
                    />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    label={t(
                      "dashboard.inspection_calibration_due_date.serial"
                    )}
                    name="serial"
                    labelAlign="left"
                  >
                    <Input
                      placeholder={t(
                        "dashboard.inspection_calibration_due_date.enter_serial"
                      )}
                    />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    label={t(
                      "dashboard.inspection_calibration_due_date.next_inspection_date"
                    )}
                    name="nextInspectionDate"
                    labelAlign="left"
                  >
                    <DatePicker
                      style={{ width: "100%" }}
                      placeholder={t(
                        "dashboard.inspection_calibration_due_date.chosse_inspection_date"
                      )}
                      format={FORMAT_DATE}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Row>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: 16,
              gap: 12,
              background: "#fff",
              position: "sticky",
              bottom: 0,
            }}
          >
            <Button
              block
              onClick={handleReset}
              style={{
                background: "#34c38f",
                color: "#fff",
                flex: 1,
                height: 40,
                fontWeight: 500,
                fontSize: 16,
              }}
            >
              {t("dashboard.inspection_calibration_due_date.delete_filter")}
            </Button>
            <Button
              block
              onClick={handleSubmit}
              style={{
                background: "#34c38f",
                color: "#fff",
                flex: 1,
                height: 40,
                fontWeight: 500,
                fontSize: 16,
              }}
            >
              {t("dashboard.inspection_calibration_due_date.apply_filter")}
            </Button>
          </div>
        </Form>
      </Drawer>
    </div>
  );
};

export default CardFilterAssetMaintenanceDueInspection;
