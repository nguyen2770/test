import { LeftOutlined } from "@ant-design/icons";
import { Drawer, Input } from "antd";
import { useTranslation } from "react-i18next";

const SearchPreventive = ({ open, onClose }) => {
    const { t } = useTranslation();

    const onCancelSearch = () => {
        onClose();
    };

    return (
        <Drawer
            placement="right"
            closable={false}
            open={open}
            width="100%"
            bodyStyle={{ padding: 0 }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    height: 56,
                    background: '#ffffff',
                    color: "rgb(143, 141, 141)",
                    padding: '0 16px',
                    fontWeight: 600,
                    fontSize: 20,
                    boxSizing: 'border-box',
                }}
            >
                <LeftOutlined
                    style={{ fontSize: 22, marginRight: 16, cursor: 'pointer' }}
                    onClick={onCancelSearch}
                />
                <Input
                    placeholder={t("preventive.search.placeholder.code")}
                    allowClear
                />
            </div>
        </Drawer>
    );
};

export default SearchPreventive;