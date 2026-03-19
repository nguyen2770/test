import Modal from "antd/es/modal/Modal";
import React, { useEffect, useState } from "react";
import {
    ArrowLeftOutlined,
    CloseCircleOutlined,
    SearchOutlined,
    SyncOutlined,
    UploadOutlined,
} from "@ant-design/icons";
import {
    Drawer,
    Button,
    Col,
    Form,
    Input,
    Pagination,
    Row,
    Select,
    Table,
    Card,
    Radio,
    Switch,
    Upload,
    message,
} from "antd";
import { assetType, PAGINATION } from "../../utils/constant";
import * as _unitOfWork from "../../api";
import { filterOption } from "../../helper/search-select-helper";
import { parseToLabel } from "../../helper/parse-helper";
import CardItemAssetMaintenance from "../../pages/assetMaintenance/CardItemAssetMaintenance";
import { answerTypeInspection, serviceTaskType } from "../../utils/schedulePreventive.constant";
import { useTranslation } from "react-i18next";

export default React.memo(function SchedulePreventiveTaskItemsDrawer({
    open,
    handleCancel,
    schedulePreventiveTask,
    taskItems = []
}) {
    const [schedulePreventiveTaskItems, setSchedulePreventiveTaskItems] = useState([]);
    useEffect(() => {
        if (schedulePreventiveTask && schedulePreventiveTask.taskItems && schedulePreventiveTask.taskItems.length > 0) {
            setSchedulePreventiveTaskItems(schedulePreventiveTask.taskItems)
        }
    }, [schedulePreventiveTask])
    useEffect(() => {
        if (taskItems.length > 0) {
            setSchedulePreventiveTaskItems(taskItems)
        }
    }, [taskItems])
    const [form] = Form.useForm();
    const { t } = useTranslation();
    const onClose = () => {
        handleCancel();
    }
    return (
        <Drawer
            placement="right"
            closable={false}
            open={open}
            width="100%"
            bodyStyle={{ padding: 0, background: "#f8f8f8", display: "flex", flexDirection: "column", height: "100vh" }}
        >
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
                    flexShrink: 0
                }}
            >
                <ArrowLeftOutlined
                    style={{ fontSize: 22, marginRight: 16, cursor: 'pointer' }}
                    onClick={onClose}
                />
                <span style={{ flex: 1 }}>{t("schedulePreventiveTask.tooltips.view_items")}</span>
            </div>
            <div style={{ padding: '0px 16px', marginTop: '10px', fontWeight: '600', fontSize: '18px' }}>{t("schedulePreventiveTask.columns.name")} {schedulePreventiveTask?.taskName}</div>
            <div>
                {schedulePreventiveTaskItems && schedulePreventiveTaskItems?.map((taskItem, taskItemIdx) => (
                    <div
                        style={{
                            border: "1px solid #d9d9d9",
                            padding: 16,
                            marginBottom: "10px",
                            borderRadius: "8px",
                            marginTop: '6px'
                        }}
                        className="ml-3 mr-3 mb-4"
                    >
                        <div style={{ fontWeight: 500 }}>
                            <span style={{ fontWeight: "600" }}>{t("workTask.labels.task_name")} {taskItemIdx + 1} {" "}:</span>{" "}
                            {taskItem?.taskItemDescription}
                        </div>
                        <Row gutter={16}>
                            <Col span={24}>
                                {((taskItem?.schedulePreventiveTask?.taskType === serviceTaskType.inspection &&
                                    (taskItem?.answerTypeInspection === answerTypeInspection.numbericValue || taskItem?.answerTypeInspection === answerTypeInspection.value))
                                    || taskItem?.schedulePreventiveTask?.taskType === serviceTaskType.monitoring) && (
                                        <Form.Item
                                            label="Value"
                                            name={["taskItems", taskItemIdx, "value"]}
                                            rules={[{ required: true, message: t("myTask.checkin.validation.value_required") }]}
                                        >
                                            <Input />
                                        </Form.Item>
                                    )}
                                {taskItem?.answerTypeInspection === answerTypeInspection.yesNoNa && (
                                    <Form.Item
                                        label="Value"
                                        name={[
                                            "taskItems",
                                            taskItemIdx,
                                            "status",
                                        ]}
                                        rules={[
                                            { required: true, message: t("myTask.checkin.validation.value_required", { defaultValue: "Vui lòng chọn giá trị!" }) },
                                        ]}
                                    >
                                        <Radio.Group>
                                            <Radio value="yes">Yes</Radio>
                                            <Radio value="no">No</Radio>
                                            <Radio value="na">N/A</Radio>
                                        </Radio.Group>
                                    </Form.Item>
                                )}
                                {taskItem?.schedulePreventiveTask?.taskType === serviceTaskType.calibration && (
                                    <>
                                        <Form.Item
                                            label="Value"
                                            name=""
                                            initialValue={taskItem.value1}
                                            rules={[
                                                { required: true, message: t("myTask.checkin.validation.value_required", { defaultValue: "Vui lòng chọn giá trị!" }) },
                                            ]}
                                        >
                                            <Input />
                                        </Form.Item>
                                        <Form.Item
                                            label={t("myTask.checkin.fields.work_level", { defaultValue: "Mức độ công việc" })}
                                            name={[
                                                "taskItems",
                                                taskItemIdx,
                                                "status",
                                            ]}
                                            rules={[
                                                { required: true, message: t("myTask.checkin.validation.value_required", { defaultValue: "Vui lòng chọn giá trị!" }) },
                                            ]}
                                        >
                                            <Radio.Group>
                                                <Radio value="done">{t("myTask.checkin.messages.complete_task", { defaultValue: "Đã xong" })}</Radio>
                                                <Radio value="not-done">{t("myTask.checkin.messages.incomplete_task", { defaultValue: "Không hoàn thành" })}</Radio>
                                            </Radio.Group>
                                        </Form.Item>
                                    </>
                                )}
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    label={t("myTask.checkin.fields.problem_switch", { defaultValue: "Gặp vấn đề (tạo sự cố)" })}
                                    name={[
                                        "taskItems",
                                        taskItemIdx,
                                        "isProblem",
                                    ]}
                                    valuePropName="checked"
                                >
                                    <Switch className="ml-2" disabled />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    label={t("myTask.checkin.fields.attachment", { defaultValue: "Tài liệu đính kèm" })}
                                    name={["taskItems", taskItemIdx, "file"]}
                                    valuePropName="fileList"
                                    getValueFromEvent={(e) => e && e.fileList}
                                >
                                    <Upload
                                        className="ml-2"
                                        disabled
                                        name="file"
                                        listType="text"
                                        maxCount={1}
                                        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                                        showUploadList={{
                                            showPreviewIcon: true,
                                            showRemoveIcon: true,
                                        }}
                                        beforeUpload={(file) => {
                                            const isLt5M = file.size / 1024 / 1024 < 5;
                                            if (!isLt5M) {
                                                message.error(t("myTask.checkin.messages.upload_size_error", { defaultValue: "Kích thước tài liệu phải nhỏ hơn 5MB!" }));
                                            }
                                            return isLt5M ? false : Upload.LIST_IGNORE;
                                        }}
                                    >
                                        <Button icon={<UploadOutlined />}>{t("myTask.checkin.buttons.upload_file", { defaultValue: "Tải lên tài liệu" })}</Button>
                                    </Upload>
                                </Form.Item>
                            </Col>

                            <Col span={24}>
                                <Form.Item
                                    name={["taskItems", taskItemIdx, "comment"]}
                                >
                                    <Input.TextArea disabled placeholder={t("myTask.checkin.fields.comment", { defaultValue: "Ghi chú" })} autoSize={{ minRows: 3, maxRows: 5 }} />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    shouldUpdate={(prev, curr) =>
                                        prev?.taskItems?.[taskItemIdx]?.isProblem !== curr?.taskItems?.[taskItemIdx]?.isProblem
                                    }
                                    noStyle
                                >
                                    {({ getFieldValue }) =>
                                        getFieldValue([
                                            "taskItems",
                                            taskItemIdx,
                                            "isProblem",
                                        ]) ? (
                                            <Form.Item
                                                label={
                                                    <span style={{ color: "red" }}>
                                                        {t("myTask.checkin.fields.problem_description", { defaultValue: "Mô tả vấn đề" })}
                                                    </span>
                                                }
                                                name={[
                                                    "taskItems",
                                                    taskItemIdx,
                                                    "problemComment",
                                                ]}
                                                rules={[
                                                    { required: true, message: t("myTask.checkin.validation.problem_required", { defaultValue: "Nhập mô tả vấn đề!" }) },
                                                ]}
                                            >
                                                <Input.TextArea placeholder={t("myTask.checkin.fields.problem_description_placeholder", { defaultValue: "Nhập mô tả vấn đề" })} />
                                            </Form.Item>
                                        ) : null
                                    }
                                </Form.Item>
                            </Col>
                        </Row>
                    </div>
                ))}
            </div>
        </Drawer >
    );
})