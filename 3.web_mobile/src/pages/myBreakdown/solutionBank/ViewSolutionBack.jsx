import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

export default function ViewSolutionBack() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const solution = location.state?.solution;

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
                <span style={{ flex: 1 }}>{t("breakdown.solutionBank.detail_title")}</span>
            </div>

            <div style={{ padding: '24px 12px 0 12px' }}>
                <div style={{ color: '#888', fontWeight: 500, fontSize: 15, marginBottom: 2 }}>
                    {t("breakdown.viewTabs.general.fields.defect")}
                </div>
                <div style={{ fontSize: 17, marginBottom: 12 }}>
                    {solution?.assetModelFailureType?.name}
                </div>
                <div style={{ borderBottom: '1px solid #eee', marginBottom: 12 }} />

                <div style={{ color: '#888', fontWeight: 500, fontSize: 15, marginBottom: 2 }}>
                    {t("breakdown.close.fields.root_cause")}
                </div>
                <div style={{ fontSize: 17, marginBottom: 12 }}>
                    {solution?.reasonOrigin}
                </div>
                <div style={{ borderBottom: '1px solid #eee', marginBottom: 12 }} />

                <div style={{ color: '#888', fontWeight: 500, fontSize: 15, marginBottom: 2 }}>
                    {t("breakdown.close.fields.solution")}
                </div>
                <div style={{ fontSize: 17, marginBottom: 12 }}>
                    {solution?.solutionContent}
                </div>
                <div style={{ borderBottom: '1px solid #eee', marginBottom: 12 }} />
            </div>
        </div>
    );
}