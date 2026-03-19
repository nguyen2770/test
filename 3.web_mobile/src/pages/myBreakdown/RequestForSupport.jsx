import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Row, Col, message, Form, Select, Button, Input } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import * as _unitOfWork from "../../api";
import useAuth from "../../contexts/authContext";
import { useTranslation } from "react-i18next";

const { Option } = Select;
const { TextArea } = Input;

const RequestForSupport = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const params = useParams();
  const navigate = useNavigate();
  const [breakdown, setBreakdown] = useState(null);
  const [status, setStatus] = useState("partialComplete");
  const [comment, setComment] = useState("");
  const userId = user?.id;

  useEffect(() => {
    fetchGetBreakdownById();
  }, []);

  const fetchGetBreakdownById = async () => {
    let res = await _unitOfWork.breakdown.getBreakdownById({ id: params.id });
    if (res) {
      setBreakdown(res?.breakdown);
    }
  };

  const handleSubmit = async () => {
    const payload = {
      user: userId,
      breakdown: breakdown?.id,
      progressStatus: status,
      comment: comment,
    };
    const res =
      await _unitOfWork.breakdownAssignUser.updateBreakdownAssignUserStatusRequestForSupport(
        payload
      );
    if (res && res.code === 1) {
      message.success(t("breakdown.requestSupport.messages.submit_success"));
      navigate(-1);
    } else {
      message.error(t("breakdown.requestSupport.messages.submit_error"));
    }
  };

  return (
    <div style={{ background: "#f8f8f8", minHeight: "100vh" }}>
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
        <span style={{ flex: 1 }}>{t("breakdown.requestSupport.title")}</span>
      </div>
      <div
        style={{
          fontWeight: 600,
          fontSize: 17,
          margin: "24px 0 12px 20px",
          textAlign: "center",
        }}
      >
        {breakdown?.assetMaintenance?.asset?.assetName}
      </div>
      <div style={{ padding: "15px" }}>
        <Row style={{ textAlign: "center" }}>
          <Col span={12}>
            <div style={{ color: "#aaa", fontSize: 15 }}>
              {t("breakdown.sparePart.card_code")}
            </div>
            <div style={{ color: "#00b96b", fontWeight: 500, fontSize: 17 }}>
              {breakdown?.code}
            </div>
          </Col>
          <Col span={12}>
            <div style={{ color: "#aaa", fontSize: 15 }}>
              {t("breakdown.reopen.fields.opened_date")}
            </div>
            <div style={{ color: "#00b96b", fontWeight: 500, fontSize: 17 }}>
              {breakdown?.createdAt
                ? new Date(breakdown.createdAt).toLocaleString("vi-VN")
                : "null"}
            </div>
          </Col>
        </Row>
      </div>
      <div
        style={{
          borderBottom: "2px dashed #ccc",
        }}
      />
      <div
        style={{
          margin: "24px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <Form layout="vertical">
          <Form.Item
            label={t("breakdown.requestSupport.fields.progress_status")}
          >
            <Select
              value={status}
              onChange={(value) => setStatus(value)}
              placeholder={t(
                "breakdown.requestSupport.placeholders.progress_status"
              )}
            >
              <Option value="Incomplete">
                {t("breakdown.requestSupport.options.incomplete")}
              </Option>
              <Option value="partialComplete">
                {t("breakdown.requestSupport.options.partial_complete")}
              </Option>
            </Select>
          </Form.Item>
          <Form.Item label={t("breakdown.requestSupport.fields.comment")}>
            <TextArea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t("breakdown.requestSupport.placeholders.comment")}
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              block
              onClick={handleSubmit}
              style={{ marginTop: 10 }}
            >
              {t("breakdown.cancel.buttons.submit")}
            </Button>
          </Form.Item>
        </Form>
      </div>
      <div style={{ marginBottom: "100px" }}></div>
    </div>
  );
};

export default RequestForSupport;
