import {
  CheckOutlined,
  CloseOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { Button, Card, Col, Divider, Image, Row } from "antd";
import { staticPath } from "../../router/RouteConfig";
import { useNavigate } from "react-router-dom";
import { parseToLabel } from "../../helper/parse-helper";
import { schedulePreventiveTaskAssignUserStatus } from "../../utils/schedulePreventive.constant";
import { parseDatetime } from "../../helper/date-helper";
import * as _unitOfWork from "../../api";
import ShowSuccess from "../modal/result/successNotification";
import AssignUserRefuseSchedulePreventiveTask from "../../pages/mySchedulePreventive/AssignUserRefuseSchedulePreventiveTask";
import { useState } from "react";
import useAuth from "../../contexts/authContext";
import { checkPermission } from "../../helper/permission-helper";
import { permissionCodeConstant } from "../../utils/permissionCodeConstant";
import { useTranslation } from "react-i18next";

const CardMySchedulePreventive = ({
  schedulePreventiveTaskAssignUser,
  refresh,
}) => {
  const navigate = useNavigate();
  const [
    showRefuseSchedulePreventiveTask,
    setShowRefuseSchedulePreventiveTask,
  ] = useState(null);
  const { permissions } = useAuth();
  const { t } = useTranslation();

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
        schedulePreventiveTaskAssignUser.schedulePreventiveTask._id,
    };
    let res = await _unitOfWork.schedulePreventive.userConfirm(payload);
    if (res && res.code === 1) {
      ShowSuccess(
        "topRight",
        t("modal.notifications.error_default_title"),
        t("schedulePreventive.card.confirm_success_message")
      );
      refresh();
    }
  };
  const onCallbackRefuse = () => {
    setShowRefuseSchedulePreventiveTask(false);
    refresh();
  };

  const onClickMySchedulePreventive = () => {
    if (checkPermission(permissions, permissionCodeConstant.schedule_preventive_my_task_checkin_checkout))
    navigate(
      `${staticPath.scheulePreventiveTaskAssignUserDetail +
      "/" +
      schedulePreventiveTaskAssignUser._id
      }`
    );
  };
  return (
    <Card
      className="ticket-card"
      bodyStyle={{ padding: 10 }}
      style={{ margin: 5 }}
    >
      {/* Trạng thái ticket */}
      <Row align="middle">
        <Col span={24} style={{ textAlign: "end" }}>
          <span className="ticket-status" style={{ color: "#1677ff" }}>
            {t(parseToLabel(
              schedulePreventiveTaskAssignUserStatus.Options,
              schedulePreventiveTaskAssignUser?.status
            ))}
          </span>
        </Col>
      </Row>

      {/* Thông tin thiết bị */}
      <Row onClick={onClickMySchedulePreventive}>
        <Row align="middle">
          <Col span={4}>
            <Image
              width={60}
              height={60}
              src={_unitOfWork.resource.getImage(
                schedulePreventiveTaskAssignUser?.schedulePreventive
                  ?.assetMaintenance?.resource
              )}
              preview={false}
              style={{ borderRadius: "5px", background: "#eee" }}
            />
          </Col>
          <Col span={20} style={{ paddingLeft: 10 }}>
            <Row gutter={32}>
              <Col span={24}>
                <b className="ticket-title ellipsis">
                  {
                    schedulePreventiveTaskAssignUser?.schedulePreventive
                      ?.preventive?.preventiveName
                  }
                </b>
              </Col>
              <Col span={24}>
                <span className="ellipsis">
                  {t("schedulePreventive.card.task_name_label")}{" "}
                  {
                    schedulePreventiveTaskAssignUser?.schedulePreventiveTask
                      ?.taskName
                  }
                </span>
              </Col>
              <Col span={24}>
                <span className="ellipsis">
                  {t("schedulePreventive.card.schedule_id_label")}{" "}
                  {schedulePreventiveTaskAssignUser?.schedulePreventive?.code}
                </span>
              </Col>
              <Col span={24}>
                <span>
                  {
                    schedulePreventiveTaskAssignUser?.schedulePreventive
                      ?.assetMaintenance?.assetModel?.asset?.assetName
                  }{" "}
                  |{" "}
                  {
                    schedulePreventiveTaskAssignUser?.schedulePreventive
                      ?.assetMaintenance?.assetModel?.assetModelName
                  }{" "}
                  |{" "}
                  {schedulePreventiveTaskAssignUser?.schedulePreventive
                    ?.assetMaintenance?.serial ||
                    schedulePreventiveTaskAssignUser?.schedulePreventive
                      ?.assetMaintenance?.assetNumber}
                </span>
              </Col>
            </Row>
          </Col>
        </Row>

        <Divider style={{ margin: "8px 0" }} />

        {/* Thông tin khách hàng và thời gian */}
        <Row className="wp-100">
          <Col span={12}>
            <div>
              {t("schedulePreventive.card.user_label")}{" "}
              {
                schedulePreventiveTaskAssignUser?.schedulePreventive
                  ?.assetMaintenance?.customer?.customerName
              }{" "}
            </div>
            <div>
              {t("schedulePreventive.card.location_label")}{" "}
              {
                schedulePreventiveTaskAssignUser?.schedulePreventive
                  ?.assetMaintenance?.addressNote
              }
            </div>
          </Col>
          <Col span={12} style={{ textAlign: "end" }}>
            <div>
              {t("schedulePreventive.card.open_date_label")}{" "}
              {parseDatetime(schedulePreventiveTaskAssignUser?.createdAt)}
            </div>
            <div style={{ color: "red" }}>
              {t("schedulePreventive.card.updated_date_label")}{" "}
              {parseDatetime(schedulePreventiveTaskAssignUser?.updatedAt)}
            </div>
          </Col>
        </Row>
      </Row>
      {/* Hành động */}
      {showButtonConfirmAndCancelAssignUser() && (
        <Row
          justify="space-around"
          className="ticket-actions"
          style={{ marginTop: 12 }}
        >
          <>
            {checkPermission(
              permissions,
              permissionCodeConstant.schedule_preventive_my_task_accept
            ) && (
                <Button
                  icon={<CheckOutlined style={{ color: "blue" }} />}
                  onClick={onConfirmAssignUser}
                  className="btn-breakdown"
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
                  className="btn-breakdown"
                  onClick={() => setShowRefuseSchedulePreventiveTask(true)}
                >
                  {t("schedulePreventive.card.reject_button")}
                </Button>
              )}
          </>
        </Row>
      )}
      <AssignUserRefuseSchedulePreventiveTask
        schedulePreventiveTaskAssignUser={schedulePreventiveTaskAssignUser}
        open={showRefuseSchedulePreventiveTask}
        onCallback={onCallbackRefuse}
        onCancel={() => setShowRefuseSchedulePreventiveTask(false)}
      />
    </Card>
  );
};

export default CardMySchedulePreventive;