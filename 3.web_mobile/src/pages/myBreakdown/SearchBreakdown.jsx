/* (ĐÃ I18N – GIỮ LOGIC, chỉ thay text) */
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Button, Input, Card, Image, Modal, DatePicker, Drawer } from 'antd';
import { LeftOutlined, CheckOutlined, CloseOutlined, EnvironmentOutlined, PhoneOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import * as _unitOfWork from "../../api";
import useAuth from "../../contexts/authContext";
import { parseDateHH } from '../../helper/date-helper';
import { staticPath } from '../../router/RouteConfig';
import { breakdownTicketStatus, breakdownType, breakdownUserStatus, PAGINATION, priorityLevelStatus } from '../../utils/constant';
import ComfirmRefuse from '../../components/modal/comfirmModal/ComfirmRefuse';
import { useTranslation } from 'react-i18next';

const SearchBreakdown = ({ open, onClose, ticketStatus }) => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [page, setPage] = useState(1);
    const navigate = useNavigate();
    const [totalRecord, setTotalRecord] = useState(0);
    const [breakdowns, setBreakdowns] = useState(null);
    const [expectedTime, setExpectedTime] = useState(null);
    const [selectedAssignUser, setSelectedAssignUser] = useState(null);
    const [showExpectedTimeModal, setShowExpectedTimeModal] = useState(false);
    const [isOpenConmfirmRefuse, setIsOpenConmfirmRefuse] = useState(false);
    const [refuseBreakAssignUser, setRefuseBreakAssignUser] = useState(null);
    const [searchText, setSearchText] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const contentRef = useRef(null);

    useEffect(() => {
        if (open) {
            const delayDebounce = setTimeout(() => {
                setPage(1);
                fetchBreakdowns();
            }, 1000);
            return () => clearTimeout(delayDebounce);
        }
    }, [searchText, open]);

    useEffect(() => {
        if (open) {
            fetchBreakdowns(page, page > 1);
        }
    }, [page]);

    const loadMoreData = () => {
        if (!isLoading) {
            setPage(prev => prev + 1);
        }
    };

    useEffect(() => {
        const div = contentRef.current;
        if (!div) return;
        const handleScroll = () => {
            const bottom = div.scrollHeight - div.scrollTop <= div.clientHeight + 1;
            if (bottom && breakdowns?.length < totalRecord) {
                loadMoreData();
            }
        };
        div.addEventListener("scroll", handleScroll);
        return () => div.removeEventListener("scroll", handleScroll);
    }, [breakdowns, totalRecord, open]);

    const fetchBreakdowns = async (currentPage = 1, isLoadMore = false) => {
        if (isLoading) return;
        setIsLoading(true);
        const payload = {
            page: currentPage,
            limit: PAGINATION.limit,
        };
        if (ticketStatus === breakdownType.hasOpened) {
            payload.user = user?.id || user?._id;
        }
        if (searchText) payload.code = searchText;
        const res = await _unitOfWork.breakdown.getAllSearchMyBreakdown(payload);
        if (res?.data) {
            setTotalRecord(res?.data?.totalResults);
            if (isLoadMore) {
                setBreakdowns(prev => [...prev, ...res.data?.results]);
            } else {
                setBreakdowns(res.data?.results);
            }
        }
        setIsLoading(false);
    };

    const onClickAccept = (value) => {
        setSelectedAssignUser(value);
        setShowExpectedTimeModal(true);
    };
    const onClichRefuse = (value) => {
        setIsOpenConmfirmRefuse(true);
        setRefuseBreakAssignUser(value);
    };
    const onRefeshComfirmRefuse = () => {
        setIsOpenConmfirmRefuse(false);
        fetchBreakdowns();
    };
    const handleConfirmAccept = async () => {
        if (!expectedTime) return;
        let res = await _unitOfWork.breakdownAssignUser.comfirmAcceptBreakdownAssignUer({
            data: {
                id: selectedAssignUser?.id,
                expectedRepairTime: expectedTime.format("YYYY-MM-DD HH:mm:ss"),
            }
        });
        if (res && res.code === 1) {
            setShowExpectedTimeModal(false);
            setExpectedTime(null);
            setSelectedAssignUser(null);
            fetchBreakdowns();
        }
    };
    const resetState = () => {
        setPage(1);
        setTotalRecord(0);
        setBreakdowns(null);
        setExpectedTime(null);
        setSelectedAssignUser(null);
        setShowExpectedTimeModal(false);
        setIsOpenConmfirmRefuse(false);
        setRefuseBreakAssignUser(null);
        setSearchText(null);
        setIsLoading(false);
    };

    const onCancelSearch = () => {
        onClose();
        resetState();
    };

    return (
        <Drawer
            placement="right"
            closable={false}
            open={open}
            width="100%"
            bodyStyle={{ padding: 0 }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    height: 56,
                    background: '#ffffff',
                    color: "rgb(143, 141, 141)",
                    padding: '0 16px',
                    fontWeight: 600,
                    fontSize: 20,
                    boxSizing: 'border-box',
                }}
            >
                <LeftOutlined
                    style={{ fontSize: 22, marginRight: 16, cursor: 'pointer' }}
                    onClick={onCancelSearch}
                />
                <Input
                    placeholder={t("breakdown.search.placeholder.code")}
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    allowClear
                />
            </div>
            <div
                ref={contentRef}
                className="ticket-list p-1"
                style={{
                    maxHeight: 'calc(100vh - 56px)',
                    overflowY: 'auto',
                }}
            >
                {breakdowns?.map((data, idx) => {
                    const userId = user?.id || user?._id;
                    const assignUser = data?.breakdownAssignUsers?.find(
                        u => u.user && (u.user._id === userId || u.user === userId)
                    );
                    return (
                        <Card key={idx} className="ticket-card" style={{ background: "#ffffff" }} bodyStyle={{ padding: 10 }} onClick={() => navigate(staticPath.viewMyBreakdown + "/" + data.id)}>
                            <Row align="middle">
                                <Col span={24} style={{ textAlign: "end" }}>
                                    <span className="ticket-status" style={{
                                        color:
                                            (() => {
                                                const option = assignUser
                                                    ? breakdownUserStatus.Option.find(opt => opt.value === assignUser.status)
                                                    : null;
                                                return option?.color || "#333";
                                            })
                                    }}>
                                        {
                                            assignUser
                                                ? (
                                                    t(breakdownUserStatus.Option.find(
                                                        opt => opt.value === assignUser.status
                                                    )?.label || assignUser.status
                                                    ))
                                                : ""
                                        }
                                    </span>
                                </Col>
                                <Col span={4}>
                                    <Image
                                        width={60}
                                        height={60}
                                        src={_unitOfWork.resource.getImage(data?.assetMaintenance?.resource)}
                                        preview={false}
                                        style={{ borderRadius: "5px", background: "#eee" }}
                                    />
                                </Col>
                                <Col style={{ paddingLeft: 10 }} span={20}>
                                    <Row gutter={32}>
                                        <Col span={24}>
                                            <b className="ticket-title ellipsis" >
                                                {t("breakdown.viewTabs.general.fields.code")} : {data?.code}
                                            </b>
                                        </Col>
                                        <Col span={24} >
                                            <span className="ellipsis">
                                                {data?.assetMaintenance?.asset?.assetName} {data?.assetMaintenance?.assetModel?.assetModelName} | {data?.assetMaintenance?.serial}
                                            </span></Col>
                                        <Col span={24} >
                                            <span style={{
                                                fontWeight: 500,
                                                color: priorityLevelStatus.Options.find(
                                                    opt => opt.value === data?.priorityLevel
                                                )?.color || "#333"
                                            }}>
                                                {t(priorityLevelStatus.Options.find(
                                                    opt => opt.value === data?.priorityLevel
                                                )?.label) || "--"}
                                            </span></Col>
                                    </Row>
                                </Col>
                            </Row>
                            <hr
                                style={{
                                    border: "none",
                                    borderBottom: "1px solid #e0e0e0",
                                    background: "transparent",
                                    height: 1,
                                    margin: "8px 0",
                                }}
                            />
                            <Row >
                                <Col span={12}>
                                    <div className="ellipsis">
                                        {t("breakdown.viewTabs.general.fields.customer_name")} :{data?.assetMaintenance?.customer?.customerName}
                                    </div>
                                    <div>{t("breakdown.viewTabs.general.fields.opened_by")}: {data?.createdBy?.username}</div>
                                </Col>
                                <Col span={12} style={{ textAlign: "end" }}>
                                    <div>{t("breakdown.reopen.fields.opened_date")}: {parseDateHH(data?.createdAt)}</div>
                                    {data?.incidentDeadline ? <div style={{ color: "red" }}>{t("breakdown.close.fields.deadline")} : {parseDateHH(data?.incidentDeadline)}</div> : ""}
                                </Col>
                            </Row>
                            <Row
                                justify="space-around"
                                className="ticket-actions"
                                style={{ marginTop: 12 }}
                            >
                                <Button
                                    icon={<EnvironmentOutlined />}
                                    className="btn-breakdown"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(staticPath.monitor + "/" + data.id)
                                    }}
                                >
                                    {t("breakdown.myBreakdown.buttons.monitor")}
                                </Button>
                                {assignUser?.status === breakdownUserStatus.assigned && (
                                    <> <Button
                                        icon={<CheckOutlined style={{ color: "blue" }} />}
                                        className="btn-breakdown"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onClickAccept(assignUser)
                                        }}
                                    >
                                        {t("breakdown.actions.accept")}
                                    </Button>
                                        <Button
                                            className="btn-breakdown"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onClichRefuse(assignUser)
                                            }}
                                        >
                                            <CloseOutlined style={{ color: "red" }} />
                                            {t("breakdown.actions.reject")}
                                        </Button></>
                                )}
                                {(assignUser?.status !== breakdownUserStatus.assigned) && (
                                    <> <a
                                        href={`tel:${data?.assetMaintenance?.customer?.contactNumber || ""}`}
                                        style={{ textDecoration: "none" }}
                                        onClick={e => e.stopPropagation()}
                                    >
                                        <Button
                                            icon={<PhoneOutlined />}
                                            className="btn-breakdown"
                                        >
                                            {t("breakdown.myBreakdown.buttons.call")}
                                        </Button>
                                    </a>
                                        <Button
                                            icon={<QuestionCircleOutlined />}
                                            className="btn-breakdown ellipsis"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(staticPath.solutionBankBreakdown + "/" + data.id,
                                                    {
                                                        state: {
                                                            assetModel: data?.assetMaintenance?.assetModel.id || data?.assetMaintenance?.assetModel._id,
                                                            assetModelFailureType: data?.breakdownDefect?.id || data?.breakdownDefect?._id
                                                        }
                                                    });
                                            }}
                                        >
                                            {t("breakdown.myBreakdown.buttons.solution_bank")}
                                        </Button>
                                    </>
                                )}
                            </Row>
                            <div className="my-breakdown-container">
                            </div>
                        </Card>
                    );
                })}
            </div>
            <ComfirmRefuse
                open={isOpenConmfirmRefuse}
                refuseBreakAssignUser={refuseBreakAssignUser}
                onCancel={onRefeshComfirmRefuse} />
            <Modal
                open={showExpectedTimeModal}
                title={t("breakdown.myBreakdown.modals.expected_time_title")}
                closable={false}
                onCancel={() => {
                    setShowExpectedTimeModal(false);
                    setExpectedTime(null);
                    setSelectedAssignUser(null);
                }}
                onOk={handleConfirmAccept}
                okText={t("breakdown.common.yes")}
                cancelText={t("breakdown.common.no")}
            >
                <DatePicker
                    showTime
                    style={{ width: "100%" }}
                    value={expectedTime}
                    onChange={setExpectedTime}
                    format="DD/MM/YYYY HH:mm"
                    placeholder={t("breakdown.workSession.datetime_placeholder")}
                />
            </Modal>
        </Drawer>
    );
};

export default SearchBreakdown;