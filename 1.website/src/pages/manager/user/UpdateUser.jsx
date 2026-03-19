import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Row,
  Col,
  Select,
  message,
  Card,
  Button,
  Avatar,
  Upload,
} from "antd";
import * as _unitOfWork from "../../../api";
import { useTranslation } from "react-i18next";
import { UploadOutlined, UserOutlined } from "@ant-design/icons";

export default function UpdateUser({
  open,
  onCancel,
  onRefresh,
  id,
  branchs,
  roles,
  departments,
}) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    if (id && open) {
      fetchUserDetails(id);
    }
  }, [id, open]);

  const fetchUserDetails = async (userId) => {
    try {
      const res = await _unitOfWork.user.getUserById({ userId });
      if (res) {
        form.setFieldsValue({
          ...res,
        });
      }
      if (res?.avatar) {
        setFileList([
          {
            uid: res?.avatar,
            url: _unitOfWork.resource.getImage(res?.avatar),
            supportDocumentId: res?.avatar,
            name: "avatar",
          },
        ]);
      }
    } catch (error) {
      message.error(t("users.update.messages.load_error"));
    }
  };

  const handleConfirm = async () => {
    try {
      let avatar = null;
      if (fileList.length > 0) {
        if (fileList[0].originFileObj) {
          const resUpload = await _unitOfWork.resource.uploadImage({
            file: fileList[0]?.originFileObj,
          });
          if (resUpload && resUpload.code === 1) {
            avatar = resUpload?.resourceId;
          }
        } else {
          avatar = fileList[0].supportDocumentId;
        }
      }
      const values = await form.validateFields();
      const result = {
        ...values,
        id,
      };
      if (avatar) {
        result.avatar = avatar;
      }
      const res = await _unitOfWork.user.updateUser(id, result);
      if (res) {
        message.success(t("users.update.messages.success"));
        onRefresh();
        form.resetFields();
        onCancel();
      } else {
        message.error(res?.message || t("users.update.messages.error"));
      }
    } catch {
      message.error(t("users.update.messages.validate_error"));
    }
  };
  const handleChangeUpload = async (info) => {
    let newFileList = info.fileList.slice(-1);
    setFileList(newFileList);
    if (newFileList.length > 0 && newFileList[0].originFileObj) {
      const reader = new FileReader();
      reader.readAsDataURL(newFileList[0].originFileObj);
      reader.onload = () => setAvatarUrl(reader.result);
    } else {
      setAvatarUrl(null);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      className="custom-modal"
      closable={false}
      footer={null}
      width={1200}
    >
      <Form form={form} layout="vertical" onFinish={handleConfirm}>
        <Card title={t("users.update.title")}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="fullName"
                label={t("users.create.fields.fullName")}
                rules={[
                  {
                    required: true,
                    message: t("users.create.validation.fullName_required"),
                  },
                ]}
              >
                <Input placeholder={t("users.create.placeholders.fullName")} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="email" label={t("users.create.fields.email")}>
                <Input placeholder={t("users.create.placeholders.email")} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="contactNo"
                label={t("users.create.fields.contactNo")}
                rules={[
                  {
                    required: true,
                    message: t("users.create.validation.contactNo_required"),
                  },
                ]}
              >
                <Input placeholder={t("users.create.placeholders.contactNo")} />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                name="role"
                label={t("users.create.fields.role")}
                rules={[
                  {
                    required: true,
                    message: t("users.create.validation.role_required"),
                  },
                ]}
              >
                <Select
                  allowClear
                  placeholder={t("users.create.placeholders.role")}
                  options={roles.map((item) => ({
                    value: item.id,
                    label: item.name,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="branch" label={t("users.create.fields.branch")}>
                <Select
                  allowClear
                  placeholder={t("users.create.placeholders.branch")}
                  options={branchs.map((item) => ({
                    value: item.id,
                    label: item.name,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="department"
                label={t("users.create.fields.department")}
              >
                <Select
                  allowClear
                  placeholder={t("users.create.placeholders.department")}
                  options={departments.map((item) => ({
                    value: item.id,
                    label: item.departmentName,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="username"
                label={t("users.create.fields.username")}
                rules={[
                  {
                    required: true,
                    message: t("users.create.validation.username_required"),
                  },
                ]}
              >
                <Input placeholder={t("users.create.placeholders.username")} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label={t("users.create.fields.avatar")}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <Avatar
                    size={64}
                    src={
                      avatarUrl || (fileList.length > 0 && fileList[0].url)
                        ? avatarUrl || fileList[0].url
                        : undefined
                    }
                    icon={<UserOutlined />}
                    style={{ background: "#f0f0f0" }}
                  />
                  <Upload
                    accept="image/png,image/jpeg,image/jpg"
                    showUploadList={false}
                    beforeUpload={() => false}
                    fileList={fileList}
                    onChange={handleChangeUpload}
                    maxCount={1}
                  >
                    <Button icon={<UploadOutlined />}>
                      {t("users.create.buttons.upload_avatar")}
                    </Button>
                  </Upload>
                </div>
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <div className="modal-footer">
              <Button onClick={onCancel}>
                {t("users.update.buttons.cancel")}
              </Button>
              <Button type="primary" htmlType="submit">
                {t("users.update.buttons.submit")}
              </Button>
            </div>
          </Row>
        </Card>
      </Form>
    </Modal>
  );
}
