import React, { useEffect, useRef, useState } from 'react';
import { Row, Col, Form, Button, Input, Drawer, Checkbox, Spin, Pagination, message, Timeline, Upload } from 'antd';
import { ArrowLeftOutlined, PhoneOutlined, RedoOutlined, CheckSquareFilled, PhoneFilled, UserOutlined, PaperClipOutlined } from '@ant-design/icons';
import SignaturePad from 'react-signature-canvas';
import './styles/HistoryAssignUserOfSchedulePreventiveTask.scss'
import { parseToLabel } from '../../helper/parse-helper';
import * as _unitOfWork from "../../api";
import { parseDatetime } from '../../helper/date-helper';
import ShowError from '../modal/result/errorNotification';
import ShowSuccess from '../modal/result/successNotification';
import { useTranslation } from "react-i18next";
// Chưa làm scroll khi kéo hết
const CloseSchedulePreventiveDrawer = ({ open, onClose, schedulePreventive, onCallback }) => {
    const [formClose] = Form.useForm();
    const [fileList, setFileList] = useState([]);
    const sigPadRef = useRef();
    const { t } = useTranslation();
    const onFinish = async () => {
        const formValues = formClose.getFieldsValue();
        const signatureData = sigPadRef.current?.isEmpty()
            ? null
            : sigPadRef.current.getCanvas().toDataURL('image/png');
        formValues.signature = signatureData;
        try {
            const res = await _unitOfWork.schedulePreventive.comfirmCloseSchedulePreventive({
                schedulePreventive: schedulePreventive._id || schedulePreventive.id,
                comment: formValues.comment,
                closeSignature: formValues.signature
            }
            );
            if (res && res.code === 1) {
                onCallback();
                ShowSuccess('topRight', t('modal.notifications.error_default_title', { defaultValue: 'Thông báo' }), t('preventiveSchedule.messages.close_success', { defaultValue: 'Đóng lịch bảo trì định kỳ thành công' }));
                formClose.resetFields();
            } else {
                ShowError('topRight', t('modal.notifications.error_default_title', { defaultValue: 'Thông báo' }), res?.message || t('preventiveSchedule.messages.close_error', { defaultValue: 'Đóng lịch bảo trì định kỳ thất bại' }));
            }
        } catch (error) {
            console.error("Error confirming close schedule preventive:", error);
        }
    }
    return (
        <Drawer
            placement="right"
            closable={false}
            open={open}
            width="100%"
            className='drawer-task-history-assign-user'
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
                <span style={{ flex: 1 }}>{t("preventiveSchedule.modal.close_title", { defaultValue: "Đóng bảo trì" })}</span>
            </div>
            <div style={{ fontWeight: 600, fontSize: 18, marginTop: "10px", textAlign: 'center' }}>
                {schedulePreventive?.preventive?.preventiveName}
            </div>

            {/* Card thông tin */}
            <div style={{ padding: '15px' }}>
                <Row style={{ textAlign: 'center' }}>
                    <Col span={12}>
                        <div style={{ color: '#aaa', fontSize: 15 }}>{t("preventiveSchedule.fields.plan_code", { defaultValue: "ID tài sản" })}</div>
                        <div style={{ color: '#00b96b', fontWeight: 500, fontSize: 17 }}>
                            {schedulePreventive?.preventive?.code}
                        </div>
                    </Col>
                    <Col span={12}>
                        <div style={{ color: '#aaa', fontSize: 15 }}>{t("preventiveSchedule.fields.start_date", { defaultValue: "Ngày mở" })}</div>
                        <div style={{ color: '#00b96b', fontWeight: 500, fontSize: 17 }}>
                            {parseDatetime(schedulePreventive?.startDate)}
                        </div>
                    </Col>
                </Row>
            </div>
            <div style={{ borderBottom: '2px dashed #ccc', marginBottom: 12 }} />
            {/* Form */}
            <Form
                layout="vertical"
                style={{ padding: '0 16px' }}
                onFinish={onFinish}
                form={formClose}
            >
                <Form.Item label={t("preventiveSchedule.fields.comment", { defaultValue: "Những ghi chú" })} name="comment">
                    <Input.TextArea rows={2} placeholder={t("preventiveSchedule.fields.comment", { defaultValue: "Nhập ghi chú" })} />
                </Form.Item>
                <Form.Item label={<span><PaperClipOutlined />{t("preventiveSchedule.attachment_label", { defaultValue: "Các tập tin đính kèm (tối đa 5 hình ảnh, 1 video, 1 audio)" })}</span>}>
                    <Upload
                        fileList={fileList}
                        onChange={({ fileList }) => setFileList(fileList)}
                        beforeUpload={() => false}
                        multiple
                        listType="picture"
                        maxCount={7}
                    >
                        <Button>{t("preventiveSchedule.attachment_choose_file", { defaultValue: "Chọn file" })}</Button>
                    </Upload>
                </Form.Item>

                <Form.Item label={t("preventiveSchedule.fields.signature", { defaultValue: "Chữ ký người dùng tài sản" })} name="signature" rules={[
                    {
                        required: true,
                        message: t("preventiveSchedule.validation.signature_required", { defaultValue: "Vui lòng ký tên trước khi nộp!" }),
                        validator: (_, value) => {
                            // Kiểm tra chữ ký có tồn tại không (base64)
                            if (
                                sigPadRef.current &&
                                !sigPadRef.current.isEmpty()
                            ) {
                                return Promise.resolve();
                            }
                            return Promise.reject(t("preventiveSchedule.validation.signature_required", { defaultValue: "Vui lòng ký tên trước khi nộp!" }));
                        }
                    }
                ]}>
                    <div style={{ border: "2px solid #b8aeae", borderRadius: "2px" }}>
                        <SignaturePad
                            ref={sigPadRef}
                            canvasProps={{ width: 320, height: 100, className: 'sigCanvas' }}
                        />
                    </div>
                    <div style={{ textAlign: "end" }}><Button onClick={() => sigPadRef.current?.clear()} style={{ marginTop: "5px", background: "#23457B", color: "#ffffff" }}>{t("modal.common.buttons.close", { defaultValue: "Xóa" })}</Button></div>
                </Form.Item>
                <Button type="primary" htmlType="submit" block size="large" style={{ fontWeight: 600 }}>
                    {t("preventiveSchedule.buttons.submit", { defaultValue: "Nộp" })}
                </Button>
            </Form>
        </Drawer>
    );
};

export default React.memo(CloseSchedulePreventiveDrawer);