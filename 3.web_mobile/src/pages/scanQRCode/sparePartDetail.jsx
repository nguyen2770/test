import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as _unitOfWork from "../../api";
import { Avatar, Col, Row } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { parseDate } from "../../helper/date-helper";
import { useTranslation } from "react-i18next";

const SparePartDetail = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const qrcode = queryParams.get("qrcode");
    const [sparePartDetail, setSparePartDetail] = useState(null);

    useEffect(() => {
        if (qrcode) {
            handleGetSparePartDetail();
        }
    }, [qrcode]);

    const handleGetSparePartDetail = async () => {
        const res = await _unitOfWork.sparePart.getSparePartDetailByQrCode({
            qrCode: qrcode,
        });
        if (res && res.code === 1) {
            setSparePartDetail(res.data);
        }
    };
    return (
        <div style={{ height: "100vh" }}>
            <Row
                style={{
                    display: "flex",
                    alignItems: "center",
                    height: 56,
                    background: "#23457b",
                    color: "#fff",
                    padding: "0 16px",
                    fontWeight: 600,
                    fontSize: 20,
                    boxSizing: "border-box",
                }}
            >
                <Col span={16}>
                    {/* <ArrowLeftOutlined
                        style={{ fontSize: 22, marginRight: 16, cursor: 'pointer' }}
                        onClick={() => navigate(-1)}
                    /> */}
                    <span style={{ flex: 1, fontSize: 20 }}>{t("sparePart.detail.title")}</span>
                </Col>
            </Row>
            <div>
                <div
                    style={{
                        marginTop: 16,
                        display: "flex",
                        justifyContent: "center",
                        marginBottom: 16,
                    }}
                >
                    <Avatar
                        shape="square"
                        size={150}
                        src={
                            sparePartDetail?.sparePart?.resourceId
                                ? _unitOfWork.resource.getImage(sparePartDetail.sparePart.resourceId)
                                : "https://via.placeholder.com/300?text=No+Image"
                        }
                        style={{
                            borderRadius: 8,
                            border: "1px solid #ccc",
                            padding: 4,
                            background: "#fff",
                            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                        }}
                    />
                </div>
            </div>
            <div style={{ fontWeight: 600, fontSize: 18, margin: "24px 0 12px 20px" }}>
                {t("sparePart.detail.infoSectionTitle")}
            </div>

            <div
                style={{
                    background: "#f5f5f7",
                    margin: "0 12px 18px 12px",
                    padding: "10px 0",
                    boxShadow: "0 1px 6px #0001",
                }}
            >
                <RowDetail label={t("sparePart.detail.labels.code")} value={sparePartDetail?.sparePart?.code} />
                <RowDetail label={t("sparePart.detail.labels.name")} value={sparePartDetail?.sparePart?.sparePartsName} />
                <RowDetail label={t("sparePart.detail.labels.manufacturer")} value={sparePartDetail?.manufacturer?.manufacturerName} />
                <RowDetail label={t("sparePart.detail.labels.supplier")} value={sparePartDetail?.supplier?.supplierName} />
                <RowDetail label={t("sparePart.detail.labels.origin")} value={sparePartDetail?.origin} />
                <RowDetail label={t("sparePart.detail.labels.warehouseReceivedDate")} value={parseDate(sparePartDetail?.warehouseReceivedDate)} />
                <RowDetail label={t("sparePart.detail.labels.productionDate")} value={parseDate(sparePartDetail?.productionDate)} />
                <RowDetail label={t("sparePart.detail.labels.replacementDate")} value={parseDate(sparePartDetail?.replacementDate)} />
            </div>

            <div style={{ fontWeight: 600, fontSize: 18, margin: "24px 0 12px 20px" }}>
                {t("sparePart.detail.deviceSectionTitle")}
            </div>
            <div
                style={{
                    background: "#f5f5f7",
                    margin: "0 12px 18px 12px",
                    padding: "10px 0",
                    boxShadow: "0 1px 6px #0001",
                }}
            >
                <RowDetail label={t("sparePart.detail.labels.deviceName")} value={sparePartDetail?.assetMaintenance?.assetName} />
                <RowDetail label={t("sparePart.detail.labels.deviceModel")} value={sparePartDetail?.assetMaintenance?.assetModelName} />
                <RowDetail label={t("sparePart.detail.labels.serial")} value={sparePartDetail?.assetMaintenance?.serial} />
            </div>
        </div>
    );
};
export default SparePartDetail;
function RowDetail({ label, value }) {
    return (
        <div
            style={{
                display: "flex",
                padding: "10px 8px",
                borderBottom: "1px solid #eee",
                fontSize: 16,
                gap: 12,
            }}
        >
            <span style={{ color: "#888", whiteSpace: "nowrap" }}>{label}</span>

            <span
                style={{
                    fontWeight: 500,
                    textAlign: "right",
                    flex: 1,
                    wordBreak: "break-word",
                }}
            >
                {value}
            </span>
        </div>
    );
}