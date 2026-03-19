import React, { useRef, useTransition } from "react";
import { Button, Table, message, Tooltip } from "antd";
import {
    PlusOutlined,
    DeleteOutlined,
    PaperClipOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";

export default function AttachmentComponent({
    value = [],
    onChange,
    maxSizeMB = 10,
}) {
    const inputRef = useRef();
    const {t} = useTranslation()
    // Xử lý khi chọn file
    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        let newFileList = [...value];
        for (let file of files) {
            if (file.size > maxSizeMB * 1024 * 1024) {
                message.error(`File "${file.name}" vượt quá ${maxSizeMB}MB!`);
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
                src, // base64
            });
        }
        if (onChange) onChange(newFileList);
        e.target.value = ""; // reset input
    };

    // Xóa file
    const handleRemove = (idx) => {
        if (onChange) onChange(value.filter((_, i) => i !== idx));
    };

    // Chuyển file sang base64
    const toBase64 = (file) =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });

    // Cột bảng file
    const columns = [
        // {
        //     title: "#",
        //     dataIndex: "index",
        //     align: "center",
        //     width: 60,
        //     render: (_, __, idx) => idx + 1,
        // },
        {
            title: (
                <>
                    <PaperClipOutlined /> {t("modal.attachmentUpload.table.name")}
                </>
            ),
            dataIndex: "name",
            render: (text) => (
                <Tooltip title={text}>
                    <span style={{ wordBreak: "break-all" }}>{text}</span>
                </Tooltip>
            ),
        },
        // {
        //     title: "Kích thước",
        //     dataIndex: "size",
        //     width: 150,
        //     render: (size) => `${(size / 1024).toFixed(1)} KB`,
        // },
        {
            title: t("modal.attachmentUpload.table.action"),
            dataIndex: "action",
            width: 100,
            align: "center",
            render: (_, __, idx) => (
                <Button
                    icon={<DeleteOutlined />}
                    type="primary"
                    danger
                    size="small"
                    onClick={() => handleRemove(idx)}
                />
            ),
        },
    ];

    return (
        <div className="mb-4">
            <div
                style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}
            >
                <Button
                    icon={<PlusOutlined />}
                    onClick={() => inputRef.current.click()}
                    style={{ marginBottom: 12 }}
                    type="primary"
                >
                    {t("modal.attachmentUpload.add_button")}
                </Button>
            </div>

            <input
                ref={inputRef}
                type="file"
                multiple
                style={{ display: "none" }}
                onChange={handleFileChange}
            />
            <Table
                columns={columns}
                dataSource={value}
                rowKey="uid"
                pagination={false}
                size="small"
                locale={{ emptyText: t("modal.attachmentUpload.table.empty_text") }}
            />
        </div>
    );
}
