import { Card, List } from "antd";
import {
    ArrowLeftOutlined,
    FileDoneOutlined,
    FileTextOutlined,
    SolutionOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { staticPath } from "../../router/RouteConfig";

export default function Contract() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const items = [
        {
            title: t("menu.contract.maintenance"),
            icon: <FileDoneOutlined style={{ fontSize: 22 }} />,
            path: staticPath.maintenanceContract,

        },
        {
            title: t("menu.contract.calibration"),
            icon: <SolutionOutlined style={{ fontSize: 22 }} />,
            path: staticPath.calibrationContract,

        },
        {
            title: t("menu.contract.repair"),
            icon: <FileTextOutlined style={{ fontSize: 22 }} />,
            path: staticPath.repairContract,

        },
    ];

    return (

        <div style={{ background: '#f8f8f8', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Sticky Header */}
            <div
                style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 100,
                    background: '#23457b',
                    height: 56,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 16px',
                    fontWeight: 600,
                    fontSize: 20,
                    color: '#fff',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <ArrowLeftOutlined
                        style={{ fontSize: 22, marginRight: 16, cursor: 'pointer' }}
                        onClick={() => navigate(-1)}
                    />
                    <span>{t("menu.contract.root")}</span>
                </div>
            </div>
            <Card
                style={{
                    margin: 16,
                    borderRadius: 12,
                    padding: 0,
                    background: "transparent",
                    boxShadow: "none",
                }}
                bodyStyle={{ padding: 0 }}
            >
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 12,
                    }}
                >
                    {items.map((item, index) => (
                        <div
                            key={index}
                            onClick={() => navigate(item.path)}
                            style={{
                                background: "#fff",
                                borderRadius: 12,
                                padding: "18px 10px",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                textAlign: "center",
                                boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                                cursor: "pointer",
                            }}
                        >
                            <div style={{ marginBottom: 8 }}>{item.icon}</div>
                            <div style={{ fontSize: 14, fontWeight: 500 }}>{item.title}</div>
                        </div>
                    ))}
                </div>
            </Card>

        </div>
    );
}
