import { Col, Row, Button, Radio, Form, Dropdown, Menu } from "antd";
import React, { useRef, useState, useEffect } from "react";
import "./schedulePreventive.scss";
import {
  CheckOutlined,
  CloseOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
} from "@ant-design/icons";
import * as _unitOfWork from "../../api";
import { parseDateHH } from "../../helper/date-helper";
import useAuth from "../../contexts/authContext";
import CardFilterSchedulePreventive from "./CardFilterSchedulePreventive";
import { schedulePreventiveTicketStatus } from "../../utils/schedulePreventive.constant";
import CardSchedulePreventive from "../../components/schedulePreventive/CardSchedulePreventive";
import useSchedulePreventiveContext from "../../contexts/schedulePreventiveContext";
import { useTranslation } from "react-i18next";

export default function SchedulePreventive() {
  const { t } = useTranslation();
  const [searchForm] = Form.useForm();
  const { updateSearchValue, searchValue } = useSchedulePreventiveContext();
  const [loadingMore, setLoadingMore] = useState(false);
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [totalRecord, setTotalRecord] = useState(0);
  const [schedulePreventives, setSchedulePreventives] = useState([]);
  const _ticketStatus = Form.useWatch("ticketStatus", searchForm);
  const [sortOrder, setSortOrder] = useState(-1);
  const [sortField, setSortField] = useState("createdAt");
  const [open, setOpen] = useState(false);
  const [valueFilter, setValueFilter] = useState(null);
  const contentRef = useRef(null);

  useEffect(() => {
    searchForm.setFieldsValue(searchValue);
  }, []);

  useEffect(() => {
    if (_ticketStatus) {
      fetchGetListSchedulePreventives(1);
    }
    if (page > 1) {
      setPage(1);
    }
  }, [_ticketStatus, valueFilter, sortField, sortOrder]);

  useEffect(() => {
    if (page > 1) {
      fetchGetListSchedulePreventives();
    }
  }, [page]);

  const sortMenu = (
    <Menu
      onClick={({ key }) => onSelectSortField(key)}
      items={[
        {
          label: (
            <span>
              {sortField === "createdAt" ? "✔️ " : ""}
              {t("preventiveSchedule.list.sort.by_created")}
            </span>
          ),
          key: "createdAt",
        },
        {
          label: (
            <span>
              {sortField === "updatedAt" ? "✔️ " : ""}
              {t("preventiveSchedule.list.sort.by_updated")}
            </span>
          ),
          key: "updatedAt",
        },
      ]}
    />
  );
  const fetchGetListSchedulePreventives = async (_page) => {
    let payload = {
      page: _page || page,
      limit: 6,
      ...searchForm.getFieldsValue(),
      sortBy: sortField,
      sortOrder,
      ...valueFilter,
    };
    const res = await _unitOfWork.schedulePreventive.getListSchedulePreventives(
      payload
    );
    updateSearchValue({ ...payload });
    if (res && res.code === 1) {
      if (payload.page > 1) {
        setLoadingMore(false);
        setSchedulePreventives((prev) => [
          ...prev,
          ...res?.schedulePreventives,
        ]);
      } else {
        if (contentRef && contentRef.current) {
          contentRef.current.scrollTo(0, 0);
        }
        setSchedulePreventives(res?.schedulePreventives || []);
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
  const onScroll = () => {
    if (contentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      if (!loadingMore && scrollTop + clientHeight + 1 >= scrollHeight) {
        loadMoreData();
      }
    }
  };
  const onRefeshFilter = () => {
    setOpen(false);
    setValueFilter([]);
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
              {t("preventiveSchedule.page.title")}
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
                title={t("preventiveSchedule.filter.title")}
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

        <Row
          className="my-breakdown-status"
          align="middle"
          justify="space-between"
        >
          <Col span={12}></Col>
          <Col span={12} style={{textAlign: "right"}}>
            <Dropdown overlay={sortMenu} trigger={["click"]}>
              <Button className="sort-btn">
                {t("preventiveSchedule.common.sort_label")}
              </Button>
            </Dropdown>
            {sortOrder === 1 ? (
              <SortAscendingOutlined
                className="icon-filter"
                onClick={onToggleSortOrder}
                style={{ cursor: "pointer", fontSize: 20, color: "#10426d" }}
              />
            ) : (
              <SortDescendingOutlined
                className="icon-filter"
                onClick={onToggleSortOrder}
                style={{ cursor: "pointer", fontSize: 20, color: "#10426d" }}
              />
            )}
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
          <Form.Item label="" name="ticketStatus" style={{ marginBottom: 16 }}>
            <Radio.Group
              block
              options={schedulePreventiveTicketStatus.Options.map((opt) => ({
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
              <b>
                {t("preventiveSchedule.list.total", { count: totalRecord })}
              </b>
            </Col>
          </Row>
        )}

        <div
          ref={contentRef}
          className="ticket-list p-1"
          style={{
            padding: 16,
            background: "#fff",
            maxHeight: "calc(100vh - 260px)",
            overflowY: "auto",
          }}
          onScroll={onScroll}
        >
          {schedulePreventives.map((sp) => (
            <div key={sp.id || sp._id}>
              <CardSchedulePreventive schedulePreventive={sp}/>
            </div>
          ))}
        </div>
      </Form>
      <CardFilterSchedulePreventive
        onSearch={onSearchFilter}
        open={open}
        onClose={() => setOpen(false)}
        onReFeshFilter={onRefeshFilter}
      />
    </div>
  );
}
