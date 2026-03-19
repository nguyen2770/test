import React, { useEffect, useRef, useState } from "react";
import { ArrowLeftOutlined, UploadOutlined } from "@ant-design/icons";
import SignaturePad from "react-signature-canvas";
import {
  Drawer,
  Button,
  Col,
  Form,
  Input,
  Row,
  Radio,
  Switch,
  Upload,
  message,
} from "antd";
import * as _unitOfWork from "../../api";
import {
  answerTypeInspection,
  serviceTaskType,
} from "../../utils/schedulePreventive.constant";
import ShowSuccess from "../modal/result/successNotification";
import ShowError from "../modal/result/errorNotification";
import { useTranslation } from "react-i18next";

function StartSchedulePreventiveTaskAssignUserDrawer({
  open,
  handleCancel,
  schedulePreventiveTask,
  taskItems = [],
  onCallback,
  schedulePreventive,
}) {
  const [schedulePreventiveTaskItems, setSchedulePreventiveTaskItems] =
    useState([]);
  const [formStartWork] = Form.useForm();
  const sigPadRef = useRef();
  const { t } = useTranslation();
  useEffect(() => {
    if (taskItems.length > 0) {
      setSchedulePreventiveTaskItems(taskItems);
    }
  }, [taskItems]);

  useEffect(() => {
    if (open && schedulePreventiveTask) {
      fetchGetDownTimeBySchedulePreventiveTaskAssignUser();
    }
  }, [open, schedulePreventiveTask]);
  const fetchGetDownTimeBySchedulePreventiveTaskAssignUser = async () => {
    if (schedulePreventiveTask?.id) {
      const res = await _unitOfWork.schedulePreventive.getDowntimeByShedulePreventiveAssignUser(
        schedulePreventiveTask?.id
      );
      if (res?.code === 1) {
        formStartWork.setFieldsValue({
          downtimeHr: res.downtimeHr,
          downtimeMin: res.downtimeMin,
        });
      }
    }
  };
  const onClose = () => {
    handleCancel();
  };
  const handleFinish = async () => {
    const values = formStartWork.getFieldsValue();
    const taskItems = await Promise.all(
      schedulePreventiveTaskItems.map(async (taskItem, taskItemIdx) => {
        const formTaskItem = values.taskItems?.[taskItemIdx] || {};
        let resource = null;

        if (
          Array.isArray(formTaskItem.file) &&
          formTaskItem.file.length > 0 &&
          formTaskItem.file[0].originFileObj
        ) {
          const resUpload = await _unitOfWork.resource.uploadImage({
            file: formTaskItem.file[0].originFileObj,
          });
          if (resUpload && resUpload.code === 1) {
            resource = resUpload.resourceId;
          }
        }

        const { file, ...rest } = formTaskItem;

        return {
          ...rest,
          taskItemId: taskItem._id || taskItem.id,
          resource,
        };
      })
    );
    const signatureData = sigPadRef.current?.isEmpty()
      ? null
      : sigPadRef.current.getCanvas().toDataURL("image/png");
    values.signature = signatureData;
    const payload = {
      schedulePreventiveTask: {
        id: schedulePreventiveTask?.id,
        downtimeHr: values.downtimeHr || 0,
        downtimeMin: values.downtimeMin || 0,
        comment: values.comment || "",
        signature: signatureData,
        signatoryIsName: values?.signatoryIsName,
      },
      taskItems,
      signature: signatureData,
    };
    const res = await _unitOfWork.schedulePreventive.startWorkTask(payload);
    if (res && res.code === 1) {
      ShowSuccess(
        "topRight",
        t("modal.notifications.error_default_title", {
          defaultValue: "Thông báo",
        }),
        t("myTask.checkin.messages.complete_task", {
          defaultValue: "Hoàn thành công việc!",
        })
      );
      onCallback();
    }
    //  else {
    //   ShowError(
    //     "topRight",
    //     t("modal.notifications.error_default_title", {
    //       defaultValue: "Thông báo",
    //     }),
    //     t("myTask.checkin.messages.incomplete_task", {
    //       defaultValue: "Chưa hoàn thành công việc, vui lòng thử lại!",
    //     })
    //   );
    // }
  };
  return (
    <Drawer
      placement="right"
      closable={false}
      open={open}
      width="100%"
      bodyStyle={{
        padding: 0,
        background: "#f8f8f8",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
      }}
    >
      <Form form={formStartWork} layout="vertical" onFinish={handleFinish}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            height: 56,
            background: "#23457b",
            color: "#fff",
            padding: "0 16px",
            fontWeight: 600,
            fontSize: 20,
            boxSizing: "border-box",
            flexShrink: 0,
          }}
        >
          <ArrowLeftOutlined
            style={{ fontSize: 22, marginRight: 16, cursor: "pointer" }}
            onClick={onClose}
          />
          <span style={{ flex: 1 }}>
            {t("schedulePreventiveTask.tooltips.view_items", {
              defaultValue: "Xem các mục công việc",
            })}
          </span>
        </div>
        <div
          style={{
            padding: "0px 16px",
            marginTop: "10px",
            fontWeight: "600",
            fontSize: "18px",
          }}
        >
          {t("schedulePreventiveTask.columns.name", {
            defaultValue: "Công viêc:",
          })}{" "}
          {schedulePreventiveTask?.taskName}
        </div>
        <div>
          {schedulePreventiveTaskItems &&
            schedulePreventiveTaskItems?.map((taskItem, taskItemIdx) => (
              <div
                style={{
                  border: "1px solid #d9d9d9",
                  padding: 16,
                  marginBottom: "10px",
                  borderRadius: "8px",
                  marginTop: "6px",
                }}
                className="ml-3 mr-3 mb-4"
              >
                <div style={{ fontWeight: 500 }}>
                  <span style={{ fontWeight: "600", fontSize: "16px" }}>
                    {t("workTask.labels.task_name", {
                      defaultValue: "Nghiệm vụ",
                    })}{" "}
                    {taskItemIdx + 1} :
                  </span>{" "}
                  {taskItem?.taskItemDescription}
                </div>
                <Row gutter={16}>
                  <Col span={24}>
                    {((taskItem?.schedulePreventiveTask?.taskType ===
                      serviceTaskType.inspection &&
                      (taskItem?.answerTypeInspection ===
                        answerTypeInspection.numbericValue ||
                        taskItem?.answerTypeInspection ===
                          answerTypeInspection.value)) ||
                      taskItem?.schedulePreventiveTask?.taskType ===
                        serviceTaskType.monitoring) && (
                      <Form.Item
                        name={["taskItems", taskItemIdx, "value"]}
                        rules={[
                          {
                            required: true,
                            message: t(
                              "myTask.checkin.validation.value_required",
                              { defaultValue: "Vui lòng chọn giá trị!" }
                            ),
                          },
                        ]}
                      >
                        <Input
                          placeholder={t(
                            "workTask.placeholders.task_item_description",
                            { defaultValue: "Nhập nội dung" }
                          )}
                        />
                      </Form.Item>
                    )}
                    {taskItem?.answerTypeInspection ===
                      answerTypeInspection.yesNoNa && (
                      <Form.Item
                        name={["taskItems", taskItemIdx, "status"]}
                        rules={[
                          {
                            required: true,
                            message: t(
                              "myTask.checkin.validation.value_required",
                              { defaultValue: "Vui lòng chọn giá trị!" }
                            ),
                          },
                        ]}
                      >
                        <Radio.Group>
                          <Radio value="yes">Yes</Radio>
                          <Radio value="no">No</Radio>
                          <Radio value="na">N/A</Radio>
                        </Radio.Group>
                      </Form.Item>
                    )}
                    {taskItem?.schedulePreventiveTask?.taskType ===
                      serviceTaskType.calibration && (
                      <>
                        <Form.Item
                          label="Value"
                          name=""
                          initialValue={taskItem.value1}
                          rules={[
                            {
                              required: true,
                              message: t(
                                "myTask.checkin.validation.value_required",
                                { defaultValue: "Vui lòng chọn giá trị!" }
                              ),
                            },
                          ]}
                        >
                          <Input />
                        </Form.Item>
                        <Form.Item
                          label={t("myTask.checkin.fields.work_level", {
                            defaultValue: "Mức độ công việc",
                          })}
                          name={["taskItems", taskItemIdx, "status"]}
                          rules={[
                            {
                              required: true,
                              message: t(
                                "myTask.checkin.validation.value_required",
                                { defaultValue: "Vui lòng chọn giá trị!" }
                              ),
                            },
                          ]}
                        >
                          <Radio.Group>
                            <Radio value="done">
                              {t("myTask.checkin.messages.complete_task", {
                                defaultValue: "Đã xong",
                              })}
                            </Radio>
                            <Radio value="not-done">
                              {t("myTask.checkin.messages.incomplete_task", {
                                defaultValue: "Không hoàn thành",
                              })}
                            </Radio>
                          </Radio.Group>
                        </Form.Item>
                      </>
                    )}
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      label={t("myTask.checkin.fields.attachment", {
                        defaultValue: "Tài liệu đính kèm",
                      })}
                      name={["taskItems", taskItemIdx, "file"]}
                      valuePropName="fileList"
                      getValueFromEvent={(e) => e && e.fileList}
                    >
                      <Upload
                        name="file"
                        listType="text"
                        maxCount={1}
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                        showUploadList={{
                          showPreviewIcon: true,
                          showRemoveIcon: true,
                        }}
                        beforeUpload={(file) => {
                          const isLt5M = file.size / 1024 / 1024 < 5;
                          if (!isLt5M) {
                            message.error(
                              t("myTask.checkin.messages.upload_size_error", {
                                defaultValue:
                                  "Kích thước tài liệu phải nhỏ hơn 5MB!",
                              })
                            );
                          }
                          return isLt5M ? false : Upload.LIST_IGNORE;
                        }}
                      >
                        <Button icon={<UploadOutlined />}>
                          {t("myTask.checkin.buttons.upload_file", {
                            defaultValue: "Tải lên tài liệu",
                          })}
                        </Button>
                      </Upload>
                    </Form.Item>
                  </Col>

                  <Col span={24}>
                    <Form.Item name={["taskItems", taskItemIdx, "comment"]}>
                      <Input.TextArea
                        placeholder={t("myTask.checkin.fields.comment", {
                          defaultValue: "Ghi chú",
                        })}
                        autoSize={{ minRows: 3, maxRows: 5 }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      label={t("myTask.checkin.fields.problem_switch", {
                        defaultValue: "Gặp vấn đề (tạo sự cố)",
                      })}
                      name={["taskItems", taskItemIdx, "isProblem"]}
                      labelCol={{ span: 12 }}
                      wrapperCol={{ span: 12 }}
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      shouldUpdate={(prev, curr) =>
                        prev?.taskItems?.[taskItemIdx]?.isProblem !==
                        curr?.taskItems?.[taskItemIdx]?.isProblem
                      }
                      noStyle
                    >
                      {({ getFieldValue }) =>
                        getFieldValue([
                          "taskItems",
                          taskItemIdx,
                          "isProblem",
                        ]) ? (
                          <Form.Item
                            label={
                              <span style={{ color: "red" }}>
                                {t(
                                  "myTask.checkin.fields.problem_description",
                                  { defaultValue: "Mô tả vấn đề" }
                                )}
                              </span>
                            }
                            name={["taskItems", taskItemIdx, "problemComment"]}
                            rules={[
                              {
                                required: true,
                                message: t(
                                  "myTask.checkin.validation.problem_required",
                                  { defaultValue: "Nhập mô tả vấn đề!" }
                                ),
                              },
                            ]}
                          >
                            <Input.TextArea
                              placeholder={t(
                                "myTask.checkin.fields.problem_description_placeholder",
                                { defaultValue: "Nhập mô tả vấn đề" }
                              )}
                            />
                          </Form.Item>
                        ) : null
                      }
                    </Form.Item>
                  </Col>
                </Row>
              </div>
            ))}
        </div>
        <Row className="pr-3 pl-3" gutter={[16, 16]}>
          <Col span={12}>
            <Form.Item
              label={t("myTask.checkin.fields.downtime_hour", {
                defaultValue: "Giờ ngừng hoạt động",
              })}
              name="downtimeHr"
              initialValue={0}
            >
              <Input type="number" min={0} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={t("myTask.checkin.fields.downtime_minute", {
                defaultValue: "Phút ngừng hoạt động",
              })}
              name="downtimeMin"
              initialValue={0}
            >
              <Input type="number" min={0} />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name={"comment"}>
              <Input.TextArea
                className="wp-100"
                placeholder={t("myTask.checkin.fields.comment", {
                  defaultValue: "Ghi chú chung",
                })}
                autoSize={{ minRows: 3, maxRows: 5 }}
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            {" "}
            <Form.Item
              label={t("breakdown.close.fields.signatory_is_name")}
              name="signatoryIsName"
            >
              <Input
                placeholder={t(
                  "breakdown.close.fields.enter_signatory_is_name"
                )}
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label={t("preventiveSchedule.fields.signature", {
                defaultValue: "Chữ ký người dùng tài sản",
              })}
              name="signature"
              rules={[
                {
                  required: true,
                  message: t(
                    "preventiveSchedule.validation.signature_required",
                    { defaultValue: "Vui lòng ký tên trước khi nộp!" }
                  ),
                  validator: (_, value) => {
                    if (sigPadRef.current && !sigPadRef.current.isEmpty()) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      t("preventiveSchedule.validation.signature_required", {
                        defaultValue: "Vui lòng ký tên trước khi nộp!",
                      })
                    );
                  },
                },
              ]}
            >
              <div style={{ border: "2px solid #b8aeae", borderRadius: "2px" }}>
                <SignaturePad
                  ref={sigPadRef}
                  canvasProps={{
                    width: 320,
                    height: 100,
                    className: "sigCanvas",
                  }}
                />
              </div>
              <div style={{ textAlign: "end" }}>
                <Button
                  onClick={() => sigPadRef.current?.clear()}
                  style={{
                    marginTop: "5px",
                    background: "#23457B",
                    color: "#ffffff",
                  }}
                >
                  {t("modal.common.buttons.clear", {
                    defaultValue: "Xóa chữ ký",
                  })}
                </Button>
              </div>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16} className="mb-3 ml-3 mr-3">
          <Col span={24} className="text-center">
            <Button type="primary" htmlType="submit">
              {t("myTask.checkin.buttons.complete_task", {
                defaultValue: "Xác nhận hoàn thành công việc",
              })}
            </Button>
          </Col>
        </Row>
      </Form>
    </Drawer>
  );
}
export default React.memo(StartSchedulePreventiveTaskAssignUserDrawer);
