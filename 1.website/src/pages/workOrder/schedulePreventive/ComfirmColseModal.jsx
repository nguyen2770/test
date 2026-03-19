import React from "react";
import { Modal, Row, Col, Input, Button, Typography, Divider, Card, Form } from "antd";
import { parseDateHH } from "../../../helper/date-helper";
import { schedulePreventiveStatus } from "../../../utils/constant";
import { parseToLabel } from "../../../helper/parse-helper";
import * as _unitOfWork from "../../../api";
import ShowSuccess from "../../../components/modal/result/successNotification";
import ShowError from "../../../components/modal/result/errorNotification";
import { useTranslation } from "react-i18next";
const { Text } = Typography;
const { TextArea } = Input;

const ComfirmColseModal = ({ open, onCancel, onRefresh, schedulePreventive }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const onCancelComfirm = () => {
    form.resetFields();
    onCancel();
  }
  const onFinish = async () => {
    const formValues = form.getFieldsValue();
    try {
      const res = await _unitOfWork.schedulePreventive.comfirmCloseSchedulePreventive({
        schedulePreventive: schedulePreventive._id || schedulePreventive.id,
        comment: formValues.comment,
      }
      );
      if (res && res.code === 1) {
        onRefresh();
        onCancelComfirm();
        ShowSuccess('topRight', t("preventiveSchedule.modal.close_title"), t("preventiveSchedule.messages.close_success"));
        form.resetFields();
      } else {
        ShowError('topRight', t("preventiveSchedule.modal.close_title"), res?.message || t("preventiveSchedule.messages.close_error"));
      }
    } catch (error) {
      console.error("Error confirming close schedule preventive:", error);
    }
  }

  return (
    <Modal
      open={open}
      onCancel={onCancelComfirm}
      closable={false}
      footer={null}
      width={"70%"}
      className="custom-modal"
    >
      <Card title={t("preventiveSchedule.modal.close_title")}>
        <Form form={form} onFinish={onFinish} className="p-3">
          <Row gutter={[16, 16]} >
            <Col span={3}> <Text strong>{t("preventiveSchedule.fields.plan_name")}:</Text></Col>
            <Col span={5}>
              {schedulePreventive?.preventive?.preventiveName}
            </Col>
            <Col span={3}><Text strong>{t("preventiveSchedule.fields.plan_code")}:</Text></Col>
            <Col span={5}>
              {schedulePreventive?.code}
            </Col>
            <Col span={3}> <Text strong>{t("preventiveSchedule.fields.start_date")}:</Text></Col>
            <Col span={5}>
              {parseDateHH(schedulePreventive?.startDate)}
            </Col>
            <Col span={3}> <Text strong>{t("preventiveSchedule.fields.serial")}:</Text></Col>
            <Col span={5}>
              {schedulePreventive?.preventive?.assetMaintenance?.serial}
            </Col>
            <Col span={3}> <Text strong>{t("preventiveSchedule.fields.asset_name")}:</Text></Col>
            <Col span={5}>
              {schedulePreventive?.preventive?.assetMaintenance?.assetName}
            </Col>
            <Col span={3}><Text strong>Model:</Text></Col>
            <Col span={5}>
              {schedulePreventive?.preventive?.assetMaintenance?.assetModelName}
            </Col>
            <Col span={3}>  <Text strong>{t("preventiveSchedule.fields.status")}:</Text></Col>
            <Col span={5}>
              {t(parseToLabel(schedulePreventiveStatus.Options, schedulePreventive?.status))}
            </Col>
          </Row>
          <Divider />
          <Form.Item
            name="comment"
            label=""
          >
            <TextArea rows={3} placeholder={t("preventiveSchedule.fields.comment")} />
          </Form.Item>
          <div style={{ textAlign: "right", marginTop: 16 }}>
            <Button onClick={onCancelComfirm} style={{ marginRight: 8 }}>
              {t("preventiveSchedule.buttons.cancel")}
            </Button>
            <Button type="primary" htmlType="submit">
              {t("preventiveSchedule.buttons.approve")}
            </Button>
          </div>
        </Form>
      </Card>
    </Modal>
  );
};

export default ComfirmColseModal;