import { Card, Col, Row, Select } from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next'
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { STORAGE_KEY } from "../../utils/constant";

const Settings = () => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const [currentLanguage, setCurrentLanguage] = useState(null);

    useEffect(() => {
        const _curentLanguage = localStorage.getItem(STORAGE_KEY.LANGUAGE);
        if (_curentLanguage) {
            setCurrentLanguage(_curentLanguage);
        } else {
            setCurrentLanguage('vi');
        }
    }, []);

    const handleChangeLanguage = (_val) => {
        setCurrentLanguage(_val);
        localStorage.setItem(STORAGE_KEY.LANGUAGE, _val);
        i18n.changeLanguage(_val);
        window.location.reload();
    };

    return (
        <div style={{ height: "100vh" }}>
            {/* Header */}
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
                <Col span={24} style={{ display: "flex", alignItems: "center" }}>
                    <ArrowLeftOutlined
                        style={{ fontSize: 22, marginRight: 16, cursor: "pointer" }}
                        onClick={() => navigate(-1)}
                    />
                    {/* Sử dụng i18n key cho tiêu đề */}
                    <span style={{ flex: 1, fontSize: 20 }}>
                        {t('layout.header.settings.title', { defaultValue: 'Cài đặt' })}
                    </span>
                </Col>
            </Row>

            <Card>
                {/* Sử dụng i18n key cho label chọn ngôn ngữ */}
                <div style={{ marginBottom: 12, fontWeight: 500 }}>
                    {t('layout.header.settings.choose_language')}
                </div>
                <Select
                    value={currentLanguage}
                    onChange={handleChangeLanguage}
                    style={{ width: "100%" }}
                    options={[
                        { value: "vi", label: t('layout.header.language.vi', { defaultValue: "Tiếng Việt" }) },
                        { value: "en", label: t('layout.header.language.en', { defaultValue: "English" }) },
                    ]}
                />
            </Card>
        </div>
    );
};

export default Settings;