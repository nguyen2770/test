import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as _unitOfWork from "../../../api";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Col, Row } from "antd";
import { parseDate } from "../../../helper/date-helper";
export default function SolutionBank() {
  const params = useParams();
  const navigate = useNavigate();
  const [breakdown, setBreakdown] = useState(null);

  useEffect(() => {
    fetchGetBreakdownById();
  }, []);

  const fetchGetBreakdownById = async () => {
    let res = await _unitOfWork.breakdown.getBreakdownById({ id: params.id });
    if (res) {
      setBreakdown(res?.breakdown);
    }
  };

  return (
    <div style={{ background: "#f8f8f8", minHeight: "100vh" }}>
      {/* Header */}
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
          onClick={() => navigate(-1)}
        />
        <span style={{ flex: 1 }}>Ngân hàng giải pháp</span>
      </div>
      {/* Tiêu đề */}
      <div
        style={{
          fontWeight: 600,
          fontSize: 17,
          margin: "24px 0 12px 20px",
          textAlign: "center",
        }}
      >
        {breakdown?.assetMaintenanceId?.asset?.assetName}
      </div>

      {/* Card thông tin */}
      <div
        style={{
          padding: "15px",
        }}
      >
        <Row style={{ textAlign: "center" }}>
          <Col span={12}>
            <div style={{ color: "#aaa", fontSize: 15 }}>ID của thẻ</div>
            <div style={{ color: "#00b96b", fontWeight: 500, fontSize: 17 }}>
              {breakdown?.code}
            </div>
          </Col>
          <Col span={12}>
            <div style={{ color: "#aaa", fontSize: 15 }}>Ngày mở</div>
            <div style={{ color: "#00b96b", fontWeight: 500, fontSize: 17 }}>
              {breakdown?.createdAt ? parseDate(breakdown?.createdAt) : "null"}
            </div>
          </Col>
        </Row>
      </div>
      <div
        style={{
          borderBottom: "2px dashed #ccc",
        }}
      />
    </div>
  );
}
