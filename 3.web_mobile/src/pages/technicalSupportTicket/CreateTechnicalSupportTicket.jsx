import { Button, Col, DatePicker, Form, Input, Row, Select } from "antd";
import React, { useEffect, useState } from "react";
import * as _unitOfWork from "../../api";
import ShowSuccess from "../../components/modal/result/successNotification";
import ShowError from "../../components/modal/result/errorNotification";
import {
  ArrowLeftOutlined,
  PlusCircleFilled,
  QrcodeOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  assetMaintenanceStatus,
  FORMAT_DATE,
  priorityLevelStatus,
} from "../../utils/constant";
import { useNavigate } from "react-router-dom";
import AttachmentComponent from "../myBreakdown/AttachmentComponent";
import QrCodeScan from "../../components/qrCodeScan";
import { parseQuery } from "../../helper/queryString-helper";
import { staticPath } from "../../router/RouteConfig";
import AssetMaintenanceDrawer from "../../components/Drawer/AssetMaintenanceDrawer";
import { checkPermission } from "../../helper/permission-helper";
import { permissionCodeConstant } from "../../utils/permissionCodeConstant";
import useAuth from "../../contexts/authContext";
import { useTranslation } from "react-i18next";
import de from "date-fns/esm/locale/de/index.js";

const { Search } = Input;

export default function CreateTechnicalSupportTicket() {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [assetMaintenanceId, setAssetMaintenanceId] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [showQrCodeScan, setShowQrCodeScan] = useState(false);
  const [assetMaintenceChange, setAssetMaintenceChange] = useState(null);
  const [serviceSubCategorys, setServiceSubCategorys] = useState([]);
  const [serviceCategorys, setServiceCategorys] = useState([]);
  const [showSearchAssetMaintenance, setShowSearchAssetMaintenance] =
    useState(false);
  const [assetModelFailureTypes, setAssetModelFailureTypes] = useState([]);
  const { permissions } = useAuth();

  useEffect(() => {
    fetchGetAllServiceCategory();
  }, []);

  useEffect(() => {
    if (assetMaintenanceId) {
      fetchAssetMaintenance();
    }
  }, [assetMaintenanceId]);

  useEffect(() => {
    if (assetMaintenceChange) {
      fetchGetAssetModelFailureTypeByAssetModel();
    }
  }, [assetMaintenceChange]);

  const fetchAssetMaintenance = async () => {
    let res = await _unitOfWork.assetMaintenance.getAssetMaintenance({
      id: assetMaintenanceId,
    });
    if (res && res.code === 1) {
      form.setFieldsValue({
        assetModel: res.data?.assetModel?.assetModelName,
        asset: res.data?.assetModel?.asset?.assetName,
        serial: res.data?.serial,
        customer: res.data?.customer?.customerName,
        assetNumber: res.data?.assetNumber,
      });
      setAssetMaintenceChange(res?.data);
    }
  };

  const fetchGetAssetModelFailureTypeByAssetModel = async () => {
    setAssetModelFailureTypes([]);
    let payload = {
      assetModel: assetMaintenceChange?.assetModel?.id,
    };
    let res =
      await _unitOfWork.assetModelFailureType.getAllAssetModelFailureType(
        payload
      );
    if (res && res.code === 1) {
      setAssetModelFailureTypes(res.data);
    }
  };

  const fetchGetAllServiceCategory = async () => {
    let res = await _unitOfWork.serviceCategory.getAllServiceCategories();
    if (res && res.code === 1) {
      setServiceCategorys(res.data);
    }
  };

  const onFinish = async () => {
    const values = await form.getFieldsValue();
    const newSupportDocuments = [];
    if (fileList) {
      for (const file of fileList) {
        const resUpload = await _unitOfWork.resource.uploadImage({
          file: file?.originFileObj,
        });
        if (resUpload && resUpload.code === 1) {
          newSupportDocuments.push({ resource: resUpload.resourceId });
        }
      }
    }
    const formatedValues = {
      ...values,
      listResource: newSupportDocuments,
      assetMaintenance: assetMaintenceChange?.id,
    };
    const response = await _unitOfWork.breakdown.createBreakdown(
      formatedValues
    );
    if (response && response.code === 1) {
      form.resetFields();
      ShowSuccess("topRight", t("breakdown.create.messages.create_success"));
      navigate(`${staticPath.myBreakdown}?ticketStatus=new`);
    } else {
      ShowError("topRight", t("breakdown.create.messages.create_error"));
    }
  };

  const onClickShowQrCodeScan = () => {
    setShowQrCodeScan(!showQrCodeScan);
  };

  const onCallback = (dataQrcode) => {
    let query = parseQuery(dataQrcode);
    setAssetMaintenanceId(query["assetMaintenance"]);
    setShowQrCodeScan(false);
  };

  const onSelectAssetMaintenance = (selectedAssetMaintenance) => {
    setAssetMaintenanceId(selectedAssetMaintenance.id);
  };

  return (
    <div>
      <Form
        form={form}
        onFinish={onFinish}
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            height: 56,
            background: "#23457b",
            color: "#fff",
            paddingLeft: 15,
            paddingRight: 15,
            fontWeight: 600,
            fontSize: 20,
            boxSizing: "border-box",
          }}
        >
          <ArrowLeftOutlined
            style={{ fontSize: 22, marginRight: 10, cursor: "pointer" }}
            onClick={() => navigate(-1)}
          />
          <span style={{ flex: 1 }}>{t("breakdown.create.title")}</span>
          <div className="icon-right-header-create-ticket">
            {/* {showQrCodeScan ? (
              <Button
                className="btn-title-clear"
                onClick={onClickShowQrCodeScan}
              >
                {t("breakdown.workSession.clear_signature")}
              </Button>
            ) : (
              <QrcodeOutlined
                onClick={onClickShowQrCodeScan}
                style={{ padding: 5 }}
              />
            )} */}
            <SearchOutlined
              onClick={() => setShowSearchAssetMaintenance(true)}
              className="pr2 ml-2"
              style={{ cursor: "pointer" }}
            />
          </div>
        </div>

        {showQrCodeScan && <QrCodeScan onCallback={onCallback} />}

        <Row className="p-3">
          <Col span={24}>
            <Form.Item
              label={t("breakdown.create.fields.serial")}
              name="serial"
              labelAlign="left"
              rules={[
                {
                  required: true,
                  message: t("breakdown.create.validation.serial_required"),
                },
              ]}
            >
              <Search
                placeholder={t("breakdown.create.placeholders.serial")}
                allowClear
                onClick={() => setShowSearchAssetMaintenance(true)}
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              label={t("breakdown.view.menu.asset_number")}
              name="assetNumber"
              labelAlign="left"
            >
              <Input
                placeholder={t("breakdown.view.menu.asset_number")}
                disabled
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              label={t("breakdown.create.fields.asset")}
              name="asset"
              labelAlign="left"
            >
              <Input
                placeholder={t("breakdown.create.placeholders.asset")}
                disabled
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              label={t("breakdown.create.fields.asset_model")}
              name="assetModel"
              labelAlign="left"
            >
              <Input
                placeholder={t("breakdown.create.placeholders.model")}
                disabled
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              label={t("breakdown.create.fields.customer")}
              name="customer"
              labelAlign="left"
            >
              <Input
                placeholder={t("breakdown.create.placeholders.customer")}
                disabled
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              name="incidentDeadline"
              label={t("breakdown.create.fields.incident_deadline")}
              labelAlign="left"
            >
              <DatePicker
                placeholder={t(
                  "breakdown.create.placeholders.incident_deadline"
                )}
                format={FORMAT_DATE}
                style={{ width: "100%" }}
                allowClear
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              label={t("breakdown.create.fields.failure_type")}
              name="breakdownDefect"
              labelAlign="left"
            >
              <Select
                placeholder={t("breakdown.create.placeholders.failure_type")}
                allowClear
                options={(assetModelFailureTypes || []).map((item) => ({
                  value: item.id,
                  label: item.name,
                }))}
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              label={t("breakdown.create.fields.asset_status")}
              name="assetMaintenanceStatus"
              labelAlign="left"
              initialValue={assetMaintenanceStatus.isNotActive}
            >
              <Select
                placeholder={t("breakdown.create.placeholders.asset_status")}
                allowClear
                options={(assetMaintenanceStatus.Options || []).map((item) => ({
                  value: item.value,
                  label: t(item.label),
                }))}
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              label={t("breakdown.create.fields.priority_level")}
              name="priorityLevel"
              labelAlign="left"
            >
              <Select
                placeholder={t("breakdown.create.placeholders.priority_level")}
                allowClear
                options={(priorityLevelStatus.Options || []).map((item) => ({
                  value: item.value,
                  label: t(item.label),
                }))}
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              label={t("breakdown.create.fields.description")}
              name="defectDescription"
              labelAlign="left"
            >
              <Input.TextArea
                placeholder={t("breakdown.create.placeholders.description")}
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <AttachmentComponent value={fileList} onChange={setFileList} />
          </Col>
        </Row>

        {checkPermission(
          permissions,
          permissionCodeConstant.technical_sheet_create
        ) && (
          <div className="p-2 text-center">
            <Button type="primary" htmlType="submit">
              <PlusCircleFilled style={{ marginRight: 6 }} />
              {t("breakdown.create.buttons.submit")}
            </Button>
          </div>
        )}
      </Form>

      <AssetMaintenanceDrawer
        onSelectAssetMaintenance={onSelectAssetMaintenance}
        open={showSearchAssetMaintenance}
        handleCancel={() => setShowSearchAssetMaintenance(false)}
      />
    </div>
  );
}
