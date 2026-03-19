import React, { useEffect, useRef, useState } from "react";
import {
  Row,
  Col,
  Form,
  Button,
  Input,
  Drawer,
  Checkbox,
  message,
  Avatar,
} from "antd";
import {
  ArrowLeftOutlined,
  CheckSquareFilled,
  PhoneFilled,
  UserOutlined,
} from "@ant-design/icons";
import * as _unitOfWork from "../../api";
import { PAGINATIONMAX } from "../../utils/constant";
import { useTranslation } from "react-i18next";

const ReplacementAssignUser = ({
  open,
  onClose,
  homeBreakdown,
  onReFeshFilter,
  replacementAssignUser,
}) => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [form] = Form.useForm();
  const [page, setPage] = useState(1);
  const [totalRecord, setTotalRecord] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const searchTimeout = useRef();
  const contentRef = useRef(null);

  useEffect(() => {
    if (open) {
      clearTimeout(searchTimeout.current);
      searchTimeout.current = setTimeout(() => {
        fetchListUser(1, search);
        if (page > 1) {
          setPage(1);
        }
      }, 1000);
      return () => clearTimeout(searchTimeout.current);
    }
  }, [search, open]);

  useEffect(() => {
    if (page > 1) {
      fetchListUser();
    }
  }, [page]);

  useEffect(() => {
    if (open) {
      setUsers([]);
      setSelectedRowKeys([]);
      setSearch("");
      form.resetFields();
      setPage(1);
    }
  }, [open]);

  const fetchListUser = async (currentPage, searchValue = search) => {
    let payload = {
      page: currentPage ?? page,
      limit: PAGINATIONMAX.limit,
    };
    if (searchValue) {
      payload.fullName = searchValue;
    }
    let res = await _unitOfWork.user.getListUser(payload);
    if (res && res.results) {
      setTotalRecord(res.totalResults);
      if (payload.page > 1) {
        setUsers((prev) => [...prev, ...res.results]);
      } else {
        setUsers(res.results);
      }
    }
  };

  const loadMoreData = () => {
    const nextPage = page + 1;
    const totalLoaded = (nextPage - 1) * PAGINATIONMAX.limit;
    if (totalLoaded >= totalRecord) return;
    setPage(nextPage);
  };

  useEffect(() => {
    const div = contentRef.current;
    if (!div) return;
    const handleScroll = () => {
      const bottom = div.scrollHeight - div.scrollTop <= div.clientHeight + 1;
      if (bottom && users?.length < totalRecord) {
        loadMoreData();
      }
    };
    div.addEventListener("scroll", handleScroll);
    return () => div.removeEventListener("scroll", handleScroll);
  }, [users, totalRecord, open]);

  const onCancel = () => {
    form.resetFields();
    setSelectedRowKeys([]);
    onClose();
  };

  const handleSubmit = async () => {
    if (selectedRowKeys.length === 0) {
      message.error(t("modal.replacementAssignUser.messages.select_one"));
      return;
    }
    const values = form.getFieldsValue();
    const payload = {
      ...values,
      user: selectedRowKeys,
      breakdown: homeBreakdown?.id || homeBreakdown?._id,
      breakdownAssignUser:
        replacementAssignUser?.id || replacementAssignUser?._id,
      replacementUser:
        replacementAssignUser?.user?._id || replacementAssignUser?.user?.id,
    };
    const res = await _unitOfWork.breakdownAssignUser.replacementAssignUser(
      payload
    );
    if (res && res.code === 1) {
      message.success(t("modal.replacementAssignUser.messages.success"));
      onCancel();
      onReFeshFilter();
    } else {
      message.error(t("modal.replacementAssignUser.messages.error"));
    }
  };

  const onSelectRow = (id, checked) => {
    setSelectedRowKeys((prev) =>
      checked ? [...prev, id] : prev.filter((key) => key !== id)
    );
  };

  return (
    <Drawer
      placement="right"
      closable={false}
      open={open}
      width="100%"
      bodyStyle={{
        padding: 0,
        background: "#f8f8f8",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
      }}
    >
      <Form
        form={form}
        layout="vertical"
        style={{ height: "100%", display: "flex", flexDirection: "column" }}
      >
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
            boxSizing: "border-box",
            flexShrink: 0,
          }}
        >
          <ArrowLeftOutlined
            style={{ fontSize: 22, marginRight: 16, cursor: "pointer" }}
            onClick={onCancel}
          />
          <span style={{ flex: 1 }}>
            {t("modal.replacementAssignUser.title")}
          </span>
        </div>

        <div style={{ background: "#fff", padding: 12, flexShrink: 0 }}>
          <Row gutter={8}>
            <Col flex="auto">
              <Input
                placeholder={t(
                  "modal.replacementAssignUser.search_placeholder"
                )}
                value={search}
                allowClear
                htmlType="button"
                style={{ width: "100%" }}
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
                onPressEnter={(e) => {
                  e.preventDefault();
                  setPage(1);
                }}
              />
            </Col>
          </Row>
        </div>

        <div
          ref={contentRef}
          style={{
            flex: 1,
            maxHeight: "calc(100vh - 234x)",
            overflowY: "auto",
            background: "#f8f8f8",
            padding: "8px 0",
            marginBottom: 110,
          }}
        >
          {users.map((record, idx) => (
            <div
              key={record.id}
              style={{
                background: "#fff",
                borderRadius: 10,
                boxShadow: "0 2px 8px #0001",
                margin: "8px 12px",
                padding: "12px 10px",
                display: "flex",
                alignItems: "center",
                borderBottom: "1px solid #eee",
                gap: 6,
              }}
            >
              <Checkbox
                checked={selectedRowKeys.includes(record.id)}
                onChange={(e) => onSelectRow(record.id, e.target.checked)}
                style={{ marginRight: 8 }}
              />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Avatar
                  size={50}
                  style={{ backgroundColor: "#87d068" }}
                  icon={<UserOutlined />}
                />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 16,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {record.fullName}
                </div>
                <div
                  style={{
                    color: "#888",
                    fontSize: 14,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {t("modal.replacementAssignUser.fields.contact")}:{" "}
                  {record.contactNo || "--"}
                </div>
                <div
                  style={{
                    color: "#888",
                    fontSize: 14,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {t("modal.replacementAssignUser.fields.branch")}:{" "}
                  {record.branch?.name || "--"}
                </div>
              </div>
              <div style={{ minWidth: 70, textAlign: "right" }}>
                <div
                  style={{
                    display: "flex",
                    gap: 4,
                    justifyContent: "flex-end",
                  }}
                >
                  <div
                    style={{
                      background: "#db331dff",
                      color: "#fff",
                      borderRadius: 16,
                      width: 32,
                      height: 32,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 600,
                      fontSize: 16,
                    }}
                  >
                    {record?.breakdownAssignUserCount || 0}
                  </div>
                  <div
                    style={{
                      background: "#cceb1eff",
                      color: "#fff",
                      borderRadius: 16,
                      width: 32,
                      height: 32,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 600,
                      fontSize: 16,
                    }}
                  >
                    {record?.schedulePreventiveTaskAssignUser || 0}
                  </div>
                  <div
                    style={{
                      background: "#46ec8bff",
                      color: "#fff",
                      borderRadius: 16,
                      width: 32,
                      height: 32,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 600,
                      fontSize: 16,
                    }}
                  >
                    {record?.calibrationWorkAssignUserByUser || 0}
                  </div>
                </div>
                <div style={{ color: "#888", fontSize: 13, marginTop: 2 }}>
                  {t("preventiveAssignUser.columns.ticket")} /{" "}
                  {t("preventiveAssignUser.columns.schedule")} /{" "}
                  {t("preventiveAssignUser.columns.calibration")}
                </div>
                {record?.contactNo && (
                  <div style={{ marginTop: 2, textAlign: "center" }}>
                    <a
                      href={`tel:${record?.contactNo || ""}`}
                      style={{ textDecoration: "none" }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <PhoneFilled style={{ fontSize: 18, color: "#10426d" }} />{" "}
                      {t("modal.replacementAssignUser.buttons.call")}
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div
          style={{
            position: "fixed",
            left: 0,
            bottom: 0,
            width: "100%",
            background: "#fff",
            zIndex: 1001,
            boxShadow: "0 -2px 8px #0001",
          }}
        >
          <div style={{ marginBottom: 8, padding: 8 }}>
            <Form.Item name="comments" style={{ marginBottom: 8 }}>
              <Input.TextArea
                rows={2}
                placeholder={t(
                  "modal.replacementAssignUser.comment_placeholder"
                )}
                style={{
                  background: "#fafafa",
                  border: "none",
                  resize: "none",
                }}
              />
            </Form.Item>
          </div>
          <Row gutter={8} style={{ padding: "0 8px 8px 8px" }}>
            <Col span={12}>
              <Button
                block
                onClick={onCancel}
                style={{
                  background: "#fff",
                  color: "#2ecc71",
                  border: "1px solid #2ecc71",
                  fontWeight: 600,
                  height: 44,
                }}
              >
                {t("modal.replacementAssignUser.buttons.cancel")}
              </Button>
            </Col>
            <Col span={12}>
              <Button
                block
                type="primary"
                icon={<CheckSquareFilled />}
                onClick={handleSubmit}
                style={{
                  background: "#2ecc71",
                  color: "#fff",
                  fontWeight: 600,
                  height: 44,
                }}
              >
                {t("modal.replacementAssignUser.buttons.submit")}
              </Button>
            </Col>
          </Row>
        </div>
      </Form>
    </Drawer>
  );
};

export default ReplacementAssignUser;
