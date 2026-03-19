import { useEffect, useState } from "react";
import {
  ArrowLeftOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  CloseOutlined,
  FileTextOutlined,
  FolderOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { Button, Col, Image, message, Row, Tooltip, Typography } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import * as _unitOfWork from "../../api";
import { parseToLabel } from "../../helper/parse-helper";
import SchedulePreventiveTaskItemsDrawer from "../../components/Drawer/SchedulePreventiveTaskItemsDrawer";
import { parseDatetime } from "../../helper/date-helper";
import SchedulePreventiveCommentDrawer from "../../components/Drawer/SchedulePreventiveCommentDrawer";
import useAuth from "../../contexts/authContext";
import { useTranslation } from "react-i18next";
import { staticPath } from "../../router/RouteConfig";
import { calibrationWorkAssignUserStatus } from "../../utils/calibration.constant";
import CardCalibrationWorkDetailAsset from "../calibrationWork/CardCalibrationWorkDetailAsset";
import ComfirmLogoutModal from "../../components/modal/ComfirmLogoutModal";
import CalibratedComfirm from "./CalibratedComfirm";
import CalibrationWorkCommentDrawer from "../../components/Drawer/CalibrationWorkCommentDrawer";
import { permissionCodeConstant } from "../../utils/permissionCodeConstant";
import { checkPermission } from "../../helper/permission-helper";
import ShowSuccess from "../../components/modal/result/successNotification";
import ComfirmRejectModal from "../../components/modal/ComfirmRejectModal";
const { Text } = Typography;

const MyCalibrationWorkDetail = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();
  const [taskItems, setTaskItems] = useState(false);
  const [assetMaintenance, setAssetMaintenance] = useState(null);
  const [calibrationWork, setCalibrationWork] = useState(null);
  const [calibrationWorkAssignUser, setCalibrationWorkAssignUser] =
    useState(null);
  const [showSchedulePreventiveTaskItems, setShowSchedulePreventiveTaskItems] =
    useState(false);
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);
  const [showStartWork, setShowStartWork] = useState(false);
  const [currentCheckinCheckout, setCurrentCheckinCheckout] = useState(null);
  const [lastCheckInCheckOut, setLastCheckInCheckOut] = useState(null);
  const [showComment, setShowComment] = useState(false);
  const { permissions } = useAuth();
  const [
    showRefuseSchedulePreventiveTask,
    setShowRefuseSchedulePreventiveTask,
  ] = useState(null);

  useEffect(() => {
    fetchGetCalibrationWorkAssignUserById();
    fetchCurrentCheckinCheckOut();
  }, []);
  const fetchCurrentCheckinCheckOut = async () => {
    let res =
      await _unitOfWork.calibrationWork.getCurrentCalibrationWorkCheckinCheckout();
    if (res && res.code === 1) {
      setCurrentCheckinCheckout(res.data);
    }
  };
  const fetchGetCalibrationWorkAssignUserById = async (id) => {
    let res =
      await _unitOfWork.calibrationWork.getCalibrationWorkAssignUserById(
        id || params.id
      );
    if (res && res.code === 1) {
      setCalibrationWork(res?.calibrationWorkAssignUser?.calibrationWork);
      setCalibrationWorkAssignUser(res?.calibrationWorkAssignUser);
      setAssetMaintenance(
        res?.calibrationWorkAssignUser?.calibrationWork?.assetMaintenance
      );
      // setTaskItems(res.taskItems);
      setLastCheckInCheckOut(res?.lastCheckInCheckOut);
    }
  };
  // const fetchAssetMaintenance = async (assetMaintenanceId) => {
  //   let res = await _unitOfWork.assetMaintenance.getAssetMaintenanceById({
  //     id: assetMaintenanceId,
  //   });
  //   if (res && res.code === 1) {
  //     setAssetMaintenance(res.data);
  //   }
  // };
  const onClickCancelShowItems = () => {
    setShowSchedulePreventiveTaskItems(false);
  };
  const onClickCancelStartWork = () => {
    setShowStartWork(false);
  };
  const setShowRequestSparePart = () => {
    navigate(
      staticPath.requestSparePartSchedulePreventive +
      "/" +
      calibrationWorkAssignUser?.calibrationWork?.id,
      {
        state: {
          assetModel: calibrationWork?.assetMaintenance?.assetModel?.id,
          calibrationWork: calibrationWork?.id,
        },
      }
    );
  };
  const disabledLogin = () => !!currentCheckinCheckout;
  const onClickCheckIn = async () => {
    const payload = {
      calibrationWork:
        calibrationWorkAssignUser?.calibrationWork?.id ||
        calibrationWorkAssignUser?.calibrationWork?._id,
    };
    let res = await _unitOfWork.calibrationWork.checkinCalibrationWork(payload);
    if (res && res.code === 1) {
      message.success(t("preventive.checkin.messages.success"));
      onRefeshData();
    }
  };
  const onRefeshData = () => {
    fetchGetCalibrationWorkAssignUserById();
    fetchCurrentCheckinCheckOut();
  };
  const showWork = () => {
    const statusNoWorks = [
      calibrationWorkAssignUserStatus.completed,
      calibrationWorkAssignUserStatus.cancelled,
      calibrationWorkAssignUserStatus.partiallyCompleted,
    ];
    if (statusNoWorks.includes(calibrationWorkAssignUser?.status)) return false;
    if (!currentCheckinCheckout) return true;
    if (
      currentCheckinCheckout.calibrationWork.id ===
      calibrationWorkAssignUser?.calibrationWork.id
    ) {
      return true;
    }
    return false;
  };
  const onCallbackCheckOut = async (data) => {
    const payload = {
      calibrationWorkCheckinCheckOutId:
        currentCheckinCheckout?.id || currentCheckinCheckout?._id,
      comment: data?.comment,
    };
    let res = await _unitOfWork.calibrationWork.checkOutCalibrationWork(
      payload
    );
    if (res && res.code === 1) {
      message.success(t("preventive.checkin.messages.success"));
      onRefeshData();
    }
    setShowCheckOutModal(false);
  };
  const onCallbackStartWork = () => {
    onRefeshData();
    setShowStartWork(false);
  };
  const showButtonConfirmAndCancelAssignUser = () => {
    if (
      calibrationWorkAssignUser &&
      calibrationWorkAssignUser.status ===
      calibrationWorkAssignUserStatus.assigned
    ) {
      return true;
    } else {
      return false;
    }
  };
  const onConfirmAssignUser = async () => {
    const payload = {
      calibrationWork: calibrationWorkAssignUser.calibrationWork.id,
    };
    console.log(payload);
    let res = await _unitOfWork.calibrationWork.comfirmAcceptCalibrationWork(
      payload
    );
    if (res && res.code === 1) {
      ShowSuccess("topRight", t("Thông báo"), t("Chấp nhận thành công"));
      // refresh();
      fetchGetCalibrationWorkAssignUserById();
    }
  };
  const onCallbackRefuse = async (data) => {
    const payload = {
      calibrationWork: calibrationWorkAssignUser.calibrationWork.id,
      reasonsForRefusal: data.comment,
    };
    let res = await _unitOfWork.calibrationWork.comfirmRejectCalibrationWork(
      payload
    );
    if (res && res.code === 1) {
      ShowSuccess(
        "topRight",
        t("Thông báo"),
        t("Đã từ chối công việc thành công")
      );
      fetchGetCalibrationWorkAssignUserById();
    }
    setShowRefuseSchedulePreventiveTask(false);
    fetchGetCalibrationWorkAssignUserById();
  };
  const onViewMyCalibrationWorkDetail = () => {
    navigate(
      staticPath.myCalibrationWorkDetail +
      "/" +
      currentCheckinCheckout?.calibrationWorkAssignUser
    );
    fetchGetCalibrationWorkAssignUserById(
      currentCheckinCheckout?.calibrationWorkAssignUser
    );
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
            onClick={() => navigate(staticPath.myCalibrationWork)}
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
            <Row>
              <Col span={24}>
                <Text strong style={{ color: "#FF4D4F", fontSize: 14 }}>
                  {t(
                    parseToLabel(
                      calibrationWorkAssignUserStatus.Options,
                      calibrationWorkAssignUser?.status
                    )
                  )}
                </Text>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
      {/* Hành động */}
      {showButtonConfirmAndCancelAssignUser() && (
        <Row
          style={{
            display: "flex",
            gap: 8,
            marginTop: 12,
            padding: "0 12px",
          }}
        >
          <>
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
                  style={{
                    flex: 1,
                    height: 44,
                    borderRadius: 8,
                  }}
                  onClick={() => setShowRefuseSchedulePreventiveTask(true)}
                >
                  {t("schedulePreventive.card.reject_button")}
                </Button>
              )}
          </>
        </Row>
      )}
      {showWork() && (
        <>
          {currentCheckinCheckout && (
            <div
              style={{
                textAlign: "center",
                fontWeight: "600",
                fontSize: "18px",
                paddingTop: "20px",
                background: "#fff"
              }}
            >
              <span>
                {t("preventive.checkin.logged_in_at")}{" "}
                {parseDatetime(currentCheckinCheckout?.checkInDateTime)}
              </span>
            </div>
          )}
          {lastCheckInCheckOut &&
            lastCheckInCheckOut.checkOutDateTime &&
            !disabledLogin() && (
              <div
                style={{
                  textAlign: "center",
                  fontWeight: "600",
                  fontSize: "18px",
                  paddingTop: "20px",
                }}
              >
                <span>
                  {t("preventive.checkout.comment_label")}{" "}
                  {lastCheckInCheckOut?.comment}
                </span>
              </div>
            )}
          {calibrationWorkAssignUser?.status !==
            calibrationWorkAssignUserStatus.pendingApproval &&
            calibrationWorkAssignUserStatus.replacement &&
            calibrationWorkAssignUser?.status !==
            calibrationWorkAssignUserStatus.assigned && (
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
                    setShowCheckOutModal(calibrationWork);
                  }}
                >
                  {t("breakdown.workSession.logout")}
                </button>
              </div>
            )}

          {(disabledLogin() ||
            calibrationWorkAssignUser?.status ===
            calibrationWorkAssignUserStatus.pendingApproval) && (
              <div
                className="text-center"
                style={{ background: "#fff", padding: "10px 0px" }}
              >
                {disabledLogin() && (
                  <Button
                    onClick={() => setShowStartWork(true)}
                    type="primary"
                    title={t("preventive.startSchedule.tooltip")}
                  >
                    {t("Báo cáo hiệu chuẩn")}
                  </Button>
                )}
              </div>
            )}
        </>
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
              style={{ color: "#2fb8eeff" }}
              onClick={() => onViewMyCalibrationWorkDetail()}
            >
              {currentCheckinCheckout?.calibrationWork?.code}
            </span>
          </div>
        </>
      )}
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
      <CalibratedComfirm
        onCallback={onCallbackStartWork}
        open={showStartWork}
        calibrationWorkAssignUser={calibrationWorkAssignUser}
        handleCancel={onClickCancelStartWork}
      />
      <SchedulePreventiveTaskItemsDrawer
        open={showSchedulePreventiveTaskItems}
        taskItems={taskItems}
        schedulePreventiveTask={calibrationWorkAssignUser?.calibrationWork}
        handleCancel={onClickCancelShowItems}
      />
      <ComfirmLogoutModal
        open={showCheckOutModal}
        onCancel={() => setShowCheckOutModal(false)}
        onCallback={onCallbackCheckOut}
      />
      <CalibrationWorkCommentDrawer
        open={showComment}
        onClose={() => setShowComment(false)}
        calibrationWork={calibrationWork}
      />
      <ComfirmRejectModal
        open={showRefuseSchedulePreventiveTask}
        onCallback={onCallbackRefuse}
        onCancel={() => setShowRefuseSchedulePreventiveTask(false)}
      />
    </div>
  );
};

export default MyCalibrationWorkDetail;
