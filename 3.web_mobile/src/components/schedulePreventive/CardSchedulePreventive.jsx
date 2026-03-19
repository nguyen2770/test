import {
  CheckOutlined,
  CloseOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { Card, Col, Divider, Image, Row } from "antd";
import { staticPath } from "../../router/RouteConfig";
import { useNavigate } from "react-router-dom";
import { parseToLabel } from "../../helper/parse-helper";
import { schedulePreventiveStatus } from "../../utils/schedulePreventive.constant";
import { parseDatetime } from "../../helper/date-helper";
import * as _unitOfWork from "../../api";
import useAuth from "../../contexts/authContext";
import { checkPermission } from "../../helper/permission-helper";
import { permissionCodeConstant } from "../../utils/permissionCodeConstant";
import { useTranslation } from "react-i18next";

const CardSchedulePreventive = ({ schedulePreventive }) => {
  const navigate = useNavigate();
  const { permissions } = useAuth();
  const { t } = useTranslation();

  const onClickSchedulePreventiveDetail = () => {
    if (
      checkPermission(
        permissions,
        permissionCodeConstant.schedule_preventive_view_detail
      )
    )
      navigate(
        `${staticPath.schedulePreventiveDetail + "/" + schedulePreventive._id}`
      );
  };

  return (
    <Card
      className="ticket-card"
      bodyStyle={{ padding: 10 }}
      style={{ margin: 5 }}
      onClick={onClickSchedulePreventiveDetail}
    >
      {/* Trạng thái ticket */}
      <Row align="middle">
        <Col span={24} style={{ textAlign: "end" }}>
          <span className="ticket-status" style={{ color: "#1677ff" }}>
            {t(parseToLabel(
              schedulePreventiveStatus.Options,
              schedulePreventive?.status
            ))}
          </span>
        </Col>
      </Row>

      {/* Thông tin thiết bị */}
      <Row align="middle">
        <Col span={4}>
          <Image
            width={60}
            height={60}
            src={_unitOfWork.resource.getImage(
              schedulePreventive?.assetMaintenance?.resource
            )}
            preview={false}
            style={{ borderRadius: "5px", background: "#eee" }}
          />
        </Col>
        <Col span={20} style={{ paddingLeft: 10 }}>
          <Row gutter={32}>
            <Col span={24}>
              <b className="ticket-title ellipsis">
                {schedulePreventive?.preventive?.preventiveName}
              </b>
            </Col>
            <Col span={24}>
              <span className="ellipsis">
                {t("schedulePreventive.card.schedule_id_label")} {schedulePreventive?.code}
              </span>
            </Col>
            <Col span={24}>
              <span>
                {
                  schedulePreventive?.assetMaintenance?.assetModel?.asset
                    ?.assetName
                }{" "}
                |{" "}
                {
                  schedulePreventive?.assetMaintenance?.assetModel
                    ?.assetModelName
                }{" "}
                |{" "}
                {schedulePreventive?.assetMaintenance?.serial ||
                  schedulePreventive?.assetMaintenance?.assetNumber}
              </span>
            </Col>
          </Row>
        </Col>
      </Row>

      <Divider style={{ margin: "8px 0" }} />

      {/* Thông tin khách hàng và thời gian */}
      <Row>
        <Col span={12}>
          <div>
            {t("schedulePreventive.card.user_label")}{" "}
            {schedulePreventive?.assetMaintenance?.customer?.customerName}{" "}
          </div>
          <div>
            {t("schedulePreventive.card.location_label")}{" "}
            {schedulePreventive?.assetMaintenance?.addressNote}
          </div>
        </Col>
        <Col span={12} style={{ textAlign: "end" }}>
          <div>{t("schedulePreventive.card.open_date_label")} {parseDatetime(schedulePreventive?.createdAt)}</div>
          <div style={{ color: "red" }}>
            {t("schedulePreventive.card.updated_date_label")} {parseDatetime(schedulePreventive?.updatedAt)}
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default CardSchedulePreventive;