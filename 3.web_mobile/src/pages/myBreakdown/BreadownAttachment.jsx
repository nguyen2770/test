import React, { useState, useEffect, useRef } from "react";
import { Row, Col, message } from "antd";
import { ArrowLeftOutlined, PlusCircleFilled } from "@ant-design/icons";
import * as _unitOfWork from "../../api";
import { useNavigate, useParams } from "react-router-dom";
import AttachmentModal from "../../components/modal/Attachment/AttachmentModal";
import { useTranslation } from "react-i18next";

export default function BreakdownAttachment() {
    const params = useParams();
    const navigate = useNavigate();
    const [breakdownAttachments, setBreakdownAttachments] = useState([]);
    const [fileList, setFileList] = useState([]);
    const fileInputRef = useRef();
    const {t} = useTranslation()
    useEffect(() => {
        fetchGetAllBreakdownAttachment();
    }, []);

    const fetchGetAllBreakdownAttachment = async () => {
        let res = await _unitOfWork.breakdown.getAllBreakdownAttachment({ breakdown: params.id });
        if (res && res.code === 1) {
            const resources = res.data.map((data) => data.resource);
            setBreakdownAttachments(res.data);
            const fileList = resources.map((doc) => ({
                ...doc,
                id: doc?.id,
                name: doc?.fileName,
                src: _unitOfWork.resource.getImage(doc?.id),
                supportDocumentId: doc?.id,
            }));
            setFileList(fileList);
        }
    };

    const handleFileChange = async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        const file = files[0];

        let resource;
        if (file) {
            let resUpload = await _unitOfWork.resource.uplresourceoadImage({ file: file });
            if (resUpload && resUpload?.code === 1) {
                resource = resUpload.resourceId;
            } else {
                message.error(t("common.messages.errors.upload"));
                return;
            }
        }
        let res = await _unitOfWork.breakdown.createBreakdownAttachment({
            resource: resource,
            breakdown: params.id
        });
        if (res && res.code === 1) {
            message.success(t("common.messages.success.upload"));
            fetchGetAllBreakdownAttachment();
        }
        else {
            message.error(t("common.messages.errors.upload"));
        }

    };


    return (
        <div
            style={{
                background: "#f7f9fb",
                borderRadius: 2,
                height: "calc(100vh - 56px)",
                display: "flex",
                flexDirection: "column",
                paddingBottom: 2,
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    height: 56,
                    background: '#23457b',
                    color: '#fff',
                    padding: '0 16px',
                    fontWeight: 600,
                    fontSize: 20,
                    boxSizing: 'border-box',
                }}
            >
                <ArrowLeftOutlined
                    style={{ fontSize: 22, marginRight: 16, cursor: 'pointer' }}
                    onClick={() => navigate(-1)}
                />
                <span style={{ flex: 1 }}>{t("breakdown.close.fields.attachments")}</span>
            </div>
            <Row gutter={24} className="p-2">
                {fileList.map((file, index) => (
                    <Col span={12} key={index} >
                        <AttachmentModal file={file} breakdownAttachments={breakdownAttachments} />

                    </Col>
                ))}
            </Row>
            <input
                ref={fileInputRef}
                type="file"
                style={{ display: "none" }}
                onChange={handleFileChange}
            />
            {/* Nút thêm mới (nếu cần) */}
            <div
                style={{
                    position: "fixed",
                    right: 20,
                    bottom: 80,
                    zIndex: 10,
                    fontSize: 50,
                    color: "#1890ff",
                    cursor: "pointer",
                }}
                onClick={() => fileInputRef.current?.click()}
            >
                <PlusCircleFilled />
            </div>
        </div>
    );
};

