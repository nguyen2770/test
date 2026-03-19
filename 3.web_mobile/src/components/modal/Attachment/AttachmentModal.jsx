import React, { useState } from "react";
import FileViewer from "react-file-viewer";
import { EyeOutlined } from "@ant-design/icons";
import { Image, Modal, Button, Tooltip } from "antd";
import iconDocx from "../../../assets/images/icons8-docs-96.png";
import iconPdf from "../../../assets/images/icons8-pdf-96.png";
import iconExel from "../../../assets/images/icons8-excel-96.png";
import iconZip from "../../../assets/images/icons8-zip-96.png";
import iconText from "../../../assets/images/icons8-text-96.png";
import iconXml from "../../../assets/images/icons8-xml-96.png";
import { FILE_EXTENSION } from "../../../utils/constant";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

export default function AttachmentModal({ file, breakdownAttachments }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentFile, setCurrentFile] = useState(null);
    const { t } = useTranslation();

    const showModal = (file) => {
        setCurrentFile(file);
        setIsModalOpen(true);
    };

    const onShowFile = (file) => {
        if (!file) return null;
        const filename = file.name.toLowerCase();
        const filePath = file.src;
        const isImage = FILE_EXTENSION.IMAGE.some((ext) => filename.endsWith(ext));

        if (filename.endsWith(".docx")) {
            return <FileViewer fileType="docx" filePath={filePath} />;
        } else if (filename.endsWith(".pdf")) {
            return <FileViewer fileType="pdf" filePath={filePath} />;
        } else if (filename.endsWith(".xlsx")) {
            return <FileViewer fileType="xlsx" filePath={filePath} />;
        } else if (isImage) {
            return (
                <div style={{ textAlign: "center" }}>
                    <Image
                        src={file.src}
                        alt={t("modal.attachmentView.image_alt")}
                        style={{ maxWidth: "100%", maxHeight: 500 }}
                    />
                </div>
            );
        } else {
            return <>{t("modal.attachmentView.cannot_preview")}</>;
        }
    };

    const renderIconFile = (file) => {
        const filename = file.name.toLowerCase();
        const isExcel = FILE_EXTENSION.EXCEL.some((ext) => filename.endsWith(ext));
        const isDocx = FILE_EXTENSION.WORD.some((ext) => filename.endsWith(ext));

        if (isDocx) return iconDocx;
        if (filename.endsWith(".pdf")) return iconPdf;
        if (isExcel) return iconExel;
        if (filename.endsWith(".zip")) return iconZip;
        if (filename.endsWith(FILE_EXTENSION.TEXT)) return iconText;
        if (filename.endsWith(FILE_EXTENSION.XML)) return iconXml;
        return file.src;
    };
    const openInNewTab = (file) => {
        if (!file?.src) return;
        window.open(file.src, "_blank");
    };
    return (
        <div style={{ margin: "16px 0" }}>
            <div
                key={file.uid}
                className="file-preview-container"
                style={{ border: "1px solid #e2dddd", width: "100%", height: "150px" }} onClick={() => openInNewTab(file)}
            >
                <div style={{ width: "100%", }}
                ><img
                        width={"100%"}
                        height={150}
                        src={renderIconFile(file)}
                        alt="file-icon"
                        style={{ marginRight: 16 }}
                    /></div>
            </div>
            <div>{dayjs(file?.createdAt).format('DD/MM/YYYY HH:mm')}</div>
            <Modal
                title={t("modal.attachmentView.title")}
                open={isModalOpen}
                onOk={() => setIsModalOpen(false)}
                onCancel={() => setIsModalOpen(false)}
                cancelText={t("modal.common.buttons.close")}
                okButtonProps={{ style: { display: "none" } }}
                width="80%"
                bodyStyle={{ minHeight: "60vh" }}
                closable={false}
            >
                {onShowFile(currentFile)}
            </Modal>
        </div>
    );
}