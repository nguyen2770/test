import { ArrowLeftOutlined } from "@ant-design/icons";
import { Card, Col, Row } from "antd";
import { useNavigate } from "react-router-dom";
import { staticPath } from "../../router/RouteConfig";
import "./index.scss";
import { useTranslation } from "react-i18next";

const ReportSelection = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const handleClickItem = (key) => {
        switch (key) {
            case "assetMaintenanceReport":
                navigate(staticPath.assetMaintenanceReport);
                break;
            case "assetPerformance":
                navigate(staticPath.assetPerformance);
                break;
            case "assetDepreciation":
                navigate(staticPath.assetDepreciation);
                break;
            case "spareUsageSummary":
                navigate(staticPath.sparePartsUsageSummaryReport);
                break;
            case "spareUsageDetail":
                navigate(staticPath.spareMovementReport);
                break;
            case "processingBreakdown":
                navigate(staticPath.processingStatusReportBreakdown);
                break;
            case "engineerBreakdown":
                navigate(staticPath.reportEngineerPerformanceInBreakdown);
                break;
            case "processingSchedulePreventive":
                navigate(staticPath.processingStatusReportSchedulePreventive);
                break;
            case "engineerSchedulePreventive":
                navigate(staticPath.reportEngineerPerformanceInSchedulePreventive);
                break;
            case "maintenanceRequest":
                navigate(staticPath.reportAssetMaintenanceRequest);
                break;
            default:
                break;
        }
    };

    const reportGroups = [
        {
            title: t("report.selection.incident_report"),
            items: [
                { key: "processingBreakdown", label: t("report.selection.incident_processing_status") },
                { key: "engineerBreakdown", label: t("report.selection.incident_engineer_performance") },
            ],
        },
        {
            title: t("report.selection.work_report"),
            items: [
                { key: "processingSchedulePreventive", label: t("report.selection.work_processing_status") },
                { key: "engineerSchedulePreventive", label: t("report.selection.work_engineer_performance") },
            ],
        },
        {
            title: t("report.selection.maintenance_request_report"),
            items: [{ key: "maintenanceRequest", label: t("report.selection.maintenance_request") }],
        },
        {
            title: t("report.selection.asset_report"),
            items: [
                { key: "assetMaintenanceReport", label: t("report.selection.asset_report") },
                { key: "assetPerformance", label: t("report.selection.asset_performance") },
                { key: "assetDepreciation", label: t("report.selection.asset_depreciation") },
            ],
        },
        {
            title: t("report.selection.spare_report"),
            items: [
                { key: "spareUsageSummary", label: t("report.selection.spare_usage_summary") },
                { key: "spareUsageDetail", label: t("report.selection.spare_usage_detail") },
            ],
        },
        {
            title: t("report.selection.general_report"),
            items: [],
        },
    ];

    return (
        <div className="report-page">
            {/* Header */}
            <div className="report-header">
                <ArrowLeftOutlined className="back-icon" onClick={() => navigate(-1)} />
                <span className="header-title">{t("report.selection.title")}</span>
            </div>

            {/* Content */}
            <div className="report-container">
                <Row gutter={[8, 8]} style={{ flexDirection: "column" }}>
                    {reportGroups.map((group, idx) => (
                        <Col key={idx} span={24}>
                            <Card className="report-card" title={group.title} bordered={false}>
                                {group.items.length === 0 && (
                                    <p className="report-item--empty">
                                        {t("report.common.no_data")}
                                    </p>
                                )}
                                {group.items.map((item) => (
                                    <p
                                        key={item.key}
                                        className="report-item"
                                        onClick={() => handleClickItem(item.key)}
                                    >
                                        {"► "}{item.label}
                                    </p>
                                ))}
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>
        </div>
    );
};

export default ReportSelection;