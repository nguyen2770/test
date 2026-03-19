import React, { useState, useRef, useEffect } from "react";
import { Input, Button, Avatar, Row, Col, Drawer, Card } from "antd";
import { ArrowLeftOutlined, SendOutlined } from "@ant-design/icons";
import { PAGINATION } from "../../utils/constant";
import * as _unitOfWork from "../../api";
import { parseDateHH, parseDatetime } from "../../helper/date-helper";
import './styles/NotificationDrawer.scss'
const userLocal = JSON.parse(localStorage.getItem("USER"));
const NotificationDrawer = ({ open, onClose }) => {
    const [notifications, setNotifications] = useState([]);
    const [page, setPage] = useState(1);
    const contentRef = useRef();
    const [loadingMore, setLoadingMore] = useState(false);
    const [totalRecord, setTotalRecord] = useState(0);
    // Scroll to bottom when new comment

    useEffect(() => {
        if (open) {
            fetchNotifications();
        }
    }, [open, page]);

    const fetchNotifications = async () => {
        const payload = {
            page: page,
            limit: PAGINATION.limit
        }
        let res = await _unitOfWork.notification.getMyNotifications(payload);
        setLoadingMore(false)
        if (res && res.code === 1) {
            setNotifications([...notifications, ...res.data.results])
            setTotalRecord(res.data.totalResults);
        }
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
        const totalLoaded = page * PAGINATION.limit;
        if (totalLoaded >= totalRecord) return;
        setLoadingMore(true);
        setPage(nextPage);
    };
    const onClickItem = async (_record) => {
        if (!_record.viewTime) {
            _unitOfWork.notification.readNotification({
                id: _record.id
            })
        }
        window.location.href = _record.url
    }
    return (
        <div
            style={{
                background: "#f7f9fb",
                borderRadius: 8,
                // height: "calc(100vh - 112px)", // Sửa tại đây
                display: "flex",
                flexDirection: "column",
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
                    className="notification-drawer-container"
                >
                    {/* Header */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        height: 56,
                        minHeight: 56,
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
                        <span style={{ flex: 1 }}>Thông báo</span>
                    </div>

                    {/* Comments scrollable area */}
                    <div ref={contentRef} style={{
                        overflowY: "auto",
                        padding: "0 8px",
                        paddingBottom: 20
                    }}
                        onScroll={onScroll}
                    >
                        {
                            notifications && notifications.length > 0 && notifications.map(_notification => {
                                return <Card className={"notification-item-card " + (_notification.viewTime ? "" : "notification-item-card-not-view")} onClick={() => onClickItem(_notification)}>
                                    {/* <div className="">{_notification.title}</div> */}
                                    <div className=""><b>{_notification.text}</b></div>
                                    <div>{parseDatetime(_notification.createdAt)}</div>
                                </Card>
                            })
                        }
                    </div>
                </div>
            </Drawer>

        </div>
    );
};

export default React.memo(NotificationDrawer);
