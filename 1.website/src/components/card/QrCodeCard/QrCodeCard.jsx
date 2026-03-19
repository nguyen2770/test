import { EnvironmentOutlined } from "@ant-design/icons";
import { Col, Form, Input, Row, Select } from "antd";
import React, { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import "./qrCodeCard.scss";
import useAuth from "../../../contexts/authContext";
export default function QrCodeCard({ assetMaintenance, companyCode }) {
  const { user } = useAuth();
  return (
    <>
      {assetMaintenance && (
        <div className="qr-code-card-container ">
          <div className="asset-maintenance-customer-name">
            {assetMaintenance?.customer?.customerName}
          </div>
          <div className="asset-maintenance-asset-name">
            {assetMaintenance?.assetModel?.asset?.assetName}
          </div>
          <div className="asset-maintenance-asset-number">
            {assetMaintenance?.assetNumber}
          </div>
          {/* <div className="asset-maintenance-qrcode">
            <QRCode
              value={
                "http://192.168.1.154:3003/scan-QR-code-home?assetMaintenance=" +
                assetMaintenance.id +
                "&companyCode=" +
                user?.company?.code
              }
            />
          </div> */}
          <div className="asset-maintenance-qrcode">
            <QRCode
              value={
                "https://m.medicmms.vn/scan-QR-code-home?assetMaintenance=" +
                assetMaintenance.id +
                "&companyCode=" +
                user?.company?.code
              }
            />
          </div>
        </div>
      )}
    </>
  );
}
