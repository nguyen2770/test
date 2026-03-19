import { Col, Row, Button, Radio, Form, Dropdown, Menu } from "antd";
import React, { useRef, useState, useEffect } from "react";
import {
  CheckOutlined,
  CloseOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import * as _unitOfWork from "../../api";
import { cleanEmptyValues } from "../../helper/check-search-value";
import useAuth from "../../contexts/authContext";
import CardFilterSparePartRequestSchedulePreventive from "../../components/schedulePreventive/CardFilterSparePartRequestSchedulePreventive";
import useSchedulePreventiveContext from "../../contexts/schedulePreventiveContext";
import { useTranslation } from "react-i18next";
import { PAGINATION } from "../../utils/constant";
import "./index.scss";
import CardSparePartRequetsSchedulePreventive from "../../components/schedulePreventive/CardSparePartRequetsSchedulePreventive";
import { useNavigate } from "react-router-dom";
import { staticPath } from "../../router/RouteConfig";

export default function SparePartRequestSchedulePrevetive() {
  const { t } = useTranslation();
  const [searchForm] = Form.useForm();
  const { updateSearchValue, searchValue } = useSchedulePreventiveContext();
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalRecord, setTotalRecord] = useState(0);
  const [sparePartRequestBreakdowns, setSparePartRequestBreakdowns] = useState(
    []
  );
  const [open, setOpen] = useState(false);
  const [valueFilter, setValueFilter] = useState(null);
  const contentRef = useRef(null);
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
  }, [valueFilter]);

  const onclickViewSparePartRequestBreakdown = (value) => {
    navigate(
      staticPath.sparePartRequestSchedulePreventiveDetail +
        "/" +
        (value?.id || value?._id),
    );
  };

  const fetchGetListSchedulePreventives = async (_page) => {
    const rawValues = cleanEmptyValues(
      valueFilter || searchForm.getFieldsValue()
    );
    let payload = {
      page: _page || page,
      limit: PAGINATION.limit,
      ...searchForm.getFieldsValue(),
      ...rawValues,
    };
    const res =
      await _unitOfWork.schedulePreventiveTaskRequestSparepart.getListSchedulePrevetiveTaskSparePartRequests(
        payload
      );
    updateSearchValue({ ...payload });
    if (res && res?.data) {
      if (payload.page > 1) {
        setLoadingMore(false);
        setSparePartRequestBreakdowns((prev) => [...prev, ...res?.data]);
      } else {
        if (contentRef && contentRef.current) {
          contentRef.current.scrollTo(0, 0);
        }
        setSparePartRequestBreakdowns(res?.data || []);
      }
      setTotalRecord(res?.totalResults);
    }
  };
  const onRefresh = () => {
    fetchGetListSchedulePreventives(1);
  };

  const onSearchFilter = (_valueFilter) => {
    setValueFilter(_valueFilter);
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
              {t("spare_part.approve_parts_request_Maintenance")}
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
          <Col span={12} style={{ textAlign: "start" }}></Col>
          <Col span={12}>
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
              <CardSparePartRequetsSchedulePreventive
                sparePartRequestSchedulePreventive={sp}
                onRefresh={onRefresh}
              />
            </div>
          ))}
        </div>
      </Form>
      <CardFilterSparePartRequestSchedulePreventive
        onSearch={onSearchFilter}
        open={open}
        onClose={() => setOpen(false)}
        onReFeshFilter={onRefeshFilter}
      />
    </div>
  );
}
