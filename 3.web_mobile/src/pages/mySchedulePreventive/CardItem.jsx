import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { Button, Card, Col, Divider, Image, Row } from "antd";
import { staticPath } from "../../router/RouteConfig";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const CardItem = ({ schedulePreventiveAssignUser }) => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    return (
        <Card
            className="ticket-card"
            bodyStyle={{ padding: 10 }}
            style={{ margin: 5 }}
            onClick={() => navigate(`${staticPath.PreventiveDetail + "/" + "dđ"}`)}
        >
            <Row align="middle">
                <Col span={24} style={{ textAlign: "end" }}>
                    <span className="ticket-status" style={{ color: "#1677ff" }}>
                        {t("preventive.card.status.assigned")}
                    </span>
                </Col>
            </Row>

            <Row align="middle">
                <Col span={4}>
                    <Image
                        width={60}
                        height={60}
                        src="https://via.placeholder.com/60"
                        preview={false}
                        style={{ borderRadius: "5px", background: "#eee" }}
                    />
                </Col>
                <Col span={20} style={{ paddingLeft: 10 }}>
                    <Row gutter={32}>
                        <Col span={24}>
                            <b className="ticket-title ellipsis">
                                {t("preventive.card.sample_title")}
                            </b>
                        </Col>
                        <Col span={24}>
                            <span className="ellipsis">
                                {t("preventive.pdf.schedule_id")}: {schedulePreventiveAssignUser && schedulePreventiveAssignUser.code}
                            </span>
                        </Col>
                        <Col span={24}>
                            <span className="ellipsis">
                                {t("myTask.myTask.search.task_name")}: {schedulePreventiveAssignUser?.schedulePreventiveTask?.taskName}
                            </span>
                        </Col>
                        <Col span={24}>
                            <span className="ellipsis">
                                {t("preventive.common.frequency_type")}: {schedulePreventiveAssignUser?.schedulePreventiveTask?.sla}
                            </span>
                        </Col>
                    </Row>
                </Col>
            </Row>

            <Divider style={{ margin: '8px 0' }} />

            <Row>
                <Col span={12}>
                    <div>{t("preventive.pdf.customer_name")}: {schedulePreventiveAssignUser?.schedulePreventive?.customerName}</div>
                    <div>{t("preventive.card.labels.location")}: Pnp solution</div>
                    <div>{t("preventive.card.labels.building")}: ----</div>
                </Col>
                <Col span={12} style={{ textAlign: "end" }}>
                    <div>{t("breakdown.reopen.fields.opened_date")}: 01/08/2025 22:43</div>
                    <div style={{ color: "red" }}>{t("breakdown.close.fields.deadline")}: 01/08/2025 22:43</div>
                </Col>
            </Row>

            <Row justify="space-around" className="ticket-actions" style={{ marginTop: 12 }}>
                <Button icon={<CheckOutlined style={{ color: "blue" }} />} className="btn-breakdown">
                    {t("breakdown.actions.accept")}
                </Button>
                <Button icon={<CloseOutlined style={{ color: "red" }} />} className="btn-breakdown">
                    {t("breakdown.actions.reject")}
                </Button>
                <Button className="btn-breakdown">
                    {t("preventive.card.buttons.start_task")}
                </Button>
            </Row>
        </Card>
    );
};

export default CardItem;