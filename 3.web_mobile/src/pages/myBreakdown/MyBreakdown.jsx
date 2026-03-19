import {
  Col,
  Row,
  Card,
  Button,
  Image,
  Radio,
  Modal,
  DatePicker,
  Form,
  Dropdown,
  Menu,
  Drawer,
} from "antd";
import React, { useRef, useState, useEffect } from "react";
import "./myBreakdown.scss";
import {
  CheckOutlined,
  CloseOutlined,
  EnvironmentOutlined,
  FilterOutlined,
  PhoneOutlined,
  QrcodeOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  WechatWorkOutlined,
} from "@ant-design/icons";
import {
  breakdownTicketStatus,
  breakdownType,
  breakdownUserStatus,
  PAGINATIONMAX,
  priorityLevelStatus,
} from "../../utils/constant";
import { useLocation, useNavigate } from "react-router-dom";
import * as _unitOfWork from "../../api";
import { parseDateHH } from "../../helper/date-helper";
import ComfirmRefuse from "../../components/modal/comfirmModal/ComfirmRefuse";
import { staticPath } from "../../router/RouteConfig";
import CardFilter from "./CardFilter";
import SearchBreakdown from "./SearchBreakdown";
import useAuth from "../../contexts/authContext";
import BreakdownComment from "./BreakdownComment";
import { checkPermission } from "../../helper/permission-helper";
import { permissionCodeConstant } from "../../utils/permissionCodeConstant";
import { useTranslation } from "react-i18next";

const statusMap = {
  new: ["assigned", "rejected", "accepted", "reopen"],
  inProgress: [
    "inProgress",
    "requestForSupport",
    "WCA",
    "reassignment",
    "experimentalFix",
    "pending_approval",
    "approved",
    "submitted",
  ],
  overdue: [
    "assigned",
    "rejected",
    "accepted",
    "reopen",
    "inProgress",
    "requestForSupport",
    "WCA",
    "reassignment",
    "experimentalFix",
    "pending_approval",
    "approved",
    "submitted",
  ],
  completed: ["completed"],
  cloesed: ["cloesed", "cancelled", "replacement"],
};

export default function MyBreakdown() {
  const { t } = useTranslation();
  const [breakdowns, setBreakdowns] = useState([]);
  const { user, permissions } = useAuth();
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const [totalRecord, setTotalRecord] = useState(0);
  const [isOpenConmfirmRefuse, setIsOpenConmfirmRefuse] = useState(false);
  const [refuseBreakAssignUser, setRefuseBreakAssignUser] = useState(null);
  const [showExpectedTimeModal, setShowExpectedTimeModal] = useState(false);
  const [selectedAssignUser, setSelectedAssignUser] = useState(null);
  const [expectedTime, setExpectedTime] = useState(null);
  const [searchForm] = Form.useForm();
  const _status = Form.useWatch("status", searchForm);
  const _ticketStatus = Form.useWatch("ticketStatus", searchForm);
  const [sortOrder, setSortOrder] = useState(-1);
  const [sortField, setSortField] = useState("createdAt");
  const [open, setOpen] = useState(false);
  const [openSearch, setOpenSeach] = useState(false);
  const [valueFilter, setValueFilter] = useState(null);
  const [openCommentBreakdown, setOpenCommentBreakdown] = useState(false);
  const [breakdown, setBreakdown] = useState([]);
  const contentRef = useRef(null);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const ticketStatus = queryParams.get("ticketStatus");
  const myTicketStatus = queryParams.get("myTicketStatus");

  useEffect(() => {
    const saved = localStorage.getItem("ticketStatus");
    if (saved) {
      const s = JSON.parse(saved);
      if (s.filters) searchForm.setFieldsValue(s.filters);
      localStorage.removeItem("ticketStatus");
      return
    }
    searchForm.resetFields();
    if (ticketStatus) {
      searchForm.setFieldsValue({
        ticketStatus: breakdownType.hasOpened,
        status: ticketStatus,
      });
    } else if (myTicketStatus) {
      searchForm.setFieldsValue({
        ticketStatus: breakdownType.assigned,
        status: myTicketStatus,
      });
    } else {
      searchForm.setFieldsValue({
        ticketStatus: checkPermission(
          permissions,
          permissionCodeConstant.ticket_view_list
        )
          ? breakdownType.assigned
          : breakdownType.hasOpened,
        status: breakdownTicketStatus.new,
      });
    }
  }, []);

  useEffect(() => {
    if (_ticketStatus && _status) {
      fetchGetListBreakdown(1);
    }
    if (page > 1) {
      setPage(1);
    }
  }, [_status, _ticketStatus, valueFilter, ticketStatus, sortField, sortOrder]);

  useEffect(() => {
    if (page > 1) {
      fetchGetListBreakdown();
    }
  }, [page]);

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
      const bottom = div.scrollHeight - div.scrollTop <= div.clientHeight + 100;
      if (bottom && breakdowns?.length < totalRecord) {
        loadMoreData();
      }
    };
    div.addEventListener("scroll", handleScroll);
    return () => div.removeEventListener("scroll", handleScroll);
  }, [breakdowns, totalRecord, open]);

  const fetchGetListBreakdown = async (_page) => {
    const values = searchForm.getFieldsValue();
    let payload = {
      page: _page ?? page,
      limit: PAGINATIONMAX.limit,
      sortBy: sortField,
      sortOrder: sortOrder,
      ...valueFilter,
    };
    if (values.status === breakdownTicketStatus.overdue) {
      payload.isOverdue = true;
    }
    if (_ticketStatus === breakdownType.assigned) {
      payload.user = user?.id;
      payload.breakdownAssignUserStatuses = statusMap[values.status];
    } else {
      if (values.status !== breakdownTicketStatus.overdue) {
        payload.ticketStatuses = [values.status];
      } else {
        payload.ticketStatuses = [
          breakdownTicketStatus.new,
          breakdownTicketStatus.inProgress,
        ];
      }
    }
    const res = await _unitOfWork.breakdown.getListBreakdowns(payload);
    if (res && res?.results) {
      if (payload.page > 1) {
        setBreakdowns([...breakdowns, ...res?.results]);
      } else {
        setBreakdowns(res?.results);
      }
      setTotalRecord(res?.totalResults);
    }
  };

  const onRefeshComfirmRefuse = () => {
    setIsOpenConmfirmRefuse(false);
    fetchGetListBreakdown();
  };
  const onClichRefuse = (value) => {
    setIsOpenConmfirmRefuse(true);
    setRefuseBreakAssignUser(value);
  };
  const onClickAccept = (value) => {
    setSelectedAssignUser(value);
    setShowExpectedTimeModal(true);
  };
  const handleConfirmAccept = async () => {
    if (!expectedTime) return;
    let res =
      await _unitOfWork.breakdownAssignUser.comfirmAcceptBreakdownAssignUer({
        data: {
          id: selectedAssignUser?.id,
          expectedRepairTime: expectedTime.format("YYYY-MM-DD HH:mm:ss"),
        },
      });
    if (res && res.code === 1) {
      setShowExpectedTimeModal(false);
      setExpectedTime(null);
      setSelectedAssignUser(null);
      fetchGetListBreakdown();
    }
  };
  const onToggleSortOrder = () => {
    const newOrder = sortOrder * -1;
    setSortOrder(newOrder);
  };
  const onSelectSortField = (key) => {
    setSortField(key);
  };
  const onRefeshFilter = () => {
    setOpen(false);
    setValueFilter([]);
  };
  const onSearchFilter = (_valueFilter) => {
    setValueFilter(_valueFilter);
  };
  const onClickCommentBreakdwon = (value) => {
    setBreakdown(value);
    setOpenCommentBreakdown(true);
  };

  const saveState = () => {
    localStorage.removeItem("ticketStatus");
    const data = {
      filters: searchForm.getFieldsValue(),
    };

    localStorage.setItem("ticketStatus", JSON.stringify(data));
  };


  const sortMenu = (
    <Menu
      onClick={({ key }) => onSelectSortField(key)}
      items={[
        {
          label: (
            <span>
              {sortField === "createdAt" ? "✔️ " : ""}
              {t("breakdown.viewTabs.general.fields.opened_at")}
            </span>
          ),
          key: "createdAt",
        },
        {
          label: (
            <span>
              {sortField === "updatedAt" ? "✔️ " : ""}
              {t("breakdown.update.title")}
            </span>
          ),
          key: "updatedAt",
        },
      ]}
    />
  );

  const onGoToQrcodeScan = () => {
    navigate(staticPath.searchBreakdownByQrCode);
  };

  return (
    <div className="my-breakdown-container">
      <Form className="search-form" form={searchForm} layout="vertical">
        <Row className="header-my-breakdown">
          <Col span={12}>
            <h2 className="title-my-breakdown">
              {t("breakdown.myBreakdown.title")}
            </h2>
          </Col>
          <Col
            span={12}
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 12,
              color: "#ffffff",
            }}
          >
            {/* <QrcodeOutlined
              onClick={onGoToQrcodeScan}
              style={{ fontSize: 22, marginRight: 12, cursor: "pointer" }}
            /> */}
            <div style={{ position: "relative" }}>
              <FilterOutlined
                onClick={() => setOpen(true)}
                style={{ fontSize: 22, marginRight: 12, cursor: "pointer" }}
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
            <SearchOutlined
              onClick={() => setOpenSeach(true)}
              style={{ fontSize: 22, cursor: "pointer", paddingRight: "7px" }}
            />
          </Col>
        </Row>
        <Row
          className="my-breakdown-status"
          align="middle"
          justify="space-between"
        >
          <Col span={12}>
            <Form.Item
              label=""
              name="ticketStatus"
              style={{ marginBottom: 16 }}
            >
              <Radio.Group
                block
                options={breakdownType.Option.filter((opt) =>
                  checkPermission(permissions, opt.permissionCode)
                ).map((opt) => ({
                  ...opt,
                  label: t(opt.label),
                }))}
                defaultValue={
                  checkPermission(
                    permissions,
                    permissionCodeConstant.ticket_view_list
                  )
                    ? breakdownType.assigned
                    : breakdownType.hasOpened
                }
                optionType="button"
                buttonStyle="solid"
                className="status-breakdown"
              />
            </Form.Item>
          </Col>
          <Col span={12} style={{ textAlign: "right" }}>
            <Dropdown overlay={sortMenu} trigger={["click"]}>
              <Button className="sort-btn">
                {t("breakdown.myBreakdown.buttons.sort")}
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
          <Form.Item label="" name="status" style={{ marginBottom: 16 }}>
            <Radio.Group
              block
              options={breakdownTicketStatus.Option.map((opt) => ({
                ...opt,
                label: t(opt.label),
              }))}
              optionType="button"
              defaultValue={breakdownTicketStatus.new}
              className="status-breakdown-assign-user"
              style={{ minWidth: "max-content", display: "inline-block" }}
            />
          </Form.Item>
        </div>
        {totalRecord > 0 && (
          <Row>
            <Col span={24} className="text-right pr-3 mt-2">
              <b>
                {t("breakdown.common.total", {
                  count: totalRecord,
                })}
              </b>
            </Col>
          </Row>
        )}
        <div
          ref={contentRef}
          className="ticket-list"
          style={{
            background: "#fff",
            maxHeight: "calc(100vh - 254px)",
            overflowY: "auto",
          }}
        >
          {breakdowns.map((item, idx) => {
            const userId = user?.id || user?._id;
            const assignUser = item.breakdownAssignUsers?.find(
              (u) => u.user && (u.user._id === userId || u.user === userId)
            );
            return (
              <Card
                key={idx}
                className="ticket-card m-2"
                bodyStyle={{ padding: 10 }}
                onClick={() => {
                  saveState();
                  navigate(
                    `${staticPath.viewMyBreakdown + "/" + item.id
                    }?ticketStatus=${_ticketStatus}`
                  );
                }
                }
              >
                <Row align="middle">
                  {_ticketStatus === breakdownType.assigned && (
                    <Col span={24} style={{ textAlign: "end" }}>
                      <span
                        className="ticket-status"
                        style={{
                          color: (() => {
                            const option = assignUser
                              ? breakdownUserStatus.Option.find(
                                (opt) => opt.value === assignUser.status
                              )
                              : null;
                            return option?.color || "#333";
                          })(),
                        }}
                      >
                        {assignUser
                          ? t(
                            breakdownUserStatus.Option.find(
                              (opt) => opt.value === assignUser.status
                            )?.label
                          ) || assignUser.status
                          : ""}
                      </span>
                    </Col>
                  )}
                  {_ticketStatus === breakdownType.hasOpened && (
                    <Col span={24} style={{ textAlign: "end" }}>
                      <span
                        className="ticket-status"
                        style={{
                          color: (() => {
                            const option = item
                              ? breakdownUserStatus.Option.find(
                                (opt) => opt.value === item.status
                              )
                              : null;
                            return option?.color || "#333";
                          })(),
                        }}
                      >
                        {t(
                          breakdownUserStatus.Option.find(
                            (opt) => opt.value === item.status
                          )?.label
                        ) || item.status}
                      </span>
                    </Col>
                  )}
                  <Col span={4}>
                    <Image
                      width={60}
                      height={60}
                      src={_unitOfWork.resource.getImage(
                        item?.assetMaintenance?.resource
                      )}
                      preview={false}
                      style={{ borderRadius: "5px", background: "#eee" }}
                    />
                  </Col>
                  <Col style={{ paddingLeft: 10 }} span={20}>
                    <Row gutter={32}>
                      <Col span={24}>
                        <b className="ticket-title ellipsis">
                          {t("breakdown.viewTabs.general.fields.code")} :{" "}
                          {item?.code}
                        </b>
                      </Col>
                      <Col span={24}>
                        <span className="ellipsis">
                          {item?.assetMaintenance?.asset?.assetName}{" "}
                          {item?.assetMaintenance?.assetModel?.assetModelName} |{" "}
                          {item?.assetMaintenance?.serial}
                        </span>
                      </Col>
                      {_ticketStatus === breakdownType.assigned && (
                        <Col span={24}>
                          <span className="ticket-status">
                            {assignUser
                              ? assignUser?.repairContract?.contractNo
                              : ""}
                          </span>
                        </Col>
                      )}
                      <Col span={24}>
                        <span
                          style={{
                            fontWeight: 500,
                            color:
                              priorityLevelStatus.Options.find(
                                (opt) => opt.value === item?.priorityLevel
                              )?.color || "#333",
                          }}
                        >
                          {t(
                            priorityLevelStatus.Options.find(
                              (opt) => opt.value === item?.priorityLevel
                            )?.label
                          ) || ""}
                        </span>
                      </Col>
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
                <Row>
                  <Col span={12}>
                    <div className="ticket-customer">
                      {t("breakdown.viewTabs.general.fields.customer_name")} :
                      {item?.assetMaintenance?.customer?.customerName}
                    </div>
                    <div>
                      {t("breakdown.viewTabs.general.fields.opened_by")}:{" "}
                      {item?.createdBy?.username}
                    </div>
                  </Col>
                  <Col span={12} style={{ textAlign: "end" }}>
                    <div>
                      {t("breakdown.reopen.fields.opened_date")} :{" "}
                      {parseDateHH(item?.createdAt)}
                    </div>
                    {item?.incidentDeadline ? (
                      <div style={{ color: "red" }}>
                        {t("breakdown.close.fields.deadline")} :{" "}
                        {parseDateHH(item?.incidentDeadline)}
                      </div>
                    ) : (
                      ""
                    )}
                  </Col>
                </Row>
                {_ticketStatus === breakdownType.assigned && (
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
                        navigate(staticPath.monitor + "/" + item.id);
                      }}
                    >
                      {t("breakdown.myBreakdown.buttons.monitor")}
                    </Button>
                    {assignUser?.status === breakdownUserStatus.assigned && (
                      <>
                        <Button
                          icon={<CheckOutlined style={{ color: "blue" }} />}
                          className="btn-breakdown"
                          onClick={(e) => {
                            e.stopPropagation();
                            onClickAccept(assignUser);
                          }}
                        >
                          {t("breakdown.actions.accept")}
                        </Button>
                        <Button
                          className="btn-breakdown"
                          onClick={(e) => {
                            e.stopPropagation();
                            onClichRefuse(assignUser);
                          }}
                        >
                          <CloseOutlined style={{ color: "red" }} />
                          {t("breakdown.actions.reject")}
                        </Button>
                      </>
                    )}
                    {assignUser?.status !== breakdownUserStatus.assigned && (
                      <>
                        <a
                          href={`tel:${item?.assetMaintenance?.customer?.contactNumber ||
                            ""
                            }`}
                          style={{ textDecoration: "none" }}
                          onClick={(e) => e.stopPropagation()}
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
                            navigate(
                              staticPath.solutionBankBreakdown + "/" + item.id,
                              {
                                state: {
                                  assetModel:
                                    item?.assetMaintenance?.assetModel.id ||
                                    item?.assetMaintenance?.assetModel._id,
                                },
                              }
                            );
                          }}
                        >
                          {t("breakdown.myBreakdown.buttons.solution_bank")}
                        </Button>
                      </>
                    )}
                  </Row>
                )}
                {_ticketStatus === breakdownType.hasOpened &&
                  _status !== breakdownTicketStatus.cloesed && (
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
                          navigate(staticPath.monitor + "/" + item.id);
                        }}
                      >
                        {t("breakdown.myBreakdown.buttons.monitor")}
                      </Button>
                      <>
                        <a
                          href={`tel:${item?.assetMaintenance?.customer?.contactNumber ||
                            ""
                            }`}
                          style={{ textDecoration: "none" }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            icon={<PhoneOutlined />}
                            className="btn-breakdown"
                          >
                            {t("breakdown.myBreakdown.buttons.call")}
                          </Button>
                        </a>
                        <Button
                          icon={<WechatWorkOutlined />}
                          className="btn-breakdown ellipsis"
                          onClick={(e) => {
                            e.stopPropagation();
                            onClickCommentBreakdwon(item);
                          }}
                        >
                          {t("breakdown.close.fields.comment")}
                        </Button>
                      </>
                    </Row>
                  )}
                <div className="my-breakdown-container"></div>
              </Card>
            );
          })}
        </div>
        <ComfirmRefuse
          open={isOpenConmfirmRefuse}
          refuseBreakAssignUser={refuseBreakAssignUser}
          onCancel={onRefeshComfirmRefuse}
        />
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
        <SearchBreakdown
          open={openSearch}
          onClose={() => setOpenSeach(false)}
          ticketStatus={_ticketStatus}
        />
      </Form>
      <CardFilter
        onSearch={onSearchFilter}
        open={open}
        onClose={() => setOpen(false)}
        onReFeshFilter={onRefeshFilter}
      />
      <BreakdownComment
        open={openCommentBreakdown}
        onClose={() => setOpenCommentBreakdown(false)}
        dataBreakdown={breakdown}
      />
    </div>
  );
}
