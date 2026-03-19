import { useEffect, useState } from "react";
import {
  ArrowLeftOutlined,
  CloseOutlined,
  HistoryOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { Button, Col, Image, Row, Tooltip, Typography } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import * as _unitOfWork from "../../api";
import CardSchedulePreventiveTask from "./CardSchedulePreventiveTask";
import ConfirmCancel from "./ConfirmCancel";
import ConfirmReopen from "./ConfirmReopen";
import CardSchedulePreventiveDetailAsset from "../../components/schedulePreventive/CardSchedulePreventiveDetailAsset";
import CardSchedulePreventiveDetail from "../../components/schedulePreventive/CardSchedulePreventiveDetail";
import { schedulePreventiveStatus } from "../../utils/schedulePreventive.constant";
import { parseToLabel } from "../../helper/parse-helper";
import AssignUserSchedulePreventiveTaskDrawer from "../../components/Drawer/AssignUserSchedulePreventiveTaskDrawer";
import CloseSchedulePreventiveDrawer from "../../components/Drawer/CloseSchedulePreventiveDrawer";
import SchedulePreventiveHistoryDrawer from "../../components/Drawer/SchedulePreventiveHistoryDrawer";
import SchedulePreventiveCommentDrawer from "../../components/Drawer/SchedulePreventiveCommentDrawer";
import useAuth from "../../contexts/authContext";
import { checkPermission } from "../../helper/permission-helper";
import { permissionCodeConstant } from "../../utils/permissionCodeConstant";
import { useTranslation } from "react-i18next";
const { Text } = Typography;

const SchedulePreventiveDetail = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();
  const [showClose, setShowClose] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isConfirmCancel, setIsConfirmCancel] = useState(false);
  const [isConfirmReopen, setIsConfirmReopen] = useState(false);
  const [assetMaintenance, setAssetMaintenance] = useState(null);
  const [schedulePreventive, setSchedulePreventive] = useState(null);
  const [showAssignUser, setShowAssignUser] = useState(false);
  const [assetMaintenanceId, setAssetMaintenanceId] = useState(null);
  const [schedulePreventiveTaskChange, setSchedulePreventiveTaskChange] =
    useState(null);
  const [schedulePreventiveHistories, setSchedulePreventiveHistories] =
    useState([]);
  const [showComment, setShowComment] = useState(false);
  const { permissions } = useAuth();
  useEffect(() => {
    fetchSchedulePreventive();
  }, []);
  useEffect(() => {
    if (assetMaintenanceId) {
      fetchAssetMaintenance();
    }
  }, [assetMaintenanceId]);

  const fetchSchedulePreventive = async () => {
    let res = await _unitOfWork.schedulePreventive.getSchedulePreventiveById({
      id: params.id,
    });
    if (res && res.code === 1) {
      setSchedulePreventive(res?.data);
      setSchedulePreventiveHistories(res?.schedulePreventiveHistorys);
      setAssetMaintenanceId(res.data.assetMaintenance);
    }
  };
  const fetchAssetMaintenance = async () => {
    let res = await _unitOfWork.assetMaintenance.getAssetMaintenanceById({
      id: assetMaintenanceId,
    });
    if (res && res.code === 1) {
      setAssetMaintenance(res.data);
    }
  };
  const onCallbackConfirmCancel = () => {
    fetchSchedulePreventive();
    setIsConfirmCancel(false);
  };
  const onCloseShowAssignUser = () => {
    setShowAssignUser(false);
  };
  const onCallbackAssignUser = () => {
    fetchSchedulePreventive();
    setShowAssignUser(false);
  };
  const onClickAssignUser = (task) => {
    if (
      checkPermission(
        permissions,
        permissionCodeConstant.schedule_preventive_assign_engineer
      )
    ) {
      setSchedulePreventiveTaskChange(task);
      setShowAssignUser(true);
    }
  };
  const onClickCancelClose = () => {
    setShowClose(false);
  };
  const onCallbackConfirmClose = () => {
    setShowClose(false);
    fetchSchedulePreventive();
  };
  const onCallbackReopen = () => {
    setIsConfirmReopen(false);
    fetchSchedulePreventive();
  };
  const onClickOpenComment = () => {
    setShowComment(true);
  };
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
        <div style={{ display: "flex", alignItems: "center" }} >
          <ArrowLeftOutlined
            style={{ fontSize: 20, marginRight: 16, cursor: "pointer" }}
            onClick={() => navigate(-1)}
          />
        </div>
        <div>{t("preventiveSchedule.fields.plan_code")}: {schedulePreventive?.code}</div>
        <div style={{ display: "flex", gap: 20 }}>
          <Tooltip title={t("preventiveSchedule.history.title")}>
            <HistoryOutlined
              style={{ fontSize: 25, cursor: "pointer" }}
              onClick={() => setShowHistory(true)}
            />
          </Tooltip>
          {checkPermission(
            permissions,
            permissionCodeConstant.schedule_preventive_cancel
          ) &&
            schedulePreventive?.status !==
            schedulePreventiveStatus.completed && (
              <Tooltip title={t("preventiveSchedule.buttons.cancel")}>
                <CloseOutlined
                  style={{ fontSize: 25, cursor: "pointer" }}
                  onClick={() => {
                    setIsConfirmCancel(true);
                  }}
                />
              </Tooltip>
            )}
        </div>
      </div>

      <div style={{ background: "#23457b", color: "#fff", padding:"0px 8px" }}>
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
                  {t(parseToLabel(
                    schedulePreventiveStatus.Options,
                    schedulePreventive?.status
                  ))}
                </Text>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>

      {checkPermission(
        permissions,
        permissionCodeConstant.schedule_preventive_close_or_reopen
      ) &&
        schedulePreventive?.status ===
        schedulePreventiveStatus.waitingForAdminApproval && (
          <Row gutter={[0, 10]} justify="center" className="mt-3">
            <Col span={24} style={{ display: "flex", justifyContent: "center" }}>
              <Button
                style={{
                  backgroundColor: "#FF4D4F",
                  color: "#fff",
                  width: "66%",
                  borderRadius: 24,
                  border: "none",
                  fontWeight: "bold",
                }}
                onClick={() => setShowClose(true)}
              >
                {t("preventiveSchedule.buttons.close")}
              </Button>
            </Col>
            <Col span={24} style={{ display: "flex", justifyContent: "center" }}>
              <Button
                style={{
                  backgroundColor: "#ccc",
                  color: "#fff",
                  width: "66%",
                  borderRadius: 24,
                  border: "none",
                  fontWeight: "bold",
                }}
                onClick={() => {
                  setIsConfirmReopen(true);
                }}
              >
                {t("preventiveSchedule.buttons.reopen_all")}
              </Button>
            </Col>
          </Row>
        )}

      <div
        style={{ fontWeight: 600, fontSize: 18, margin: "24px 0 12px 20px" }}
      >
        {t("preventiveSchedule.detail.tasks_title")}
      </div>
      <div>
        {schedulePreventive?.tasks?.map((task, _idx) => (
          <CardSchedulePreventiveTask
            key={task._id || task.id}
            onClickAssignUser={() => onClickAssignUser(task)}
            task={task}
            _idx={_idx}
          />
        ))}
      </div>
      <CardSchedulePreventiveDetailAsset
        schedulePreventive={schedulePreventive}
        assetMaintenance={assetMaintenance}
      />
      {checkPermission(
        permissions,
        permissionCodeConstant.schedule_preventive_comment
      ) && (
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
              onClick={onClickOpenComment}
            />
          </div>
        )}
      <ConfirmCancel
        schedulePreventive={schedulePreventive}
        onCallback={onCallbackConfirmCancel}
        open={isConfirmCancel}
        onCancel={() => setIsConfirmCancel(false)}
      />
      <ConfirmReopen
        open={isConfirmReopen}
        onCallback={onCallbackReopen}
        schedulePreventive={schedulePreventive}
        onCancel={() => setIsConfirmReopen(false)}
      />
      <AssignUserSchedulePreventiveTaskDrawer
        task={schedulePreventiveTaskChange}
        open={showAssignUser}
        onClose={onCloseShowAssignUser}
        callbackAssignUser={onCallbackAssignUser}
      />
      <CloseSchedulePreventiveDrawer
        onCallback={onCallbackConfirmClose}
        schedulePreventive={schedulePreventive}
        open={showClose}
        onClose={onClickCancelClose}
      />
      <SchedulePreventiveHistoryDrawer
        open={showHistory}
        onClose={() => setShowHistory(false)}
        schedulePreventiveHistories={schedulePreventiveHistories}
      />
      <SchedulePreventiveCommentDrawer
        open={showComment}
        onClose={() => setShowComment(false)}
        schedulePreventive={schedulePreventive}
      />
    </div>
  );
};

export default SchedulePreventiveDetail;