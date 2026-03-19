import { Button, Card, Col, DatePicker, Form, Input, Row, Select } from "antd";
import React, { useEffect, useState } from "react";
import * as _unitOfWork from "../../api";
import { useNavigate, useParams } from "react-router-dom";
import useQuery from "../../helper/useQuery";
import { staticPathUnAuthen } from "../../router/RouteUnAuthenConfig";
import { useTranslation } from "react-i18next";

export default function ScanQRCodeHome() {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  let query = useQuery();
  const [assetMaintenanceId, setAssetMaintenanceId] = useState(
    query.get("assetMaintenance")
  );
  const [companyCode, setCompanyCode] = useState(query.get("companyCode"));

  return (
    <Form
      form={form}
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
    >
      <Card title={t("scanQRCode.title_list_of_functions")}>
        <Row gutter={[16, 16]} justify="center">
          <Col span={24}>
            <Button
              type="primary"
              block
              size="large"
              onClick={() =>
                navigate(
                  `${staticPathUnAuthen.createBreakdown}?assetMaintenance=${assetMaintenanceId}&companyCode=${companyCode}`
                )
              }
            >
              {t("scanQRCode.bt_report_a_problem")}
            </Button>
          </Col>

          <Col span={24}>
            <Button
              type="default"
              block
              size="large"
              onClick={() =>
                navigate(
                  `${staticPathUnAuthen.detailAssetMaintenanceByScanQRCode}?assetMaintenance=${assetMaintenanceId}&companyCode=${companyCode}`
                )
              }
            >
              {t("scanQRCode.bt_view_property_details")}
            </Button>
          </Col>
        </Row>
      </Card>
    </Form>
  );
}
