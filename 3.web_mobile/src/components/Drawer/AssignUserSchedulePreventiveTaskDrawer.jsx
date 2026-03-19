import React, { useEffect, useRef, useState } from "react";
import {
  Row,
  Col,
  Form,
  Button,
  Input,
  Drawer,
  Checkbox,
  Spin,
  Pagination,
  message,
  Avatar,
} from "antd";
import {
  ArrowLeftOutlined,
  PhoneOutlined,
  RedoOutlined,
  CheckSquareFilled,
  PhoneFilled,
  UserOutlined,
} from "@ant-design/icons";
import * as _unitOfWork from "../../api";
import { PAGINATION, PAGINATIONMAX } from "../../utils/constant";
import { useTranslation } from "react-i18next"; // Thêm dòng này

// chưa làm scroll khi kéo hêt
const AssignUserSchedulePreventiveTaskDrawer = ({
  open,
  task,
  callbackAssignUser,
}) => {
  const [users, setUsers] = useState([]);
  const [form] = Form.useForm();
  const [page, setPage] = useState(1);
  const [totalRecord, setTotalRecord] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedRowKey, setSelectedRowKey] = useState([]);
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);
  const searchTimeout = useRef();
  const { t } = useTranslation();

  useEffect(() => {
    if (open) {
      setUsers([]);
      setSelectedRowKey(null);
      setSearch("");
      form.resetFields();
      setPage(1);
    }
    // eslint-disable-next-line
  }, [open]);

  const fetchListUser = async (
    currentPage = 1,
    isLoadMore = false,
    searchValue = search
  ) => {
    if (loading) return;
    setLoading(true);
    let payload = {
      page: currentPage || page,
      limit: PAGINATIONMAX.limit,
      fullName: searchValue,
    };
    let res = await _unitOfWork.user.getListUser(payload);
    if (res && res.results) {
      setTotalRecord(res.totalResults);
      if (isLoadMore) {
        setUsers((prev) => [...prev, ...res.results]);
      } else {
        setUsers(res.results);
      }
    }
    setLoading(false);
  };

  // Cancel
  const onCancel = () => {
    form.resetFields();
    setSelectedRowKey(null);
    callbackAssignUser();
  };

  // Submit
  const handleSubmit = async () => {
    if (!selectedRowKey) {
      message.error(t("preventiveAssignUser.validation_select_user")); // Sửa chỗ này
      return;
    }
    const values = form.getFieldsValue();
    const payload = {
      ...values,
      user: selectedRowKey,
      schedulePreventiveTask: task._id,
      schedulePreventive: task.schedulePreventive,
    };
    const res =
      await _unitOfWork.schedulePreventive.schedulePreventiveTaskAssignUser(
        payload
      );
    if (res && res.code === 1) {
      message.success(t("preventiveAssignUser.messages.assign_success")); // Sửa chỗ này
      onCancel();
    } else {
      message.error(t("preventiveAssignUser.messages.assign_error")); // Sửa chỗ này
    }
  };

  // Select row
  const onSelectRow = (id, checked) => {
    if (checked) {
      setSelectedRowKey(id);
    } else {
      setSelectedRowKey(null);
    }
  };

  useEffect(() => {
    if (!open) return;
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setPage(1);
      fetchListUser(1, false, search);
    }, 1000);
    return () => clearTimeout(searchTimeout.current);
  }, [search, open]);

  useEffect(() => {
    if (!open) return;
    fetchListUser(page, page > 1, search);
  }, [page, open]);

  const handleScroll = () => {
    const el = listRef.current;
    if (!el || loading) return;

    const isBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 50;

    if (isBottom) {
      const maxPage = Math.ceil(totalRecord / PAGINATIONMAX.limit);

      if (page < maxPage) {
        setPage((prev) => prev + 1);
      }
    }
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
            boxSizing: "border-box",
            flexShrink: 0,
          }}
        >
          <ArrowLeftOutlined
            style={{ fontSize: 22, marginRight: 16, cursor: "pointer" }}
            onClick={onCancel}
          />
          <span style={{ flex: 1 }}>{t("preventiveAssignUser.title")}</span>
        </div>

        {/* Search */}
        <div style={{ background: "#fff", padding: 12, flexShrink: 0 }}>
          <Row gutter={8}>
            <Col flex="auto">
              <Input
                placeholder={t("preventiveAssignUser.search_placeholder")}
                value={search}
                allowClear
                htmlType="button"
                style={{ width: "100%" }}
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
                onSearch={() => {
                  setPage(1);
                }}
                onPressEnter={(e) => {
                  e.preventDefault();
                  setPage(1);
                }}
              />
            </Col>
          </Row>
        </div>

        {/* Danh sách kỹ thuật viên */}
        <div
          ref={listRef}
          onScroll={handleScroll}
          style={{
            flex: 1,
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
                padding: "12px 7px",
                display: "flex",
                alignItems: "center",
                borderBottom: "1px solid #eee",
                gap: 6,
              }}
            >
              <Checkbox
                checked={selectedRowKey === record.id}
                onChange={(e) => onSelectRow(record.id, e.target.checked)}
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
                  {t("users.list.columns.phone", { defaultValue: "Liên hệ" })}:{" "}
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
                  {t("users.list.columns.branch", {
                    defaultValue: "Chi nhánh",
                  })}
                  : {record.branch?.name || "--"}
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
                      {t("preventiveAssignUser.call", { defaultValue: "Gọi" })}
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
          {}
          {loading && (
            <div style={{ textAlign: "center", padding: 16 }}>
              <Spin />
            </div>
          )}
          {users.length === 0 && !loading && (
            <div style={{ textAlign: "center", color: "#aaa", padding: 16 }}>
              {t("preventiveAssignUser.no_data")}
            </div>
          )}
        </div>

        {/* Bình luận và nút cố định dưới */}
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
                placeholder={t("preventiveAssignUser.comment_placeholder")}
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
                {t("preventiveAssignUser.cancel")}
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
                {t("preventiveAssignUser.submit")}
              </Button>
            </Col>
          </Row>
        </div>
      </Form>
    </Drawer>
  );
};

export default React.memo(AssignUserSchedulePreventiveTaskDrawer);
