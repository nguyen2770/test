import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftOutlined, EyeOutlined, DownloadOutlined } from '@ant-design/icons';
import { Col, Row, Card, Button, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import * as _unitOfWork from "../../api";
import { assetModelDocumentCategory } from '../../utils/constant';
import { base_api } from '../../api/config';
import { t } from 'i18next';

const { Title } = Typography;

export default function AssetModelDocument() {
    const params = useParams();
    const navigate = useNavigate();
    const [assetModelDocuments, setAssetModelDocuments] = useState([]);

    useEffect(() => {
        fetchAssetModelDocByAssetModel();
    }, []);

    const fetchAssetModelDocByAssetModel = async () => {
        const res = await _unitOfWork.assetModelDocument.getAssetModelDocumentByAssetModel({
            assetModel: params.id
        });
        if (res && res.code === 1) {
            setAssetModelDocuments(res.data);
        }
    };

    // Group theo documentCategory
    const groupedDocuments = assetModelDocuments.reduce((acc, doc) => {
        const categoryName = t(assetModelDocumentCategory[doc.documentCategory]) || t("breakdown.close.fields.document_category_empty");
        if (!acc[categoryName]) acc[categoryName] = [];
        acc[categoryName].push(doc);
        return acc;
    }, {});

    return (
        <div style={{ background: '#f8f8f8', minHeight: '100vh' }}>
            {/* Header */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    height: 56,
                    background: '#23457b',
                    color: '#fff',
                    padding: '0 16px',
                    fontWeight: 600,
                    fontSize: 20,
                }}
            >
                <ArrowLeftOutlined
                    style={{ fontSize: 22, marginRight: 16, cursor: 'pointer' }}
                    onClick={() => navigate(-1)}
                />
                <span>{t("breakdown.close.fields.title_document")}
                </span>
            </div>

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
                                <Col span={18}>{doc.resourceId?.fileName || t("breakdown.close.fields.attachments_empty")}</Col>
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
        </div>
    );
}
