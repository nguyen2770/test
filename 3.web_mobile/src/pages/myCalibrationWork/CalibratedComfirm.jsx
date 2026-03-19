import React, { useEffect, useRef, useState } from "react";
import { ArrowLeftOutlined } from "@ant-design/icons";
import SignaturePad from "react-signature-canvas";
import { Drawer, Button, Col, Form, Input, Row, Switch } from "antd";
import * as _unitOfWork from "../../api";
import { useTranslation } from "react-i18next";
import ShowSuccess from "../../components/modal/result/successNotification";
import ShowError from "../../components/modal/result/errorNotification";
import AddListAttachment from "../../components/modal/Attachment/AddListAttachment";

export default function CalibratedConfirm({
  open,
  handleCancel,
  onCallback,
  calibrationWorkAssignUser,
}) {
  const [formStartWork] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const sigPadRef = useRef();
  const { t } = useTranslation();

  useEffect(() => {
    if (open && calibrationWorkAssignUser) {
      fetchGetDownTimeByCalibrationWorkAssignUser();
    }
  }, [open, calibrationWorkAssignUser]);
   //  tính ra thời gian downtime từ lúc đăng nhập đến lúc vào trang này
  const fetchGetDownTimeByCalibrationWorkAssignUser = async () => {
    if (calibrationWorkAssignUser?.id) {
      const res =
        await _unitOfWork.calibrationWork.getDownTimeByCalibrationWorkAssignUser(
          calibrationWorkAssignUser?.id
        );
      if (res?.code === 1) {
        formStartWork.setFieldsValue({
          downtimeHr: res.downtimeHr,
          downtimeMin: res.downtimeMin,
        });
      }
    }
  };

  const onClose = () => handleCancel();

  const handleFinish = async () => {
    const values = formStartWork.getFieldsValue();
    const newSupportDocuments = [];
    for (const file of fileList) {
      const resUpload = await _unitOfWork.resource.uploadImage({
        file: file?.originFileObj,
      });
      if (resUpload?.code === 1) {
        newSupportDocuments.push({ resource: resUpload.resourceId });
      }
    }
    const signatureData = sigPadRef.current?.isEmpty()
      ? null
      : sigPadRef.current.getCanvas().toDataURL("image/png");

    const payload = {
      ...values,
      calibrationWorkAssignUser:
        calibrationWorkAssignUser?.id || calibrationWorkAssignUser?._id,
      newSupportDocuments,
      signature: signatureData,
    };
    const res = await _unitOfWork.calibrationWork.calibratedComfirm(payload);
    if (res?.code === 1) {
      ShowSuccess("topRight", t("Thông báo"), t("Hoàn thành công việc!"));
      onCallback?.();
    } else {
      ShowError(
        "topRight",
        t("Thông báo"),
        t("Chưa hoàn thành, vui lòng thử lại!")
      );
    }
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
      <Form
        form={formStartWork}
        layout="vertical"
        onFinish={handleFinish}
        style={{ height: "100%", display: "flex", flexDirection: "column" }}
      >
        {/* Header */}
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
            {t("calibrationWork.confirm_calibration_work")}
          </span>
        </div>

        {/* Nội dung */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Form.Item
                label={t("calibrationWork.an_incident_occurred")}
                name="isProblem"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                shouldUpdate={(prev, curr) => prev.isProblem !== curr.isProblem}
                noStyle
              >
                {({ getFieldValue }) =>
                  getFieldValue("isProblem") ? (
                    <Form.Item
                      label={
                        <span style={{ color: "red" }}>
                          {t("calibrationWork.problem_description")}
                        </span>
                      }
                      name="problemComment"
                      rules={[
                        {
                          required: true,
                          message: t(
                            "calibrationWork.enter_problem_description"
                          ),
                        },
                      ]}
                    >
                      <Input.TextArea
                        placeholder={t(
                          "calibrationWork.enter_problem_description"
                        )}
                        autoSize={{ minRows: 3, maxRows: 5 }}
                      />
                    </Form.Item>
                  ) : (
                    <Row gutter={[16, 16]}>
                      <Col span={12}>
                        <Form.Item
                          label={t("myTask.checkin.fields.downtime_hour")}
                          name="downtimeHr"
                          initialValue={0}
                        >
                          <Input type="number" min={0} />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          label={t("myTask.checkin.fields.downtime_minute")}
                          name="downtimeMin"
                          initialValue={0}
                        >
                          <Input type="number" min={0} />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        {" "}
                        <Form.Item
                          label={t("calibrationWork.note")}
                          name="comment"
                          rules={[
                            {
                              required: false,
                            },
                          ]}
                        >
                          <Input.TextArea
                            placeholder={t("calibrationWork.enter_note")}
                            autoSize={{ minRows: 3, maxRows: 5 }}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  )
                }
              </Form.Item>
            </Col>

            {/* Chữ ký */}
            <Col span={24}>
              <Form.Item
                label={t("calibrationWork.signature")}
                name="signature"
                rules={[
                  {
                    validator: () => {
                      if (sigPadRef.current && !sigPadRef.current.isEmpty()) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        t("calibrationWork.please_sign_before_submitting")
                      );
                    },
                  },
                ]}
              >
                <div
                  style={{
                    border: "2px solid #b8aeae",
                    borderRadius: "4px",
                    padding: "4px",
                  }}
                >
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
                    {t("calibrationWork.clear_signature")}
                  </Button>
                </div>
              </Form.Item>
            </Col>
            {/* File đính kèm */}
            <Col span={24}>
              <AddListAttachment value={fileList} onChange={setFileList} />
            </Col>
          </Row>
        </div>

        {/* Nút gửi */}
        <div
          style={{
            padding: "16px",
            textAlign: "center",
            borderTop: "1px solid #ddd",
          }}
        >
          <Button type="primary" htmlType="submit">
            {t("calibrationWork.send_confirmation")}
          </Button>
        </div>
      </Form>
    </Drawer>
  );
}
