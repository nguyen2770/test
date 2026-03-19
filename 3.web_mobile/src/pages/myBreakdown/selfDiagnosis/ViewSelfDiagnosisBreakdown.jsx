import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { answerTypeSeftDiagnosia } from '../../../utils/constant';
import { Col, Row } from 'antd';
import { useTranslation } from 'react-i18next';

export default function ViewSelfDiagnosisBreakdown() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const selfDiagnosi = location.state?.selfDiagnosi;

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
                <span style={{ flex: 1 }}>{t("breakdown.selfDiagnosis.detail_title")}</span>
            </div>

            <div style={{ padding: '24px 12px 0 12px' }}>
                <div style={{ color: '#888', fontWeight: 500, fontSize: 15, marginBottom: 2 }}>
                    {t("breakdown.viewTabs.selfDiagnosis.failure_type")}
                </div>
                <div style={{ fontSize: 17, marginBottom: 12 }}>
                    {selfDiagnosi?.assetModelFailureType?.name}
                </div>
                <div style={{ borderBottom: '1px solid #eee', marginBottom: 12 }} />

                <div style={{ color: '#888', fontWeight: 500, fontSize: 15, marginBottom: 2 }}>
                    {t("breakdown.viewTabs.selfDiagnosis.answer_type")}
                </div>
                <div style={{ fontSize: 17, marginBottom: 12 }}>
                    {answerTypeSeftDiagnosia.options.map((option) => {
                        if (option.value === selfDiagnosi?.answerType) {
                            return (
                                <span key={option.value}>
                                    {t(option.label)}
                                </span>
                            );
                        }
                        return null;
                    })}
                </div>
                <div style={{ borderBottom: '1px solid #eee', marginBottom: 12 }} />

                <div style={{ color: '#888', fontWeight: 500, fontSize: 15, marginBottom: 2 }}>
                    {t("breakdown.viewTabs.selfDiagnosis.question")}
                </div>
                <div style={{ fontSize: 17, marginBottom: 12 }}>
                    {selfDiagnosi?.question}
                </div>
                <div style={{ borderBottom: '1px solid #eee', marginBottom: 12 }} />
                <div style={{ color: '#888', fontWeight: 500, fontSize: 15, marginBottom: 2 }}>
                    {t("breakdown.viewTabs.selfDiagnosis.answer")}
                </div>
                <div style={{ fontSize: 17, marginBottom: 12 }}>
                    {selfDiagnosi?.values && selfDiagnosi.values.length > 0 ? (
                        selfDiagnosi?.answerType === answerTypeSeftDiagnosia.option ? (
                            selfDiagnosi.values.map((v, idx) => (
                                <Row
                                    key={v.id || idx}
                                    style={{
                                        background: '#f4f8f5',
                                        borderRadius: 8,
                                        padding: '10px 14px',
                                        marginBottom: 10,
                                        border: '1px solid #e0e0e0',
                                        alignItems: 'center'
                                    }}
                                >
                                    <Col span={24}>
                                        <span style={{ fontWeight: 600, marginRight: 8 }}>
                                            {t("breakdown.viewTabs.selfDiagnosis.answer_item", { index: idx + 1 })}:
                                        </span>
                                        <span style={{ color: '#23457b' }}>
                                            {v.value1}
                                        </span>
                                    </Col>
                                </Row>
                            ))
                        ) : selfDiagnosi?.answerType === answerTypeSeftDiagnosia.range ? (
                            selfDiagnosi.values.map((v, idx) => (
                                <Row
                                    key={v.id || idx}
                                    style={{
                                        background: '#f5f7fa',
                                        borderRadius: 8,
                                        padding: '10px 14px',
                                        marginBottom: 10,
                                        border: '1px solid #e0e0e0',
                                        alignItems: 'center'
                                    }}
                                    gutter={12}
                                >
                                    <Col span={24} style={{ fontWeight: 600, marginBottom: 6 }}>
                                        {t("breakdown.viewTabs.selfDiagnosis.answer_item", { index: idx + 1 })}:
                                    </Col>
                                    <Col span={12}>
                                        <span style={{ color: '#888' }}>{t("breakdown.viewTabs.selfDiagnosis.value1")}</span>{' '}
                                        <span style={{ color: '#23457b' }}>{v.value1}</span>
                                    </Col>
                                    <Col span={12}>
                                        <span style={{ color: '#888' }}>{t("breakdown.viewTabs.selfDiagnosis.value2")}</span>{' '}
                                        <span style={{ color: '#23457b' }}>{v.value2}</span>
                                    </Col>
                                </Row>
                            ))
                        ) : (
                            <span style={{ color: '#bbb' }}>--</span>
                        )
                    ) : (
                        <span style={{ color: '#bbb' }}>--</span>
                    )}
                </div>
            </div>
        </div>
    );
}