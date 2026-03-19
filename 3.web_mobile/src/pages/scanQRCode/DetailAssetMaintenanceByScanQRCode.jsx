import { Button, Card, Col, Row, Input } from "antd";
import React, { useEffect, useState } from "react";
import * as _unitOfWork from "../../api";
import { STORAGE_KEY } from "../../utils/constant";
import { useNavigate } from "react-router-dom";
import useQuery from "../../helper/useQuery";
import useAuth from "../../contexts/authContext";
import { useTranslation } from "react-i18next";
import { LeftCircleOutlined } from "@ant-design/icons";
import { parseDate } from "../../helper/date-helper";

export default function DetailAssetMaintenanceByScanQRCode() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const query = useQuery();

  const [assetMaintenanceId] = useState(query.get("assetMaintenance"));
  const [companyCode] = useState(query.get("companyCode"));

  const [assetMaintenance, setAssetMaintenance] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    // save company if user isn't logged in
    if (!user) {
      localStorage.setItem(
        STORAGE_KEY.USER,
        JSON.stringify({
          company: {
            code: companyCode,
          },
        })
      );
    }
  }, []);

  useEffect(() => {
    if (assetMaintenanceId) {
      fetchAssetMaintenance();
    }
  }, [assetMaintenanceId]);

  const fetchAssetMaintenance = async () => {
    const res = await _unitOfWork.assetMaintenance.getAssetMaintenance({
      id: assetMaintenanceId,
    });

    if (res && res.code === 1) {
      setAssetMaintenance(res?.data);
    }
  };

  return (
    <Card
      title={t("scanQRCode.title_property_information")}
      headStyle={{
        background: "#003064ff", // màu nền title
        color: "#fff", // màu chữ
        fontWeight: "700", // độ đậm chữ
        fontSize: "18px", // cỡ chữ,
        height:"7vh"
      }}
    >
      {!assetMaintenance ? (
        <p>{t("scanQRCode.loading_data")}</p>
      ) : (
        <Row gutter={24} style={{ marginBottom: 60 }}>
          {assetMaintenance?.serial && (
            <Col span={24}>
              <strong>{t("scanQRCode.serial")}:</strong>
              <Input
                value={assetMaintenance?.serial}
                disabled
                style={{ marginTop: 4 }}
              />
            </Col>
          )}
          {assetMaintenance?.assetNumber && (
            <Col span={24}>
              <strong>{t("scanQRCode.asset_number")}:</strong>
              <Input
                value={assetMaintenance?.assetNumber}
                disabled
                style={{ marginTop: 4 }}
              />
            </Col>
          )}
          {assetMaintenance.assetModel?.asset?.assetName && (
            <Col span={24} style={{ marginTop: 16 }}>
              <strong>{t("scanQRCode.asset_name")}:</strong>
              <Input
                value={assetMaintenance.assetModel?.asset?.assetName}
                disabled
                style={{ marginTop: 4 }}
              />
            </Col>
          )}
          {assetMaintenance.assetModel?.category && (
            <Col span={24} style={{ marginTop: 16 }}>
              <strong>{t("scanQRCode.category")}:</strong>
              <Input
                value={assetMaintenance.assetModel?.category?.categoryName}
                disabled
                style={{ marginTop: 4 }}
              />
            </Col>
          )}
          {assetMaintenance.assetModel?.subCategory && (
            <Col span={24} style={{ marginTop: 16 }}>
              <strong>{t("scanQRCode.sub_category")}:</strong>
              <Input
                value={
                  assetMaintenance.assetModel?.subCategory?.subCategoryName
                }
                disabled
                style={{ marginTop: 4 }}
              />
            </Col>
          )}
          {assetMaintenance.assetModel?.supplier && (
            <Col span={24} style={{ marginTop: 16 }}>
              <strong>{t("scanQRCode.supplier")}:</strong>
              <Input
                value={assetMaintenance.assetModel?.supplier?.supplierName}
                disabled
                style={{ marginTop: 4 }}
              />
            </Col>
          )}
          {assetMaintenance.assetModel?.manufacturer && (
            <Col span={24} style={{ marginTop: 16 }}>
              <strong>{t("scanQRCode.manufacturer")}:</strong>
              <Input
                value={
                  assetMaintenance.assetModel?.manufacturer?.manufacturerName
                }
                disabled
                style={{ marginTop: 4 }}
              />
            </Col>
          )}
          {assetMaintenance.assetModel && (
            <Col span={24} style={{ marginTop: 16 }}>
              <strong>{t("scanQRCode.asset_model_name")}:</strong>
              <Input
                value={assetMaintenance.assetModel?.assetModelName}
                disabled
                style={{ marginTop: 4 }}
              />
            </Col>
          )}
           {assetMaintenance.assetTypeCategory && (
            <Col span={24} style={{ marginTop: 16 }}>
              <strong>{t("scanQRCode.asset_type_category")}:</strong>
              <Input
                value={assetMaintenance.assetTypeCategory}
                disabled
                style={{ marginTop: 4 }}
              />
            </Col>
          )}
          {assetMaintenance.customer && (
            <Col span={24} style={{ marginTop: 16 }}>
              <strong>{t("scanQRCode.customer")}:</strong>
              <Input
                value={assetMaintenance.customer?.customerName}
                disabled
                style={{ marginTop: 4 }}
              />
            </Col>
          )}
          {assetMaintenance?.installationDate && (
            <Col span={24} style={{ marginTop: 16 }}>
              <strong>{t("scanQRCode.installation_date")}:</strong>
              <Input
                value={parseDate(assetMaintenance?.installationDate)}
                disabled
                style={{ marginTop: 4 }}
              />
            </Col>
          )}
          {assetMaintenance?.purchaseDate && (
            <Col span={24} style={{ marginTop: 16 }}>
              <strong>{t("scanQRCode.purchase_date")}:</strong>
              <Input
                value={parseDate(assetMaintenance?.purchaseDate)}
                disabled
                style={{ marginTop: 4 }}
              />
            </Col>
          )}
          {assetMaintenance.yearOfManufacturing && (
            <Col span={24} style={{ marginTop: 16 }}>
              <strong>{t("scanQRCode.year_of_manufacturing")}:</strong>
              <Input
                value={assetMaintenance.yearOfManufacturing}
                disabled
                style={{ marginTop: 4 }}
              />
            </Col>
          )}
          {assetMaintenance.description && (
            <Col span={24} style={{ marginTop: 16 }}>
              <strong>{t("scanQRCode.description")}:</strong>
              <Input.TextArea
                value={assetMaintenance.description || t("Không có mô tả")}
                disabled
                rows={3}
                style={{ marginTop: 4 }}
              />
            </Col>
          )}
        </Row>
      )}

      {/* Nút quay lại */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100%",
          padding: "20px",
          background: "#ffffffff",
          borderTop: "1px solid #eee",
          textAlign: "center",
        }}
      >
        <Button
          style={{ width: "30vw", fontWeight: 700 }}
          onClick={() => navigate(-1)}
        >
          <LeftCircleOutlined /> {t("common_buttons.back")}
        </Button>
      </div>
    </Card>
  );
}
