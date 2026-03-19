import { ArrowLeftOutlined, PlusCircleFilled } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import { message } from "antd";
import * as _unitOfWork from "../../../api";
import { useTranslation } from "react-i18next";

const PreventiveAttachment = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('tab1');
    const fileInputRef = useRef();

    const tabStyle = (tabKey) => ({
        flex: 1,
        textAlign: 'center',
        padding: '12px 0',
        color: activeTab === tabKey ? '#fff' : 'rgba(255, 255, 255, 0.6)',
        backgroundColor: '#23457b',
        borderBottom: activeTab === tabKey ? '3px solid orange' : '3px solid transparent',
        cursor: 'pointer',
        fontWeight: 500,
        fontSize: 16,
        transition: 'border-bottom 0.3s ease, color 0.3s ease',
    });

    const handleFileChange = async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        const file = files[0];

        let resource;
        if (file) {
            let resUpload = await _unitOfWork.resource.uplresourceoadImage({ file: file });
            if (resUpload && resUpload?.code === 1) {
                resource = resUpload.resourceId;
            } else {
                message.error(t("preventive.attachment.messages.upload_error"));
                return;
            }
        }
        // Future: call API to persist attachment
    };

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
                    fontSize: 20
                }}
            >
                <ArrowLeftOutlined
                    style={{ fontSize: 22, marginRight: 16, cursor: 'pointer' }}
                    onClick={() => navigate(-1)}
                />
                <span style={{ flex: 1 }}>{t("preventive.documents.title")}</span>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex' }}>
                <div style={tabStyle('tab1')} onClick={() => setActiveTab('tab1')}>
                    {t("preventive.pdf.before_task")}
                </div>
                <div style={tabStyle('tab2')} onClick={() => setActiveTab('tab2')}>
                    {t("preventive.pdf.after_task")}
                </div>
            </div>

            {/* Content */}
            <div style={{ overflow: 'hidden', position: 'relative', height: 200 }}>
                <div
                    style={{
                        display: 'flex',
                        width: '200%',
                        transform: `translateX(${activeTab === 'tab1' ? '0%' : '-50%'})`,
                        transition: 'transform 0.4s ease',
                    }}
                >
                    <div style={{ width: '50%', padding: 16 }}>
                        <div>{t("preventive.attachment.list_before")}</div>
                    </div>
                    <div style={{ width: '50%', padding: 16 }}>
                        <div>{t("preventive.attachment.list_after")}</div>
                    </div>
                </div>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                style={{ display: "none" }}
                onChange={handleFileChange}
            />

            {/* Add Button */}
            <div
                style={{
                    position: "fixed",
                    right: 20,
                    bottom: 80,
                    zIndex: 10,
                    fontSize: 50,
                    color: "#1890ff",
                    cursor: "pointer",
                }}
                onClick={() => fileInputRef.current?.click()}
                title={t("preventive.attachment.buttons.add")}
            >
                <PlusCircleFilled />
            </div>
        </div>
    );
};

export default PreventiveAttachment;