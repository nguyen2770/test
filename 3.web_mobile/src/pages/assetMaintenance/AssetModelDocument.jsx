import { Button, Col, Row } from "antd";
import { assetModelDocumentCategory } from "../../utils/constant";
import Title from "antd/es/skeleton/Title";
import { DownloadOutlined, EyeOutlined } from "@ant-design/icons";
import { base_api } from "../../api/config";
import { useTranslation } from "react-i18next";

const AssetModelDocument = ({ assetModelDocuments }) => {
    const { t } = useTranslation();
    // Group theo documentCategory
    const groupedDocuments = assetModelDocuments.reduce((acc, doc) => {
        const categoryName = t(assetModelDocumentCategory[doc.documentCategory]) || t("assetMaintenance.documents.other");
        if (!acc[categoryName]) acc[categoryName] = [];
        acc[categoryName].push(doc);
        return acc;
    }, {});

    return (

        <div style={{ padding: "0 16px 16px 16px" }}>
            {Object.entries(groupedDocuments).map(([categoryName, docs]) => (
                <div key={categoryName} style={{ marginBottom: 24 }}>
                    <Title level={5}>{categoryName}</Title>
                    {docs.map((doc) => (
                        <Row
                            key={doc.id}
                            justify="space-between"
                            align="middle"
                            style={{
                                background: '#fff',
                                padding: 12,
                                borderRadius: 4,
                                marginBottom: 8,
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                            }}
                        >
                            <Col span={18}>{doc.resourceId?.fileName || t("assetMaintenance.documents.no_file")}</Col>
                            <Col>
                                {doc.resourceId?.id ? (
                                    <Button
                                        type="link"
                                        icon={<EyeOutlined />}
                                        href={`/resource/image/${doc.resourceId.id}`}
                                        target="_blank"
                                    />
                                ) : (
                                    <Button type="link" icon={<DownloadOutlined />} disabled />
                                )}
                            </Col>
                        </Row>
                    ))}
                </div>
            ))}
        </div>
    );
}

export default AssetModelDocument;