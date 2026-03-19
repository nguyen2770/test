import { Card, Col, Divider, Image, Row } from "antd";
import { parseToLabel } from "../../helper/parse-helper";
import { parseDatetime } from "../../helper/date-helper";
import * as _unitOfWork from "../../api";
import { useTranslation } from "react-i18next";
import { schedulePreventiveTaskRequestSparePartStatus } from "../../utils/constant";

const CardSparePartRequetsSchedulePreventive = ({
  sparePartRequestSchedulePreventive,
}) => {
  const { t } = useTranslation();

  return (
    <Card
      className="ticket-card"
      bodyStyle={{ padding: 10 }}
      style={{ margin: 5 }}
    >
      <Row align="middle">
        <Col span={24} style={{ textAlign: "end" }}>
          <span className="ticket-status" style={{ color: "#1677ff" }}>
            {t(
              parseToLabel(
                schedulePreventiveTaskRequestSparePartStatus.Options,
                sparePartRequestSchedulePreventive?.requestStatus
              )
            )}
          </span>
        </Col>
      </Row>

      <Row align="middle">
        <Col span={24}>
          <Row gutter={32}>
            <Col span={24}>
              <b className="ticket-title ellipsis">
                {sparePartRequestSchedulePreventive?.preventive?.preventiveName}
              </b>
            </Col>
            <Col span={24}>
              <span className="ellipsis">
                {t("spare_part.part_number")} {" : "}
                {sparePartRequestSchedulePreventive?.code}
              </span>
            </Col>
            <Col span={24}>
              <span className="ellipsis">
                {t("spare_part.maintenance_code")}{" : "}
                {sparePartRequestSchedulePreventive?.schedulePreventive?.code}
              </span>
            </Col>
            <Col span={24}>
              <span>
                {
                  sparePartRequestSchedulePreventive?.schedulePreventive
                    ?.assetMaintenance?.assetModel?.asset?.assetName
                }{" "}
                |{" "}
                {
                  sparePartRequestSchedulePreventive?.schedulePreventive
                    ?.assetMaintenance?.assetModel?.assetModelName
                }{" "}
                |{" "}
                {sparePartRequestSchedulePreventive?.schedulePreventive
                  ?.assetMaintenance?.serial ||
                  sparePartRequestSchedulePreventive?.schedulePreventive
                    ?.assetMaintenance?.assetNumber}
              </span>
            </Col>
          </Row>
        </Col>
      </Row>

      <Divider style={{ margin: "8px 0" }} />

      <Row>
        <Col span={12}>
          <div>
            {t("schedulePreventive.card.user_label")}{" "}
            {
              sparePartRequestSchedulePreventive?.schedulePreventive
                ?.assetMaintenance?.customer?.customerName
            }{" "}
          </div>
          <div>
            {t("schedulePreventive.card.location_label")}{" "}
            {
              sparePartRequestSchedulePreventive?.schedulePreventive
                ?.assetMaintenance?.addressNote
            }
          </div>
        </Col>
        <Col span={12} style={{ textAlign: "end" }}>
          <div>
            {t("schedulePreventive.card.open_date_label")}{" "}
            {parseDatetime(sparePartRequestSchedulePreventive?.createdAt)}
          </div>
          <div style={{ color: "red" }}>
            {t("schedulePreventive.card.updated_date_label")}{" "}
            {parseDatetime(sparePartRequestSchedulePreventive?.updatedAt)}
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default CardSparePartRequetsSchedulePreventive;
