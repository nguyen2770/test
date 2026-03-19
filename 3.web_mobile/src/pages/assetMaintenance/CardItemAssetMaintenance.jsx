import { Button, Card, Col, Divider, Image, Row } from "antd";
import { useNavigate } from "react-router-dom";
import { staticPath } from "../../router/RouteConfig";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import * as _unitOfWork from "../../api";
import useAuth from "../../contexts/authContext";
import { checkPermission } from "../../helper/permission-helper";
import { permissionCodeConstant } from "../../utils/permissionCodeConstant";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";

const CardItemAssetMaintenance = ({
  data,
  onClickItem,
  assetMaintenceChamge,
}) => {
  const navigate = useNavigate();
  const { permissions } = useAuth();
  const { t } = useTranslation();

  const [imgSrc, setImgSrc] = useState(null);

  useEffect(() => {
    if (data?.resource?.id) {
      setImgSrc(_unitOfWork.resource.getImage(data.resource.id));
    }
  }, [data?.resource?.id]);
  const onClickCard = () => {
    if (onClickItem) {
      onClickItem(data);
    } else {
      if (
        checkPermission(permissions, permissionCodeConstant.asset_view_detail)
      )
        navigate(`${staticPath.assetMaintenanceDetail + "/" + data.id}`);
    }
  };
  return (
    <Card
      key={data.id}
      className={
        "ticket-card " +
        (assetMaintenceChamge &&
          assetMaintenceChamge.id === data.id &&
          "card-asset-maintence-change")
      }
      bodyStyle={{ padding: 10 }}
      style={{ margin: 5 }}
      onClick={onClickCard}
    >
      <Row align="middle">
        <Col span={4}>
          <Image
            width={60}
            height={60}
            src={imgSrc}
            preview={false}
            style={{ borderRadius: "5px", background: "#eee" }}
            // fallback="https://via.placeholder.com/60"
          />
        </Col>

        <Col span={20} style={{ paddingLeft: 10 }}>
          <Row gutter={32}>
            <Col span={24}>
              <b className="ticket-title ellipsis">
                {" "}
                {data.assetName}
              </b>
            </Col>
            <Col span={24}>
              <span className="ellipsis">
                {t("assetMaintenance.card.model_label")}: {data.assetModelName}
              </span>
            </Col>
            <Col span={24}>
              <span className="ellipsis">{t("assetMaintenance.card.serial_label")}: {data.serial}</span>
            </Col>
          </Row>
        </Col>
      </Row>

      <Divider style={{ margin: "8px 0" }} />

      <Row>
        <Col span={24}>
          <div>
            {" "}
            {t("assetMaintenance.card.manufacturer_label")}: {data.manufacturerName}
          </div>
          <div>{t("assetMaintenance.card.customer_label")}: {data.customerName}</div>
        </Col>
      </Row>
    </Card>
  );
};

export default CardItemAssetMaintenance;