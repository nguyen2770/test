import React, { useEffect, useState, memo } from 'react';
import * as _unitOfWork from "../../api";
import { Button, Col, DatePicker, Input, message, Modal, Row, } from 'antd';
import './myBreakdown.scss';
import { parseDateHH } from '../../helper/date-helper';
import { breakdownTicketStatus, breakdownUserStatus, } from '../../utils/constant';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const CheckinCheckoutBreakdown = ({ getBreakdownAssignUserByBreakdownId, lastCheckInCheckOut, lastCheckInCheckOutByUser, breakdownAssignUser, onCallBack }) => {
    const [showExpectedHourModal, setShowExpectedHourModal] = useState(false);
    const [showCheckoutCommentModal, setShowCheckoutCommentModal] = useState(false);
    const [expectedTime, setExpectedTime] = useState(null);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [logoutComment, setLogoutComment] = useState("");
    const { t } = useTranslation();
    const navigate = useNavigate();

    const disabledLogin = () => {
        if (lastCheckInCheckOut && !lastCheckInCheckOut.logOutAt) {
            return true;
        }
        return false;
    }
    const onClickCheckIn = async () => {
        if (disabledLogin()) return;
        if (!lastCheckInCheckOut) {
            setShowExpectedHourModal(true);
        } else {
            // setCheckoutComment(res?.data?.checkOutComments);
            setShowCheckoutCommentModal(true);
        }
    }
    const onOkCheckin = async () => {
        if (!expectedTime) {
            message.error(t("breakdown.workSession.validation.planned_finish_required"));
            return;
        }
        await _unitOfWork.breakdownAssignUser.checkinBreakdown(breakdownAssignUser.id, {
            estimatedCompletionDate: expectedTime
        });
        setShowExpectedHourModal(false);
        getBreakdownAssignUserByBreakdownId();
    }
    const showButtonCheckin = () => {
        if (showAnother()) return false;
        if ((breakdownAssignUser?.status === breakdownUserStatus.accepted ||
            breakdownAssignUser?.status === breakdownUserStatus.inProgress ||
            breakdownAssignUser?.status === breakdownUserStatus.submitted ||
            breakdownAssignUser?.status === breakdownUserStatus.approved

        ))
            return true;
        else {
            return false;
        }
    }
    const onProceedCheckIn = async () => {
        await _unitOfWork.breakdownAssignUser.checkinBreakdown(breakdownAssignUser.id, {});
        setShowExpectedHourModal(false);
        getBreakdownAssignUserByBreakdownId();
        setShowCheckoutCommentModal(false);
    }
    const onCheckoutBreakdown = async () => {
        if (!logoutComment.trim()) {
            message.error(t("breakdown.workSession.validation.checkout_comment_required"));
            return;
        }
        await _unitOfWork.breakdownAssignUser.checkoutBreakdown(breakdownAssignUser.id, {
            checkOutComments: logoutComment
        });
        setShowLogoutModal(false);
        getBreakdownAssignUserByBreakdownId();
    }
    const showAnother = () => {
        if (lastCheckInCheckOutByUser && !lastCheckInCheckOutByUser.logOutAt && lastCheckInCheckOutByUser.breakdownAssignUser !== breakdownAssignUser.id) return true;
        return false;
    }
    return (
        <>
            {/* Đăng nhập/Đăng xuất */}
            {((lastCheckInCheckOut && !lastCheckInCheckOut.logOutAt && breakdownAssignUser.status === breakdownTicketStatus.inProgress)) && (

                <div style={{ textAlign: "center", paddingTop: "10px", background: "#ffffff", fontWeight: "450" }}>Check-in Time : {parseDateHH(lastCheckInCheckOut?.logInAt)}</div>
            )}
            {showAnother() && (
                <div style={{ textAlign: "center", paddingTop: "10px", background: "#ffffff", fontWeight: "450" }}>
                    {/* Bạn đã đăng ký vào một nhiệm vụ khác:{" "} */}
                    {t("breakdown.workSession.already_checked_in_other")}
                    <span
                        style={{
                            color: "#1677ff",
                            textDecoration: "underline",
                            cursor: "pointer"
                        }}
                        onClick={() => {
                            // navigate(`/view-my-breakdown/${lastCheckInCheckOutByUser?.breakdown?.id}?ticketStatus=assigned`);
                            onCallBack(lastCheckInCheckOutByUser?.breakdown?.id)
                        }}
                    >
                        {lastCheckInCheckOutByUser?.breakdown?.code}
                    </span>
                </div>
            )}
            {showButtonCheckin() && (<>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        background: '#fff',
                        padding: '18px 0 8px 0'
                    }}
                >
                    <button
                        className={'check-in-button ' + (disabledLogin() && "check-in-disable")}
                        onClick={onClickCheckIn}
                        disabled={disabledLogin()}
                    >
                        {/* Đăng nhập */}
                        {t("breakdown.workSession.login")}
                    </button>
                    <button
                        className={'check-out-button ' + (!disabledLogin() && "check-out-disable")}
                        disabled={!disabledLogin()}
                        onClick={() => {
                            setLogoutComment("");
                            setShowLogoutModal(true);
                        }}
                    >
                        {/* Đăng xuất */}
                        {t("breakdown.workSession.logout")}

                    </button>
                </div>
                {(
                    breakdownAssignUser?.estimatedCompletionDate !== null
                    && breakdownAssignUser?.estimatedCompletionDate !== undefined
                    && breakdownAssignUser?.estimatedCompletionDate !== ""
                ) && (
                        <div style={{ textAlign: "center", paddingBottom: "15px", background: "#ffffff", fontWeight: "450" }}>
                            {/* Thời gian dự kiến hoàn thành :{" "} */}
                            {t("breakdown.workSession.planned_finish_time")}
                            {parseDateHH(breakdownAssignUser?.estimatedCompletionDate)}
                        </div>
                    )}
            </>
            )}

            <Modal
                open={showExpectedHourModal}
                onCancel={() => setShowExpectedHourModal(false)}
                closable={false}
                onOk={onOkCheckin}
                okText={t("breakdown.myTicket.buttons.confirm")}
                cancelText={t("breakdown.cancel.buttons.cancel")}
            >
                <div style={{ width: "100%", textAlign: "center", fontSize: "18px", fontWeight: "600", marginBottom: "15px" }}>
                    {/* Nhập ngày dự kiến hoàn thành */}
                    {t("breakdown.workSession.enter_planned_finish_date")}

                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <DatePicker
                        showTime
                        style={{ width: "100%" }}
                        value={expectedTime}
                        onChange={setExpectedTime}
                        format="DD/MM/YYYY HH:mm"
                        placeholder={t("breakdown.workSession.datetime_placeholder")}

                    />
                </div>
            </Modal>
            <Modal
                open={showCheckoutCommentModal}
                onCancel={() => setShowCheckoutCommentModal(false)}
                closable={false}
                footer={[
                    <Button key="cancel" onClick={() => setShowCheckoutCommentModal(false)}>{t("breakdown.cancel.buttons.cancel")}</Button>,
                    <Button key="proceed" type="primary" onClick={onProceedCheckIn}>{t("breakdown.workSession.proceed")}</Button>
                ]}
            >
                <div style={{ width: "100%", textAlign: "start", fontSize: "18px", fontWeight: "600" }}>
                    {t("breakdown.workSession.checkout_comments")}
                </div>
                <div style={{ minHeight: 60, padding: 8 }}>{lastCheckInCheckOut?.checkOutComments}</div>
            </Modal>
            <Modal
                open={showLogoutModal}
                closable={false} // Ẩn dấu X
                onCancel={() => setShowLogoutModal(false)}
                footer={[
                    <Row key="footer" gutter={16} justify="center" style={{ width: "100%" }}>
                        <Col span={12} style={{ textAlign: "right" }}>
                            <Button
                                style={{
                                    fontWeight: 550,
                                    minWidth: 100,
                                }}
                                onClick={() => setShowLogoutModal(false)}
                            >
                                {t("breakdown.cancel.buttons.cancel")}
                            </Button>
                        </Col>
                        <Col span={12} style={{ textAlign: "left" }}>
                            <Button
                                style={{
                                    fontWeight: 550,
                                    minWidth: 100,
                                }}
                                type="primary"
                                onClick={onCheckoutBreakdown}
                            >
                                {t("breakdown.cancel.buttons.submit")}
                            </Button>
                        </Col>
                    </Row>
                ]}
            >
                <div style={{ width: "100%", textAlign: "center", fontSize: "18px", fontWeight: "600" }}>
                    {/* Đăng xuất */}
                    {t("breakdown.workSession.logout")}

                </div>
                <div style={{ minHeight: 60, padding: 8 }}>
                    <Input.TextArea
                        style={{ width: "100%" }}
                        autoSize={{ minRows: 3, maxRows: 6 }}
                        placeholder={t("breakdown.workSession.checkout_comment_placeholder")}
                        value={logoutComment}
                        onChange={e => setLogoutComment(e.target.value)}
                        allowClear
                    />
                </div>
            </Modal>
        </>
    );
};
export default memo(CheckinCheckoutBreakdown);