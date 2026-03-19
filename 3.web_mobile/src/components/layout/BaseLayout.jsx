import {
  TransactionOutlined,
  BarChartOutlined,
  CameraOutlined,
  EllipsisOutlined,
  SolutionOutlined,
  ReconciliationOutlined,
  SettingOutlined,
  ReloadOutlined,
  UserAddOutlined,
  InfoCircleOutlined,
  MonitorOutlined,
  NodeIndexOutlined,
  ContactsOutlined,
  MailOutlined,
  CloseOutlined,
  CompassOutlined,
  CalendarOutlined,
  FileSearchOutlined,
  PhoneOutlined,
  HeatMapOutlined,
  HomeOutlined,
  AppstoreAddOutlined,
  FileDoneOutlined,
  FileProtectOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Drawer, Layout, Menu, Space, Row, Col } from "antd";
import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { staticPath } from "../../router/RouteConfig";
import "./BaseLayout.scss";
import useAuth from "../../contexts/authContext";
import AddToHomeScreen from "@ideasio/add-to-homescreen-react";
import { checkPermission } from "../../helper/permission-helper";
import { permissionCodeConstant } from "../../utils/permissionCodeConstant";
import useFooter from "../../contexts/footerContext";
import { useTranslation } from "react-i18next";

export default function BaseLayout(props) {
  const { innerWidth: width, innerHeight: height } = window;
  const { footerActive, setFooterActive } = useFooter();
  const [openMore, setOpenMore] = useState(false);
  const [openSupport, setOpenSupport] = useState(false);
  const navigate = useNavigate();
  const { permissions } = useAuth();
  const { t } = useTranslation();

  const onCloseMore = () => {
    setOpenMore(false);
  };

  return (
    <Layout className="base-layout">
      {/* <AddToHomeScreen /> */}
      <div className="site-layout-content">{props.children}</div>
      {/* Custom Bottom Navigation */}
      <div className="custom-bottom-nav">
        <div
          className={`nav-item ` + (footerActive === "1" && "nav-item-active")}
          onClick={() => {
            setFooterActive("1");
            navigate(staticPath.realtime);
          }}
        >
          <BarChartOutlined className="nav-icon" />
          <div>{t("baseLayout.nav.dashboard")}</div>
        </div>
        {(checkPermission(
          permissions,
          permissionCodeConstant.ticket_view_list
        ) ||
          checkPermission(
            permissions,
            permissionCodeConstant.breakdown_view_list
          )) && (
          <div
            className={
              `nav-item ` + (footerActive === "2" && "nav-item-active")
            }
            onClick={() => {
              setFooterActive("2");
              navigate(staticPath.myBreakdown);
            }}
          >
            <ReconciliationOutlined className="nav-icon" />
            <div>{t("baseLayout.nav.ticket")}</div>
          </div>
        )}

        <button
          className="add-btn"
          onClick={() => {
            setFooterActive("0");
            navigate(staticPath.createTechnicalSupportTicket);
          }}
        >
          +
        </button>
        {checkPermission(
          permissions,
          permissionCodeConstant.schedule_preventive_my_task_view_list
        ) && (
          <div
            className={
              `nav-item ` + (footerActive === "3" && "nav-item-active")
            }
            onClick={() => {
              setFooterActive("3");
              navigate(staticPath.priventive);
            }}
          >
            <SolutionOutlined className="nav-icon" />
            <div>{t("baseLayout.nav.work")}</div>
          </div>
        )}
        <div
          className={`nav-item ` + (footerActive === "4" && "nav-item-active")}
          onClick={() => setOpenMore(true)}
        >
          <EllipsisOutlined className="nav-icon" />
          <div>{t("baseLayout.nav.more")}</div>
        </div>
      </div>
      <Drawer
        placement="bottom"
        className="drawer-more-function"
        onClose={onCloseMore}
        height="auto"
        closable={false}
        open={openMore}
      >
        <Row className="" gutter={12}>
          {checkPermission(
            permissions,
            permissionCodeConstant.asset_view_list
          ) && (

            <Col span={24} className="function-container">
              <div
                className="function-item"
                onClick={() => {
                  navigate(staticPath.assetMaintenance);
                  setOpenMore(false);
                }}
              >
                <InfoCircleOutlined className="icon-function" />
                <span className="title-function">
                  {t("baseLayout.nav.asset")}
                </span>
              </div>
            </Col>
          )}


          {checkPermission(
            permissions,
            permissionCodeConstant.schedule_preventive_view_list
          ) && (
            <Col span={24} className="function-container">
              <div
                className="function-item"
                onClick={() => {
                  navigate(staticPath.schedulePreventive);
                  setOpenMore(false);
                }}
              >
                <NodeIndexOutlined className="icon-function" />
                <span className="title-function">
                  {t("baseLayout.nav.maintenance")}
                </span>
              </div>
            </Col>
          )}
          <Col span={24} className="function-container">
            <div
              className="function-item"
              onClick={() => {
                navigate(staticPath.calibrationWork);
                setOpenMore(false);
              }}
            >
              <CalendarOutlined className="icon-function" />
              <div className="title-function">
                {t("baseLayout.nav.calibration_work")}
              </div>
            </div>
          </Col>
          <Col span={24} className="function-container">
            <div
              className="function-item"
              onClick={() => {
                navigate(staticPath.myCalibrationWork);
                setOpenMore(false);
              }}
            >
              <CompassOutlined className="icon-function" />
              <div className="title-function">
                {t("baseLayout.nav.my_calibration_work")}
              </div>
            </div>
          </Col>
          <Col span={24} className="function-container">
            <div
              className="function-item"
              onClick={() => {
                navigate(staticPath.sparePartRequestBreakdown);
                setOpenMore(false);
              }}
            >
              <FileProtectOutlined className="icon-function" />
              <div className="title-function">
                {t("spare_part.approval_of_replacement_parts_for_malfunctions")}
              </div>
            </div>
          </Col>
          <Col span={24} className="function-container">
            <div
              className="function-item"
              onClick={() => {
                navigate(staticPath.sparePartRequestSchedulePreventive);
                setOpenMore(false);
              }}
            >
              <FileDoneOutlined className="icon-function" />
              <div className="title-function">
                {t("spare_part.approval_of_maintenance_parts")}
              </div>
            </div>
          </Col>

          <Col span={24} className="function-container">
            <div
              className="function-item"
              onClick={() => {
                navigate(staticPath.contract);
                setOpenMore(false);
              }}
            >
              <AppstoreAddOutlined className="icon-function" />
              <div
                className="title-function"
              // style={{
              //   maxWidth: 120,
              //   margin: "0 auto",
              //   whiteSpace: "nowrap",
              //   overflow: "hidden",
              //   textOverflow: "ellipsis",
              // }}
              >
                {t("baseLayout.nav.contract")}
              </div>
            </div>
          </Col>
          <Col span={24} className="function-container">
            <div
              className="function-item"
              onClick={() => {
                navigate(staticPath.report);
                setOpenMore(false);
              }}
            >
              <FileSearchOutlined className="icon-function" />
              <div className="title-function">{t("baseLayout.nav.report")}</div>
            </div>
          </Col>
          <Col span={24} className="function-container">
            <span
              className="function-item"
              onClick={() => {
                navigate(staticPath.settings);
                setOpenMore(false);
              }}
            >
              <SettingOutlined className="icon-function" />
              <div className="title-function">
                {t("baseLayout.nav.settings")}
              </div>
            </span>
          </Col>
          <Col span={24} className="function-container">
            <div
              className="function-item"
              onClick={() => {
                setOpenMore(false);
                setOpenSupport(true);
              }}
            >
              <ContactsOutlined className="icon-function" />
              <div className="title-function">
                {t("baseLayout.nav.contact")}
              </div>
            </div>
          </Col>
        </Row>
      </Drawer>

      <Drawer
        placement="bottom"
        className="drawer-more-function"
        onClose={() => setOpenSupport(false)}
        height="auto"
        open={openSupport}
        title={t("baseLayout.support.title")}
      >
        <div
          style={{
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 16px",
            background: "#f5f5f5",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 16,
            fontWeight: 500,
          }}
        >
          <div className="mb-2">
            <HomeOutlined style={{ marginRight: 8 }} />
            <span>CÔNG TY TNHH CÔNG NGHỆ VÀ DỊCH VỤ PNP SOLUTION</span>
          </div>
          <div className="mb-2">
            <PhoneOutlined style={{ marginRight: 8 }} />
            <span>0385389383</span>
          </div>
          <div className="mb-2">
            <MailOutlined style={{ marginRight: 8 }} />
            <span>apnpsolution@gmail.com</span>
          </div>
          <div className="mb-2">
            <HeatMapOutlined style={{ marginRight: 8 }} />
            <span>
              P.2 – Nhà G4B - TT Thành Công, Phường Giảng Võ, TP Hà Nội, Việt
              Nam
            </span>
          </div>
        </div>
      </Drawer>
    </Layout>
  );
}
