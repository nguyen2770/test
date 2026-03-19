import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as _unitOfWork from "../../api";
import { ArrowLeftOutlined, PaperClipOutlined } from "@ant-design/icons";
import {
  Col,
  Row,
  Form,
  Input,
  Select,
  Button,
  Upload,
  message,
  Rate,
  InputNumber,
} from "antd";
import SignaturePad from "react-signature-canvas";
import { parseDateHH } from "../../helper/date-helper";
import { useTranslation } from "react-i18next";

const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
export default function ComfirmFixed() {
  const { t } = useTranslation();
  const params = useParams();
  const navigate = useNavigate();
  const [breakdownAssignUser, setBreakdownAssignUser] = useState(null);
  const [fileList, setFileList] = useState([]);
  const sigPadRef = useRef();
  const [form] = Form.useForm();
  const [totalEngineerBreakdown, setTotalEngineerBreakdown] = useState("");

  useEffect(() => {
    fetchGetBreakdownUserById();
    fetchGetTotalEngineerBreakdown();
  }, []);

  const fetchGetBreakdownUserById = async () => {
    let res = await _unitOfWork.breakdownAssignUser.getBreakdownAssignUserById({
      id: params.id,
    });
    if (res && res.code === 1) {
      setBreakdownAssignUser(res?.data?.breakdown);
      form.setFieldsValue({
        problem: res?.data?.breakdown?.breakdown?.breakdownDefect?.name,
      });
    }
  };
  const fetchGetTotalEngineerBreakdown = async () => {
    let res =
      await _unitOfWork.breakdownAssignUser.getTotalEngineerBreakdownAssignUser(
        params.id
      );
    if (res && res.code === 1) {
      setTotalEngineerBreakdown(res?.totalEngineerBreakdown);
      if (!res?.time)
        return form.setFieldsValue({ downtimeHr: 0, downtimeMin: 0 });
      const totalMinutes = Math.floor(Number(res?.time) / 60000);
      const downtimeHr = Math.floor(totalMinutes / 60);
      const downtimeMin = totalMinutes % 60;
      return form.setFieldsValue({
        downtimeHr: downtimeHr,
        downtimeMin: downtimeMin,
      });
    }
  };
  const handleChangeUpload = async (info) => {
    let newFileList = info.fileList;
    for (let i = 0; i < newFileList.length; i++) {
      if (!newFileList[i].src && newFileList[i].originFileObj) {
        newFileList[i].src = await getBase64(newFileList[i].originFileObj);
      }
    }
    setFileList(newFileList);
  };

  const propss = {
    onChange: handleChangeUpload,
    multiple: true,
    fileList: fileList,
  };

  const onFinish = async () => {
    const values = form.getFieldsValue();
    const signatureData = sigPadRef.current?.isEmpty()
      ? null
      : sigPadRef.current.getCanvas().toDataURL("image/png");
    values.signature = signatureData;
    const newSupportDocuments = [];
    if (fileList) {
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const resUpload = await _unitOfWork.resource.uplresourceoadImage({
          file: file?.originFileObj,
        });
        if (resUpload && resUpload.code === 1) {
          newSupportDocuments.push({
            resource: resUpload.resourceId,
          });
        }
      }
    }
    const hour = Number(values.downtimeHr || 0);
    const minute = Number(values.downtimeMin || 0);
    const downtimeMs = (hour * 60 + minute) * 60 * 1000;
    values.downTimeMilis = downtimeMs;

    let res =
      await _unitOfWork.breakdownAssignUser.createBreakdownAssignUserRepair({
        data: {
          listAttachment: newSupportDocuments,
          beakdownAssignUserRepair: {
            breakdownAssignUser: params?.id,
            ...values,
          },
        },
      });
    if (res && res.code === 1) {
      message.success(t("breakdown.testedFix.messages.success"));
      navigate(-1);
    }
  };
  return (
    <div style={{ background: "#ffffff", minHeight: "100vh" }}>
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
        }}
      >
        <ArrowLeftOutlined
          style={{ fontSize: 22, marginRight: 16, cursor: "pointer" }}
          onClick={() => navigate(-1)}
        />
        <span style={{ flex: 1 }}>{t("breakdown.testedFix.title")}</span>
      </div>
      {/* Tiêu đề */}
      <div
        style={{
          fontWeight: 600,
          fontSize: 18,
          marginTop: "10px",
          textAlign: "center",
        }}
      >
        {
          breakdownAssignUser?.breakdown?.assetMaintenanc?.assetModel?.asset
            ?.assetName
        }
      </div>
      {/* Card thông tin */}
      <div style={{ padding: "15px" }}>
        <Row style={{ textAlign: "center" }}>
          <Col span={12}>
            <div style={{ color: "#aaa", fontSize: 15 }}>
              {t("breakdown.sparePart.card_code")}
            </div>
            <div style={{ color: "#00b96b", fontWeight: 500, fontSize: 17 }}>
              {breakdownAssignUser?.breakdown?.code}
            </div>
          </Col>
          <Col span={12}>
            <div style={{ color: "#aaa", fontSize: 15 }}>
              {t("breakdown.reopen.fields.opened_date")}
            </div>
            <div style={{ color: "#00b96b", fontWeight: 500, fontSize: 17 }}>
              {parseDateHH(breakdownAssignUser?.breakdown?.createdAt)}
            </div>
          </Col>
        </Row>
      </div>
      <div style={{ borderBottom: "2px dashed #ccc", marginBottom: 12 }} />

      {/* Form */}
      <Form
        layout="vertical"
        style={{ padding: "0 16px" }}
        onFinish={onFinish}
        form={form}
      >
        <Row gutter={10}>
          <Col span={12}>
            <Form.Item
              label={t("breakdown.testedFix.fields.supervisory_time")}
              name="supervisoryNumber"
              rules={[
                {
                  required: true,
                  message: t(
                    "breakdown.testedFix.validation.supervisory_required"
                  ),
                },
              ]}
            >
              <InputNumber style={{ width: "100%" }} size="large" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={t("breakdown.testedFix.fields.unit")} name="unit">
              <Select defaultValue="Days" size="large">
                <Select.Option value="Days">
                  {t("breakdown.testedFix.options.days")}
                </Select.Option>
                <Select.Option value="Hours">
                  {t("breakdown.testedFix.options.hours")}
                </Select.Option>
              </Select>
            </Form.Item>
          </Col>
          {totalEngineerBreakdown === 1 && (
            <>
              <Col span={12}>
                <Form.Item
                  label={t("myTask.checkin.fields.downtime_hour", {
                    defaultValue: "Giờ ngừng hoạt động",
                  })}
                  name="downtimeHr"
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
                >
                  <Input type="number" min={0} />
                </Form.Item>
              </Col>
            </>
          )}
        </Row>
        <Form.Item label={t("breakdown.workSession.notes_label")} name="notes">
          <Input.TextArea
            rows={2}
            placeholder={t("breakdown.workSession.notes_placeholder")}
          />
        </Form.Item>
        <Form.Item label={t("breakdown.close.fields.problem")} name="problem">
          <Input
            placeholder={t("breakdown.close.fields.problem")}
            size="large"
          />
        </Form.Item>
        <Form.Item
          label={t("breakdown.close.fields.root_cause")}
          name="rootCause"
        >
          <Input.TextArea
            rows={2}
            placeholder={t("breakdown.close.fields.root_cause")}
          />
        </Form.Item>
        <Form.Item label={t("breakdown.close.fields.solution")} name="solution">
          <Input.TextArea
            rows={2}
            placeholder={t("breakdown.close.fields.solution")}
          />
        </Form.Item>
        <Form.Item label={t("breakdown.close.fields.comment")} name="comment">
          <Input.TextArea
            rows={2}
            placeholder={t("breakdown.close.fields.comment")}
          />
        </Form.Item>
        <div>
          <Form.Item
            label={
              <span>
                <PaperClipOutlined /> {t("breakdown.close.fields.attachments")}{" "}
                {t("breakdown.workSession.attachments_hint")}
              </span>
            }
          >
            <Upload
              {...propss}
              onChange={handleChangeUpload}
              beforeUpload={() => false}
              multiple
              listType="picture"
              maxCount={7}
            >
              <Button>{t("breakdown.attachment.file_button")}</Button>
            </Upload>
          </Form.Item>
        </div>
        <Form.Item
          label={t("breakdown.close.fields.signatory_is_name")}
          name="signatoryIsName"
        >
          <Input
            placeholder={t("breakdown.close.fields.enter_signatory_is_name")}
          />
        </Form.Item>
        <Form.Item
          label={t("breakdown.close.fields.signature")}
          name="signature"
          rules={[
            {
              required: true,
              message: t("breakdown.workSession.signature_required"),
              validator: (_, value) => {
                if (sigPadRef.current && !sigPadRef.current.isEmpty()) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  t("breakdown.workSession.signature_required")
                );
              },
            },
          ]}
        >
          <div style={{ border: "2px solid #b8aeae", borderRadius: "2px" }}>
            <SignaturePad
              ref={sigPadRef}
              canvasProps={{ width: 320, height: 100, className: "sigCanvas" }}
            />
          </div>
          <div style={{ textAlign: "end" , marginBottom:"8vh"}}>
            <Button
              onClick={() => sigPadRef.current?.clear()}
              style={{
                marginTop: "5px",
                background: "#23457B",
                color: "#ffffff",
              }}
            >
              {t("breakdown.workSession.clear_signature")}
            </Button>
          </div>
        </Form.Item>
        <div
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 62,
            padding: "12px",
            background: "#ffffff",
            borderTop: "1px solid #f0f0f0",
          }}
        >
          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            style={{ fontWeight: 600 }}
          >
            {t("breakdown.cancel.buttons.submit")}
          </Button>
        </div>
      </Form>
    </div>
  );
}
