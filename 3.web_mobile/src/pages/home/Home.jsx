import useAuth from "../../contexts/authContext";
import { useNavigate } from "react-router-dom";
import { staticPath } from "../../router/RouteConfig";
import "./home.scss";
import {
  AccountBookOutlined,
  AuditOutlined,
  BellOutlined,
  CarryOutOutlined,
  ContactsOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import * as _unitOfWork from "../../api";
import { Avatar, Badge, Button, Col, Row, Select } from "antd";
import { useEffect, useState } from "react";
import QuickApproval from "./QuickApproval";
import { STORAGE_KEY } from "../../utils/constant";
import logo from "../../assets/images/logo-green.png";
import AssetSummary from "./AssetSummary";
import PreventiveScheduleAndBreakdownCompleteChartDrawer from "./drawer/PreventiveScheduleAndBreakdownCompleteChartDrawer";
import KeyIndicatorDrawer from "./drawer/KeyIndicatorDrawer";
import HumanResourceIndicatorsDrawer from "./drawer/HumanResourceIndicatorsDrawer";
import ComparisonDashbroardDrawer from "./drawer/ComparisonDashbroardDrawer";
import OperationalMetricsDrawer from "./drawer/OperationalMetricsDrawer";
import { checkPermission } from "../../helper/permission-helper";
import { permissionCodeConstant } from "../../utils/permissionCodeConstant";
import { useTranslation } from "react-i18next";
import ChangePasswordModal from "../../pages/auth/ChangePassword";
import UserInformation from "./UserImformation";
import { calibrationGroupStatus } from "../../utils/calibration.constant";
import { schedulePreventiveTicketStatus } from "../../utils/schedulePreventive.constant";
export default function Home() {
  const navigate = useNavigate();
  const { logout, user, branchs, branchChange } = useAuth();
  const [totalBreakdownStatues, setTotalBreakdownStatues] = useState([]);
  const [totalSchedulePreventiveStatuses, setTotalSchedulePreventiveStatuses] =
    useState([]);
  const [
    totalMyBreakdownAssignUserStatuses,
    setTotalMyBreakdownAssignUserStatuses,
  ] = useState([]);
  const [
    totalMySchedulePreventiveTaskAssignUserStatuses,
    setTotalMySchedulePreventiveTaskAssignUserStatuses,
  ] = useState([]);
  const [isOpenQuickApproval, setIsOpenQuickApproval] = useState(false);
  const [quickApprovalTotal, setQuickApprovalTotal] = useState(0);
  const [valueBranch, setValueBranch] = useState("all");
  const [
    showPreventiveAndBreakdownComplete,
    setShowPreventiveAndBreakdownComplete,
  ] = useState(false);
  const [showKeyIndicatorDrawer, setShowKeyIndicatorDrawer] = useState(false);
  const [showHumanResourceIndicators, setShowHumanResourceIndicators] =
    useState(false);
  const [showComparisonDashbroard, setShowComparisonDashbroard] =
    useState(false);
  const [showOperationalMetrics, setShowOperationalMetrics] = useState(false);
  const { permissions } = useAuth();
  const { t } = useTranslation();
  const [showChangePassModal, setShowChangePassModal] = useState(false);
  const [showUserInformation, setShowUserInformation] = useState(false);
  const [totalCalibrationWorkByGroupStatus, setTotalCalibrationWorkByGroupStatus] = useState(null);
  const [totalCalibrationWorkAssignUserByStatus, setTotalCalibrationWorkAssignUserByStatus] = useState(null);

  useEffect(() => {
    fetchGetTotalBreakdownStatuses();
    fetchGetTotalSchedulePreventiveStatuses();
    fetchGetTotalMySchedulePreventiveTaskAssignUserStatuses();
    fetchGetTotalMyBreakdownAssignUserStatuses();
    getApproveWorks();
    fetchGetTotalCalibrationWorkByGroupStatus();
    fetchGetTotalCalibrationWorkAssignUserByStatus()
  }, []);

  useEffect(() => {
    setValueBranch(branchChange);
  }, [branchChange]);
  const getApproveWorks = async () => {
    const payload = { page: 1, limit: 1 };
    const res = await _unitOfWork.report.getApproveWorks(payload);
    if (res && res.data) {
      setQuickApprovalTotal(res.data.totalResults);
    }
  };

  const fetchGetTotalBreakdownStatuses = async () => {
    let res = await _unitOfWork.breakdown.getTotalBreakdwonStatus({});
    if (res && res.code === 1) {
      setTotalBreakdownStatues(res.data);
    }
  };
  const fetchGetTotalSchedulePreventiveStatuses = async () => {
    let res =
      await _unitOfWork.schedulePreventive.getTotalSchedulePreventiveStatus();
    if (res && res.code === 1) {
      setTotalSchedulePreventiveStatuses(res.data);
    }
  };
  const fetchGetTotalMySchedulePreventiveTaskAssignUserStatuses = async () => {
    let res =
      await _unitOfWork.schedulePreventive.getTotalMySchedulePreventiveTaskAssignUserStatus();
    if (res && res.code === 1) {
      setTotalMySchedulePreventiveTaskAssignUserStatuses(res.data);
    }
  };
  const fetchGetTotalMyBreakdownAssignUserStatuses = async () => {
    let res =
      await _unitOfWork.breakdownAssignUser.getTotalMyBreakdownAssignUserStatus();
    if (res && res.code === 1) {
      setTotalMyBreakdownAssignUserStatuses(res.data);
    }
  };
  const fetchGetTotalCalibrationWorkByGroupStatus = async () => {
    let res = await _unitOfWork.calibrationWork.getTotalCalibrationWorkByGroupStatus();
    if (res && res.code === 1) {
      setTotalCalibrationWorkByGroupStatus(res?.totalCalibrationWorkByGroupStatus);
    }
  };
  const fetchGetTotalCalibrationWorkAssignUserByStatus = async () => {
    let res = await _unitOfWork.calibrationWork.getTotalCalibrationWorkAssignUserByStatus();
    if (res && res.code === 1) {
      setTotalCalibrationWorkAssignUserByStatus(res?.totalCalibrationWorkAssignUserByStatus);
    }
  };
  const goToUpdateInfo = () => {
    navigate(staticPath.updateUserInfo);
  };
  const onClickLogout = async () => {
    logout();
  };

  const onChangeBranch = (val) => {
    setValueBranch(val);
    localStorage.setItem(STORAGE_KEY.BRANCH_CHANGE, val);
    window.location.reload();
  };



  const dashboardItems = [
    {
      title: t("home.menu_preventive_breakdown_completed"),
      onClick: () => setShowPreventiveAndBreakdownComplete(true),
    },
    {
      title: t("home.menu_operational_metrics"),
      onClick: () => setShowOperationalMetrics(true),
    },
    {
      title: t("home.menu_comparison_dashboard"),
      onClick: () => setShowComparisonDashbroard(true),
    },
    {
      title: t("home.menu_key_indicators"),
      onClick: () => setShowKeyIndicatorDrawer(true),
    },
    {
      title: t("home.menu_human_resource_indicators"),
      onClick: () => setShowHumanResourceIndicators(true),
    },
    {
      title: t("home.my_calendar"),
      onClick: () => navigate(staticPath.myCalendar),
    },
    // {
    //   title: t("home.inspection_calibration_due_date"),
    //   onClick: () => navigate(staticPath.assetMaintenanceDueInspection),
    // },
  ];
  const goToUserInfo = () => {
    setShowUserInformation(true);
  };

  return (
    <div
      className="home-container"
      style={{ background: "#f8f8f8", minHeight: "100vh" }}
    >
      {/* Header */}
      <div
        style={{
          background: "#223b5b",
          color: "#fff",
          padding: "16px",
          borderBottomLeftRadius: 16,
          borderBottomRightRadius: 16,
          position: "relative",
        }}
      >
        <Row
          className="pb-2"
        >
          <Col style={{ alignSelf: "center" }}>
            <div className="title-branch">{t("home.branch_label")} </div>
          </Col>
          <Col flex="auto">
            <Select
              onChange={onChangeBranch}
              value={valueBranch}
              style={{ width: "94%", alignSelf: "center" }}
            >
              {branchs &&
                branchs.map((_branch) => {
                  return (
                    <Select.Option key={_branch.id} value={_branch.id}>
                      {_branch.name}
                    </Select.Option>
                  );
                })}
              <Select.Option value="all">
                {t("home.all_branches", "Tất cả")}
              </Select.Option>
            </Select>
          </Col>
          <Col onClick={() => setIsOpenQuickApproval(true)} className="mr-4">
            <Badge count={quickApprovalTotal} size="small" offset={[6, 0]}>
              <CheckOutlined style={{ fontSize: 28, color: "#fff" }} />
            </Badge>
          </Col>
          <Col>
            <Badge dot>
              <BellOutlined style={{ fontSize: 28, color: "#fff" }} />
            </Badge>
          </Col>
        </Row>
        <Row align="middle" className="pb-2">
          <Col>
            <Avatar
              onClick={goToUpdateInfo}
              size={64}
              src={logo}
              style={{ background: "#e5e5e5" }}
            />
          </Col>
          <Col flex="auto" style={{ marginLeft: 16 }}>
            <div
              style={{ fontWeight: 600, fontSize: 20, padding: 4 }}
              onClick={goToUserInfo}
            >
              {user?.fullName}
            </div>
            <div style={{ fontSize: 15, color: "#e0e0e0", display: "flex" }}>
              <div
                className="mr-2"
                onClick={() => setShowChangePassModal(true)}
              >
                {t("home.change_password")}
              </div>
              <div id="bt-logout" className="bt-logout" onClick={onClickLogout}>
                {t("home.logout")}
              </div>
            </div>
          </Col>
        </Row>
      </div>
      {checkPermission(
        permissions,
        permissionCodeConstant.schedule_preventive_view_list
      ) && (
          <div
            style={{
              margin: "16px 12px 0 12px",
              background: "#fff",
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "15px",
                fontWeight: 600,
                fontSize: "18px",
              }}
            >
              <AuditOutlined className="mr-2 ml-2" />
              {t("home.preventive_section")}
            </div>
            <Row className="preventive-card">
              <Col
                onClick={() =>
                  navigate(`${staticPath.schedulePreventive}?ticketStatus=new`)
                }
                span={6}
                style={{ textAlign: "center", padding: 12 }}
              >
                <div style={{ fontSize: 18, fontWeight: 600, color: "#fff" }}>
                  {totalSchedulePreventiveStatuses
                    ? totalSchedulePreventiveStatuses?.totalSchedulePreventiveTicketStatusNews
                    : 0}
                </div>
                <div style={{ color: "#fff" }}>{t("home.new")}</div>
              </Col>
              <Col
                onClick={() =>
                  navigate(
                    `${staticPath.schedulePreventive}?ticketStatus=inProgress`
                  )
                }
                span={6}
                style={{
                  textAlign: "center",
                  padding: 12,
                  borderLeft: "1px solid #fff",
                }}
              >
                <div style={{ fontSize: 18, fontWeight: 600, color: "#fff" }}>
                  {totalSchedulePreventiveStatuses
                    ? totalSchedulePreventiveStatuses?.totalSchedulePreventiveTicketStatusInProgress
                    : 0}
                </div>
                <div style={{ color: "#fff" }}>{t("home.in_progress")}</div>
              </Col>
              <Col
                onClick={() =>
                  navigate(
                    `${staticPath.schedulePreventive}?ticketStatus=overdue`
                  )
                }
                span={6}
                style={{
                  textAlign: "center",
                  padding: 12,
                  borderLeft: "1px solid #fff",
                }}
              >
                <div style={{ fontSize: 18, fontWeight: 600, color: "#fff" }}>
                  {totalSchedulePreventiveStatuses
                    ? totalSchedulePreventiveStatuses?.totalSchedulePreventiveStatusOverdues
                    : 0}
                </div>
                <div style={{ color: "#fff" }}>{t("home.overdue")}</div>
              </Col>
              <Col
                onClick={() =>
                  navigate(
                    `${staticPath.schedulePreventive}?ticketStatus=completed`
                  )
                }
                span={6}
                style={{
                  textAlign: "center",
                  padding: 12,
                  borderLeft: "1px solid #fff",
                }}
              >
                <div style={{ fontSize: 18, fontWeight: 600, color: "#fff" }}>
                  {totalSchedulePreventiveStatuses
                    ? totalSchedulePreventiveStatuses?.totalSchedulePreventiveTicketStatusUpcomings
                    : 0}
                </div>
                <div style={{ color: "#fff" }}>{t("home.upcoming")}</div>
              </Col>
            </Row>
          </div>
        )}
      {checkPermission(
        permissions,
        permissionCodeConstant.breakdown_view_list
      ) && (
          <div
            style={{
              margin: "16px 12px 0 12px",
              background: "#fff",
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "15px",
                fontWeight: 600,
                fontSize: "18px",
              }}
            >
              <AccountBookOutlined className="mr-2 ml-2" />
              {t("home.breakdown_section")}
            </div>
            <Row className="breakdown-card">
              <Col
                span={6}
                style={{ textAlign: "center", padding: 12 }}
                onClick={() =>
                  navigate(`${staticPath.myBreakdown}?ticketStatus=new`)
                }
              >
                <div style={{ fontSize: 18, fontWeight: 600, color: "#fff" }}>
                  {totalBreakdownStatues?.totalBreakdownTicketStatusNews || 0}
                </div>
                <div style={{ color: "#fff" }}>{t("home.new")}</div>
              </Col>
              <Col
                span={6}
                style={{
                  textAlign: "center",
                  padding: 12,
                  borderLeft: "1px solid #fff",
                }}
                onClick={() =>
                  navigate(`${staticPath.myBreakdown}?ticketStatus=inProgress`)
                }
              >
                <div style={{ fontSize: 18, fontWeight: 600, color: "#fff" }}>
                  {totalBreakdownStatues?.totalBreakdownTicketStatusInProgress ||
                    0}
                </div>
                <div style={{ color: "#fff" }}>{t("home.in_progress")}</div>
              </Col>
              <Col
                span={6}
                style={{
                  textAlign: "center",
                  padding: 12,
                  borderLeft: "1px solid #fff",
                }}
                onClick={() =>
                  navigate(`${staticPath.myBreakdown}?ticketStatus=overdue`)
                }
              >
                <div style={{ fontSize: 18, fontWeight: 600, color: "#fff" }}>
                  {totalBreakdownStatues?.totalBreakdownStatusOverdues || 0}
                </div>
                <div style={{ color: "#fff" }}>{t("home.overdue")}</div>
              </Col>
              <Col
                span={6}
                style={{
                  textAlign: "center",
                  padding: 12,
                  borderLeft: "1px solid #fff",
                }}
                onClick={() =>
                  navigate(`${staticPath.myBreakdown}?ticketStatus=completed`)
                }
              >
                <div style={{ fontSize: 18, fontWeight: 600, color: "#fff" }}>
                  {totalBreakdownStatues?.totalBreakdownTicketStatusCompleteds ||
                    0}
                </div>
                <div style={{ color: "#fff" }}>{t("home.completed")}</div>
              </Col>
            </Row>
          </div>
        )}
      {checkPermission(
        permissions,
        permissionCodeConstant.schedule_preventive_my_task_view_list
      ) && (
          <div
            style={{
              margin: "16px 12px 0 12px",
              background: "#fff",
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "15px",
                fontWeight: 600,
                fontSize: "18px",
              }}
            >
              <AccountBookOutlined className="mr-2 ml-2" />
              {t("home.my_tasks_section")}
            </div>
            <Row className="my-task-card">
              <Col span={8} style={{ textAlign: "center", padding: 12 }} onClick={() =>
                navigate(`${staticPath.priventive}?ticketStatus=${schedulePreventiveTicketStatus.new}`)
              }>
                <div style={{ fontSize: 18, fontWeight: 600, color: "#fff" }}>
                  {totalMySchedulePreventiveTaskAssignUserStatuses
                    ? totalMySchedulePreventiveTaskAssignUserStatuses?.totalSchedulePreventiveTaskAssignUserStatusNews
                    : 0}
                </div>
                <div style={{ color: "#fff" }}>{t("home.new")}</div>
              </Col>
              <Col
                span={8}
                style={{
                  textAlign: "center",
                  padding: 12,
                  borderLeft: "1px solid #fff",
                }}
                onClick={() =>
                  navigate(`${staticPath.priventive}?ticketStatus=${schedulePreventiveTicketStatus.inProgress}`)
                }
              >
                <div style={{ fontSize: 18, fontWeight: 600, color: "#fff" }}>
                  {totalMySchedulePreventiveTaskAssignUserStatuses
                    ? totalMySchedulePreventiveTaskAssignUserStatuses?.totalSchedulePreventiveTaskAssignUserStatusInProgress
                    : 0}
                </div>
                <div style={{ color: "#fff" }}>{t("home.in_progress")}</div>
              </Col>
              <Col
                span={8}
                style={{
                  textAlign: "center",
                  padding: 12,
                  borderLeft: "1px solid #fff",
                }}
                onClick={() =>
                  navigate(`${staticPath.priventive}?ticketStatus=${schedulePreventiveTicketStatus.overdue}`)
                }
              >
                <div style={{ fontSize: 18, fontWeight: 600, color: "#fff" }}>
                  {totalMySchedulePreventiveTaskAssignUserStatuses
                    ? totalMySchedulePreventiveTaskAssignUserStatuses?.totalSchedulePreventiveTaskAssignUserStatusOverdues
                    : 0}
                </div>
                <div style={{ color: "#fff" }}>{t("home.overdue")}</div>
              </Col>
            </Row>
          </div>
        )}
      {checkPermission(
        permissions,
        permissionCodeConstant.ticket_view_list
      ) && (
          <div
            style={{
              margin: "16px 12px 0 12px",
              background: "#fff",
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "15px",
                fontWeight: 600,
                fontSize: "18px",
              }}
            >
              <ContactsOutlined className="mr-2 ml-2" />
              {t("home.my_tickets_section")}
            </div>
            <Row className="my-breakdown-card">
              <Col
                span={8}
                style={{ textAlign: "center", padding: 12 }}
                onClick={() =>
                  navigate(`${staticPath.myBreakdown}?myTicketStatus=new`)
                }
              >
                <div style={{ fontSize: 18, fontWeight: 600, color: "#fff" }}>
                  {totalMyBreakdownAssignUserStatuses
                    ? totalMyBreakdownAssignUserStatuses?.totalMyBreakdownAssignUserStatusNews
                    : 0}
                </div>
                <div style={{ color: "#fff" }}>{t("home.new")}</div>
              </Col>
              <Col
                span={8}
                style={{
                  textAlign: "center",
                  padding: 12,
                  borderLeft: "1px solid #fff",
                }}
                onClick={() =>
                  navigate(`${staticPath.myBreakdown}?myTicketStatus=inProgress`)
                }
              >
                <div style={{ fontSize: 18, fontWeight: 600, color: "#fff" }}>
                  {totalMyBreakdownAssignUserStatuses
                    ? totalMyBreakdownAssignUserStatuses?.totalMyBreakdownAssignUserStatusInProgress
                    : 0}
                </div>
                <div style={{ color: "#fff" }}>{t("home.in_progress")}</div>
              </Col>
              <Col
                span={8}
                style={{
                  textAlign: "center",
                  padding: 12,
                  borderLeft: "1px solid #fff",
                }}
                onClick={() =>
                  navigate(`${staticPath.myBreakdown}?myTicketStatus=overdue`)
                }
              >
                <div style={{ fontSize: 18, fontWeight: 600, color: "#fff" }}>
                  {totalMyBreakdownAssignUserStatuses
                    ? totalMyBreakdownAssignUserStatuses?.totalMyBreakdownAssignUserStatusOverdues
                    : 0}
                </div>
                <div style={{ color: "#fff" }}>{t("home.overdue")}</div>
              </Col>
            </Row>
          </div>
        )}
      <div
        style={{
          margin: "16px 12px 0 12px",
          background: "#fff",
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "15px",
            fontWeight: 600,
            fontSize: "18px",
          }}
        >
          <AccountBookOutlined className="mr-2 ml-2" />
          {t("home.calibration_work")}
        </div>
        <Row className="breakdown-card">
          <Col
            span={6}
            style={{ textAlign: "center", padding: 12 }}
            onClick={() =>
              navigate(`${staticPath.calibrationWork}?groupStatus=${calibrationGroupStatus.new}`)
            }
          >
            <div style={{ fontSize: 18, fontWeight: 600, color: "#fff" }}>
              {totalCalibrationWorkByGroupStatus?.totalCalibrationWorkByNews || 0}
            </div>
            <div style={{ color: "#fff" }}>{t("home.new")}</div>
          </Col>
          <Col
            span={6}
            style={{
              textAlign: "center",
              padding: 12,
              borderLeft: "1px solid #fff",
            }}
            onClick={() =>
              navigate(`${staticPath.calibrationWork}?groupStatus=${calibrationGroupStatus.inProgress}`)
            }
          >
            <div style={{ fontSize: 18, fontWeight: 600, color: "#fff" }}>
              {totalCalibrationWorkByGroupStatus?.totalCalibrationWorkByinProgress ||
                0}
            </div>
            <div style={{ color: "#fff" }}>{t("home.in_progress")}</div>
          </Col>
          <Col
            span={6}
            style={{
              textAlign: "center",
              padding: 12,
              borderLeft: "1px solid #fff",
            }}
            onClick={() =>
              navigate(`${staticPath.calibrationWork}?groupStatus=${calibrationGroupStatus.overdue}`)
            }
          >
            <div style={{ fontSize: 18, fontWeight: 600, color: "#fff" }}>
              {totalCalibrationWorkByGroupStatus?.totalCalibrationWorkByOverdues || 0}
            </div>
            <div style={{ color: "#fff" }}>{t("home.overdue")}</div>
          </Col>
          <Col
            span={6}
            style={{
              textAlign: "center",
              padding: 12,
              borderLeft: "1px solid #fff",
            }}
            onClick={() =>
              navigate(`${staticPath.calibrationWork}?groupStatus=${calibrationGroupStatus.upcoming}`)
            }
          >
            <div style={{ fontSize: 18, fontWeight: 600, color: "#fff" }}>
              {totalCalibrationWorkByGroupStatus?.totalCalibrationWorkByUpcomings ||
                0}
            </div>
            <div style={{ color: "#fff" }}>{t("home.upcoming")}</div>
          </Col>
        </Row>
      </div>
      <div
        style={{
          margin: "16px 12px 0 12px",
          background: "#fff",
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "15px",
            fontWeight: 600,
            fontSize: "18px",
          }}
        >
          <ContactsOutlined className="mr-2 ml-2" />
          {t("home.my_calibration_work")}
        </div>
        <Row className="my-breakdown-card">
          <Col
            span={8}
            style={{ textAlign: "center", padding: 12 }}
            onClick={() =>
              navigate(`${staticPath.myCalibrationWork}?groupStatus=${calibrationGroupStatus.new}`)
            }
          >
            <div style={{ fontSize: 18, fontWeight: 600, color: "#fff" }}>
              {totalCalibrationWorkAssignUserByStatus ? totalCalibrationWorkAssignUserByStatus?.totalCalibrationWorkAssignUserByNews
                : 0}
            </div>
            <div style={{ color: "#fff" }}>{t("home.new")}</div>
          </Col>
          <Col
            span={8}
            style={{
              textAlign: "center",
              padding: 12,
              borderLeft: "1px solid #fff",
            }}
            onClick={() =>
              navigate(`${staticPath.myCalibrationWork}?groupStatus=${calibrationGroupStatus.inProgress}`)
            }
          >
            <div style={{ fontSize: 18, fontWeight: 600, color: "#fff" }}>
              {totalCalibrationWorkAssignUserByStatus?.totalCalibrationWorkAssignUserByinProgress || 0}
            </div>
            <div style={{ color: "#fff" }}>{t("home.in_progress")}</div>
          </Col>
          <Col
            span={8}
            style={{
              textAlign: "center",
              padding: 12,
              borderLeft: "1px solid #fff",
            }}
            onClick={() =>
              navigate(`${staticPath.myCalibrationWork}?groupStatus=${calibrationGroupStatus.overdue}`)
            }
          >
            <div style={{ fontSize: 18, fontWeight: 600, color: "#fff" }}>
              {totalCalibrationWorkAssignUserByStatus?.totalCalibrationWorkAssignUserByOverdues || 0}
            </div>
            <div style={{ color: "#fff" }}>{t("home.overdue")}</div>
          </Col>
        </Row>
      </div>
      <div
        style={{
          margin: "16px 12px 0 12px",
          background: "#fff",
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "15px",
            fontWeight: 600,
            fontSize: "18px",
          }}
        >
          <AuditOutlined className="mr-2 ml-2" />
          {t("home.asset_status_section")}
        </div>
        <AssetSummary />
      </div>
      {/* Danh sách menu */}
      <div
        style={{
          margin: "16px 0 16px 0",
          background: "#fff",
          borderRadius: 10,
          padding: "0 12px",
        }}
      >
        {dashboardItems.map((item, idx) => (
          <div
            key={item.title}
            style={{
              padding: "16px 0",
              borderBottom: idx !== 5 ? "1px solid #eee" : "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: 16,
              cursor: "pointer",
            }}
            onClick={item.onClick}
          >
            <span>{item.title}</span>
            <span style={{ color: "#bbb", fontSize: 20 }}>{">"}</span>
          </div>
        ))}
      </div>
      <QuickApproval
        open={isOpenQuickApproval}
        onClose={() => setIsOpenQuickApproval(false)}
        onTotalChange={setQuickApprovalTotal}
      />
      <PreventiveScheduleAndBreakdownCompleteChartDrawer
        open={showPreventiveAndBreakdownComplete}
        onClose={() => setShowPreventiveAndBreakdownComplete(false)}
      />
      <KeyIndicatorDrawer
        open={showKeyIndicatorDrawer}
        onClose={() => setShowKeyIndicatorDrawer(false)}
      />
      <HumanResourceIndicatorsDrawer
        open={showHumanResourceIndicators}
        onClose={() => setShowHumanResourceIndicators(false)}
      />
      <ComparisonDashbroardDrawer
        open={showComparisonDashbroard}
        onClose={() => setShowComparisonDashbroard(false)}
      />
      <OperationalMetricsDrawer
        open={showOperationalMetrics}
        onClose={() => setShowOperationalMetrics(false)}
      />
      <ChangePasswordModal
        open={showChangePassModal}
        onCancel={() => setShowChangePassModal(false)}
        onCallback={logout}
      />
      <UserInformation
        open={showUserInformation}
        onClose={() => setShowUserInformation(false)}
      />
    </div>
  );
}
