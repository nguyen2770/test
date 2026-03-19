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
import { calibrationWorkAssignUserStatus } from "../../utils/calibration.constant";
import ComfirmRejectModal from "../modal/ComfirmRejectModal";
import { da } from "date-fns/locale";

const CardMyCalibrationWork = ({ calibrationWorkAssignUsers, refresh, status }) => {
  const navigate = useNavigate();
  const [
    showRefuseSchedulePreventiveTask,
    setShowRefuseSchedulePreventiveTask,
  ] = useState(null);
  const { permissions } = useAuth();
  const { t } = useTranslation();

  const saveState = () => {
    localStorage.removeItem("ticketStatus");
    const data = {
      filters: status,
    };

    localStorage.setItem("ticketStatus", JSON.stringify(data));
  };

  const showButtonConfirmAndCancelAssignUser = () => {
    if (
      calibrationWorkAssignUsers &&
      calibrationWorkAssignUsers.status ===
      calibrationWorkAssignUserStatus.assigned
    ) {
      return true;
    } else {
      return false;
    }
  };
  const onConfirmAssignUser = async () => {
    const payload = {
      calibrationWork: calibrationWorkAssignUsers.calibrationWork._id,
    };
    console.log(payload);
    let res = await _unitOfWork.calibrationWork.comfirmAcceptCalibrationWork(
      payload
    );
    if (res && res.code === 1) {
      ShowSuccess("topRight", t("Thông báo"), t("Chấp nhận thành công"));
      refresh();
    }
  };
  const onCallbackRefuse = async (data) => {
    const payload = {
      calibrationWork: calibrationWorkAssignUsers.calibrationWork._id,
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
      refresh();
    }
    setShowRefuseSchedulePreventiveTask(false);
    refresh();
  };
  const onClickMySchedulePreventive = () => {
    saveState();
    navigate(
      `${staticPath.myCalibrationWorkDetail +
      "/" +
      calibrationWorkAssignUsers._id
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
            {t(
              parseToLabel(
                calibrationWorkAssignUserStatus.Options,
                calibrationWorkAssignUsers?.status
              )
            )}
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
                calibrationWorkAssignUsers?.calibrationWork?.assetMaintenance
                  ?.resource
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
                    calibrationWorkAssignUsers?.calibrationWork?.preventive
                      ?.preventiveName
                  }
                </b>
              </Col>
              <Col span={24}>
                <span className="ellipsis">
                  {t("preventive.workItems.task_name_label")}{" "}
                  {calibrationWorkAssignUsers?.calibrationWork?.calibrationName}
                </span>
              </Col>
              <Col span={24}>
                <span className="ellipsis">
                  {t("schedulePreventive.card.schedule_id_label")}{" "}
                  {calibrationWorkAssignUsers?.calibrationWork?.code}
                </span>
              </Col>
              <Col span={24}>
                <span>
                  {
                    calibrationWorkAssignUsers?.calibrationWork
                      ?.assetMaintenance?.assetModel?.asset?.assetName
                  }{" "}
                  |{" "}
                  {
                    calibrationWorkAssignUsers?.calibrationWork
                      ?.assetMaintenance?.assetModel?.assetModelName
                  }{" "}
                  |{" "}
                  {calibrationWorkAssignUsers?.calibrationWork?.assetMaintenance
                    ?.serial ||
                    calibrationWorkAssignUsers?.calibrationWork
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
                calibrationWorkAssignUsers?.calibrationWork?.assetMaintenance
                  ?.customer?.customerName
              }{" "}
            </div>
            <div className="ellipsis">
              {calibrationWorkAssignUsers?.calibrationWork
                ?.calibrationContract && (
                  <>
                    {" "}
                    {t("calibration.contract")}
                    {": "}
                    {
                      calibrationWorkAssignUsers?.calibrationWork
                        ?.calibrationContract?.contractNo
                    }
                  </>
                )}
            </div>
          </Col>
          <Col span={12} style={{ textAlign: "end" }}>
            <div>
              {t("schedulePreventive.card.open_date_label")}{" "}
              {parseDatetime(calibrationWorkAssignUsers?.createdAt)}
            </div>
            <div style={{ color: "red" }}>
              {t("schedulePreventive.card.updated_date_label")}{" "}
              {parseDatetime(calibrationWorkAssignUsers?.updatedAt)}
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
      <ComfirmRejectModal
        open={showRefuseSchedulePreventiveTask}
        onCallback={onCallbackRefuse}
        onCancel={() => setShowRefuseSchedulePreventiveTask(false)}
      />
    </Card>
  );
};

export default CardMyCalibrationWork;
