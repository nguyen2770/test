import { Card, Image } from "antd";
import * as _unitOfWork from "../../api";
import { useTranslation } from "react-i18next";

const CardSparePart = ({ data }) => {
    const { t } = useTranslation();
    return (
        <Card bodyStyle={{ padding: 10, textAlign: "center" }}>
            <div>
                <Image
                    width={80}
                    height={80}
                    src={_unitOfWork.resource.getImage(data?.sparePart?.resourceId)}
                    preview={false}
                    style={{ borderRadius: "5px", background: "#eee", margin: "0 auto" }}
                    fallback="https://via.placeholder.com/60"
                />
                <div style={{ marginTop: 8, fontWeight: "bold" }}>
                    {data.sparePart?.sparePartsName}
                </div>
                <div style={{ marginTop: 4 }}>
                    {t("assetMaintenance.spare_part.asset_id_label")}: {data.sparePart?.code}
                </div>
            </div>
        </Card>
    );
};

export default CardSparePart;