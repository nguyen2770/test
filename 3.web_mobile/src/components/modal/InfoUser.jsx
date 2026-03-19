import { ArrowLeftOutlined } from '@ant-design/icons';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { STORAGE_KEY } from "../../utils/constant";
import { useTranslation } from 'react-i18next';
export default function InfoUser({ }) {

    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem(STORAGE_KEY.USER));
    const { t } = useTranslation();

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
                    boxSizing: 'border-box',
                }}
            >
                <ArrowLeftOutlined
                    style={{ fontSize: 22, marginRight: 16, cursor: 'pointer' }}
                    onClick={() => navigate(-1)}
                />
                <span style={{ flex: 1 }}>{t("infoUser.title")}</span>
            </div>

            {/* Tiêu đề */}
            <div style={{ fontWeight: 600, fontSize: 18, margin: '24px 0 12px 20px', color: '#23457b' }}>
                {t("infoUser.user_info")}
            </div>

            {/* Card thông tin */}
            <div
                style={{
                    background: '#fff',
                    borderRadius: 6,
                    boxShadow: '0 1px 6px #0001',
                    margin: '0 16px',
                    padding: '20px 16px',
                    fontWeight: "450"
                }}
            >
                <div style={{ color: '#888', fontSize: 16, marginBottom: 2 }}>{t("infoUser.username")}</div>
                <div style={{
                    fontSize: 18,
                    borderBottom: '1px solid #ccc',
                    marginBottom: 12,
                    paddingBottom: 4,
                }}>{user.username}</div>

                <div style={{ color: '#888', fontSize: 16, marginBottom: 2 }}>{t("infoUser.first_name")}</div>
                <div style={{
                    fontSize: 18,
                    borderBottom: '1px solid #ccc',
                    marginBottom: 12,
                    paddingBottom: 4,
                }}>{user.firstName}</div>

                <div style={{ color: '#888', fontSize: 16, marginBottom: 2 }}>{t("infoUser.last_name")}</div>
                <div style={{
                    fontSize: 18,
                    borderBottom: '1px solid #ccc',
                    marginBottom: 12,
                    paddingBottom: 4,
                }}>{user.lastName}</div>

                <div style={{ color: '#888', fontSize: 16, marginBottom: 2 }}>{t("infoUser.contact_no_label")}</div>
                <div style={{
                    fontSize: 18,
                    borderBottom: '1px solid #ccc',
                    marginBottom: 12,
                    paddingBottom: 4,
                }}>{user.contactNo}</div>
                <div style={{ color: '#888', fontSize: 16, marginBottom: 2 }}>{t("infoUser.phone")}</div>
                <div style={{
                    fontSize: 18,
                    borderBottom: '1px solid #ccc',
                    marginBottom: 12,
                    paddingBottom: 4,
                }}>{user.email}</div>
            </div>
        </div>
    );
};