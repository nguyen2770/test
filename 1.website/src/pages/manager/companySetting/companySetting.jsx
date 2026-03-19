import {
  Button,
  Card,
  Checkbox,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Tooltip,
} from "antd";
import React, { useEffect } from "react";
import {
  ArrowLeftOutlined,
  PlusCircleOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import * as _unitOfWork from "../../../api";
import ShowSuccess from "../../../components/modal/result/successNotification";
import ShowError from "../../../components/modal/result/errorNotification";
import { STORAGE_KEY } from "../../../utils/constant";
import { useNavigate } from "react-router-dom";
import useHeader from "../../../contexts/headerContext";
import useAuth from "../../../contexts/authContext";
import { checkPermission } from "../../../helper/permission-helper";
import { permissionCodeConstant } from "../../../utils/permissionConstant";
import { useTranslation } from "react-i18next";

export default function CompanySetting() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { setHeaderTitle } = useHeader();
  const { permissions } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    setHeaderTitle(t("configuration.title"));
    const companySetting = JSON.parse(
      localStorage.getItem(STORAGE_KEY.COMPANY_SETTING)
    );
    if (companySetting) {
      form.setFieldsValue(companySetting);
    }
  }, []);
  const onClickFinish = async () => {
    const payload = {
      companySetting: {
        ...form.getFieldsValue(),
      },
    };
    let res = await _unitOfWork.user.updateCompanySetting(payload);
    if (res && res.code === 1) {
      ShowSuccess(t("configuration.update_success"));
      localStorage.setItem(
        STORAGE_KEY.COMPANY_SETTING,
        JSON.stringify(res.data)
      );
      form.resetFields();
      window.location.reload();
    }
  };
  return (
    <div className="">
      <Form
        className="search-form"
        form={form}
        onFinish={onClickFinish}
        labelCol={{ span: 16 }}
        wrapperCol={{ span: 8 }}
      >
        <Card
          extra={
            <>
              {/* <Button
                            style={{ marginRight: "10px" }}
                            onClick={() => navigate(-1)}
                        >
                            <ArrowLeftOutlined />
                            {t("configuration.come_back_button")}
                        </Button> */}
              {checkPermission(
                permissions,
                permissionCodeConstant.company_setting_update
              ) && (
                <Button className="" type="primary" htmlType="submit">
                  <PlusCircleOutlined />
                  {t("configuration.update_button")}
                </Button>
              )}
            </>
          }
        >
          <Row gutter={[16]} className="mb-1">
            <Col span={12}>
              <Form.Item
                label={
                  <span style={{ color: "#000" }}>
                    {t("configuration.filter_data_by_branch")}
                  </span>
                }
                name="branchDataHierarchy"
                labelAlign="left"
                valuePropName="checked"
              >
                <Checkbox></Checkbox>
              </Form.Item>
            </Col>
            <Col
              span={11}
              style={{
                textAlign: "end",
                fontSize: 25,
                fontWeight: 700,
              }}
            >
              <Tooltip title={t("note.title_note_setting_with_branch")}>
                {" "}
                <QuestionCircleOutlined />
              </Tooltip>
            </Col>
          </Row>
        </Card>
      </Form>
    </div>
  );
}
