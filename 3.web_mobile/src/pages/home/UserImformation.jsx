import React, { useEffect, useState } from "react";
import { Drawer, Form, Avatar, Divider, Input, Button, Image } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import useAuth from "../../contexts/authContext";
import * as _unitOfWork from "../../api";
import { use } from "react";
import UpdateProfile from "./UpdateProfile";
import { set } from "store";

const UserInformation = ({ open, onClose }) => {
  const [form] = Form.useForm();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [userDetail, setUserDetail] = useState(null);
  const [showUpdateProfile, setShowUpdateProfile] = useState(false);
  useEffect(() => {
    if (open) {
      getUserById(user?.id);
    }
  }, [open, user]);

  const getUserById = async (id) => {
    const res = await _unitOfWork.user.getUserByIdPopulate(id);
    if (res) {
      setUserDetail(res);
      form.setFieldsValue({ ...res });
    }
  };

  const onCallback = () => {
    getUserById(user?.id);
    setShowUpdateProfile(false);
    };
  return (
    <Drawer
      placement="right"
      closable={false}
      open={open}
      width="100%"
      bodyStyle={{
        padding: 0,
        background: "#f0f3f7",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          height: 60,
          background: "#23457b",
          color: "#fff",
          padding: "0 20px",
          fontWeight: 600,
          fontSize: 18,
          letterSpacing: 0.3,
          flexShrink: 0,
          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
        }}
      >
        <ArrowLeftOutlined
          style={{
            fontSize: 22,
            marginRight: 16,
            cursor: "pointer",
            transition: "transform 0.2s",
          }}
          onClick={onClose}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "translateX(-3px)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
        />
        <span>{t("users.profile.title")}</span>
      </div>

      {/* Nội dung */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "10px",
          scrollbarWidth: "thin",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
            padding: 24,
            marginBottom: 24,
            textAlign: "center",
          }}
        >
          <Button
            style={{ position: "absolute", right: 20, top: 80 }}
            type="primary"
            onClick={() => setShowUpdateProfile(true)}
          >
            {t("common_buttons.edit")}
          </Button>
          <Image
          width={60}
          height={60}
            size={96}
            src={_unitOfWork.resource.getImage(userDetail?.avatar)}
            style={{
              backgroundColor: "#e5e5e5",
              marginBottom: 16,
              border: "3px solid #23457b",
            }}
          />
          <div style={{ fontSize: 20, fontWeight: 600, color: "#1e2a3a" }}>
            {userDetail?.username || "—"}
          </div>
          <div style={{ color: "#777", marginTop: 4, fontSize: 14 }}>
            {userDetail?.email || "—"}
          </div>
        </div>

        {/* Thông tin chi tiết */}
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
            padding: 24,
            maxWidth: 600,
            margin: "0 auto",
          }}
        >
          <Divider
            orientation="left"
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "#23457b",
              marginTop: 0,
            }}
          >
            {t("users.profile.detail")}
          </Divider>
          <Form
            form={form}
            layout="vertical"
            style={{
              marginTop: 8,
            }}
          >
            <Form.Item label={t("users.profile.full_name")}>
              <div className="info-box">{userDetail?.fullName || "---"}</div>
            </Form.Item>
            <Form.Item label={t("users.profile.phoneNumber")}>
              <div className="info-box">{userDetail?.contactNo || "---"}</div>
            </Form.Item>
            <Form.Item label={t("users.profile.role")}>
              <div className="info-box">{userDetail?.role?.name || "---"}</div>
            </Form.Item>
            <Form.Item label={t("users.profile.branch")}>
              <div className="info-box">
                {userDetail?.branch?.name || "---"}
              </div>
            </Form.Item>
            <Form.Item label={t("users.profile.department")}>
              <div className="info-box">
                {userDetail?.department?.departmentName || "---"}
              </div>
            </Form.Item>
          </Form>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          height: 60,
          background: "#fff",
          borderTop: "1px solid #e5e5e5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 13,
          color: "#888",
        }}
      >
        CMMS © {new Date().getFullYear()} — Maintenance Management System
      </div>
      <UpdateProfile
        open={showUpdateProfile}
        onCancel={() => setShowUpdateProfile(false)}
        onCallback={onCallback}
        user= {userDetail}
      />
    </Drawer>
  );
};

export default React.memo(UserInformation);
