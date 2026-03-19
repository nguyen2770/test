import { Col, Row, Button, Radio, Form, Dropdown, Menu } from "antd";
import React, { useRef, useState, useEffect } from "react";
import {
  CheckOutlined,
  CloseOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
} from "@ant-design/icons";
import * as _unitOfWork from "../../api";
import { parseDateHH } from "../../helper/date-helper";
import { cleanEmptyValues } from "../../helper/check-search-value";
import useAuth from "../../contexts/authContext";
import CardFilterSparePartRequestBreakdown from "../../components/modal/breakdown/CardFilterSparePartRequestBreakdown";
import useSchedulePreventiveContext from "../../contexts/schedulePreventiveContext";
import { useTranslation } from "react-i18next";
import { PAGINATION } from "../../utils/constant";
import "./index.scss";
import CardSparePartRequets from "../../components/modal/breakdown/CardSparePartRequets";
import ApproveSparePartModal from "../myBreakdown/ApproveSparePartModal";
import { useNavigate } from "react-router-dom";
import { staticPath } from "../../router/RouteConfig";
export default function SparePartRequestBreakdown() {
  const { t } = useTranslation();
  const [searchForm] = Form.useForm();
  const { updateSearchValue, searchValue } = useSchedulePreventiveContext();
  const [loadingMore, setLoadingMore] = useState(false);
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [totalRecord, setTotalRecord] = useState(0);
  const [sparePartRequestBreakdowns, setSparePartRequestBreakdowns] = useState(
    []
  );
  const [sortOrder, setSortOrder] = useState(-1);
  const [sortField, setSortField] = useState("createdAt");
  const [open, setOpen] = useState(false);
  const [valueFilter, setValueFilter] = useState(null);
  const contentRef = useRef(null);
  const [isOpenModalApprover, setIsOpenModalApprover] = useState(false);
  const [sparePartRequestBreakdown, setSparePartRequestBreakdown] =
    useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    searchForm.setFieldsValue(searchValue);
  }, []);

  useEffect(() => {
    if (page > 1) {
      fetchGetListSchedulePreventives();
    } else {
      fetchGetListSchedulePreventives(1);
    }
  }, [page]);

  useEffect(() => {
    if (page > 1) {
      setPage(1);
    }
    fetchGetListSchedulePreventives(1);
  }, [valueFilter, sortField, sortOrder]);

  const onclickViewSparePartRequestBreakdown = (value) => {
    // setSparePartRequestBreakdown(value);
    // setIsOpenModalApprover(true);
    navigate(
      staticPath.sparePartRequestBreakdownDetail +
        "/" +
        (value?.id || value?._id),
      {
        state: {
          data: value,
        },
      }
    );
  };
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
    const rawValues = cleanEmptyValues(
      valueFilter || searchForm.getFieldsValue()
    );
    let payload = {
      page: _page || page,
      limit: PAGINATION.limit,
      ...searchForm.getFieldsValue(),
      // sortBy: sortField,
      // sortOrder,
      ...rawValues,
    };
    const res =
      await _unitOfWork.breakdownSpareRequest.getListBreakdownSpareRequests(
        payload
      );
    updateSearchValue({ ...payload });
    if (res && res?.results && res?.results?.results) {
      if (payload.page > 1) {
        setLoadingMore(false);
        setSparePartRequestBreakdowns((prev) => [
          ...prev,
          ...res?.results?.results,
        ]);
      } else {
        if (contentRef && contentRef.current) {
          contentRef.current.scrollTo(0, 0);
        }
        setSparePartRequestBreakdowns(res?.results?.results || []);
      }
      setTotalRecord(res?.results?.totalResults);
    }
  };
  const onRefresh = () => {
    fetchGetListSchedulePreventives(1);
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
          <Col span={20}>
            <h3 className="title-my-breakdown">
              {t("spare_part.approve_parts_request_incident")}
            </h3>
          </Col>
          <Col
            span={4}
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
          <Col span={12} style={{ textAlign: "start" }}>
            {/* <Dropdown overlay={sortMenu} trigger={["click"]}>
              <Button className="sort-btn">
                {t("preventiveSchedule.common.sort_label")}
              </Button>
            </Dropdown> */}
            {/* {sortOrder === 1 ? (
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
            )} */}
          </Col>
          <Col span={12}>
            {" "}
            {totalRecord > 0 && (
              <Row>
                <Col span={24} className="text-right pr-3 mt-2">
                  <b>
                    {t("preventiveSchedule.list.total", { count: totalRecord })}
                  </b>
                </Col>
              </Row>
            )}
          </Col>
        </Row>

        <div
          ref={contentRef}
          className="ticket-list p-1"
          style={{
            padding: 16,
            background: "#fff",
            maxHeight: "calc(100vh - 100px)",
            overflowY: "auto",
          }}
          onScroll={onScroll}
        >
          {sparePartRequestBreakdowns.map((sp) => (
            <div
              key={sp.id || sp._id}
              onClick={() => onclickViewSparePartRequestBreakdown(sp)}
            >
              <CardSparePartRequets
                sparePartRequestBreakdown={sp}
                onRefresh={onRefresh}
              />
            </div>
          ))}
        </div>
      </Form>
      <CardFilterSparePartRequestBreakdown
        onSearch={onSearchFilter}
        open={open}
        onClose={() => setOpen(false)}
        onReFeshFilter={onRefeshFilter}
      />
      <ApproveSparePartModal
        open={isOpenModalApprover}
        onClose={() => setIsOpenModalApprover(false)}
        data={sparePartRequestBreakdown}
        onSubmit={() => fetchGetListSchedulePreventives(1)}
      />
    </div>
  );
}
