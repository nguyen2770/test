import React, { useEffect, useState } from "react";
import {
  Modal,
  Row,
  Col,
  Input,
  Button,
  Space,
  message,
  Drawer,
  Form,
  Radio,
  InputNumber,
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import * as _unitOfWork from "../../api";
import {
  schedulePreventiveTaskRequestSparePartDetailStatus,
  schedulePreventiveTaskRequestSparePartStatus,
} from "../../utils/constant";
import { parseToLabel } from "../../helper/parse-helper";
import TechnicianAppoinment from "../../components/modal/TechnicianAppoinment";
import useAuth from "../../contexts/authContext";
import { useTranslation } from "react-i18next";
import { formatCurrency, parseCurrency } from "../../helper/price-helper";

const ApproveSparePartSchedulePreventive = ({
  open,
  onClose,
  data,
  onSubmit,
}) => {
  const [rejectedComments, setRejectedComments] = useState({});
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [currentRejectingItem, setCurrentRejectingItem] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [isOpenAssignUser, setIsOpenAssignUser] = useState(false);
  const [breakdownSpareRequestDetails, setBreakdownSpareRequestDetails] =
    useState([]);
  const [assignUser, setAssignUser] = useState([]);
  const [assignUserIds, setAssignUserIds] = useState([]);
  const [form] = Form.useForm();
  const [isAllRejected, setIsAllRejected] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if ((open && data?._id) || data?.id) {
      getAllBreakdownSpareRequestBySpareRequestId();
    }
  }, [open, data]);

  useEffect(() => {
    if (breakdownSpareRequestDetails.length > 0) {
      const allMatch = breakdownSpareRequestDetails.every(
        (item) =>
          item?.requestStatus ===
            schedulePreventiveTaskRequestSparePartDetailStatus.rejected ||
          item?.requestStatus ===
            schedulePreventiveTaskRequestSparePartDetailStatus.spareReplace
      );
      setIsAllRejected(allMatch);
    }
  }, [breakdownSpareRequestDetails]);

  const getAllBreakdownSpareRequestBySpareRequestId = async () => {
    const res =
      await _unitOfWork.schedulePreventiveTaskRequestSparepart.getScheduleePreventiveRequestSparePartById(
        {
          id: data?._id || data?.id,
        }
      );
    if (res?.code === 1) {
      const withTotal =
        res.data?.scheduleePreventiveRequestSparePartDetails?.map((item) => ({
          ...item,
          totalCost: item.qty * item.unitCost,
        }));
      setBreakdownSpareRequestDetails(withTotal);
    }
  };

  const handleFieldChange = (value, record, field) => {
    const updated = breakdownSpareRequestDetails.map((item) => {
      if (item.id === record.id) {
        const updatedItem = {
          ...item,
          [field]: Number(value) || 0,
        };
        updatedItem.totalCost = updatedItem.qty * updatedItem.unitCost;
        return updatedItem;
      }
      return item;
    });
    setBreakdownSpareRequestDetails(updated);
  };

  const openCommentModal = (item) => {
    setCurrentRejectingItem(item);
    setCommentText("");
    setCommentModalVisible(true);
  };

  const onClickAssignUser = (value) => {
    setIsOpenAssignUser(true);
    setAssignUser(value);
  };

  const handleRejectWithComment = () => {
    const newDetails = [...breakdownSpareRequestDetails];
    let idxReject = newDetails.findIndex(
      (item) => item.id === currentRejectingItem.id
    );
    if (idxReject > -1) {
      newDetails[idxReject].requestStatus =
        schedulePreventiveTaskRequestSparePartDetailStatus.rejected;
      newDetails[idxReject].comment = commentText;
    }
    setBreakdownSpareRequestDetails(newDetails);
    setCommentModalVisible(false);
    setCurrentRejectingItem(null);
  };

  const restoreRejectedItem = (item) => {
    const newDetails = [...breakdownSpareRequestDetails];
    let idxReject = newDetails.findIndex(
      (newDetail) => newDetail.id === item?.id
    );
    if (idxReject > -1) {
      newDetails[idxReject].requestStatus =
        schedulePreventiveTaskRequestSparePartDetailStatus.pendingApproval;
      newDetails[idxReject].comment = "";
    }
    setBreakdownSpareRequestDetails(newDetails);
  };

  const showComment = (item) => {
    Modal.info({
      title: t(
        "breakdown.spareRequest.modal.reject_reason_modal.view_reason_title"
      ),
      content:
        item.comment ||
        t("breakdown.spareRequest.modal.reject_reason_modal.no_comment"),
      okText: t("breakdown.spareRequest.buttons.close"),
    });
  };

  const callbackAssignUser = (value, selectedRowKeys) => {
    if (selectedRowKeys.length > 0) {
      setAssignUserIds(selectedRowKeys);
    }
    setIsOpenAssignUser(false);
    return true;
  };

  const onFinishSave = async () => {
    const payload = {
      schedulePrevetiveTaskSparePartRequestDetails:
        breakdownSpareRequestDetails,
      user: assignUserIds[0],
      schedulePrevetiveTaskSparePartRequest: data?.id || data?._id,
    };
    let res =
      await _unitOfWork.schedulePreventiveTaskRequestSparepart.comfirmSendSparePart(
        payload
      );
    if (res?.code === 1) {
      message.success(t("notification.successfully"));
      onSubmit();
    } else {
      message.error(t("notification.failed"));
    }
  };

  const showButtonRejeced = (item) =>
    item?.requestStatus ===
    schedulePreventiveTaskRequestSparePartDetailStatus.pendingApproval;

  const showButtonRecovered = (item) =>
    item?.requestStatus ===
    schedulePreventiveTaskRequestSparePartDetailStatus.rejected;

  return (
    <Drawer
      placement="right"
      closable={false}
      open={open}
      width="100%"
      bodyStyle={{ padding: 0 }}
    >
      <Form layout="vertical" form={form}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            height: 56,
            background: "#23457b",
            color: "#fff",
            padding: "15px",
            fontWeight: 600,
            fontSize: 20,
            zIndex: 1000,
            position: "sticky",
            top: 0,
          }}
        >
          <ArrowLeftOutlined
            style={{ fontSize: 22, marginRight: 16, cursor: "pointer" }}
            onClick={onClose}
          />
          <span style={{ flex: 1 }}>
            {t("breakdown.spareRequest.modal.title")}
          </span>
        </div>

        <Row gutter={[24, 24]} className="p-2">
          {[...breakdownSpareRequestDetails].map((item) => (
            <Col span={24} key={item.id}>
              <div
                style={{
                  marginBottom: 16,
                  background: rejectedComments[item.id] ? "#ffeaea" : "#f6ffed",
                  boxShadow: "0 2px 8px #f0f1f2",
                  borderRadius: 12,
                  padding: 18,
                  border: "1px solid #e0e0e0",
                  position: "relative",
                }}
              >
                <div style={{ position: "absolute", top: 16, right: 18 }}>
                  <Space>
                    {showButtonRejeced(item) && (
                      <Button
                        size="small"
                        onClick={() => openCommentModal(item)}
                      >
                        {t("breakdown.spareRequest.modal.tooltips.reject")}
                      </Button>
                    )}
                    {showButtonRecovered(item) && (
                      <>
                        {data.requestStatus ===
                          schedulePreventiveTaskRequestSparePartStatus.pendingApproval && (
                          <Button
                            size="small"
                            onClick={() => restoreRejectedItem(item)}
                          >
                            {t("breakdown.spareRequest.modal.tooltips.restore")}
                          </Button>
                        )}
                        <Button size="small" onClick={() => showComment(item)}>
                          {t(
                            "breakdown.spareRequest.modal.tooltips.view_reason"
                          )}
                        </Button>
                      </>
                    )}
                  </Space>
                </div>
                <div
                  style={{ fontWeight: 600, fontSize: 18, marginBottom: 12 }}
                >
                  {item.sparePart?.sparePartsName || "-"}
                </div>
                <Row gutter={16}>
                  <Col span={8} className="mb-1">
                    <b>{t("breakdown.spareRequest.modal.table.qty")}: </b>
                  </Col>
                  <Col span={16} className="mb-1">
                    <InputNumber
                      value={item.qty}
                      onChange={(value) =>
                        handleFieldChange(value, item, "qty")
                      }
                      style={{ width: "100%" }}
                    />
                  </Col>
                  <Col span={8} className="mb-1">
                    <b>{t("breakdown.spareRequest.modal.table.unit_cost")}: </b>
                  </Col>
                  <Col span={16} className="mb-1">
                    <InputNumber
                      value={item.unitCost}
                      onChange={(value) =>
                        handleFieldChange(value, item, "unitCost")
                      }
                      formatter={formatCurrency}
                      style={{ width: "100%" }}
                    />
                  </Col>
                  <Col span={8} className="mb-1">
                    <b>
                      {t("breakdown.spareRequest.modal.table.total_cost")}:{" "}
                    </b>
                  </Col>
                  <Col span={16} className="mb-2">
                    <span
                      style={{
                        color: "#1890ff",
                        fontWeight: 500,
                        marginLeft: 8,
                      }}
                    >
                      {(item.totalCost || 0).toLocaleString()} VNĐ
                    </span>
                  </Col>
                  <Col span={8} className="mb-2">
                    <b>{t("breakdown.spareRequest.modal.table.status")}: </b>
                  </Col>
                  <Col span={16}>
                    <span
                      style={{
                        color: "#23457b",
                        fontWeight: 500,
                        marginLeft: 8,
                      }}
                    >
                      {t(
                        parseToLabel(
                          schedulePreventiveTaskRequestSparePartStatus.Options,
                          item?.requestStatus
                        )
                      )}
                    </span>
                  </Col>
                </Row>
              </div>
            </Col>
          ))}
          <div className="p-3 mb-5">
            {data?.requestStatus ===
              schedulePreventiveTaskRequestSparePartStatus.pendingApproval &&
              !isAllRejected && (
                <Row>
                  <Col span={6}>
                    <strong>
                      {t("breakdown.spareRequest.modal.send_via")}
                    </strong>
                  </Col>
                  <Col span={18}>
                    <Form.Item
                      name="sendType"
                      rules={[
                        {
                          required: true,
                          message: t(
                            "breakdown.spareRequest.modal.validation.send_type_required"
                          ),
                        },
                      ]}
                    >
                      <Radio.Group
                        onChange={(e) => {
                          if (e.target.value === "technician") {
                            onClickAssignUser(data.breakdown);
                          } else {
                            setAssignUserIds([data.createdBy._id]);
                          }
                        }}
                      >
                        <Radio value="technician">
                          {t(
                            "breakdown.spareRequest.modal.send_type.technician"
                          )}
                        </Radio>
                        <Radio value="postman">
                          {t("breakdown.spareRequest.modal.send_type.postman")}
                        </Radio>
                      </Radio.Group>
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      label={t("breakdown.spareRequest.modal.comment")}
                      name="comment"
                      rules={[
                        {
                          required: true,
                          message: t(
                            "breakdown.spareRequest.modal.validation.comment_required"
                          ),
                        },
                      ]}
                    >
                      <Input
                        placeholder={t(
                          "breakdown.spareRequest.modal.comment_placeholder"
                        )}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              )}
          </div>
        </Row>
        {data?.requestStatus ===
          schedulePreventiveTaskRequestSparePartStatus.pendingApproval && (
          <Button
            type="primary"
            onClick={onFinishSave}
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              width: "100%",
              borderRadius: 10,
              height: 40,
              fontSize: 18,
              zIndex: 999,
              marginBottom: 10,
            }}
          >
            {t("breakdown.spareRequest.modal.send_button", {
              defaultValue: "Gửi tới",
            })}
          </Button>
        )}

        <Modal
          title={t("breakdown.spareRequest.modal.reject_reason_modal.title")}
          open={commentModalVisible}
          onOk={handleRejectWithComment}
          onCancel={() => setCommentModalVisible(false)}
          okText={t("breakdown.spareRequest.modal.reject_reason_modal.ok")}
          cancelText={t(
            "breakdown.spareRequest.modal.reject_reason_modal.cancel"
          )}
        >
          <Input.TextArea
            rows={4}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={t(
              "breakdown.spareRequest.modal.reject_reason_modal.placeholder"
            )}
          />
        </Modal>
      </Form>

      <TechnicianAppoinment
        open={isOpenAssignUser}
        onClose={() => setIsOpenAssignUser(false)}
        assignUser={assignUser}
        callbackAssignUser={callbackAssignUser}
        noSelectContract={true}
        oneSelectUser={true}
      />
    </Drawer>
  );
};

export default ApproveSparePartSchedulePreventive;
