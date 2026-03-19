import React, { useRef } from "react";
import { Button, message, Tooltip, Card, Row, Col, Empty, Typography, Space } from "antd";
import {
    PlusOutlined,
    DeleteOutlined,
    PaperClipOutlined,
    DownloadOutlined,
    FileOutlined,
    FilePdfOutlined,
    FileImageOutlined,
    FileWordOutlined,
    FileExcelOutlined,
    FileZipOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";

const { Text } = Typography;

export default function AttachmentModel({
    value = [],
    onChange,
    maxSizeMB = 10,
    notSize,
    notDelete,
    noCreate,
}) {
    const { t } = useTranslation();
    const inputRef = useRef();

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        let newFileList = [...value];
        for (let file of files) {
            if (file.size > maxSizeMB * 1024 * 1024) {
                message.error(
                    t("modal.attachmentUpload.messages.file_too_large", {
                        name: file.name,
                        max: maxSizeMB,
                    })
                );
                continue;
            }
            const src = await toBase64(file);
            newFileList.push({
                ...file,
                uid: `${Date.now()}-${file.name}`,
                name: file.name,
                size: file.size,
                type: file.type,
                originFileObj: file,
                src,
            });
        }
        if (onChange) onChange(newFileList);
        e.target.value = "";
    };

    const handleRemove = (idx) => {
        if (onChange) onChange(value.filter((_, i) => i !== idx));
    };

    const handleDownload = async (file) => {
        if (file.originFileObj) {
            const url = file.src;
            const link = document.createElement("a");
            link.href = url;
            link.download = file.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else if (file.src) {
            const link = document.createElement("a");
            link.href = file.src;
            link.download = file.name;
            link.target = "_blank";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const toBase64 = (file) =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });

    const getFileIcon = (file) => {
        const name = file.name?.toLowerCase() || "";
        const type = file.type?.toLowerCase() || "";

        if (type.includes("image") || /\.(jpg|jpeg|png|gif|bmp|webp)$/.test(name)) {
            return <FileImageOutlined style={{ fontSize: 28, color: "#52c41a" }} />;
        }
        if (type.includes("pdf") || /\. pdf$/.test(name)) {
            return <FilePdfOutlined style={{ fontSize: 28, color: "#ff4d4f" }} />;
        }
        if (type.includes("word") || /\.(doc|docx)$/.test(name)) {
            return <FileWordOutlined style={{ fontSize: 28, color: "#1890ff" }} />;
        }
        if (type.includes("excel") || type.includes("spreadsheet") || /\.(xls|xlsx)$/.test(name)) {
            return <FileExcelOutlined style={{ fontSize: 28, color: "#52c41a" }} />;
        }
        if (type.includes("zip") || type.includes("rar") || /\.(zip|rar|7z)$/.test(name)) {
            return <FileZipOutlined style={{ fontSize: 28, color: "#faad14" }} />;
        }
        return <FileOutlined style={{ fontSize: 28, color: "#8c8c8c" }} />;
    };

    const formatFileSize = (size) => {
        if (!size) return "";
        if (size < 1024) return `${size} B`;
        if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
        return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div style={{ background: "#fff", borderRadius: 8, padding: 12 }}>
            {/* Header */}
            <Row justify="space-between" align="middle" style={{ marginBottom: 12 }}>
                {/* <Col>
                    <Text strong style={{ fontSize: 14, color: "#10426d" }}>
                        <PaperClipOutlined style={{ marginRight: 6 }} />
                        {t("modal.attachmentUpload.title") || "Tài liệu đính kèm"}
                    </Text>
                </Col> */}
                <Col>
                    {!noCreate && (
                        <Button
                            icon={<PlusOutlined />}
                            onClick={() => inputRef.current.click()}
                            type="primary"
                            size="small"
                        >
                            {t("modal.attachmentUpload.add_button") || "Thêm"}
                        </Button>
                    )}
                </Col>
            </Row>

            <input
                ref={inputRef}
                type="file"
                multiple
                style={{ display: "none" }}
                onChange={handleFileChange}
            />

            {/* File List */}
            <div
                style={{
                    maxHeight: 300,
                    overflowY: "auto",
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                }}
            >
                {value.length === 0 ? (
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={t("modal.attachmentUpload.table.empty") || "Không có tài liệu"}
                        style={{ padding: "24px 0" }}
                    />
                ) : (
                    value.map((file, idx) => (
                        <Card
                            key={file.uid || idx}
                            size="small"
                            style={{
                                marginBottom: 8,
                                borderRadius: 8,
                                border: "1px solid #e8e8e8",
                            }}
                            bodyStyle={{ padding: 12 }}
                        >
                            <Row align="middle" gutter={12}>
                                {/* File Icon */}
                                <Col
                                    span={4}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    {getFileIcon(file)}
                                </Col>

                                {/* File Info */}
                                <Col span={notDelete ? 16 : 12}>
                                    <Text
                                        strong
                                        style={{
                                            fontSize: 13,
                                            display: "block",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        }}
                                        title={file.name}
                                    >
                                        {file.name}
                                    </Text>
                                    {!notSize && file.size && (
                                        <Text type="secondary" style={{ fontSize: 11 }}>
                                            {formatFileSize(file.size)}
                                        </Text>
                                    )}
                                </Col>

                                {/* Actions */}
                                <Col
                                    span={notDelete ? 4 : 8}
                                    style={{
                                        display: "flex",
                                        justifyContent: "flex-end",
                                    }}
                                >
                                    <Space size={8}>
                                        <Tooltip title={t("common_buttons.down_load") || "Tải về"}>
                                            <Button
                                                icon={<DownloadOutlined />}
                                                type="primary"
                                                size="small"
                                                onClick={() => handleDownload(file)}
                                                style={{ width: 32, height: 32, padding: 0 }}
                                            />
                                        </Tooltip>
                                        {!notDelete && (
                                            <Tooltip title={t("common_buttons.delete") || "Xóa"}>
                                                <Button
                                                    icon={<DeleteOutlined />}
                                                    type="primary"
                                                    danger
                                                    size="small"
                                                    onClick={() => handleRemove(idx)}
                                                    style={{ width: 32, height: 32, padding: 0 }}
                                                />
                                            </Tooltip>
                                        )}
                                    </Space>
                                </Col>
                            </Row>
                        </Card>
                    ))
                )}
            </div>

            {/* File Count */}
            {/* {value.length > 0 && (
                <Row justify="end" style={{ marginTop: 12 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {t("modal.attachmentUpload.count", { count: value.length }) ||
                            `Tổng: ${value.length} tài liệu`}
                    </Text>
                </Row>
            )} */}
        </div>
    );
}