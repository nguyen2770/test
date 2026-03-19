import React, { useEffect } from "react";
import { Input, Button, Form } from "antd";
import {
  LeftOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import useAuth from '../../../contexts/authContext';
import Header from "../../../components/header/index";
import { useNavigate } from "react-router-dom";
import "./userInfo.scss";
import { useTranslation } from "react-i18next";

function UpdateUserInfoLogin() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const onBack = () => navigate(-1);
  const [form] = Form.useForm();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        email: user.email,
        address: user.address
      });
    }
  }, [user]);

  const onFinish = async (value) => {
    // const payload = { user: { id: user.id, ...value } };
    // const res = await _unitOfWork.updateUserInfo(payload);
    // if (res && res.code === 1) {
    //   form.setFieldsValue(res.user);
    // }
  };

  const onClickLogout = () => logout();

  return (
    <div className="user-info-login-container">
      <Header
        title={t("users.profile.title")}
        leftContent={
          <div className="left-icon-header">
            <LeftOutlined onClick={onBack} />
          </div>
        }
        rightContent={
          <div className="left-icon-header" title={t("users.profile.buttons.logout")}>
            <LogoutOutlined onClick={onClickLogout} />
          </div>
        }
      />
      <div style={{ margin: "1rem" }}>
        <Form
          name="userProfile"
          form={form}
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="fullName"
            label={t("users.create.fields.fullName")}
            rules={[{ required: true, message: t("users.create.validation.fullName_required") }]}
          >
            <Input size="large" placeholder={t("users.create.placeholders.fullName")} />
          </Form.Item>

          <Form.Item
            label={t("users.create.fields.contactNo")}
            name="phoneNumber"
            rules={[{ required: true, message: t("users.create.validation.contactNo_required") }]}
          >
            <Input size="large" placeholder={t("users.create.placeholders.contactNo")} />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: t("users.profile.validation.email_required") }]}
          >
            <Input size="large" placeholder="Email" />
          </Form.Item>

          <Form.Item
            label={t("users.profile.fields.address")}
            name="address"
            rules={[{ required: true, message: t("users.profile.validation.address_required") }]}
          >
            <Input size="large" placeholder={t("users.profile.placeholders.address")} />
          </Form.Item>

          <Form.Item className="mt-3">
            <Button block size="large" type="primary" htmlType="submit">
              {t("users.profile.buttons.update")}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}

export default UpdateUserInfoLogin;