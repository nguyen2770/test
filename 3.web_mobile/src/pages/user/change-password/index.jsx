import React from 'react';
import { Button, Form, Input } from 'antd';
import {
    LeftOutlined,
    QrcodeOutlined,
} from "@ant-design/icons";
import Header from '../../../../components/header/index';
import useAuth from "../../../contexts/auth";
import './changePassword.scss';
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';

function ChangePassword() {
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const onBack = () => navigate(-1);

    const onFinishFormAuth = async () => {
        // await form.validateFields();
        // const payload = {
        //   userId: user?.id,
        //   ...form.getFieldsValue(),
        // };
        // const res = await _unitOfWork.changePassword(payload);
        // if (res && res.code === 1) {
        //   form.resetFields();
        //   navigate(-1);
        // }
    };

    return (
        <div className='change-password-container'>
            <Header
                title={t("modal.changePassword.title")}
                leftContent={
                    <div className='left-icon-header'>
                        <LeftOutlined onClick={onBack} />
                    </div>
                }
            />
            <Form
                form={form}
                layout="vertical"
                className='form-change-password'
                onFinish={onFinishFormAuth}
                autoComplete="off"
            >
                <Form.Item
                    name="password"
                    label={t("modal.changePassword.old_password")}
                    rules={[{ required: true, message: t("modal.changePassword.validation.required_password") }]}
                >
                    <Input.Password size='large' placeholder={t("modal.changePassword.placeholder_old")} />
                </Form.Item>

                <Form.Item
                    name="newPassword"
                    label={t("modal.changePassword.new_password")}
                    rules={[{ required: true, message: t("modal.changePassword.validation.required_password") }]}
                >
                    <Input.Password size='large' placeholder={t("modal.changePassword.placeholder_new")} />
                </Form.Item>

                <Form.Item
                    name="reNewPassword"
                    dependencies={["newPassword"]}
                    label={t("modal.changePassword.re_password")}
                    rules={[
                        {
                            required: true,
                            message: t("modal.changePassword.validation.required_repassword"),
                        },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue("newPassword") === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error(t("modal.changePassword.validation.not_match")));
                            },
                        }),
                    ]}
                >
                    <Input.Password size='large' placeholder={t("modal.changePassword.placeholder_re")} />
                </Form.Item>

                <Form.Item className='text-center'>
                    <Button type="primary" htmlType="submit" size='large'>
                        {t("modal.changePassword.confirm")}
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}

export default ChangePassword;