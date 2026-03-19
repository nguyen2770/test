import { Button, Card, Form, Input, Modal } from "antd";
import * as _unitOfWork from "../../api";
import { useTranslation } from "react-i18next";

const ConfirmCancel = ({ open, onCancel, onCallback, schedulePreventive }) => {
  const { t } = useTranslation();
  const [formCancel] = Form.useForm();

  const onClickSubmit = async () => {
    let res =
      await _unitOfWork.schedulePreventive.comfirmCancelSchedulePreventive({
        id: schedulePreventive._id,
        comment: formCancel.getFieldValue("comment"),
      });
    if (res && res.code === 1) {
      onCallback();
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={800}
      closable={false}
      className="custom-modal"
    >
      <Card title={t("preventiveSchedule.modal.cancel_title")}>
        <Form form={formCancel} layout="vertical" onFinish={onClickSubmit}>
          <Form.Item
            name="comment"
            rules={[
              {
                required: true,
                message: t("preventiveSchedule.validation.reason_required"),
              },
            ]}
          >
            <Input.TextArea
              rows={6}
              placeholder={t("preventiveSchedule.fields.reason")}
            />
          </Form.Item>
          <div style={{ textAlign: "right", marginTop: 5 }}>
            <Button onClick={onCancel} style={{ marginRight: 8 }}>
              {t("breakdown.common.no")}
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              style={{ padding: "0 30px" }}
            >
              {t("preventiveSchedule.buttons.confirm_cancel")}
            </Button>
          </div>
        </Form>
      </Card>
    </Modal>
  );
};

export default ConfirmCancel;
