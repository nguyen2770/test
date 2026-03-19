import { Col, Row, Button, Radio, Form, Dropdown, Menu } from "antd";
import React, { useRef, useState, useEffect } from "react";
import "./MySchedulePreventive.scss";
import {
  CheckOutlined,
  CloseOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
} from "@ant-design/icons";
import { PAGINATION, preventiveStatus } from "../../utils/constant";
import * as _unitOfWork from "../../api";
import useAuth from "../../contexts/authContext";
import useSchedulePreventiveTaskContext from "../../contexts/schedulePreventiveTaskContext";
import CardFilterMySchedulePreventive from "./CardFilterMySchedulePreventive";
import CardMySchedulePreventive from "../../components/schedulePreventive/CardMySchedulePreventive";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

const statusMap = {
  new: ["assigned", "accepted"],
  inProgress: [
    "inProgress",
    "partiallyCompleted",
    "pending_approval",
    "approved",
    "submitted",
  ],
  overdue: [
    "inProgress",
    "assigned",
    "accepted",
    "partiallyCompleted",
    "pending_approval",
    "approved",
    "submitted",
  ],
  upcoming: ["assigned", "accepted"],
  history: [
    "skipped",
    "completed",
    "cancelled",
    "reassignment",
    "reopen",
    "replacement",
    "rejected"
  ],
};

export default function MySchedulePreventive() {
  const { t } = useTranslation();
  const { updateSearchValue, searchValue } = useSchedulePreventiveTaskContext();
  const contentRef = useRef();
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [totalRecord, setTotalRecord] = useState(0);
  const [searchForm] = Form.useForm();
  const _status = Form.useWatch("status", searchForm);
  const [sortOrder, setSortOrder] = useState(-1);
  const [sortField, setSortField] = useState("createdAt");
  const [open, setOpen] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [valueFilter, setValueFilter] = useState(null);
  const [
    schedulePreventiveTaskAssignUsers,
    setSchedulePreventiveTaskAssignUsers,
  ] = useState([]);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const ticketStatus = queryParams.get("ticketStatus");

  useEffect(() => {
    searchForm.setFieldsValue(searchValue);
  }, []);

  useEffect(() => {
    searchForm.resetFields();
    if (ticketStatus) {
      searchForm.setFieldsValue({
        status: ticketStatus,
      });
    } else {
      searchForm.setFieldsValue({ status: searchValue.status });
    }
  }, [ticketStatus]);

  // useEffect(() => {
  //   setPage(1);
  //   fetchGetListSchedulePreventive(1);
  // }, [valueFilter, sortField, sortOrder]);

  // useEffect(() => {
  //   if (_status) {
  //     if (page > 1) {
  //       setPage(1);
  //     } else {
  //       fetchGetListSchedulePreventive(1);
  //     }
  //   }
  // }, [_status]);

  // useEffect(() => {
  //   if (page > 1 && _status) {
  //     fetchGetListSchedulePreventive();
  //   }
  // }, [page]);

  // Reset page khi filter /sort / status đổi
  useEffect(() => {
    setPage(1);
  }, [valueFilter, sortField, sortOrder, _status]);

  //Gọi APi khi page hoặc filter đổi
  useEffect(() => {
    if (!_status) return;
    fetchGetListSchedulePreventive(page);
  }, [page, valueFilter, sortField, sortOrder, _status]);

  const sortMenu = (
    <Menu
      onClick={({ key }) => onSelectSortField(key)}
      items={[
        {
          label: (
            <span>
              {sortField === "createdAt" ? "✔️ " : ""}
              {t("preventive.buttons.sort_created_at")}
            </span>
          ),
          key: "createdAt",
        },
        {
          label: (
            <span>
              {sortField === "updatedAt" ? "✔️ " : ""}
              {t("preventive.buttons.sort_updated_at")}
            </span>
          ),
          key: "updatedAt",
        },
      ]}
    />
  );
  const onRefeshPage = () => {
    fetchGetListSchedulePreventive();
  };

  const fetchGetListSchedulePreventive = async (_page) => {
    const status = _status || "new";
    let payload = {
      page: _page || page,
      limit: PAGINATION.limit,
      sortBy: sortField,
      sortOrder,
      schedulePreventiveTaskAssignUserStatuses: statusMap[status],
      ticketSchedulePreventiveTaskAssignUserStatus: status,
      ...valueFilter,
    };
    updateSearchValue({ ...payload, status: status, page: 1 });
    const res = await _unitOfWork.schedulePreventive.getMySchedulePreventives(
      payload
    );
    if (res && res.code === 1) {
      if (payload.page > 1) {
        setLoadingMore(false);
        setSchedulePreventiveTaskAssignUsers((prev) => [
          ...prev,
          ...(res?.schedulePreventiveTaskAssignUser || []),
        ]);
      } else {
        if (contentRef.current) contentRef.current.scrollTo(0, 0);
        setSchedulePreventiveTaskAssignUsers(
          res?.schedulePreventiveTaskAssignUser || []
        );
      }
      setTotalRecord(res?.totalResults);
    }
  };
  const onToggleSortOrder = () => {
    setSortOrder(sortOrder * -1);
  };
  const onSearchFilter = (_valueFilter) => {
    setValueFilter(_valueFilter);
  };
  const onSelectSortField = (key) => {
    setSortField(key);
  };
  const onRefeshFilter = () => {
    setOpen(false);
    setValueFilter([]);
  };
  const onScroll = () => {
    if (contentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      if (!loadingMore && scrollTop + clientHeight + 1 >= scrollHeight) {
        loadMoreData();
      }
    }
  };
  const loadMoreData = () => {
    const nextPage = page + 1;
    const totalLoaded = (nextPage - 1) * 6;
    if (totalLoaded >= totalRecord) return;
    setLoadingMore(true);
    setPage(nextPage);
  };

  return (
    <div className="my-breakdown-container">
      <Form className="search-form" form={searchForm} layout="vertical">
        <Row className="header-my-breakdown">
          <Col span={16}>
            <h2 className="title-my-breakdown">
              {t("preventive.mySchedule.title")}
            </h2>
          </Col>
          <Col
            span={8}
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 12,
              color: "#ffffff",
            }}
          >
            <div
              style={{
                position: "relative",
                paddingRight: "7px",
                marginRight: "8px",
              }}
            >
              <FilterOutlined
                onClick={() => setOpen(true)}
                style={{ fontSize: 22, marginRight: 6, cursor: "pointer" }}
              />
              {valueFilter ? (
                <CheckOutlined
                  style={{
                    position: "absolute",
                    top: -5,
                    right: 0,
                    fontSize: 12,
                    color: "green",
                  }}
                />
              ) : (
                <CloseOutlined
                  style={{
                    position: "absolute",
                    top: -5,
                    right: 0,
                    fontSize: 12,
                    color: "red",
                  }}
                />
              )}
            </div>
          </Col>
        </Row>

        <div
          style={{
            overflowX: "auto",
            backgroundColor: "#10426d",
            whiteSpace: "nowrap",
            width: "100%",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <Form.Item label="" name="status" style={{ marginBottom: 16 }}>
            <Radio.Group
              block
              options={preventiveStatus.Option.map((opt) => ({
                ...opt,
                label: t(opt.label),
              }))}
              optionType="button"
              className="status-breakdown-assign-user"
              style={{ minWidth: "max-content", display: "inline-block" }}
            />
          </Form.Item>
        </div>
        {totalRecord > 0 && (
          <Row>
            <Col span={24} className="text-right pr-3 mt-2">
              <b>{t("preventive.common.total", { count: totalRecord })}</b>
            </Col>
          </Row>
        )}

        <div
          ref={contentRef}
          className="ticket-list p-1"
          style={{
            padding: 16,
            background: "#fff",
            maxHeight: "calc(100vh - 254px)",
            overflowY: "auto",
          }}
          onScroll={onScroll}
        >
          {schedulePreventiveTaskAssignUsers.map((item) => (
            <div key={item.id} className="mb-2">
              <CardMySchedulePreventive
                schedulePreventiveTaskAssignUser={item}
                refresh={onRefeshPage}
                // filters={searchForm.getFieldsValue()}
              />
            </div>
          ))}
        </div>
      </Form>
      <CardFilterMySchedulePreventive
        onSearch={onSearchFilter}
        open={open}
        onClose={() => setOpen(false)}
        onReFeshFilter={onRefeshFilter}
      />
    </div>
  );
}
