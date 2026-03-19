import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Col, Row } from 'antd';
import React, { useEffect, useState } from 'react';
import * as _unitOfWork from "../../../api";
import { staticPath } from '../../../router/RouteConfig';
import { answerTypeSeftDiagnosia } from '../../../utils/constant';
import { useTranslation } from 'react-i18next';

export default function SelfDiagnosisBreakdown() {
    const { t } = useTranslation();
    const params = useParams();
    const navigate = useNavigate();
    const [breakdown, setBreakdown] = useState(null);
    const location = useLocation();
    const assetModel = location.state?.assetModel;
    const [selfDiagnosis, setSelfDiagnosies] = useState([]);

    useEffect(() => {
        fetchGetBreakdownById();
        fetchGetAllSolutionByAssetModelId();
    }, []);

    const fetchGetBreakdownById = async () => {
        let res = await _unitOfWork.breakdown.getBreakdownById({ id: params.id });
        if (res) {
            setBreakdown(res?.breakdown);
        }
    };
    const fetchGetAllSolutionByAssetModelId = async () => {
        let res = await _unitOfWork.assetModelSeftDiagnosia.getAllAssetModelSeftDiagnosia({ assetModel: assetModel });
        if (res && res.code === 1) {
            setSelfDiagnosies(res?.data);
        }
    };

    const goToSolutionDetail = (selfDiagnosi) => {
        navigate(staticPath.viewSelfDiagnosisBreakdown + "/" + selfDiagnosi.id, { state: { selfDiagnosi: selfDiagnosi } });
    };

    return (
        <div style={{ background: '#f8f8f8', minHeight: '100vh' }}>
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
                    boxSizing: 'border-box',
                }}
            >
                <ArrowLeftOutlined
                    style={{ fontSize: 22, marginRight: 16, cursor: 'pointer' }}
                    onClick={() => navigate(-1)}
                />
                <span style={{ flex: 1 }}>{t("breakdown.view.tabs.self_diagnosis")}</span>
            </div>

            <div style={{ fontWeight: 600, fontSize: 17, marginTop: 10, textAlign: 'center' }}>
                {breakdown?.assetMaintenance?.assetModel?.asset?.assetName}
            </div>

            <div style={{ padding: '10px' }}>
                <Row style={{ textAlign: 'center' }}>
                    <Col span={12}>
                        <div style={{ color: '#aaa', fontSize: 15 }}>{t("breakdown.spareRequest.modal.fields.code")}</div>
                        <div style={{ color: '#00b96b', fontWeight: 500, fontSize: 17 }}>
                            {breakdown?.code}
                        </div>
                    </Col>
                    <Col span={12}>
                        <div style={{ color: '#aaa', fontSize: 15 }}>{t("breakdown.reopen.fields.opened_date")}</div>
                        <div style={{ color: '#00b96b', fontWeight: 500, fontSize: 17 }}>
                            {breakdown?.createdAt
                                ? new Date(breakdown.createdAt).toLocaleString('vi-VN')
                                : 'null'}
                        </div>
                    </Col>
                </Row>
            </div>
            <div style={{
                borderBottom: '2px dashed #ccc',
            }} />
            <div style={{ padding: 16 }}>
                {selfDiagnosis.map((item) => (
                    <div
                        key={item._id}
                        onClick={() => goToSolutionDetail(item)}
                        style={{
                            background: '#fff',
                            borderRadius: 8,
                            boxShadow: '0 1px 6px #0001',
                            marginBottom: 18,
                            padding: '12px 16px',
                            cursor: 'pointer',
                        }}
                    >
                        <div style={{ display: 'flex' }}>
                            <div style={{ color: '#888', fontWeight: 600, minWidth: 100 }}>
                                {t("breakdown.viewTabs.selfDiagnosis.failure_type")}
                            </div>
                            <div style={{
                                flex: 1,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}>
                                {item?.assetModelFailureType?.name}
                            </div>
                        </div>
                        <div style={{ display: 'flex', marginBottom: 4 }}>
                            <div style={{ color: '#888', fontWeight: 600, minWidth: 100 }}>
                                {t("breakdown.viewTabs.selfDiagnosis.answer_type")}
                            </div>
                            <div style={{
                                flex: 1,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}>
                                {answerTypeSeftDiagnosia.options.map((option) => {
                                    if (option.value === item?.answerType) {
                                        return (
                                            <span key={option.value}>
                                                {t(option.label)}
                                            </span>
                                        );
                                    }
                                    return null;
                                })}
                            </div>
                        </div>
                        <div style={{ display: 'flex', marginBottom: 4 }}>
                            <div style={{ color: '#888', fontWeight: 600, minWidth: 100 }}>
                                {t("breakdown.viewTabs.selfDiagnosis.question")}
                            </div>
                            <div style={{
                                flex: 1,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}>
                                {item?.question}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}