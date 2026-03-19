import { useEffect, useState } from "react";
import {
  ArrowLeftOutlined,
  CheckOutlined,
  CloseOutlined,
  FileTextOutlined,
  FolderOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { Button, Col, Image, message, Row, Tooltip, Typography } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import * as _unitOfWork from "../../api";
import CardSchedulePreventiveDetailAsset from "../../components/schedulePreventive/CardSchedulePreventiveDetailAsset";
import { schedulePreventiveTaskAssignUserStatus } from "../../utils/schedulePreventive.constant";
import { parseToLabel } from "../../helper/parse-helper";
import SchedulePreventiveTaskItemsDrawer from "../../components/Drawer/SchedulePreventiveTaskItemsDrawer";
import { parseDatetime } from "../../helper/date-helper";
import CheckOutSchedulePreventTaskModal from "./CheckOutSchedulePreventTaskModal";
import StartSchedulePreventiveTaskAssignUserDrawer from "../../components/Drawer/StartSchedulePreventiveTaskAssignUserDrawer";
import SchedulePreventiveCommentDrawer from "../../components/Drawer/SchedulePreventiveCommentDrawer";
import useAuth from "../../contexts/authContext";
import { useTranslation } from "react-i18next";
import { staticPath } from "../../router/RouteConfig";
import { permissionCodeConstant } from "../../utils/permissionCodeConstant";
import { checkPermission } from "../../helper/permission-helper";
import ShowSuccess from "../../components/modal/result/successNotification";
import AssignUserRefuseSchedulePreventiveTask from "./AssignUserRefuseSchedulePreventiveTask";
const { Text } = Typography;

const SchedulePreventiveTaskAssignUserDetail = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();
  const [taskItems, setTaskItems] = useState(false);
  const [assetMaintenance, setAssetMaintenance] = useState(null);
  const [schedulePreventive, setSchedulePreventive] = useState(null);
  const [
    schedulePreventiveTaskAssignUser,
    setSchedulePreventiveTaskAssignUser,
  ] = useState(null);
  const [showSchedulePreventiveTaskItems, setShowSchedulePreventiveTaskItems] =
    useState(false);
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);
  const [showStartWork, setShowStartWork] = useState(false);
  const [currentCheckinCheckout, setCurrentCheckinCheckout] = useState(null);
  const [lastCheckInCheckOut, setLastCheckInCheckOut] = useState(null);
  const [showComment, setShowComment] = useState(false);
  const { permissions } = useAuth();
  const [schedulePreventiveTask, setSchedulePreventiveTask] = useState(null);
  const [
    showRefuseSchedulePreventiveTask,
    setShowRefuseSchedulePreventiveTask,
  ] = useState(null);
  const [
    lastSchedulePreventiveAsssignUser,
    setLastSchedulePreventiveAsssignUser,
  ] = useState(null);

  useEffect(() => {
    fetchGetSchedulePreventiveTaskAssignUserById();
    fetchCurrentCheckinCheckOut();
  }, []);
  const fetchCurrentCheckinCheckOut = async () => {
    let res = await _unitOfWork.schedulePreventive.getCurrentCheckinCheckout();
    if (res && res.code === 1) {
      setCurrentCheckinCheckout(res.data);
      setLastSchedulePreventiveAsssignUser(
        res?.schedulePreventiveTaskAssignUser
      );
    }
  };
  const fetchGetSchedulePreventiveTaskAssignUserById = async (id) => {
    let res =
      await _unitOfWork.schedulePreventive.getSchedulePreventiveTaskAssignUserById(
        {
          id: id || params.id,
        }
      );
    if (res && res.code === 1) {
      setSchedulePreventive(res?.data?.schedulePreventive);
      setSchedulePreventiveTask(res?.data?.schedulePreventiveTask);
      setSchedulePreventiveTaskAssignUser(res.data);
      fetchAssetMaintenance(res.data?.schedulePreventive?.assetMaintenance.id);
      setTaskItems(res?.taskItems);
      setLastCheckInCheckOut(res?.lastCheckInCheckOut);
    }
  };
  const fetchAssetMaintenance = async (assetMaintenanceId) => {
    let res = await _unitOfWork.assetMaintenance.getAssetMaintenanceById({
      id: assetMaintenanceId,
    });
    if (res && res.code === 1) {
      setAssetMaintenance(res.data);
    }
  };
  const onClickCancelShowItems = () => {
    setShowSchedulePreventiveTaskItems(false);
  };
  const onClickCancelStartWork = () => {
    setShowStartWork(false);
  };
  const onViewSchedulePreventiveTaskAssugnUser = () => {
    if (!lastSchedulePreventiveAsssignUser?.id) {
      return;
    }
    navigate(
      staticPath.scheulePreventiveTaskAssignUserDetail +
      "/" +
      lastSchedulePreventiveAsssignUser.id
    );
    fetchGetSchedulePreventiveTaskAssignUserById(
      lastSchedulePreventiveAsssignUser.id
    );
  };
  const setShowRequestSparePart = () => {
    navigate(
      staticPath.requestSparePartSchedulePreventive +
      "/" +
      schedulePreventiveTaskAssignUser?.schedulePreventiveTask?.id,
      {
        state: {
          assetModel: schedulePreventive?.assetMaintenance?.assetModel?.id,
          schedulePreventive: schedulePreventive?.id,
          assetMaintenance: schedulePreventive?.assetMaintenance?.id,
        },
      }
    );
  };
  const showButtonLogin = () => !currentCheckinCheckout;
  const disabledLogin = () => !!currentCheckinCheckout;

  const onClickCheckIn = async () => {
    const payload = {
      schedulePreventiveTaskId:
        schedulePreventiveTaskAssignUser.schedulePreventiveTask.id,
    };
    let res =
      await _unitOfWork.schedulePreventive.checkinSchedulePreventiveTask(
        payload
      );
    if (res && res.code === 1) {
      message.success(t("preventive.checkin.messages.success"));
      onRefeshData();
    }
  };
  const onRefeshData = () => {
    fetchGetSchedulePreventiveTaskAssignUserById();
    fetchCurrentCheckinCheckOut();
  };
  const showWork = () => {
    const statusNoWorks = [
      schedulePreventiveTaskAssignUserStatus.completed,
      schedulePreventiveTaskAssignUserStatus.cancelled,
      schedulePreventiveTaskAssignUserStatus.partiallyCompleted,
    ];
    if (statusNoWorks.includes(schedulePreventiveTaskAssignUser?.status))
      return false;
    if (!currentCheckinCheckout) return true;
    if (
      currentCheckinCheckout.schedulePreventiveTask.id ===
      schedulePreventiveTaskAssignUser?.schedulePreventiveTask.id
    ) {
      return true;
    }
    return false;
  };
  const onCallbackCheckOut = () => {
    onRefeshData();
    setShowCheckOutModal(false);
  };
  const onCallbackStartWork = () => {
    onRefeshData();
    setShowStartWork(false);
  };

  const showButtonConfirmAndCancelAssignUser = () => {
    if (
      schedulePreventiveTaskAssignUser &&
      schedulePreventiveTaskAssignUser.status ===
      schedulePreventiveTaskAssignUserStatus.assigned
    ) {
      return true;
    } else {
      return false;
    }
  };

  const onConfirmAssignUser = async () => {
    const payload = {
      schedulePreventiveTask:
        schedulePreventiveTaskAssignUser.schedulePreventiveTask.id,
    };
    let res = await _unitOfWork.schedulePreventive.userConfirm(payload);
    if (res && res.code === 1) {
      ShowSuccess(
        "topRight",
        t("modal.notifications.error_default_title"),
        t("schedulePreventive.card.confirm_success_message")
      );
      onRefeshData();
    }
  };

  const onCallbackRefuse = () => {
    setShowRefuseSchedulePreventiveTask(false);
    onRefeshData();
  };
  const onBack = async () => {
    navigate(staticPath.priventive);
  };

  const showRequestBtn = disabledLogin();
  const showStartBtn = disabledLogin() && schedulePreventiveTaskAssignUser?.status !== schedulePreventiveTaskAssignUserStatus.pendingApproval;
  const showBtnLoginLogout = () => {
    const invalidStatuses = [
      schedulePreventiveTaskAssignUserStatus.reassignment,
      schedulePreventiveTaskAssignUserStatus.assigned,
      schedulePreventiveTaskAssignUserStatus.replacement,
    ];

    return !invalidStatuses.includes(schedulePreventiveTaskAssignUser?.status);
  }
  return (
    <div style={{ background: "#f8f8f8" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 56,
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
            onClick={onBack}
          />
        </div>
        <div>
          {t("preventive.pdf.schedule_id")}: {schedulePreventive?.code}
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          <Tooltip title={t("preventive.detail.tooltips.view_items")}>
            <FileTextOutlined
              onClick={() => setShowSchedulePreventiveTaskItems(true)}
              style={{ fontSize: 25, cursor: "pointer" }}
            />
          </Tooltip>
          <Tooltip title={t("preventive.documents.title")}>
            <FolderOutlined style={{ fontSize: 25, cursor: "pointer" }} />
          </Tooltip>
        </div>
      </div>

      <div style={{ background: "#23457b", color: "#fff", padding: 16 }}>
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
            <Row>
              <Col span={24}>
                <Text strong style={{ color: "#FF4D4F", fontSize: 14 }}>
                  {t(
                    parseToLabel(
                      schedulePreventiveTaskAssignUserStatus.Options,
                      schedulePreventiveTaskAssignUser?.status
                    )
                  )}
                </Text>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
      {showWork() && (
        <>
          {currentCheckinCheckout && (
            <div
              style={{
                textAlign: "center",
                fontWeight: "600",
                fontSize: "18px",
                paddingTop: "20px",
                background: "#fff",
              }}
            >
              <span>
                {t("preventive.checkin.logged_in_at")}{" "}
                {parseDatetime(currentCheckinCheckout?.checkInDateTime)}
              </span>
            </div>
          )}
          {lastCheckInCheckOut && lastCheckInCheckOut.checkOutDateTime && (
            <div
              style={{
                textAlign: "center",
                fontWeight: "600",
                fontSize: "18px",
                paddingTop: "20px",
                background: "#fff",
              }}
            >
              <span>
                {t("preventive.checkout.comment_label")}{" "}
                {lastCheckInCheckOut?.comment}
              </span>
            </div>
          )}
          {
            showBtnLoginLogout() && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  background: "#fff",
                  padding: "18px 0 8px 0",
                  borderBottom: "1px solid #eeeeee",
                }}
              >
                <button
                  className={
                    "check-in-button " + (disabledLogin() && "check-in-disable")
                  }
                  onClick={onClickCheckIn}
                  disabled={disabledLogin()}
                >
                  {t("breakdown.workSession.login")}
                </button>
                <button
                  className={
                    "check-out-button " +
                    (!disabledLogin() && "check-out-disable")
                  }
                  disabled={!disabledLogin()}
                  onClick={() => {
                    setShowCheckOutModal(schedulePreventive);
                  }}
                >
                  {t("breakdown.workSession.logout")}
                </button>
              </div>
            )}

          {
            (showRequestBtn || showStartBtn) &&
            <div
              className="text-center"
              style={{ background: "#fff", padding: "10px 0px" }}
            >
              {/* mở khi đã checkIn */}
              {showRequestBtn && (
                <Button
                  onClick={() => setShowRequestSparePart()}
                  type="primary"
                  className="mr-2"
                >
                  {t("preventive.startSchedule.button_request_spare_part")}
                </Button>


              )}
              {/* Mở khi đã checkIn và trạng thái khác đang chờ gửi phụ tùng */}
              {showStartBtn && (
                <Button
                  onClick={() => setShowStartWork(true)}
                  type="primary"
                  title={t("preventive.startSchedule.tooltip")}
                >
                  {t("preventive.startSchedule.button")}
                </Button>

              )
              }
            </div>
          }

        </>
      )}

      {showButtonConfirmAndCancelAssignUser() && (
        <Row
          style={{
            display: "flex",
            gap: 8,
            marginTop: 12,
            padding: "0 12px",
          }}
        >
          {checkPermission(
            permissions,
            permissionCodeConstant.schedule_preventive_my_task_accept
          ) && (
              <Button
                icon={<CheckOutlined style={{ color: "blue" }} />}
                onClick={onConfirmAssignUser}
                style={{
                  flex: 1,
                  height: 44,
                  borderRadius: 8,
                }}
              >
                {t("schedulePreventive.card.accept_button")}
              </Button>
            )}

          {checkPermission(
            permissions,
            permissionCodeConstant.schedule_preventive_my_task_rejected
          ) && (
              <Button
                icon={<CloseOutlined style={{ color: "red" }} />}
                onClick={() => setShowRefuseSchedulePreventiveTask(true)}
                style={{
                  flex: 1,
                  height: 44,
                  borderRadius: 8,
                }}
              >
                {t("schedulePreventive.card.reject_button")}
              </Button>
            )}
        </Row>
      )}

      {!showWork() && currentCheckinCheckout && (
        <>
          <div
            style={{
              textAlign: "center",
              fontWeight: "600",
              fontSize: "18px",
              paddingTop: "20px",
            }}
          >
            {t("preventive.currentWorking.on_other_task")}{" "}
            <span
              style={{ color: "#2fb8eeff", textDecoration: "underline" }}
              onClick={onViewSchedulePreventiveTaskAssugnUser}
            >
              {
                currentCheckinCheckout?.schedulePreventiveTask
                  ?.schedulePreventive?.code
              }
            </span>
          </div>
        </>
      )}
      <CardSchedulePreventiveDetailAsset
        schedulePreventive={schedulePreventive}
        assetMaintenance={assetMaintenance}
        schedulePreventiveTask={schedulePreventiveTask}
      />
      <div
        style={{
          position: "fixed",
          bottom: 75,
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
      <StartSchedulePreventiveTaskAssignUserDrawer
        onCallback={onCallbackStartWork}
        open={showStartWork}
        taskItems={taskItems}
        schedulePreventive={
          schedulePreventiveTaskAssignUser?.schedulePreventive
        }
        schedulePreventiveTask={
          schedulePreventiveTaskAssignUser?.schedulePreventiveTask
        }
        handleCancel={onClickCancelStartWork}
      />
      <SchedulePreventiveTaskItemsDrawer
        open={showSchedulePreventiveTaskItems}
        taskItems={taskItems}
        schedulePreventiveTask={
          schedulePreventiveTaskAssignUser?.schedulePreventiveTask
        }
        handleCancel={onClickCancelShowItems}
      />
      <CheckOutSchedulePreventTaskModal
        open={showCheckOutModal}
        onCancel={() => setShowCheckOutModal(false)}
        onCallback={onCallbackCheckOut}
        schedulePreventiveCheckInCheckOut={currentCheckinCheckout}
      />
      <SchedulePreventiveCommentDrawer
        open={showComment}
        onClose={() => setShowComment(false)}
        schedulePreventive={schedulePreventive}
      />
      <AssignUserRefuseSchedulePreventiveTask
        schedulePreventiveTaskAssignUser={schedulePreventiveTaskAssignUser}
        open={showRefuseSchedulePreventiveTask}
        onCallback={onCallbackRefuse}
        onCancel={() => setShowRefuseSchedulePreventiveTask(false)}
      />
    </div>
  );
};

export default SchedulePreventiveTaskAssignUserDetail;
