import React, { useState, useRef, useEffect } from "react";
import { Input, Button, Avatar, Row, Col, Drawer } from "antd";
import { ArrowLeftOutlined, SendOutlined } from "@ant-design/icons";
import { PAGINATION } from "../../utils/constant";
import * as _unitOfWork from "../../api";
import { parseDateHH } from "../../helper/date-helper";
import { useTranslation } from "react-i18next";
const userLocal = JSON.parse(localStorage.getItem("USER"));
const SchedulePreventiveCommentDrawer = ({ open, onClose, schedulePreventive }) => {
    const [comments, setComments] = useState([]);
    const [input, setInput] = useState("");
    const inputRef = useRef(null);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(PAGINATION);
    const [totalRecord, setTotalRecord] = useState(0);
    const { t } = useTranslation();
    useEffect(() => {
        if (open) {
            fetchGetSchedulePreventiveComment();
        }

    }, [open]);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [comments]);

    const fetchGetSchedulePreventiveComment = async () => {
        let payload = {
            page: page,
            limit: PAGINATION.limit,
            schedulePreventive: schedulePreventive._id ?? schedulePreventive.id,
        };
        let res = await _unitOfWork.schedulePreventive.getSchedulePreventiveComments(payload);
        if (res && res.code === 1) {
            setComments(res.result?.results);
            setTotalRecord(res.result?.totalResults);
        }
    };
    const handleSend = async () => {
        if (!input.trim()) return;
        const payload = {
            schedulePreventive: schedulePreventive._id ?? schedulePreventive.id,
            comments: input,
        };
        const res = await _unitOfWork.schedulePreventive.createSchedulePreventiveComment(payload);
        if (res && res.code === 1) {
            setInput("");
            fetchGetSchedulePreventiveComment();
        }
    };

    return (
        <div
            style={{
                background: "#f7f9fb",
                borderRadius: 8,
                display: "flex",
                flexDirection: "column",
                paddingBottom: 2,
            }}
        >
            <Drawer
                placement="right"
                closable={false}
                open={open}
                width="100%"
                bodyStyle={{ padding: 0 }}
            >
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                    }}
                >
                    {/* Header */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        height: 56,
                        background: '#23457b',
                        color: '#fff',
                        padding: '0 16px',
                        fontWeight: 600,
                        fontSize: 20,
                    }}>
                        <ArrowLeftOutlined
                            style={{ fontSize: 22, marginRight: 16, cursor: 'pointer' }}
                            onClick={onClose}
                        />
                        <span style={{ flex: 1 }}>{t("preventive.comment.title")}</span>
                    </div>

                    {/* Title */}
                    <div style={{ fontWeight: 600, fontSize: 17, marginTop: 10, textAlign: 'center' }}>
                        {schedulePreventive?.assetMaintenance?.assetModel?.asset?.assetName}
                    </div>

                    {/* Info */}
                    <div style={{ padding: '10px' }}>
                        <Row style={{ textAlign: 'center' }}>
                            <Col span={12}>
                                <div style={{ color: '#aaa', fontSize: 15 }}>{t("preventive.comment.code", { defaultValue: "Mã của thẻ" })}</div>
                                <div style={{ color: '#00b96b', fontWeight: 500, fontSize: 17 }}>
                                    {schedulePreventive?.code}
                                </div>
                            </Col>
                            <Col span={12}>
                                <div style={{ color: '#aaa', fontSize: 15 }}>{t("preventive.comment.open_date", { defaultValue: "Ngày mở" })}</div>
                                <div style={{ color: '#00b96b', fontWeight: 500, fontSize: 17 }}>
                                    {schedulePreventive?.createdAt
                                        ? new Date(schedulePreventive.createdAt).toLocaleString('vi-VN')
                                        : 'null'}
                                </div>
                            </Col>
                        </Row>
                    </div>
                    <div style={{ borderBottom: '2px dashed #ccc' }} />
                    {/* Comments scrollable area */}
                    <div style={{
                        flex: 1,
                        overflowY: "auto",
                        marginTop: 12,
                        display: "flex",
                        flexDirection: "column-reverse",
                        padding: "0 16px",
                    }}>
                        {comments &&
                            Array.isArray(comments) &&
                            [...comments].map((c) => {
                                const isMe = c.createdBy.id === userLocal.id;
                                return (
                                    <div
                                        key={c.id}
                                        style={{
                                            display: "flex",
                                            flexDirection: isMe ? "row-reverse" : "row",
                                            alignItems: "flex-end",
                                            marginBottom: 12,
                                        }}
                                    >
                                        <Avatar
                                            style={{
                                                background: isMe ? "#1677ff" : "#bfbfbf",
                                                margin: "0 8px",
                                                color: "#fff",
                                            }}
                                        >
                                            {c.createdBy?.username?.[0] || ""}
                                        </Avatar>
                                        <div
                                            style={{
                                                maxWidth: 400,
                                                background: isMe ? "#4285f4" : "#e6f4ff",
                                                color: isMe ? "#fff" : "#222",
                                                borderRadius: 12,
                                                padding: "10px 16px",
                                                wordBreak: "break-word",
                                                textAlign: "left",
                                            }}
                                        >
                                            <div style={{ fontSize: 15 }}>{c?.comments}</div>
                                            <div style={{
                                                fontSize: 12,
                                                color: isMe ? "#e0e0e0" : "#000000",
                                                textAlign: "right",
                                                marginTop: 4,
                                            }}>
                                                <span style={{ fontWeight: 500 }}>{c.createdBy?.username}</span>{" "}
                                                - {parseDateHH(c?.createdDate)}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        <div ref={inputRef} />
                    </div>

                    {/* Input fixed at bottom */}
                    <div style={{
                        borderTop: "1px solid #eee",
                        padding: "12px 16px",
                        background: "#fff",
                    }}>
                        <Input.TextArea
                            rows={2}
                            maxLength={500}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={t("preventive.comment.placeholder", { defaultValue: "Nhập nội dung bình luận..." })}
                            onPressEnter={(e) => {
                                if (!e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            style={{ resize: "none" }}
                        />
                        <div style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            marginTop: 8,
                            gap: 8,
                        }}>
                            <span style={{ color: "#888", alignSelf: "center", padding: 8 }} >
                                {input.length}/500
                            </span>
                            <Button
                                type="primary"
                                icon={<SendOutlined />}
                                onClick={handleSend}
                                disabled={!input.trim()}
                                style={{ color: "#fff", fontWeight: 600, display: "flex", alignItems: "center" }}
                            >
                                {t("preventive.comment.send", { defaultValue: "Gửi" })}
                            </Button>
                        </div>
                    </div>
                </div>
            </Drawer>

        </div>
    );
};

export default React.memo(SchedulePreventiveCommentDrawer);