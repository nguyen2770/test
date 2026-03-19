import { Button, Card, Form, Input, message, Modal } from "antd";
import * as _unitOfWork from "../../api";
import { useTranslation } from "react-i18next";

const ComfirmLogoutModal = ({ open, onCancel, onCallback }) => {
  const { t } = useTranslation();
  const [formCancel] = Form.useForm();

  const onClickSubmit = async () => {
    onCallback({ ...formCancel.getFieldsValue() });
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
      <Card title={t("preventive.checkout.title")}>
        <Form form={formCancel} layout="vertical" onFinish={onClickSubmit}>
          <Form.Item
            name="comment"
            rules={[
              {
                required: true,
                message: t("preventive.checkout.validation.comment_required"),
              },
            ]}
          >
            <Input.TextArea
              rows={6}
              placeholder={t("preventive.checkout.placeholders.comment")}
            />
          </Form.Item>
          <div style={{ textAlign: "right", marginTop: 5 }}>
            <Button onClick={onCancel} style={{ marginRight: 8 }}>
              {t("preventive.refuse.buttons.no")}
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              style={{ padding: "0 30px" }}
            >
              {t("breakdown.workSession.logout")}
            </Button>
          </div>
        </Form>
      </Card>
    </Modal>
  );
};

export default ComfirmLogoutModal;
