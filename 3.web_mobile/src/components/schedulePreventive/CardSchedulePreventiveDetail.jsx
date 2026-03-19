import { useState } from "react";
import { MessageOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useTranslation } from "react-i18next";

const CardSchedulePreventiveDetail = ({ schedulePreventive }) => {
    const [isConfirmCancel, setIsConfirmCancel] = useState(false);
    const [isConfirmReopen, setIsConfirmReopen] = useState(false);
    const { t } = useTranslation();
    return (
        <div style={{ background: "#f8f8f8" }}>
            <div
                style={{
                    position: "fixed",
                    bottom: 75,
                    right: 20,
                    zIndex: 1000,
                }}
            >
                <Button
                    type="primary"
                    shape="circle"
                    icon={<MessageOutlined style={{ fontSize: 26 }} />}
                    style={{
                        width: 64,
                        height: 64,
                        border: "none",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                    }}
                    onClick={() => {
                        console.log("Floating message button clicked");
                    }}
                    aria-label={t("schedulePreventive.detail.floating_message_button")}
                />
            </div>
        </div>
    );
}

export default CardSchedulePreventiveDetail;