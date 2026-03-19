import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Col, Row } from 'antd';
import React, { useEffect, useState } from 'react';
import * as _unitOfWork from "../../../api";
import { staticPath } from '../../../router/RouteConfig';
import { useTranslation } from 'react-i18next';

export default function SolutionBank() {
    const { t } = useTranslation();
    const params = useParams();
    const navigate = useNavigate();
    const [breakdown, setBreakdown] = useState(null);
    const location = useLocation();
    const assetModel = location.state?.assetModel;
    const [solutions, setSolutions] = useState([]);

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
        let res = await _unitOfWork.assetModelSolution.getAllAssetModelSolution({ assetModel: assetModel });
        if (res && res.code === 1) {
            setSolutions(res?.data);
        }
    };

    const goToSolutionDetail = (solution) => {
        navigate(staticPath.viewSolutionBankBreakdown + "/" + solution.id, { state: { solution: solution } });
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
                <span style={{ flex: 1 }}>{t("breakdown.view.menu.solution_bank")}</span>
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
            <div style={{ borderBottom: '2px dashed #ccc' }} />

            <div style={{ padding: 16 }}>
                {solutions.map((item) => (
                    <div
                        key={item.id}
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
                        <Row>
                            <Col span={10}>
                                {t("breakdown.viewTabs.general.fields.defect")}:
                            </Col>
                            <Col span={14} style={{ color: '#888', fontWeight: 600, fontSize: 15 }}>
                                <div style={{
                                    flex: 1,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {item?.assetModelFailureType?.name}
                                </div>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={10}>
                                {t("breakdown.close.fields.root_cause")}:
                            </Col>
                            <Col span={14} style={{ color: '#888', fontWeight: 600, fontSize: 15 }}>
                                <div style={{
                                    flex: 1,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {item?.reasonOrigin}
                                </div>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={10}>
                                {t("breakdown.close.fields.solution")}:
                            </Col>
                            <Col span={14} style={{ color: '#888', fontWeight: 600, fontSize: 15 }}>
                                <div style={{
                                    flex: 1,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {item?.solutionContent}
                                </div>
                            </Col>
                        </Row>
                    </div>
                ))}
            </div>
        </div>
    );
}