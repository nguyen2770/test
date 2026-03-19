import { Button, Card, Col, Row } from "antd";
import { serviceTaskType } from "../../utils/schedulePreventive.constant";
import { parseToLabel } from "../../helper/parse-helper";
import './CardSchedulePreventiveTask.scss';
import { useState } from "react";
import HistoryAssignUserOfSchedulePreventiveTask from "../../components/Drawer/HistoryAssignUserOfSchedulePreventiveTask";
import SchedulePreventiveTaskItemsDrawer from "../../components/Drawer/SchedulePreventiveTaskItemsDrawer";
import { useTranslation } from "react-i18next";

const CardSchedulePreventiveTask = ({ task, _idx, onClickAssignUser }) => {
    const { t } = useTranslation();
    const [showHistoryAssignUser, setShowHistoryAssignUser] = useState(false);
    const [showItems, setShowItems] = useState(false);

    const showButtonAssignUser = () =>
        !!(task && !task.schedulePreventiveTaskAssignUserIsActive);

    const showButtonUserAssigned = () =>
        !!(task && task.schedulePreventiveTaskAssignUserIsActive);

    const onCloseHistory = () => setShowHistoryAssignUser(false);
    const onClickCancelShowItems = () => setShowItems(false);

    return (
        <Card
            title={`${t("preventiveSchedule.view.labels.task_name")}: ${task?.taskName}`}
            className="card-schedule-preventive-task"
            style={{ margin: 10 }}
            bodyStyle={{ padding: 10 }}
        >
            <Row>
                <Col span={8} style={{ fontSize: 12, textAlign: 'center' }}>
                    {t("preventiveSchedule.view.labels.task_type")}
                </Col>
                <Col span={8} style={{ fontSize: 12, textAlign: 'center' }}>
                    {t("preventiveSchedule.view.labels.task_sequence")}
                </Col>
                <Col span={8} style={{ fontSize: 12, textAlign: 'center' }}>
                    {t("preventiveSchedule.view.labels.task_duration")}
                </Col>
            </Row>
            <Row>
                <Col span={8} style={{ textAlign: 'center', color: 'orange', fontWeight: 600 }}>
                    {t(parseToLabel(serviceTaskType.Options, task?.taskType))}
                </Col>
                <Col span={8} style={{ textAlign: 'center', color: 'green', fontWeight: 600 }}>
                    {task?.sortIndex || (_idx + 1)}
                </Col>
                <Col span={8} style={{ textAlign: 'center', color: 'gray', fontWeight: 600 }}>
                    {task?.sla} {task?.intervalType}
                </Col>
            </Row>

            <Row style={{ marginTop: 8 }}>
                <Col span={12} className="text-center">
                    {showButtonAssignUser() && (
                        <Button
                            style={{
                                whiteSpace: 'normal',
                                height: 'auto',
                                marginRight: 8,
                                backgroundColor: '#23457b',
                                color: '#fff',
                                border: 'none',
                            }}
                            onClick={onClickAssignUser}
                        >
                            {t("preventiveSchedule.task.buttons.assign")}
                        </Button>
                    )}
                    {showButtonUserAssigned() && (
                        <Button
                            style={{
                                whiteSpace: 'normal',
                                height: 'auto',
                                marginRight: 8,
                                backgroundColor: '#23457b',
                                color: '#fff',
                                border: 'none',
                            }}
                            onClick={() => { setShowHistoryAssignUser(true); }}
                        >
                            {t("preventiveSchedule.task.buttons.assigned_engineers")}
                        </Button>
                    )}
                </Col>
                <Col span={12} className="text-center">
                    <Button
                        style={{
                            whiteSpace: 'normal',
                            height: 'auto',
                            backgroundColor: '#32CD32',
                            color: '#fff',
                            border: 'none',
                        }}
                        onClick={() => { setShowItems(true); }}
                    >
                        {t("preventiveSchedule.task.buttons.view_items")}
                    </Button>
                </Col>
            </Row>
            <HistoryAssignUserOfSchedulePreventiveTask
                open={showHistoryAssignUser}
                onClose={onCloseHistory}
                task={task}
            />
            <SchedulePreventiveTaskItemsDrawer
                open={showItems}
                schedulePreventiveTask={task}
                handleCancel={onClickCancelShowItems}
            />
        </Card>
    );
};

export default CardSchedulePreventiveTask;