import { Modal } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import QrCodeScan from "../qrCodeScan";

const QrScannerModal = ({ open, onClose, onScan }) => {
    return (
        <>
         
            <style>
                {`
                .qr-transparent-modal .ant-modal-content {
                    background: transparent !important;
                    box-shadow: none !important;
                }
                .qr-transparent-modal .ant-modal-body {
                    background: transparent !important;
                }
                `}
            </style>

            <Modal
                open={open}
                footer={null}
                closable={false}
                centered
                width={420}
                maskClosable={true}
                rootClassName="qr-transparent-modal"
                maskStyle={{ backgroundColor: "rgba(0,0,0,0.65)" }}
                styles={{
                    content: {
                        background: "transparent",
                        boxShadow: "none",
                    },
                    body: {
                        padding: 0,
                        background: "transparent",
                    },
                }}
            >
                <div style={{ position: "relative", width: "100%" }}>
                    <CloseOutlined
                        onClick={onClose}
                        style={{
                            position: "absolute",
                            top: 12,
                            right: 12,
                            fontSize: 26,
                            color: "#fff",
                            cursor: "pointer",
                            padding: 8,
                            background: "rgba(0,0,0,0.45)",
                            borderRadius: "50%",
                            zIndex: 10,
                        }}
                    />


                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            width: "100%",
                            marginTop: 20,
                        }}
                    >
                        <div
                            style={{
                                width: "100%",
                                maxWidth: 350,
                                borderRadius: 12,
                                overflow: "hidden",
                                boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
                                background: "#000",
                            }}
                        >
                            <QrCodeScan onCallback={onScan} />
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default QrScannerModal;
