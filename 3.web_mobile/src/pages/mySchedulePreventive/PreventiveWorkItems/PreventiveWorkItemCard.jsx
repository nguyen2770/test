import { FileAddOutlined } from "@ant-design/icons";
import { Button, Card, Col, Form, Radio, Row, Switch, Input } from "antd";
import { useState } from "react";
import { staticPath } from "../../../router/RouteConfig";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const { TextArea } = Input;

const PreventiveWorkItemCard = ({ data }) => {
    const { t } = useTranslation();
    const [showStatus, setShowStatus] = useState(false);
    const navigate = useNavigate();

    return (
        <Card bodyStyle={{ padding: 10 }} style={{ margin: 10 }}>
            <Form layout="vertical">
                <Row gutter={[0, 0]}>
                    <Col span={24}>
                        <h3 style={{ margin: 0 }}>{t("preventive.workItem.title_fix_found_errors")}</h3>
                    </Col>

                    <Col span={24}>
                        <Form.Item name="radioOption" label={t("preventive.workItem.fields.decision_label")}>
                            <Radio.Group>
                                <Radio value="yes">{t("breakdown.common.yes")}</Radio>
                                <Radio value="no">{t("breakdown.common.no")}</Radio>
                                <Radio value="na">{t("preventive.workItem.options.na")}</Radio>
                            </Radio.Group>
                        </Form.Item>
                    </Col>

                    <Col span={24}>
                        <Form.Item name="comment" label={t("preventive.comment.title")}>
                            <TextArea placeholder={t("preventive.workItem.placeholders.add_comment")} />
                        </Form.Item>
                    </Col>

                    <Col span={24} style={{ textAlign: 'right' }}>
                        <Form.Item>
                            <Switch onChange={(checked) => setShowStatus(checked)} /> {t("preventive.workItem.fields.problem_detect_switch")}
                        </Form.Item>
                    </Col>

                    {showStatus && (
                        <Col span={24}>
                            <Form.Item name="status" label={t("preventive.workItem.fields.problem_status")}>
                                <TextArea placeholder={t("preventive.workItem.placeholders.problem_status")} />
                            </Form.Item>
                        </Col>
                    )}

                    <Col span={24}>
                        <Button
                            icon={<FileAddOutlined />}
                            style={{
                                borderRadius: 30,
                                border: '1px solid rgb(31, 162, 243)',
                            }}
                            onClick={() => { navigate(`${staticPath.PreventiveAttachment + "/" + "dđ"}`); }}
                        >
                            {t("preventive.workItem.buttons.add_attachment")}
                        </Button>
                    </Col>
                </Row>
            </Form>
        </Card>
    );
};

export default PreventiveWorkItemCard;