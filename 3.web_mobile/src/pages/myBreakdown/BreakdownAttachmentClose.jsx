import React, { useRef } from "react";
import { Button, Table, Input, message, Tooltip } from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  PaperClipOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";

export default function BreakdownAttachmentClose({
  value = [],
  onChange,
  maxSizeMB = 10,
}) {
  const fileInputRefs = useRef({}); // lưu ref từng input theo uid
  const { t } = useTranslation();
  // Thêm dòng mới
  const handleAddRow = () => {
    const newList = [
      ...value,
      {
        uid: `${Date.now()}`,
        name: "",
        type: "",
        src: "",
        originFileObj: null,
      },
    ];
    onChange?.(newList);
  };

  // Xóa dòng
  const handleRemove = (index) => {
    const newList = [...value];
    newList.splice(index, 1);
    onChange?.(newList);
  };

  // Chọn file cho dòng cụ thể
  const handleFileChange = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > maxSizeMB * 1024 * 1024) {
      message.error(t("breakdown.attachment.errors.file_exceed", { name: file.name, max: maxSizeMB }));
      return;
    }
    const src = await toBase64(file);
    const newList = [...value];
    newList[index] = {
      ...newList[index],
      name: file.name,
      type: file.type,
      src,
      originFileObj: file,
    };
    onChange?.(newList);
  };

  // Convert file sang base64
  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const columns = [
    {
      title: t("breakdown.close.fields.attachments_file"),
      render: (_, record, index) => (
        <>
          <input
            type="file"
            style={{ display: "none" }}
            ref={(el) => (fileInputRefs.current[record.uid] = el)}
            onChange={(e) => handleFileChange(e, index)}
          />
          <Button
            icon={<UploadOutlined />}
            onClick={() => fileInputRefs.current[record.uid]?.click()}
            size="small"
          >
            {t("breakdown.attachment.file_button")}
          </Button>
        </>
      ),
    },
    {
      title: (
        <>
          <PaperClipOutlined /> {t("breakdown.close.attachments_name")}
        </>
      ),
      dataIndex: "name",
      render: (text) => (
        <Tooltip title={text}>
          <span style={{ wordBreak: "break-all" }}>{text || "---"}</span>
        </Tooltip>
      ),
    },
    {
      title: t("breakdown.attachment.columns.action"),
      width: 100,
      align: "center",
      render: (_, __, index) => (
        <Button
          icon={<DeleteOutlined />}
          danger
          size="small"
          onClick={() => handleRemove(index)}
        />
      ),
    },
  ];

  return (
    <div className="mb-4">
      <div style={{ textAlign: "right", marginBottom: 12 }}>
        <Button icon={<PlusOutlined />} onClick={handleAddRow} type="primary">
          {t("breakdown.attachment.add_row")}
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={value}
        rowKey="uid"
        pagination={false}
        size="small"
        locale={{ emptyText: t("breakdown.attachment.empty") }}
      />
    </div>
  );
}
