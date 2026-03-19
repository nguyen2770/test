import React, { useEffect, useState } from "react";
import {
  ArrowLeftOutlined,
  FileTextOutlined,
  BookOutlined,
  PaperClipOutlined,
  MoreOutlined,
  ToolOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  CommentOutlined,
  ReadOutlined,
  SignatureOutlined,
  PhoneFilled,
  UserOutlined,
  DatabaseOutlined,
} from "@ant-design/icons";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import * as _unitOfWork from "../../api";
import { Avatar, Button, Col, Drawer, Image, Row } from "antd";
import {
  assetMaintenanceStatus,
  assetType,
  breakdownTicketStatus,
  breakdownType,
  breakdownUserStatus,
  priorityLevelStatus,
  progressStatus,
} from "../../utils/constant";
import { parseDateHH } from "../../helper/date-helper";
import { staticPath } from "../../router/RouteConfig";
import CheckinCheckoutBreakdown from "./CheckinCheckoutBreakdown";
import BreakdownComment from "./BreakdownComment";
import ComfirmCancelBreakdown from "./ComfirmCancelBreakdown";
import TechnicianAppoinment from "../../components/modal/TechnicianAppoinment";
import ReplacementAssignUser from "./ReplacementAssignUser";
import ReopenBreakdown from "./ReOpenBreakdown";
import ComfirmCloseBreakdown from "./ComfirmCloseBreakdown";
import { parseToLabel } from "../../helper/parse-helper";
import useAuth from "../../contexts/authContext";
import { checkPermission } from "../../helper/permission-helper";
import { permissionCodeConstant } from "../../utils/permissionCodeConstant";
import { useTranslation } from "react-i18next";

export default function RepairContractByBreakdownDetails() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <div style={{ background: "#f8f8f8" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          background: "#23457b",
          color: "#fff",
          padding: "0 16px",
          height: 90,
        }}
      >
        <ArrowLeftOutlined
          style={{ fontSize: 20, cursor: "pointer", marginRight: 16 }}
          onClick={() => navigate(-1)}
        />
        <div
          style={{
            width: 1,
            height: 70,
            backgroundColor: "#fff",
            marginRight: 16,
            opacity: 0.5,
          }}
        />
      </div>
    </div>
  );
}
