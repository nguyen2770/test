import React from "react";
import { Modal, Radio, Input, Button, Card, Form, Row } from "antd";
import * as _unitOfWork from "../../api";
import ShowSuccess from "../../components/modal/result/successNotification";
import ShowError from "../../components/modal/result/errorNotification";
import { useTranslation } from "react-i18next";
const { TextArea } = Input;

const options = {
    entire: 'entire',
    fromTask: 'fromTask'
};

const ConfirmReOpenModal = ({ open, onCancel, schedulePreventive, onCallback }) => {
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const option = Form.useWatch("entire", form);
    const selectedTask = Form.useWatch("selectedTask", form);

    const onCancelComfirmReOpen = () => {
        onCancel();
        form.resetFields();
    };

    const onFinish = async () => {
        const formValues = form.getFieldsValue();
        const data = {
            schedulePreventive: schedulePreventive._id || schedulePreventive.id,
            comment: formValues.comment,
        };
        if (option === options.fromTask && selectedTask) {
            data.schedulePreventiveTask = selectedTask;
        }
        const res = await _unitOfWork.schedulePreventive.comfirmReOpenSchedulePreventive(data);
        if (res && res.code === 1) {
            ShowSuccess('topRight', t("preventiveSchedule.modal.reopen_title"), t("preventiveSchedule.messages.reopen_success"));
            onCallback();
        } else {
            ShowError('topRight', t("preventiveSchedule.modal.reopen_title"), res?.message || t("preventiveSchedule.messages.reopen_error"));
        }
    };

    return (
        <Modal
            open={open}
            onCancel={onCancelComfirmReOpen}
            footer={null}
            width={"95%"}
            closable={false}
            className="custom-modal"
        >
            <Card title={t("preventiveSchedule.modal.reopen_title")}>
                <Form
                    form={form}
                    onFinish={onFinish}
                    initialValues={{ entire: options.entire }}
                >
                    <Row>
                        <Form.Item name="entire" style={{ fontWeight: 600 }}>
                            <Radio.Group>
                                <Radio value={options.entire}>{t("preventiveSchedule.buttons.reopen_all")}</Radio>
                                <Radio value={options.fromTask}>{t("preventiveSchedule.buttons.reopen_by_task")}</Radio>
                            </Radio.Group>
                        </Form.Item>
                    </Row>

                    {option === options.fromTask && (
                        <Row>
                            <Form.Item name="selectedTask" label={t("preventiveSchedule.reopen.select_task")}>
                                <Radio.Group>
                                    {schedulePreventive?.tasks?.length > 0 &&
                                        schedulePreventive.tasks.map((item) => (
                                            <Radio key={item._id} value={item._id || item.id} style={{ display: 'block' }}>
                                                {item.taskName}
                                            </Radio>
                                        ))}
                                </Radio.Group>
                            </Form.Item>
                        </Row>
                    )}

                    <Form.Item name="comment">
                        <TextArea
                            placeholder={t("preventiveSchedule.fields.comment")}
                            rows={3}
                        />
                    </Form.Item>

                    <div style={{ textAlign: "right", marginTop: 16 }}>
                        <Button onClick={onCancelComfirmReOpen} style={{ marginRight: 8 }}>
                            {t("preventiveSchedule.buttons.cancel")}
                        </Button>
                        <Button type="primary" htmlType="submit">
                            {t("preventiveSchedule.buttons.submit")}
                        </Button>
                    </div>
                </Form>
            </Card>
        </Modal>
    );
};

export default ConfirmReOpenModal;