import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as _unitOfWork from "../../api";
import { ArrowLeftOutlined, PaperClipOutlined } from "@ant-design/icons";
import { Col, Row, Form, Input, Button, Upload, message } from "antd";
import SignaturePad from "react-signature-canvas";
import { parseDateHH } from "../../helper/date-helper";
import { useTranslation } from "react-i18next";

export default function ComfirmFixed() {
  const params = useParams();
  const navigate = useNavigate();
  const [breakdownAssignUser, setBreakdownAssignUser] = useState(null);
  const [totalEngineerBreakdown, setTotalEngineerBreakdown] = useState("");
  const [fileList, setFileList] = useState([]);
  const sigPadRef = useRef();
  const [form] = Form.useForm();
  const { t } = useTranslation();

  useEffect(() => {
    fetchGetBreakdownById();
    fetchGetTotalEngineerBreakdown();
  }, []);

  const fetchGetBreakdownById = async () => {
    let res = await _unitOfWork.breakdownAssignUser.getBreakdownAssignUserById({
      id: params.id,
    });
    if (res && res.code === 1) {
      setBreakdownAssignUser(res?.data);
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
  const onFinish = async () => {
    const values = form.getFieldsValue();
    const signatureData = sigPadRef.current?.isEmpty()
      ? null
      : sigPadRef.current.getCanvas().toDataURL("image/png");
    values.signature = signatureData;
    const newSupportDocuments = [];
    if (fileList) {
      for (let i = 0; i < fileList.length; i++) {
        const fileObj = fileList[i].originFileObj;
        const resUpload = await _unitOfWork.resource.uplresourceoadImage({
          file: fileObj,
        });
        if (resUpload && resUpload.code === 1) {
          newSupportDocuments.push({
            resource: resUpload?.resourceId,
          });
        } else {
          message.error(t("common.messages.errors.upload_failed"));
          return;
        }
      }
    }
    const hour = Number(values.downtimeHr || 0);
    const minute = Number(values.downtimeMin || 0);
    const downtimeMs = (hour * 60 + minute) * 60 * 1000;
    values.downTimeMilis = downtimeMs;

    let res =
      await _unitOfWork.breakdownAssignUser.comfirmBreakdownAssignUserFixedMobile(
        {
          data: {
            listAttachment: newSupportDocuments,
            beakdownAssignUserRepair: {
              breakdownAssignUser: params?.id,
              ...values,
            },
          },
        }
      );
    if (res && res.code === 1) {
      message.success(t("breakdown.workSession.submit_fixed_success"));
      navigate(-1);
    }
  };

  return (
    <div style={{ background: "#f8f8f8", minHeight: "100vh" }}>
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
        <span style={{ flex: 1 }}>
          {t("breakdown.workSession.fixed_title")}
        </span>
      </div>

      <div
        style={{
          fontWeight: 600,
          fontSize: 18,
          marginTop: "10px",
          textAlign: "center",
        }}
      >
        {
          breakdownAssignUser?.breakdown?.breakdown?.assetMaintenance
            ?.assetModel?.asset?.assetName
        }
      </div>

      <div style={{ padding: "15px" }}>
        <Row style={{ textAlign: "center" }}>
          <Col span={12}>
            <div style={{ color: "#aaa", fontSize: 15 }}>
              {t("breakdown.sparePart.card_code")}
            </div>
            <div style={{ color: "#00b96b", fontWeight: 500, fontSize: 17 }}>
              {breakdownAssignUser?.breakdown?.breakdown?.code}
            </div>
          </Col>
          <Col span={12}>
            <div style={{ color: "#aaa", fontSize: 15 }}>
              {t("breakdown.sparePart.open_date")}
            </div>
            <div style={{ color: "#00b96b", fontWeight: 500, fontSize: 17 }}>
              {parseDateHH(breakdownAssignUser?.breakdown?.createdAt)}
            </div>
          </Col>
        </Row>
      </div>
      <div style={{ borderBottom: "2px dashed #ccc", marginBottom: 12 }} />
      <Form
        layout="vertical"
        style={{ padding: "0 16px" }}
        onFinish={onFinish}
        form={form}
      >
        {totalEngineerBreakdown === 1 && (
          <Row gutter={[16, 16]}>
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
          </Row>
        )}

        <Form.Item label={t("breakdown.workSession.notes_label")} name="notes">
          <Input.TextArea
            rows={2}
            placeholder={t("breakdown.workSession.notes_placeholder")}
          />
        </Form.Item>
        <Form.Item label={t("breakdown.close.fields.problem")} name="problem">
          <Input.TextArea placeholder={t("breakdown.close.fields.problem")} />
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
        <Form.Item
          label={
            <span>
              <PaperClipOutlined /> {t("breakdown.close.fields.attachments")}{" "}
              {t("breakdown.workSession.attachments_hint")}
            </span>
          }
        >
          <Upload
            fileList={fileList}
            onChange={({ fileList }) => setFileList(fileList)}
            beforeUpload={() => false}
            multiple
            listType="picture"
            maxCount={7}
          >
            <Button>{t("breakdown.attachment.file_button")}</Button>
          </Upload>
        </Form.Item>
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
          <div style={{ textAlign: "end", marginBottom:"8vh" }}>
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
