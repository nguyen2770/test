import {
    DeleteOutlined,
    PlusOutlined
} from "@ant-design/icons";
import { Button, Card, Col, Modal, Row, Table, Tooltip } from "antd";
import { baseURL } from "../../../../api/config";
import * as _unitOfWork from "../../../../api";
import Comfirm from "../../../../components/modal/Confirm";
import { useState } from "react";
import FileViewerCustom from "../../../../components/fileViewer";
import { useTranslation } from "react-i18next";

export default function QuotationAttachment({
    attachments,
    handleAdd,
    handleDelete
}) {
    const { t } = useTranslation();
    const [previewFile, setPreviewFile] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const handlePreviewFile = (resourceId, record) => {
        if (!resourceId && !record.resourceId) return;
        const file = {
            name:
                resourceId?.fileName +
                resourceId?.extension ||
                record?.fileName + record?.extension,
            src: `${baseURL}/resource/image/${resourceId?.id || record.resourceId
                }`
        };
        setPreviewFile(file);
        setIsModalVisible(true);
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
        setPreviewFile(null);
    };

    const columns = [
        {
            title: t("purchaseQuotation.tableDetail.index"),
            dataIndex: "key",
            align: "center",
            width: 40,
            render: (_text, _record, index) => index + 1
        },
        {
            title: t("purchaseQuotation.attachment.file_type"),
            dataIndex: "resourceType",
            align: "center",
            width: 180
        },
        {
            title: t("purchaseQuotation.attachment.document_field"),
            dataIndex: "resourceId",
            align: "center",
            width: 250,
            render: (resourceId, record) => {
                if (!resourceId && !record.resourceId)
                    return t("purchaseQuotation.attachment.no_file");
                const fileName = resourceId?.fileName || record?.fileName;
                return (
                    <Button
                        type="link"
                        style={{
                            maxWidth: "100%",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                        }}
                        onClick={() => handlePreviewFile(resourceId, record)}
                    >
                        {fileName}
                    </Button>
                );
            }
        },
        ...(handleDelete
            ? [
                {
                    title: t("purchaseQuotation.tableDetail.action"),
                    dataIndex: "action",
                    align: "center",
                    width: 90,
                    render: (_, record) => (
                        <Tooltip title={t("purchase.actions.delete")}>
                            <Button
                                type="primary"
                                danger
                                icon={<DeleteOutlined />}
                                size="small"
                                className="ml-2"
                                onClick={() =>
                                    Comfirm(
                                        t("purchase.messages.confirm_delete"),
                                        () => handleDelete(record.resourceId)
                                    )
                                }
                            />
                        </Tooltip>
                    )
                }
            ]
            : [])
    ];

    return (
        <div>
            <Row className="mb-1">
                {handleAdd && (
                    <Col span={24} style={{ textAlign: "right" }}>
                        <Button
                            key="1"
                            type="primary"
                            onClick={handleAdd}
                            className="ml-3"
                        >
                            <PlusOutlined />
                            {t("purchaseQuotation.attachment.add_button")}
                        </Button>
                    </Col>
                )}
            </Row>
            <Table
                key={"id"}
                rowKey="id"
                columns={columns}
                dataSource={attachments}
                bordered
                pagination={handleDelete ? true : false}
            />
            <Modal
                open={isModalVisible}
                onCancel={handleCloseModal}
                footer={null}
                centered
                width={1000}
            >
                {previewFile && <Card><FileViewerCustom file={previewFile} /></Card>}
            </Modal>
        </div>
    );
}