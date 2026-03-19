import React, { useEffect, useState } from "react";
import { Card, Row, Col, Tabs, Timeline, Tag, Button } from "antd";
import {
  LeftCircleOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import * as _unitOfWork from "../../../api";
import { useTranslation } from "react-i18next";
import TabsGeneralInformationCalibrationWork from "./tabInViewCalibrationWork/TabsGeneralInformationCalibrationWork";
import CalibrationHistory from "./tabInViewCalibrationWork/CalibrationHistory";
export default function ViewCalibrationWork() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();
  const [calibrationWork, setCalibrationWork] = useState([]);
  // const [calibrationWorkHistorys, setCalibrationWorkHistorys] = useState([]);
  // const [calibrationWorkAssignUsers, setCalibrationWorkAssignUsers] = useState([]);
  const items = [
    {
      key: "general",
      label: t("calibrationWork.detail.title_general_information"),
      children: <TabsGeneralInformationCalibrationWork calibrationWork={calibrationWork} />,
    },
    {
      key: "attachment",
      label: t("calibrationWork.detail.title_calibration_history"),
      children: <CalibrationHistory calibrationWork={calibrationWork} />,
    },
  ];

  useEffect(() => {
    fetchGetBreakdownById();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchGetBreakdownById = async () => {
    let res = await _unitOfWork.calibrationWork.getCalibrationWorkById(params.id);
    if (res) {
      setCalibrationWork(res?.calibrationWork);
    }
  };
  return (
    <div className="p-3" style={{ background: "#fff" }}>
      <Row gutter={32}>
        <Col span={24}>
          <div>
            <Button
              style={{ float: "right", marginBottom: 16 }}
              onClick={() => navigate(-1)}
            >
              <LeftCircleOutlined />
              {t("breakdown.view.buttons.back")}
            </Button>
          </div>
        </Col>
        <Col span={24}>
          <Tabs
            defaultActiveKey="1"
            items={items}
            className="tab-all"
            style={{
              boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
              borderRadius: 8,
              background: "#fff",
            }}
          />
        </Col>
      </Row>
    </div>
  );
}