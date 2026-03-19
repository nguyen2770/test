import React, { useState, useRef, useEffect } from "react";
import { Row, Col, Drawer, Divider } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import * as _unitOfWork from "../../api";
import { parseToLabel } from "../../helper/parse-helper";
import { progressStatus } from "../../utils/constant";
import { parseDateHH } from "../../helper/date-helper";
import ApproveSparePart from "./ApproveSparePartModal";
import { useNavigate, useParams } from "react-router-dom";
import { checkPermission } from "../../helper/permission-helper";
import useAuth from "../../contexts/authContext";
import { permissionCodeConstant } from "../../utils/permissionCodeConstant";
import { useTranslation } from "react-i18next";
const BreakdwonSparePart = () => {
  const navigate = useNavigate();
  const params = useParams();
  const { t } = useTranslation()
  const [breakdownSparePartResquests, setBreakdownSparePartResquests] =
    useState([]);
  const [
    isOpenbreakdownSparePartResquestDetails,
    setIsOpenBreakdownSparePartResquestDetails,
  ] = useState(false);
  const [breakdownSparePartResquest, setBreakdownSparePartResquest] = useState(
    []
  );
  const [breakdown, setBreakdown] = useState([]);
  const { permissions } = useAuth();
  useEffect(() => {
    fetchGetBreakdownById();
    fetchListBreakdownSpareRequest();
  }, []);

  const fetchGetBreakdownById = async () => {
    let res = await _unitOfWork.breakdown.getBreakdownById({ id: params.id });
    if (res) {
      setBreakdown({
        ...res?.breakdown,
        breakdownAssignUsers: res?.breakdownAssignUsers,
      });
    }
  };

  const fetchListBreakdownSpareRequest = async () => {
    let payload = {
      breakdown: params.id,
    };
    const res =
      await _unitOfWork.breakdownSpareRequest.getBreakdownSparePartResByRes(
        payload
      );
    if (res && res.code === 1) {
      setBreakdownSparePartResquests(res?.data);
    }
  };

  const onClickOenDetails = (values) => {
    if (
      checkPermission(permissions, permissionCodeConstant.spare_view_detail)
    ) {
      setIsOpenBreakdownSparePartResquestDetails(true);
      setBreakdownSparePartResquest(values);
    }
  };

  const onReFresh = () => {
    fetchGetBreakdownById();
    fetchListBreakdownSpareRequest();
  };
  return (
    <div
      style={{
        background: "#f7f9fb",
        borderRadius: 8,
        display: "flex",
        flexDirection: "column",
        paddingBottom: 2,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            height: 56,
            background: "#23457b",
            color: "#fff",
            padding: "15px",
            fontWeight: 600,
            fontSize: 20,
            zIndex: 1000,
            position: "sticky",
            top: 0,
          }}
        >
          <ArrowLeftOutlined
            style={{ fontSize: 22, marginRight: 16, cursor: "pointer" }}
            onClick={() => navigate(-1)}
          />
          <span style={{ flex: 1 }}>{t("breakdown.sparePart.title")}</span>
        </div>
        {/* Title */}
        <div
          style={{
            fontWeight: 600,
            fontSize: 17,
            marginTop: 10,
            textAlign: "center",
          }}
        >
          {breakdown?.assetMaintenance?.assetModel?.asset?.assetName}
        </div>
        <div style={{ padding: "10px" }}>
          <Row style={{ textAlign: "center" }}>
            <Col span={12}>
              <div style={{ color: "#aaa", fontSize: 15 }}>{t("breakdown.sparePart.card_code")}</div>
              <div style={{ color: "#00b96b", fontWeight: 500, fontSize: 17 }}>
                {breakdown?.code}
              </div>
            </Col>
            <Col span={12}>
              <div style={{ color: "#aaa", fontSize: 15 }}>{t("breakdown.sparePart.open_date")}</div>
              <div style={{ color: "#00b96b", fontWeight: 500, fontSize: 17 }}>
                {breakdown?.createdAt
                  ? new Date(breakdown.createdAt).toLocaleString("vi-VN")
                  : "null"}
              </div>
            </Col>
          </Row>
        </div>
        <div style={{ borderBottom: "2px dashed #ccc" }} />
        {breakdownSparePartResquests?.map((item, index) => (
          <Row
            className="m-2 p-2"
            style={{ background: "#e7e7ea" }}
            key={index}
            onClick={() => onClickOenDetails(item)}
          >
            <Col
              span={24}
              key={index}
              style={{ textAlign: "end", color: "#000", fontWeight: 500 }}
            >
              {t(parseToLabel(progressStatus.Option, item?.requestStatus))}
            </Col>
            <Col span={24}>Mở bởi : {item.createdBy?.fullName}</Col>

            <Row className="mt-3">
              <Col span={12} style={{ color: "rgb(105, 102, 102)" }}>
                {t("breakdown.sparePart.requester")}
              </Col>
              <Col span={12} style={{ color: "rgb(105, 102, 102)" }}>
                {t("breakdown.sparePart.request_date")}
              </Col>
              <Col span={12} style={{ fontWeight: 500 }}>
                {item.createdBy?.fullName}
              </Col>
              <Col span={12}>{parseDateHH(item?.createdAt)}</Col>
            </Row>

            {item.assignUsers && item.assignUsers.length > 0 && <Divider />}
            {item.assignUsers &&
              item.assignUsers.length > 0 &&
              item.assignUsers.map((data) => (
                <Row className="mt-2">
                  <Col span={12} style={{ color: "rgb(105, 102, 102)" }}>
                    {t("breakdown.sparePart.receiver")}
                  </Col>
                  <Col span={12} style={{ color: "rgb(105, 102, 102)" }}>
                    {t("breakdown.sparePart.received_date")}
                  </Col>
                  <Col span={12} style={{ fontWeight: 500 }}>
                    {data.user?.fullName}
                  </Col>
                  <Col span={12}>{parseDateHH(item?.assignUserDate)}</Col>
                </Row>
              ))}
          </Row>
        ))}
        <div className="p-1"></div>
        <ApproveSparePart
          open={isOpenbreakdownSparePartResquestDetails}
          onSubmit={onReFresh}
          onClose={() => setIsOpenBreakdownSparePartResquestDetails(false)}
          data={breakdownSparePartResquest}
          breakdown={breakdown}
        />
      </div>
    </div>
  );
};

export default BreakdwonSparePart;
