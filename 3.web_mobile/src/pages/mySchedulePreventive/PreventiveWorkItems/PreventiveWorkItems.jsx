import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import PreventiveWorkItemCard from "./PreventiveWorkItemCard";
import { useTranslation } from "react-i18next";

const PreventiveWorkItems = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
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
                <span style={{ flex: 1 }}>{t("preventive.workItems.title")}</span>
            </div>
            <h3 style={{ margin: 5 }}>
                {t("preventive.workItems.task_name_label")} Check list for ........
            </h3>
            <PreventiveWorkItemCard />
        </div>
    );
};

export default PreventiveWorkItems;