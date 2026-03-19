import React, { useState, useRef, useEffect } from "react";
import { Input, Button, Avatar, Row, Col, Drawer } from "antd";
import { ArrowLeftOutlined, SendOutlined } from "@ant-design/icons";
import { PAGINATION } from "../../utils/constant";
import * as _unitOfWork from "../../api";
import { parseDate, parseDateHH } from "../../helper/date-helper";
import { t } from "i18next";
const userLocal = JSON.parse(localStorage.getItem("USER"));
const BreakdownComment = ({ open, onClose, dataBreakdown }) => {
  const [comments, setComments] = useState([]);
  const [input, setInput] = useState("");
  const inputRef = useRef(null);
  const [page, setPage] = useState(PAGINATION.page);
  const [totalRecord, setTotalRecord] = useState(0);
  const [breakdown, setBreakdown] = useState(null);
  // chưa suaw scroll khi kéo hêt
  useEffect(() => {
    if (open) {
      fetchGetBreakdownById();
    }
  }, [open]);

  const fetchGetBreakdownById = async () => {
    let res = await _unitOfWork.breakdown.getBreakdownById({
      id: dataBreakdown._id || dataBreakdown.id,
    });
    if (res) {
      setBreakdown(res?.breakdown);
    }
  };
  useEffect(() => {
    if (open) {
      fetchGetBreakdownComment();
      const interval = setInterval(() => {
        fetchGetBreakdownComment();
      }, 20000); // 20 giây
      return () => clearInterval(interval);
    }
  }, [page, open]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [comments]);

  const fetchGetBreakdownComment = async () => {
    let payload = {
      page: page,
      limit: PAGINATION.limit,
      breakdown: dataBreakdown._id || dataBreakdown.id,
    };
    let res = await _unitOfWork.breakdown.getBreakdownComments(payload);
    if (res && res.code === 1) {
      setComments(res.result?.results);
      setTotalRecord(res.result?.totalResults);
    }
  };
  const handleSend = async () => {
    if (!input.trim()) return;
    // Gửi comment lên API
    const payload = {
      breakdown: dataBreakdown._id || dataBreakdown.id,
      comments: input,
    };
    const res = await _unitOfWork.breakdown.createBreakdownComment(payload);
    if (res && res.code === 1) {
      setInput("");
      fetchGetBreakdownComment(); // Refresh lại danh sách comment
    }
  };

  return (
    <div
      style={{
        background: "#f7f9fb",
        borderRadius: 8,
        // height: "calc(100vh - 112px)", // Sửa tại đây
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              height: 56,
              background: "#23457b",
              color: "#fff",
              padding: "0 16px",
              fontWeight: 600,
              fontSize: 20,
            }}
          >
            <ArrowLeftOutlined
              style={{ fontSize: 22, marginRight: 16, cursor: "pointer" }}
              onClick={onClose}
            />
            <span style={{ flex: 1 }}>
              {t("breakdown.view.timeline.comment")}
            </span>
          </div>

          {/* Title */}
          <div
            style={{
              fontWeight: 600,
              fontSize: 17,
              marginTop: 10,
              textAlign: "center",
            }}
          >
            {breakdown?.assetMaintenance?.assetModel?.asset?.assetName}
          </div>

          {/* Info */}
          <div style={{ padding: "10px" }}>
            <Row style={{ textAlign: "center" }}>
              <Col span={12}>
                <div style={{ color: "#aaa", fontSize: 15 }}>Mã của thẻ</div>
                <div
                  style={{ color: "#00b96b", fontWeight: 500, fontSize: 17 }}
                >
                  {breakdown?.code}
                </div>
              </Col>
              <Col span={12}>
                <div style={{ color: "#aaa", fontSize: 15 }}>Ngày mở</div>
                <div
                  style={{ color: "#00b96b", fontWeight: 500, fontSize: 17 }}
                >
                  {breakdown?.createdAt
                    ? parseDate(breakdown?.createdAt)
                    : "null"}
                </div>
              </Col>
            </Row>
          </div>
          <div style={{ borderBottom: "2px dashed #ccc" }} />
          {/* Comments scrollable area */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              marginTop: 12,
              display: "flex",
              flexDirection: "column-reverse",
              padding: "0 16px",
            }}
          >
            {comments &&
              Array.isArray(comments) &&
              [...comments].reverse().map((c) => {
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
                      <div
                        style={{
                          fontSize: 12,
                          color: isMe ? "#e0e0e0" : "#000000",
                          textAlign: "right",
                          marginTop: 4,
                        }}
                      >
                        <span style={{ fontWeight: 500 }}>
                          {c.createdBy?.username}
                        </span>{" "}
                        - {parseDateHH(c?.createdDate)}
                      </div>
                    </div>
                  </div>
                );
              })}
            <div ref={inputRef} />
          </div>

          {/* Input fixed at bottom */}
          <div
            style={{
              borderTop: "1px solid #eee",
              padding: "12px 16px",
              background: "#fff",
            }}
          >
            <Input.TextArea
              rows={2}
              maxLength={500}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("breakdown.comment.placeholder")}
              onPressEnter={(e) => {
                if (!e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              style={{ resize: "none" }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: 8,
                gap: 8,
              }}
            >
              <span style={{ color: "#888", alignSelf: "center", padding: 8 }}>
                {t("breakdown.comment.counter", { current: input.length })}
              </span>
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSend}
                disabled={!input.trim()}
                style={{
                  color: "#fff",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {t("breakdown.comment.send")}
              </Button>
            </div>
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export default BreakdownComment;
