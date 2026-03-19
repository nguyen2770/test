import { Card, Col, Divider, Image, Row } from "antd";
import { parseToLabel } from "../../../helper/parse-helper";
import { parseDatetime } from "../../../helper/date-helper";
import * as _unitOfWork from "../../../api";
import { useTranslation } from "react-i18next";
import { breakdownSpareRequestStatus } from "../../../utils/constant";

const CardSparePartRequets = ({
  sparePartRequestBreakdown,
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
                breakdownSpareRequestStatus.Options,
                sparePartRequestBreakdown?.requestStatus
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
                {sparePartRequestBreakdown?.preventive?.preventiveName}
              </b>
            </Col>
            <Col span={24}>
              <span className="ellipsis">
                {t("spare_part.part_number")} {" : "}{sparePartRequestBreakdown?.code}
              </span>
            </Col>
            <Col span={24}>
              <span className="ellipsis">
                {t("spare_part.incident_code")} {" : "}{sparePartRequestBreakdown?.breakdown?.code}
              </span>
            </Col>
            <Col span={24}>
              <span>
                {
                  sparePartRequestBreakdown?.breakdown?.assetMaintenance
                    ?.assetModel?.asset?.assetName
                }{" "}
                |{" "}
                {
                  sparePartRequestBreakdown?.breakdown?.assetMaintenance
                    ?.assetModel?.assetModelName
                }{" "}
                |{" "}
                {sparePartRequestBreakdown?.breakdown?.assetMaintenance
                  ?.serial ||
                  sparePartRequestBreakdown?.breakdown?.assetMaintenance
                    ?.assetNumber}
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
            {
              sparePartRequestBreakdown?.breakdown?.assetMaintenance?.customer
                ?.customerName
            }{" "}
          </div>
          <div>
            {t("schedulePreventive.card.location_label")}{" "}
            {sparePartRequestBreakdown?.breakdown?.assetMaintenance?.addressNote}
          </div>
        </Col>
        <Col span={12} style={{ textAlign: "end" }}>
          <div>
            {t("schedulePreventive.card.open_date_label")}{" "}
            {parseDatetime(sparePartRequestBreakdown?.createdAt)}
          </div>
          <div style={{ color: "red" }}>
            {t("schedulePreventive.card.updated_date_label")}{" "}
            {parseDatetime(sparePartRequestBreakdown?.updatedAt)}
          </div>
        </Col>
      </Row>
    
    </Card>
  );
};

export default CardSparePartRequets;
