import { useEffect, useState } from "react";
import {
  ArrowLeftOutlined,
  ClockCircleOutlined,
  CloseOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { Button, Col, Image, message, Row, Tooltip, Typography } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import * as _unitOfWork from "../../api";
import useAuth from "../../contexts/authContext";
import { useTranslation } from "react-i18next";
import CardCalibrationWorkDetailAsset from "./CardCalibrationWorkDetailAsset";
import CalibrationWorkCommentDrawer from "../../components/Drawer/CalibrationWorkCommentDrawer";
import Comfirm from "../../components/modal/Comfirm";
import { calibrationWorkStatus } from "../../utils/calibration.constant";
const { Text } = Typography;

const CalibrationWorkDetail = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();
  const [assetMaintenance, setAssetMaintenance] = useState(null);
  const [calibrationWork, setCalibrationWork] = useState(null);
  const [showComment, setShowComment] = useState(false);
  const [showComfirmCancel, setShowComfirmCancel] = useState(false);
  const { permissions } = useAuth();

  useEffect(() => {
    fetchCalibrationWork();
  }, []);

  const fetchCalibrationWork = async () => {
    let res = await _unitOfWork.calibrationWork.getCalibrationWorkById(
      params.id
    );
    if (res && res.code === 1) {
      setCalibrationWork(res?.calibrationWork);
      setAssetMaintenance(res?.calibrationWork?.assetMaintenance);
    }
  };
  const onComfirmCancelCalibrationWork = async (data) => {
    let res =
      await _unitOfWork.calibrationWork.comfirmCancelCalibrationWorkById(
        params.id
      );
    if (res && res.code === 1) {
      message(t("Hủy thành công"));
    }
    setShowComfirmCancel(false);
    fetchCalibrationWork();
  };
  return (
    <div style={{ background: "#f8f8f8" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          height: 60,
          background: "#23457b",
          color: "#fff",
          padding: "0 16px",
          fontWeight: 600,
          fontSize: 18,
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <ArrowLeftOutlined
            style={{ fontSize: 20, marginRight: 16, cursor: "pointer" }}
            onClick={() => navigate(-1)}
          />
        </div>
        <div>
          {t("preventive.pdf.schedule_id")}: {calibrationWork?.code}
        </div>
        <div
          style={{
            display: "flex",
            gap: 20,
            alignItems: "center",
            marginLeft: "auto",
          }}
        >
          <Tooltip title={t("Lịch sử")}>
            <ClockCircleOutlined style={{ fontSize: 25, cursor: "pointer" }} />
          </Tooltip>
          {calibrationWork?.status === calibrationWorkStatus.new && (
            <Tooltip title={t("Hủy")}>
              <CloseOutlined
                style={{ fontSize: 25, cursor: "pointer" }}
                onClick={() =>
                  Comfirm(t("Xác nhận hủy công việc hiệu chuẩn"), () =>
                    onComfirmCancelCalibrationWork()
                  )
                }
              />
            </Tooltip>
          )}
        </div>
      </div>

      <div style={{ background: "#23457b", color: "#fff", padding: 10 }}>
        <Row align="middle" gutter={16}>
          <Col span={4}>
            <div
              style={{
                width: "100%",
                borderRadius: "50%",
                background: "#e5e5e5",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Image
                width={"90%"}
                height={"90%"}
                preview={false}
                src={_unitOfWork.resource.getImage(assetMaintenance?.resource?.id)}
                style={{ objectFit: "cover", background: "#eee" }}
              />
            </div>
          </Col>
          <Col flex="auto" span={18}>
            <Row justify="space-between">
              <Col>
                <Text strong style={{ color: "#fff", fontSize: 16 }}>
                  {assetMaintenance?.assetModel?.asset?.assetName} |{" "}
                  {assetMaintenance?.assetModel?.assetModelName} |{" "}
                  {assetMaintenance?.serial || assetMaintenance?.assetNumber}
                </Text>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
      <CardCalibrationWorkDetailAsset
        calibrationWork={calibrationWork}
        assetMaintenance={assetMaintenance}
      />
      <div
        style={{
          position: "fixed",
          bottom: 100,
          right: 20,
          zIndex: 1000,
        }}
      >
        <Button
          type="primary"
          shape="circle"
          icon={<MessageOutlined style={{ fontSize: 26 }} />}
          style={{
            width: 64,
            height: 64,
            border: "none",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          }}
          onClick={() => {
            setShowComment(true);
          }}
        />
      </div>
      <CalibrationWorkCommentDrawer
        open={showComment}
        onClose={() => setShowComment(false)}
        calibrationWork={calibrationWork}
      />
    </div>
  );
};

export default CalibrationWorkDetail;
