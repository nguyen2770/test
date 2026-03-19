import React, { useEffect, useState } from "react";
import {
  ArrowLeftOutlined,
  FileTextOutlined,
  BookOutlined,
  PaperClipOutlined,
  MoreOutlined,
  ToolOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  CommentOutlined,
  ReadOutlined,
  SignatureOutlined,
  PhoneFilled,
  UserOutlined,
  DatabaseOutlined,
  CloseOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import * as _unitOfWork from "../../api";
import {
  Avatar,
  Button,
  Col,
  DatePicker,
  Drawer,
  Image,
  Modal,
  Row,
} from "antd";
import {
  assetMaintenanceStatus,
  assetType,
  breakdownTicketStatus,
  breakdownType,
  breakdownUserStatus,
  priorityLevelStatus,
  progressStatus,
} from "../../utils/constant";
import { parseDateHH } from "../../helper/date-helper";
import { staticPath } from "../../router/RouteConfig";
import CheckinCheckoutBreakdown from "./CheckinCheckoutBreakdown";
import BreakdownComment from "./BreakdownComment";
import ComfirmCancelBreakdown from "./ComfirmCancelBreakdown";
import TechnicianAppoinment from "../../components/modal/TechnicianAppoinment";
import ReplacementAssignUser from "./ReplacementAssignUser";
import ReopenBreakdown from "./ReOpenBreakdown";
import ComfirmCloseBreakdown from "./ComfirmCloseBreakdown";
import { parseToLabel } from "../../helper/parse-helper";
import useAuth from "../../contexts/authContext";
import { checkPermission } from "../../helper/permission-helper";
import { permissionCodeConstant } from "../../utils/permissionCodeConstant";
import { useTranslation } from "react-i18next";
import ComfirmRefuse from "../../components/modal/comfirmModal/ComfirmRefuse";

export default function ViewBreakdown() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();
  const [breakdown, setBreakdown] = useState([]);
  const [breakdownAssignUser, setBreakdownAssignUser] = useState([]);
  // const [breakdownAssignUsers, setBreakdownAssignUsers] = useState([]);
  const [lastCheckInCheckOut, setLastCheckInCheckOut] = useState([]);
  const [lastCheckInCheckOutByUser, setLastCheckInCheckOutByUser] = useState(
    []
  );
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [openCommentBreakdown, setOpenCommentBreakdown] = useState(false);
  const [dataBreakdown, setDataBreakdown] = useState([]);
  const [isComfirmCancelBreakdown, setIsComfirmCancelBreakdown] =
    useState(false);
  const [isOpenTechnicianAppoinment, setIsOpenTechnicianAppoinment] =
    useState(false);
  const [isOpenReplacement, setIsOpenReplacement] = useState(false);
  const [replacementAssignUser, setReplacementAssignUser] = useState([]);
  const [isOpenReOpen, setIsOpenReOpen] = useState(false);
  const [isComfirmCloseBreakdown, setIsComfirmCloseBreakdown] = useState(false);
  const { permissions } = useAuth();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const _ticketStatus =
    queryParams.get("ticketStatus") || breakdownType.assigned;
  const [isOpenConmfirmRefuse, setIsOpenConmfirmRefuse] = useState(false);
  const [refuseBreakAssignUser, setRefuseBreakAssignUser] = useState(null);
  const [showExpectedTimeModal, setShowExpectedTimeModal] = useState(false);
  const [expectedTime, setExpectedTime] = useState(null);
  const [selectedAssignUser, setSelectedAssignUser] = useState(null);

  useEffect(() => {
    fetchGetBreakdownById();
  }, []);

  useEffect(() => {
    if (_ticketStatus === breakdownType.assigned) {
      getBreakdownAssignUserByBreakdownId();
    }
  }, [_ticketStatus]);

  const fetchGetBreakdownById = async (id = params.id) => {
    let res = await _unitOfWork.breakdown.getBreakdownById({ id });
    if (res) {
      setBreakdown({
        ...res?.breakdown,
        breakdownAssignUsers: res?.breakdownAssignUsers,
      });
      // setBreakdownAssignUsers(res?.breakdownAssignUsers);
    }
  };
  const getBreakdownAssignUserByBreakdownId = async (id = params.id) => {
    let res =
      await _unitOfWork.breakdownAssignUser.getBreakdownAssignUserByBreakdownId(
        { id }
      );
    if (res) {
      setLastCheckInCheckOut(res?.data?.lastCheckInCheckOut);
      setLastCheckInCheckOutByUser(res?.data?.lastCheckInCheckOutByUser);
      setBreakdownAssignUser(res?.data?.breakdownAssignUser);
    }
  };
  const onClickFixed = (value) => {
    navigate(staticPath.comfirmFixed + "/" + value.id);
  };
  const onClickCommentBreakdwon = (value) => {
    setOpenCommentBreakdown(true);
    setDataBreakdown(value);
  };
  const onClickComfirmCancel = () => {
    setIsComfirmCancelBreakdown(true);
  };
  const onClickTechnicianAppoinment = () => {
    setIsOpenTechnicianAppoinment(true);
  };
  const onClickReplacement = (value) => {
    setReplacementAssignUser(value);
    setIsOpenReplacement(true);
  };
  const onClickBreakdownSparePart = () => {
    navigate(`${staticPath.apprevedbreakdownSpareRequest + "/" + params.id}`);
  };
  const onClickReOpen = (value) => {
    setDataBreakdown(value);
    setIsOpenReOpen(true);
  };
  const onClickComfirmCloseBreakdown = (value) => {
    setDataBreakdown(value);
    setIsComfirmCloseBreakdown(true);
  };
  const onRefeshComfirmRefuse = () => {
    getBreakdownAssignUserByBreakdownId();
    setIsOpenConmfirmRefuse(false);
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
      getBreakdownAssignUserByBreakdownId();
      setShowExpectedTimeModal(false);
      setExpectedTime(null);
    }
  };
  const onViewContract = () => {};
  return (
    <div style={{ background: "#f8f8f8" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          background: "#23457b",
          color: "#fff",
          padding: "0 16px",
          height: 90,
        }}
      >
        <ArrowLeftOutlined
          style={{ fontSize: 20, cursor: "pointer", marginRight: 16 }}
          onClick={() => navigate(-1)}
        />
        <div
          style={{
            width: 1,
            height: 70,
            backgroundColor: "#fff",
            marginRight: 16,
            opacity: 0.5,
          }}
        />
        <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              background: "#e5e5e5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              marginRight: 16,
              flexShrink: 0,
            }}
          >
            <Image
              width={60}
              height={60}
              src={_unitOfWork.resource.getImage(
                breakdown?.assetMaintenance?.resource
              )}
              preview={false}
              style={{ objectFit: "cover", background: "#eee" }}
            />
          </div>

          <div style={{ flex: 1, overflow: "hidden" }}>
            <div
              style={{
                fontWeight: 600,
                fontSize: 18,
                marginBottom: 4,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {t("breakdown.view.header.code")}: {breakdown?.code}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 15,
              }}
            >
              <span
                style={{
                  fontWeight: 500,
                  color:
                    priorityLevelStatus.Options.find(
                      (opt) => opt.value === breakdown?.priorityLevel
                    )?.color || "#fff",
                }}
              >
                {t(
                  priorityLevelStatus.Options.find(
                    (opt) => opt.value === breakdown?.priorityLevel
                  )?.label
                ) || "--"}
              </span>

              {(_ticketStatus === breakdownType.assigned ||
                _ticketStatus === breakdownType.hasOpened) && (
                <>
                  <span style={{ color: "#ccc" }}>|</span>

                  <span
                    style={{
                      fontWeight: 600,
                      color:
                        (_ticketStatus === breakdownType.assigned
                          ? breakdownUserStatus.Option.find(
                              (opt) => opt.value === breakdownAssignUser?.status
                            )
                          : breakdownUserStatus.Option.find(
                              (opt) => opt.value === breakdown?.status
                            )
                        )?.color || "#fff",
                    }}
                  >
                    {_ticketStatus === breakdownType.assigned
                      ? t(
                          breakdownUserStatus.Option.find(
                            (opt) => opt.value === breakdownAssignUser?.status
                          )?.label
                        ) || breakdownAssignUser?.status
                      : t(
                          breakdownUserStatus.Option.find(
                            (opt) => opt.value === breakdown?.status
                          )?.label
                        ) || breakdown?.status}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Menu icon */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          background: "#fff",
          padding: "16px 0",
          borderBottom: "1px solid #eee",
        }}
      >
        <div
          style={{ textAlign: "center" }}
          onClick={() => navigate(staticPath.workDiary + "/" + breakdown.id)}
        >
          <FileTextOutlined style={{ fontSize: 28, color: "#444" }} />
          <div style={{ fontSize: 14, marginTop: 4 }}>
            {t("breakdown.view.menu.work_diary")}
          </div>
        </div>
        {_ticketStatus === breakdownType.assigned && (
          <div
            style={{ textAlign: "center" }}
            onClick={() =>
              navigate(staticPath.solutionBankBreakdown + "/" + breakdown.id, {
                state: {
                  assetModel: breakdown?.assetMaintenance?.assetModel.id,
                  assetModelFailureType: breakdown?.breakdownDefect?.id,
                },
              })
            }
          >
            <BookOutlined style={{ fontSize: 28, color: "#444" }} />
            <div style={{ fontSize: 14, marginTop: 4 }}>
              {t("breakdown.view.menu.solution_bank")}
            </div>
          </div>
        )}
        {checkPermission(permissions, permissionCodeConstant.spare_view_list) &&
          _ticketStatus === breakdownType.hasOpened && (
            <div
              style={{ textAlign: "center" }}
              onClick={() => onClickBreakdownSparePart()}
            >
              <DatabaseOutlined style={{ fontSize: 28, color: "#444" }} />
              <div style={{ fontSize: 14, marginTop: 4 }}>
                {t("breakdown.view.menu.spare_part")}
              </div>
            </div>
          )}
        <div
          style={{ textAlign: "center" }}
          onClick={() =>
            navigate(staticPath.breakdwonAttachment + "/" + breakdown.id)
          }
        >
          <PaperClipOutlined style={{ fontSize: 28, color: "#444" }} />
          <div style={{ fontSize: 14, marginTop: 4 }}>
            {t("breakdown.view.menu.attachments")}
          </div>
        </div>
        <div style={{ textAlign: "center", position: "relative" }}>
          <div
            onClick={() => setShowMoreMenu((v) => !v)}
            style={{ display: "inline-block" }}
          >
            <MoreOutlined style={{ fontSize: 28, color: "#444" }} />
            <div style={{ fontSize: 14, marginTop: 4, fontWeight: "600" }}>
              {t("breakdown.view.menu.more")}
            </div>
          </div>
          {showMoreMenu && (
            <div
              style={{
                position: "absolute",
                top: 48,
                right: 0,
                background: "#fff",
                borderRadius: 8,
                boxShadow: "0 2px 8px #0002",
                minWidth: 230,
                zIndex: 10,
                padding: "8px 0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "12px 18px",
                  cursor: "pointer",
                  fontSize: 16,
                }}
                onClick={() => {
                  setShowMoreMenu(false);
                  navigate(
                    staticPath.selfDiagnosisBreakdown + "/" + breakdown.id,
                    {
                      state: {
                        assetModel: breakdown?.assetMaintenance?.assetModel.id,
                        assetModelFailureType: breakdown?.breakdownDefect?.id,
                      },
                    }
                  );
                }}
              >
                <span style={{ marginRight: 12 }}>
                  <SignatureOutlined />
                </span>
                {t("breakdown.view.menu.self_diagnosis")}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "12px 18px",
                  cursor: "pointer",
                  fontSize: 16,
                }}
                onClick={() => {
                  setShowMoreMenu(false);
                  navigate(
                    staticPath.assetModelDocument +
                      "/" +
                      breakdown?.assetMaintenance?.assetModel.id
                  );
                }}
              >
                <span style={{ marginRight: 12 }}>
                  <ReadOutlined />
                </span>
                {t("breakdown.view.menu.guide_documents")}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "12px 18px",
                  cursor: "pointer",
                  fontSize: 16,
                }}
                onClick={() => {
                  setShowMoreMenu(false);
                  onClickCommentBreakdwon(breakdown);
                }}
              >
                <span style={{ marginRight: 12 }}>
                  <CommentOutlined />
                </span>
                {t("breakdown.close.fields.comment")}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* nút chấp nhận từ chối giao việc*/}
      {breakdownAssignUser?.status === breakdownUserStatus.assigned && (
        <Row
          style={{
            display: "flex",
            gap: 8,
            marginTop: 12,
            padding: "0 12px",
          }}
        >
          <Button
            icon={<CheckOutlined style={{ color: "blue" }} />}
            style={{
              flex: 1,
              height: 44,
              borderRadius: 8,
            }}
            onClick={(e) => {
              e.stopPropagation();
              onClickAccept(breakdownAssignUser);
            }}
          >
            {t("breakdown.actions.accept")}
          </Button>
          <Button
            style={{
              flex: 1,
              height: 44,
              borderRadius: 8,
            }}
            onClick={(e) => {
              e.stopPropagation();
              onClichRefuse(breakdownAssignUser);
            }}
          >
            <CloseOutlined style={{ color: "red" }} />
            {t("breakdown.actions.reject")}
          </Button>
        </Row>
      )}
      {_ticketStatus === breakdownType.assigned && (
        <>
          <CheckinCheckoutBreakdown
            lastCheckInCheckOutByUser={lastCheckInCheckOutByUser}
            breakdownAssignUser={breakdownAssignUser}
            lastCheckInCheckOut={lastCheckInCheckOut}
            getBreakdownAssignUserByBreakdownId={
              getBreakdownAssignUserByBreakdownId
            }
            onCallBack={(value) => {
              fetchGetBreakdownById(value);
              getBreakdownAssignUserByBreakdownId(value);
            }}
          />
          {lastCheckInCheckOut && !lastCheckInCheckOut.logOutAt && (
            <Row
              gutter={0}
              style={{
                background: "#fff",
                padding: "16px 0",
                borderBottom: "1px solid #eee",
                textAlign: "center",
              }}
              justify="center"
            >
              <Col
                span={6}
                onClick={() =>
                  navigate(
                    staticPath.breakdownSpareRequest + "/" + breakdown.id,
                    {
                      state: {
                        assetModel: breakdown?.assetMaintenance?.assetModel.id,
                        assetMaintenance: breakdown?.assetMaintenance?.id,
                      },
                    }
                  )
                }
              >
                <ToolOutlined style={{ fontSize: 28, color: "#223b5b" }} />
                <div style={{ fontSize: 14, marginTop: 4 }}>
                  {t("breakdown.view.menu.request_replace_spare")}
                </div>
              </Col>
              {breakdownAssignUser?.status !== "approved" && (
                <>
                  <Col
                    span={6}
                    onClick={() =>
                      navigate(
                        staticPath.requestForSupport + "/" + breakdown.id
                      )
                    }
                  >
                    <QuestionCircleOutlined
                      style={{ fontSize: 28, color: "#223b5b" }}
                    />
                    <div style={{ fontSize: 14, marginTop: 4 }}>
                      {t("breakdown.view.menu.request_support")}
                    </div>
                  </Col>
                  <Col
                    span={6}
                    onClick={() =>
                      navigate(
                        staticPath.testedFixed + "/" + breakdownAssignUser.id
                      )
                    }
                  >
                    <SettingOutlined
                      style={{ fontSize: 28, color: "#223b5b" }}
                    />
                    <div style={{ fontSize: 14, marginTop: 4 }}>
                      {t("breakdown.testedFix.title")}
                    </div>
                  </Col>
                  <Col
                    span={6}
                    onClick={() => onClickFixed(breakdownAssignUser)}
                  >
                    <CheckCircleOutlined
                      style={{ fontSize: 28, color: "#223b5b" }}
                    />
                    <div style={{ fontSize: 14, marginTop: 4 }}>
                      {t("breakdown.workSession.fixed_title")}
                    </div>
                  </Col>
                </>
              )}
            </Row>
          )}
        </>
      )}
      {checkPermission(
        permissions,
        permissionCodeConstant.breakdown_assign_engineer
      ) &&
        _ticketStatus === breakdownType.hasOpened &&
        breakdown?.ticketStatus === breakdownTicketStatus.new &&
        breakdown?.breakdownAssignUsers.length === 0 && (
          <Col span={24} style={{ textAlign: "center", paddingTop: 8 }}>
            <button
              onClick={() => onClickTechnicianAppoinment(breakdown)}
              style={{
                background: "#2ec6e9",
                color: "#fff",
                width: "60%",
                border: "none",
                borderRadius: 40,
                padding: "8px 10px",
                fontWeight: 600,
                fontSize: 16,
                cursor: "pointer",
              }}
            >
              {t("breakdown.view.menu.assign_technician")}
            </button>
          </Col>
        )}
      {checkPermission(
        permissions,
        permissionCodeConstant.breakdown_close_and_reopen
      ) &&
        _ticketStatus === breakdownType.hasOpened &&
        breakdown?.ticketStatus === breakdownTicketStatus.completed &&
        breakdown?.status === breakdownUserStatus.WWA && (
          <>
            <Col span={24} style={{ textAlign: "center", paddingTop: 8 }}>
              <button
                onClick={() => onClickComfirmCloseBreakdown(breakdown)}
                style={{
                  background: "#2ec6e9",
                  color: "#fff",
                  width: "60%",
                  border: "none",
                  borderRadius: 40,
                  padding: "8px 10px",
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: "pointer",
                }}
              >
                {t("breakdown.close.buttons.submit")}
              </button>
            </Col>
            <Col span={24} style={{ textAlign: "center", paddingTop: 8 }}>
              <button
                onClick={() => onClickReOpen(breakdown)}
                style={{
                  background: "red",
                  color: "#fff",
                  width: "60%",
                  border: "none",
                  borderRadius: 40,
                  padding: "8px 10px",
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: "pointer",
                }}
              >
                {t("breakdown.reopen.buttons.submit")}
              </button>
            </Col>
          </>
        )}
      {checkPermission(
        permissions,
        permissionCodeConstant.breakdown_cancel_ticket
      ) &&
        ((_ticketStatus === breakdownType.hasOpened &&
          breakdown.ticketStatus === breakdownTicketStatus.new &&
          breakdown.status !== breakdownUserStatus.accepted) ||
          (breakdown?.ticketStatus === breakdownTicketStatus.inProgress &&
            breakdown?.status === breakdownUserStatus.requestForSupport)) && (
          <Col span={24} style={{ textAlign: "center", padding: "8px 10px" }}>
            <button
              onClick={() => onClickComfirmCancel(breakdown)}
              style={{
                background: "red",
                color: "#fff",
                width: "60%",
                border: "none",
                borderRadius: 40,
                padding: "8px 10px",
                fontWeight: 600,
                fontSize: 16,
                cursor: "pointer",
              }}
            >
              {t("breakdown.view.menu.cancel_ticket")}
            </button>
          </Col>
        )}
      {_ticketStatus === breakdownType.hasOpened &&
        breakdown?.breakdownAssignUsers &&
        breakdown?.breakdownAssignUsers.length > 0 && (
          <div style={{ padding: "10px" }}>
            <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 12 }}>
              {t("breakdown.view.menu.service_technicians")}
            </div>
            <Row>
              {breakdown?.breakdownAssignUsers.map((u, idx) => (
                <Col span={24} key={idx}>
                  <div
                    style={{
                      background: "#f5f5f7",
                      minHeight: 100,
                      cursor: "pointer",
                      padding: "10px 0px",
                      borderBottom:
                        idx === breakdown.breakdownAssignUsers.length - 1
                          ? "none"
                          : "1px solid #bdbdbd",
                    }}
                  >
                    <Row align="middle">
                      <Col
                        span={5}
                        style={{ display: "flex", justifyContent: "center" }}
                      >
                        <div
                          style={{
                            width: 64,
                            height: 64,
                            borderRadius: "50%",
                            background: "#eee",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden",
                            border: "2px solid #e0e0e0",
                          }}
                        >
                          <Avatar
                            size={60}
                            style={{ backgroundColor: "#87d068" }}
                            icon={<UserOutlined />}
                          />
                        </div>
                      </Col>
                      <Col span={17}>
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: 16,
                            marginBottom: 4,
                          }}
                        >
                          {u.user?.fullName ||
                            u.user?.username ||
                            t("breakdown.view.menu.no_technician")}
                        </div>
                        <div>
                          {t("breakdown.view.menu.status")} :{" "}
                          <span
                            style={{
                              fontWeight: 600,
                              color:
                                progressStatus.Option.find(
                                  (opt) => opt.value === u.status
                                )?.color || "#000000",
                            }}
                          >
                            {t(
                              progressStatus.Option.find(
                                (p) => p.value === u.status
                              )?.label
                            )}
                          </span>
                        </div>
                        {u?.estimatedCompletionDate && (
                          <div style={{ color: "#888", fontSize: 14 }}>
                            {t("breakdown.view.menu.planned_finish")}{" "}
                            {parseDateHH(u?.estimatedCompletionDate)}
                          </div>
                        )}
                        {u?.repairContract && (
                          <div style={{ color: "#888", fontSize: 14 }}>
                            {t("menu.settings.contract")}{" "}
                            {u?.repairContract?.contractNo}
                          </div>
                        )}
                      </Col>
                      <Col
                        span={2}
                        style={{
                          textAlign: "center",
                          justifyContent: "center",
                          alignItems: "center",
                          fontSize: 20,
                          fontWeight: 600,
                          paddingRight: "10px",
                        }}
                      >
                        <a
                          href={`tel:${u.user?.contactNo || ""}`}
                          style={{ textDecoration: "none" }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <PhoneFilled style={{ color: "#10426d" }} />
                        </a>
                      </Col>
                      {checkPermission(
                        permissions,
                        permissionCodeConstant.breakdown_assign_engineer
                      ) &&
                        u.status !== breakdownUserStatus.replacement &&
                        u.status !== breakdownUserStatus.experimentalFix &&
                        u.status !== breakdownUserStatus.WCA &&
                        breakdown?.ticketStatus !==
                          breakdownTicketStatus.cloesed && (
                          <Col span={24}>
                            <button
                              onClick={() => onClickReplacement(u)}
                              className="ml-2 mt-2"
                              style={{
                                background: "#2ec6e9",
                                color: "#fff",
                                width: "40%",
                                border: "none",
                                borderRadius: 10,
                                padding: "8px 10px",
                                fontWeight: 600,
                                fontSize: 16,
                                cursor: "pointer",
                              }}
                            >
                              {t("breakdown.view.menu.reassign")}
                            </button>
                          </Col>
                        )}
                    </Row>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        )}
      <div
        style={{ fontWeight: 600, fontSize: 18, margin: "24px 0 12px 20px" }}
      >
        {t("breakdown.view.details.ticket_detail")}
      </div>
      <div
        style={{
          background: "#f5f5f7",
          margin: "0 12px 18px 12px",
          padding: "10px 0",
          boxShadow: "0 1px 6px #0001",
        }}
      >
        <RowDetail
          label={t("breakdown.create.fields.asset_status")}
          value={
            <span
              style={{
                color:
                  assetMaintenanceStatus.Options.find(
                    (opt) => opt.value === breakdown?.assetMaintenanceStatus
                  )?.color || "#000",
              }}
            >
              {t(
                parseToLabel(
                  assetMaintenanceStatus.Options,
                  breakdown?.assetMaintenanceStatus
                )
              )}
            </span>
          }
        />
        <RowDetail
          label={t("breakdown.viewTabs.general.fields.defect")}
          value={breakdown?.breakdownDefect?.name}
        />
        <RowDetail
          label={t("breakdown.reopen.fields.opened_date")}
          value={parseDateHH(breakdown?.createdAt)}
        />
        <RowDetail
          label={t("breakdown.view.menu.updated_date")}
          value={parseDateHH(breakdown?.updatedAt)}
        />
        {_ticketStatus === breakdownType.assigned && (
          <>
            <RowDetail
              label={t("breakdown.view.menu.assigned_date")}
              value={parseDateHH(breakdownAssignUser?.createdAt)}
            />
            <RowDetail
              label={t("breakdown.close.fields.deadline")}
              value={parseDateHH(breakdown?.incidentDeadline)}
            />
            <RowDetail
              label={t("breakdown.view.menu.expected_repair_time")}
              value={parseDateHH(breakdownAssignUser?.expectedRepairTime)}
            />
            {breakdownAssignUser?.repairContract && (
              <div
                onClick={() => onViewContract()}
                style={{ color: "#3bd9f5ff" }}
              >
                <RowDetail
                  label={t("menu.settings.contract")}
                  value={breakdownAssignUser?.repairContract?.contractNo}
                />
              </div>
            )}
          </>
        )}
      </div>
      <div
        style={{ fontWeight: 600, fontSize: 18, margin: "24px 0 12px 20px" }}
      >
        {t("breakdown.view.details.asset_detail")}
      </div>
      <div
        style={{
          background: "#f5f5f7",
          margin: "0 12px 18px 12px",
          padding: "10px 0",
          boxShadow: "0 1px 6px #0001",
        }}
      >
        <RowDetail
          label={t("breakdown.viewTabs.general.fields.asset_style")}
          value={
            t(
              assetType.Options.find(
                (s) => s.value === breakdown?.assetMaintenance?.assetStyle
              )?.label
            ) ||
            breakdown?.assetMaintenance?.assetStyle ||
            "--"
          }
        />
        <RowDetail
          label={t("breakdown.viewTabs.general.fields.asset_name")}
          value={breakdown?.assetMaintenance?.assetModel?.asset?.assetName}
        />
        <RowDetail
          label={t("breakdown.viewTabs.general.fields.model")}
          value={breakdown?.assetMaintenance?.assetModel?.assetModelName}
        />
        <RowDetail
          label={t("breakdown.viewTabs.general.fields.serial")}
          value={breakdown?.assetMaintenance?.serial}
        />
        <RowDetail
          label={t("breakdown.view.menu.asset_number")}
          value={breakdown?.assetMaintenance?.assetNumber}
        />
        <RowDetail
          label={t("breakdown.viewTabs.general.fields.category")}
          value={
            breakdown?.assetMaintenance?.assetModel?.category?.categoryName
          }
        />
        <RowDetail
          label={t("breakdown.cancel.fields.manufacturer")}
          value={
            breakdown?.assetMaintenance?.assetModel?.manufacturer
              ?.manufacturerName
          }
        />
      </div>
      <div
        style={{ fontWeight: 600, fontSize: 18, margin: "24px 0 12px 20px" }}
      >
        {t("breakdown.view.details.customer_detail")}
      </div>
      <div
        style={{
          background: "#f5f5f7",
          margin: "0 12px 18px 12px",
          padding: "10px 0",
          boxShadow: "0 1px 6px #0001",
        }}
      >
        <RowDetail
          label={t("breakdown.viewTabs.general.fields.customer_name")}
          value={breakdown?.assetMaintenance?.customer?.customerName || "--"}
        />
        <RowDetail
          label={t("breakdown.view.menu.customer_email")}
          value={breakdown?.assetMaintenance?.customer?.contactEmail || "--"}
        />
        <RowDetail
          label={t("breakdown.viewTabs.general.fields.contact_number")}
          value={breakdown?.assetMaintenance?.customer?.contactNumber || "--"}
        />
        <RowDetail
          label={t("breakdown.viewTabs.general.fields.opened_by")}
          value={breakdown?.createdBy?.username}
        />
      </div>
      <BreakdownComment
        open={openCommentBreakdown}
        onClose={() => setOpenCommentBreakdown(false)}
        dataBreakdown={dataBreakdown}
      />
      <ComfirmCancelBreakdown
        open={isComfirmCancelBreakdown}
        onCancel={() => setIsComfirmCancelBreakdown(false)}
        breakdown={breakdown}
        onRefresh={fetchGetBreakdownById}
      />
      <TechnicianAppoinment
        open={isOpenTechnicianAppoinment}
        onClose={() => setIsOpenTechnicianAppoinment(false)}
        onReFeshFilter={fetchGetBreakdownById}
        homeBreakdown={breakdown}
      />
      <ReplacementAssignUser
        open={isOpenReplacement}
        onClose={() => setIsOpenReplacement(false)}
        onReFeshFilter={fetchGetBreakdownById}
        homeBreakdown={breakdown}
        replacementAssignUser={replacementAssignUser}
      />
      <ReopenBreakdown
        open={isOpenReOpen}
        onCancel={() => setIsOpenReOpen(false)}
        onRefresh={fetchGetBreakdownById}
        breakdown={breakdown}
      />
      <ComfirmCloseBreakdown
        open={isComfirmCloseBreakdown}
        onCancel={() => setIsComfirmCloseBreakdown(false)}
        onRefresh={fetchGetBreakdownById}
        breakdown={breakdown}
      />
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
    </div>
  );
}

// Component cho từng dòng chi tiết
function RowDetail({ label, value }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 18px",
        borderBottom: "1px solid #eee",
        fontSize: 16,
      }}
    >
      <span style={{ color: "#888" }}>{label}</span>
      <span style={{ fontWeight: 500 }}>{value}</span>
    </div>
  );
}
