import "./index.scss";
import { Tabs } from "antd";
import MyCalenderTicket from "./MyCalenderTicket";
import MyCalenderTask from "./MyCalenderTask";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
const MyCalenderTicketTab = () => <MyCalenderTicket />;
const MyCalenderTaskTab = () => <MyCalenderTask />;
export default function MyCalender() {
  const navigate = useNavigate();
  const {t} = useTranslation();

  const items = [
    {
      key: "1",
      label: t("dashboard.calendar.tab_ticket"),
      children: <MyCalenderTicketTab />,
    },
    {
      key: "2",
      label: t("dashboard.calendar.tab_task"),
      children: <MyCalenderTaskTab />,
    },
  ];
  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          background: "#23457b",
          color: "#fff",
          padding: "15px",
          fontWeight: 600,
          fontSize: 20,
          position: "sticky",
          top: 0,
          right: 0,
          left: 0,
          zIndex: 1000,
        }}
      >
        <ArrowLeftOutlined
          style={{ fontSize: 22, marginRight: 16, cursor: "pointer" }}
          onClick={() => navigate(-1)}
        />
        <span style={{ flex: 1 }}>Quay lại</span>
      </div>
      <div className="p-1">
        <Tabs defaultActiveKey="1" items={items} />
      </div>
    </div>
  );
}
