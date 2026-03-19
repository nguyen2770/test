import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Col, Image, Row, Typography, Tabs } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import * as _unitOfWork from "../../api";
import { parseToLabel } from "../../helper/parse-helper";
import { assetType } from "../../utils/constant";
import { parseDatetime } from "../../helper/date-helper";
import CardSparePart from "./CardSparePart";
import AssetModelDocument from "./AssetModelDocument";
import { staticPath } from "../../router/RouteConfig";
import { useTranslation } from "react-i18next";

const { Text } = Typography;
const { TabPane } = Tabs;

const AssetMaintenanceDetail = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("1");
  const [assetMaintenance, setAssetMaintenance] = useState();
  const [spareParts, setSpareParts] = useState([]);
  const [assetModelDocuments, setAssetModelDocuments] = useState([]);
  const params = useParams();
  const { t } = useTranslation();

  useEffect(() => {
    fetGetAssetMaintenanceById();
  }, []);

  useEffect(() => {
    if (assetMaintenance?.assetModel?.id) {
      fetchSparePartsByAssetModel();
      fetchAssetModelDocByAssetModel();
    }
  }, [assetMaintenance]);

  const fetGetAssetMaintenanceById = async () => {
    const res = await _unitOfWork.assetMaintenance.getAssetMaintenanceById({
      id: params.id,
    });
    if (res && res.data) {
      setAssetMaintenance(res.data);
    }
  };

  const fetchSparePartsByAssetModel = async () => {
    const res = await _unitOfWork.AssetModelSparePart.getResById({
      id: assetMaintenance.assetModel?.id,
    });
    if (res && res.code === 1) {
      setSpareParts(res.data);
    }
  };

  const fetchAssetModelDocByAssetModel = async () => {
    const res =
      await _unitOfWork.assetModelDocument.getAssetModelDocumentByAssetModel({
        assetModel: assetMaintenance.assetModel?.id,
      });
    if (res && res.code === 1) {
      setAssetModelDocuments(res.data);
    }
  };

  return (
    <>
      {/* Header */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          height: 56,
          background: "#23457b",
          color: "#fff",
          padding: "0 16px",
          fontWeight: 600,
          fontSize: 18,
        }}
      >
        <ArrowLeftOutlined
          style={{ fontSize: 20, marginRight: 16, cursor: "pointer" }}
          onClick={() => navigate(-1)}
        />
        {t("assetMaintenance.detail.title")}
      </div>

      {/* Thông tin đầu trang */}
      <div style={{ padding: 16 }}>
        <Row gutter={16} align="middle">
          <Col span={6}>
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#eee",
              }}
            >
              <Image
                width={60}
                height={60}
                preview={false}
                style={{ objectFit: "cover" }}
                src={_unitOfWork.resource.getImage(
                  assetMaintenance?.resource?.id
                )}
              />
            </div>
          </Col>
          {assetMaintenance && (
            <Col span={18}>
              <Row>
                <Col span={24}>
                  <Text strong style={{ fontSize: 16 }}>
                    {t("assetMaintenance.detail.checklist_title")}
                  </Text>
                </Col>
                <Col span={24}>
                  <Text type="secondary">
                    {t("assetMaintenance.detail.manufacturer")}:{" "}
                    {
                      assetMaintenance.assetModel?.manufacturer
                        ?.manufacturerName
                    }
                  </Text>
                </Col>
                <Col span={24}>
                  <Text type="secondary">
                    {t("assetMaintenance.detail.serial")}: {assetMaintenance.serial}
                  </Text>
                </Col>
              </Row>
              <Row style={{ marginTop: 8 }}>
                <Col>
                  <Button
                    type="primary"
                    onClick={() =>
                      navigate(staticPath.createTechnicalSupportTicket)
                    }
                  >
                    {t("assetMaintenance.detail.create_support_ticket")}
                  </Button>
                </Col>
              </Row>
            </Col>
          )}
        </Row>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        centered
        tabBarGutter={32}
        tabBarStyle={{
          borderBottom: "1px solid #eee",
          padding: "0 12px",
        }}
        moreIcon={null}
      >
        {["1", "2", "3", "4"].map((key, index) => {
          const labels = [
            t("assetMaintenance.detail.tab_overview"),
            t("assetMaintenance.detail.tab_spare_parts"),
            t("assetMaintenance.detail.tab_documents"),
            t("assetMaintenance.detail.tab_history"),
          ];
          return (
            <TabPane
              tab={
                <span
                  style={{
                    color: activeTab === key ? "#000" : "#888",
                    paddingBottom: 6,
                    fontWeight: activeTab === key ? 600 : 400,
                  }}
                >
                  {labels[index]}
                </span>
              }
              key={key}
            >
              {key === "1" && (
                <>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 18,
                      margin: "16px 0 12px 20px",
                    }}
                  >
                    {t("assetMaintenance.detail.asset_info_section")}
                  </div>
                  <div
                    style={{
                      background: "#f5f5f7",
                      margin: "0 12px 18px 12px",
                      padding: "10px 0",
                      boxShadow: "0 1px 6px #0001",
                    }}
                  >
                    {assetMaintenance && (
                      <>
                        <RowDetail
                          label={t("assetMaintenance.detail.customer_name")}
                          value={assetMaintenance.customer?.customerName}
                        />
                        <RowDetail
                          label={t("assetMaintenance.detail.manufacturer")}
                          value={
                            assetMaintenance.assetModel?.manufacturer
                              ?.manufacturerName
                          }
                        />
                        <RowDetail
                          label={t("assetMaintenance.detail.category")}
                          value={
                            assetMaintenance.assetModel?.category?.categoryName
                          }
                        />
                        <RowDetail
                          label={t("assetMaintenance.detail.asset_style")}
                          value={t(parseToLabel(
                            assetType.Options,
                            assetMaintenance.assetStyle
                          ))}
                        />
                        <RowDetail
                          label={t("assetMaintenance.detail.asset_name")}
                          value={assetMaintenance.assetModel?.asset?.assetName}
                        />
                        <RowDetail
                          label={t("assetMaintenance.detail.asset_model_name")}
                          value={assetMaintenance.assetModel?.assetModelName}
                        />
                        <RowDetail
                          label={t("assetMaintenance.detail.serial")}
                          value={assetMaintenance.serial}
                        />
                        <RowDetail
                          label={t("assetMaintenance.detail.installation_date")}
                          value={parseDatetime(assetMaintenance.createdAt)}
                        />
                      </>
                    )}
                  </div>

                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 18,
                      margin: "24px 0 12px 20px",
                    }}
                  >
                    {t("assetMaintenance.detail.asset_location_section")}
                  </div>
                  <div
                    style={{
                      background: "#f5f5f7",
                      margin: "0 12px 18px 12px",
                      padding: "10px 0",
                      boxShadow: "0 1px 6px #0001",
                    }}
                  >
                    {assetMaintenance && (
                      <>
                        <RowDetail
                          label={t("assetMaintenance.detail.country")}
                          value={assetMaintenance?.location?.country?.name}
                        />
                        <RowDetail
                          label={t("assetMaintenance.detail.state")}
                          value={assetMaintenance?.location?.state?.name}
                        />
                        <RowDetail
                          label={t("assetMaintenance.detail.city")}
                          value={assetMaintenance.location?.city?.name}
                        />
                        <RowDetail
                          label={t("assetMaintenance.detail.building")}
                          value={
                            assetMaintenance.location?.building?.BuildingName
                          }
                        />
                        <RowDetail
                          label={t("assetMaintenance.detail.floor")}
                          value={assetMaintenance.location?.floor?.FloorName}
                        />
                        <RowDetail
                          label={t("assetMaintenance.detail.department")}
                          value={
                            assetMaintenance.location?.department
                              ?.DepartmentName
                          }
                        />
                        <RowDetail
                          label={t("assetMaintenance.detail.address_note")}
                          value={assetMaintenance?.addressNote}
                        />
                      </>
                    )}
                  </div>
                </>
              )}

              {key === "2" &&
                (spareParts && spareParts.length > 0 ? (
                  <Row
                    gutter={[16, 16]}
                    style={{ margin: 0, overflowX: "hidden" }}
                  >
                    {spareParts.map((item, index) => (
                      <Col key={index} span={12}>
                        <CardSparePart data={item} />
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <div></div>
                ))}

              {key === "3" &&
                assetModelDocuments &&
                assetModelDocuments.length > 0 ? (
                <div>
                  <AssetModelDocument
                    assetModelDocuments={assetModelDocuments}
                  ></AssetModelDocument>
                </div>
              ) : (
                <div></div>
              )}
              {key === "4" && (
                <div style={{ padding: 16 }}>{t("common.no_data")}</div>
              )}
            </TabPane>
          );
        })}
      </Tabs>
    </>
  );
};

export default AssetMaintenanceDetail;

// Component chi tiết
function RowDetail({ label, value }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 18px",
        borderBottom: "1px solid #eee",
        fontSize: 16,
      }}
    >
      <span style={{ color: "#888" }}>{label}</span>
      <span style={{ fontWeight: 500 }}>
        {value != null && value !== "" ? value : "--"}
      </span>
    </div>
  );
}