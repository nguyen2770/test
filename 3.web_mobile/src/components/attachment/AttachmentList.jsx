import React from "react";
import { List, Card, Button } from "antd";
import { DownloadOutlined, PaperClipOutlined } from "@ant-design/icons";

export default function AttachmentList({ files = [] }) {
  const handleDownload = (file) => {
    const link = document.createElement("a");
    link.href = file.src;
    link.download = file.name;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <List
      dataSource={files}
      renderItem={(file) => (
        <Card size="small">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>
              <PaperClipOutlined /> {file.name}
            </span>
            <Button
              icon={<DownloadOutlined />}
              size="small"
              onClick={() => handleDownload(file)}
            />
          </div>
        </Card>
      )}
    />
  );
}
