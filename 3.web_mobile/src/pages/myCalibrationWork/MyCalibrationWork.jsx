import { Col, Row, Button, Radio, Form, Dropdown, Menu } from "antd";
import React, { useRef, useState, useEffect } from "react";
import "./index.scss";
import {
    CheckOutlined,
    CloseOutlined,
    FilterOutlined,
} from "@ant-design/icons";
import { PAGINATION, preventiveStatus } from "../../utils/constant";
import * as _unitOfWork from "../../api";
import useAuth from "../../contexts/authContext";
import useSchedulePreventiveTaskContext from "../../contexts/schedulePreventiveTaskContext";
import CardFilterMyCalibrationWork from "./CardFilterMyCalibrationWork";
import { useTranslation } from "react-i18next";
import CardMyCalibrationWork from "../../components/calibration/CardMyCalibrationWork";
import { useLocation } from "react-router-dom";

const statusMap = {
    new: ["assigned", "accepted"],
    inProgress: [
        "inProgress",
        "partiallyCompleted",
        "completeRecalibrationIssue",
    ],
    overdue: [
        "inProgress",
        "assigned",
        "accepted",
        "partiallyCompleted",
        "completeRecalibrationIssue",
    ],
    upcoming: ["assigned", "accepted"],
    history: ["completed", "cancelled", "reassignment", "replacement"],
};

export default function MyCalibrationWork() {
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
        calibrationWorkAssignUsers,
        setCalibrationWorkAssignUsers,
    ] = useState([]);
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const groupStatus = queryParams.get("groupStatus");
    const [restored, setRestored] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem("ticketStatus");
        if (saved) {
            const s = JSON.parse(saved);
            if (s.filters) searchForm.setFieldsValue(s.filters);
            setRestored(true);
            localStorage.removeItem("ticketStatus");
            return
        }
        searchForm.setFieldsValue(searchValue);
    }, []);
    useEffect(() => {
        if (!restored) return;
        searchForm.resetFields();
        if (groupStatus) {
            searchForm.setFieldsValue({
                status: groupStatus,
            });
        }
    }, [groupStatus])
    useEffect(() => {
        if (_status) {
            fetchGetListMyCalibrationWorkAssignUser(1);
        }
        if (page > 1) setPage(1);
    }, [_status, valueFilter, sortField, sortOrder]);
    useEffect(() => {
        if (page > 1) {
            fetchGetListMyCalibrationWorkAssignUser();
        }
    }, [page]);

    const onRefeshPage = () => {
        fetchGetListMyCalibrationWorkAssignUser();
    };

    const fetchGetListMyCalibrationWorkAssignUser = async (_page) => {
        const values = searchForm.getFieldsValue();
        let payload = {
            page: _page || page,
            limit: PAGINATION.limit,
            sortBy: sortField,
            sortOrder,
            calibrationWorkAssignUserStatuses: statusMap[_status],
            ...valueFilter,
        };
        updateSearchValue({ ...payload, status: _status, page: 1 });
        const res = await _unitOfWork.calibrationWork.getMyCalibrationWorks(
            payload
        );
        if (res && res.code === 1) {
            if (payload.page > 1) {
                setLoadingMore(false);
                setCalibrationWorkAssignUsers((prev) => [
                    ...prev,
                    ...(res?.myCalibrationWorkAssignUsers || []),
                ]);
            } else {
                if (contentRef.current) contentRef.current.scrollTo(0, 0);
                setCalibrationWorkAssignUsers(
                    res?.myCalibrationWorkAssignUsers || []
                );
            }
            setTotalRecord(res?.totalResults);
        }
    };
    const onSearchFilter = (_valueFilter) => {
        setValueFilter(_valueFilter);
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
            <Form
                className="search-form"
                form={searchForm}
                layout="vertical"
                initialValues={{ status: preventiveStatus.new }}
            >
                <Row className="header-my-breakdown">
                    <Col span={20}>
                        <h2 className="title-my-breakdown">
                            {t("home.my_calibration_work")}
                        </h2>
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
                            // defaultValue={preventiveStatus.new}
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
                    {calibrationWorkAssignUsers.map((item) => (
                        <div key={item.id} className="mb-2" >
                            <CardMyCalibrationWork
                                calibrationWorkAssignUsers={item}
                                refresh={onRefeshPage}
                                status={searchForm.getFieldsValue()}
                            />
                        </div>
                    ))}
                </div>
            </Form>
            <CardFilterMyCalibrationWork
                onSearch={onSearchFilter}
                open={open}
                onClose={() => setOpen(false)}
                onReFeshFilter={onRefeshFilter}
            />
        </div>
    );
}
