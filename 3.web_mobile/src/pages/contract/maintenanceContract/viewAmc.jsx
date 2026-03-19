import React, { useEffect, useState, useRef } from "react";
import {
    Form,
    Checkbox,
    Button,
    Row,
    Col,
    Card,
    Collapse,
    List,
    Divider,
} from "antd";
import { ArrowLeftOutlined, FileTextOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { optionDurationType } from "../../../utils/constant";
import * as _unitOfWork from "../../../api";
import ViewAmcService from "./viewAmcService ";
import { priceFormatter } from "../../../helper/price-helper";
import { parseDate } from "../../../helper/date-helper";
import { useTranslation } from "react-i18next";
import AttachmentModel from "../../../components/modal/Attachment/AttachmentModelMobie";
import './index.scss'

export default function ViewAmc() {
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const params = useParams();
    const [amcView, setAmcView] = useState(null);
    const [customer, setCustomer] = useState(null);
    const navigate = useNavigate();
    const [amcSpareParts, setAmcSpareParts] = useState([]);
    const [assetModels, setAssetModels] = useState([]);
    const [amcServices, setAmcServices] = useState([]);
    const [serviceContractor, setServiceContractor] = useState([]);
    const isCalloutRestirction = Form.useWatch("isCalloutRestirction", form);
    const noCharge = Form.useWatch("noChargeSpares", form);
    const [servicePackageChange, setServicePackageChange] = useState(null);
    const [fileList, setFileList] = useState([]);
    const contentRef = useRef(null);

    useEffect(() => {
        fetchAmc();
    }, []);

    useEffect(() => {
        fetchAssetModels();
    }, []);

    useEffect(() => {
        if (isCalloutRestirction) {
            form.setFieldsValue({ callout: undefined });
        }
    }, [isCalloutRestirction, form]);

    const fetchAmc = async () => {
        let res = await _unitOfWork.amc.getAmcById(params.id, {
            havePopulate: true,
        });
        if (res && res.code === 1) {
            setAmcSpareParts(res.amcSpareParts);
            console.log(res.amcSpareParts)
            setAmcView(res.amc);
            setServicePackageChange(res.servicePackage);
            setAmcServices(res.amcServices);
            setCustomer(res.customer);
            setServiceContractor(res.serviceContractor);
            const resources = res?.amcResources.map((data) => data?.resource);
            const fileList = resources.map((doc) => ({
                ...doc,
                id: doc?.id,
                name: doc?.fileName + doc?.extension,
                src: _unitOfWork.resource.getImage(doc?.id),
                supportDocumentId: doc?.id,
            }));
            setFileList(fileList);
        }
    };

    const fetchAssetModels = async () => {
        let res = await _unitOfWork.assetModel.getAllAssetModel();
        if (res && res.code === 1) {
            setAssetModels(res.data);
        }
    };

    const calTotalPrice = () => {
        let _totalPrice = 0;
        amcServices.forEach((item) => {
            _totalPrice += calTotalPriceService(item);
        });
        return _totalPrice;
    };

    const calTotalPriceService = (_service) => {
        let _totalPrice = 0;
        if (!_service.amcServiceTasks) return _totalPrice;
        _service.amcServiceTasks.forEach((element) => {
            _totalPrice +=
                (element.totalPrice ?? 0) *
                (_service.frequencyNumber ?? 0) *
                (_service.noOfAsset ?? 0);
        });
        return _totalPrice;
    };

    const generateDurationType = (_type) => {
        let typeFind = optionDurationType.find((f) => f.value == _type);
        if (typeFind) return t(typeFind.label);
        return "";
    };

    return (
        <div className="view-amc-container">
            {/* Header */}
            <div
                style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 100,
                    background: '#23457b',
                    height: 56,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 16px',
                    fontWeight: 600,
                    fontSize: 20,
                    color: '#fff',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <ArrowLeftOutlined
                        style={{ fontSize: 22, marginRight: 16, cursor: 'pointer' }}
                        onClick={() => navigate(-1)}
                    />
                    <span>{t("amc.form.view_title")}</span>
                </div>
            </div>

            {/* Content with scroll */}
            <div
                ref={contentRef}
                className="content-view-amc"
                style={{
                    maxHeight: "calc(100vh - 60px)",
                    overflowY: "auto",
                    padding: "12px",
                    background: "#f5f5f5",
                }}
            >
                <Form form={form} layout="vertical">
                    {/* Contract Info Card */}
                    <Card className="info-card" bodyStyle={{ padding: 12 }}>
                        <div className="card-title">{t("amc.form.contract_info") || "Thông tin hợp đồng"}</div>

                        {/* Checkboxes */}
                        <Row gutter={[8, 8]} className="checkbox-row">
                            <Col span={12}>
                                <Form.Item
                                    name="isCalloutRestirction"
                                    valuePropName="checked"
                                    noStyle
                                >
                                    <Checkbox className="custom-checkbox">
                                        <span className="checkbox-label">{t("amc.form.callout_unlimited")}</span>
                                    </Checkbox>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="isSparepartCharge"
                                    valuePropName="checked"
                                    noStyle
                                >
                                    <Checkbox className="custom-checkbox">
                                        <span className="checkbox-label">{t("amc.form.no_spare_charge")}</span>
                                    </Checkbox>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Divider style={{ margin: "12px 0" }} />

                        {/* Info Items */}
                        <div className="info-list">
                            <div className="info-row">
                                <span className="info-label">{t("amc.form.contract_no")}</span>
                                <span className="info-value">{amcView?.amcNo}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">{t("amc.form.service_contractor")}</span>
                                <span className="info-value">{serviceContractor?.serviceContractorName}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">{t("amc.form.user")}</span>
                                <span className="info-value">{customer?.customerName}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">{t("amc.form.service_package")}</span>
                                <span className="info-value">{servicePackageChange?.servicePackageName}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">{t("amc.form.date_signed")}</span>
                                <span className="info-value">{parseDate(amcView?.signedDate)}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">{t("amc.form.request_date")}</span>
                                <span className="info-value">{parseDate(amcView?.requestDate)}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">{t("amc.form.contract_period")}</span>
                                <span className="info-value">
                                    {servicePackageChange?.durationValue}{" "}
                                    {generateDurationType(servicePackageChange?.durationType)}
                                </span>
                            </div>
                            {!isCalloutRestirction && (
                                <div className="info-row">
                                    <span className="info-label">{t("amc.form.spare_limit_label")}</span>
                                    <span className="info-value">{amcView?.calloutRestirctionNo}</span>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Attachments */}
                    {fileList.length > 0 && (
                        <Card className="info-card mt-2" bodyStyle={{ padding: 12 }}>
                            <div className="card-title">
                                <FileTextOutlined /> {t("amc.form.attachments") || "Tài liệu đính kèm"}
                            </div>
                            <AttachmentModel
                                value={fileList}
                                onChange={setFileList}
                                notSize={true}
                                notDelete={true}
                                noCreate
                            />
                        </Card>
                    )}

                    {/* Spare Parts Section */}
                    {!noCharge && (
                        <>
                            <Card className="info-card mt-2" bodyStyle={{ padding: 12 }}>
                                <Collapse defaultActiveKey={["1"]} className="spare-collapse">
                                    <Collapse.Panel header={t("amc.service.spare_title")} key="1">
                                        <List
                                            dataSource={amcSpareParts}
                                            renderItem={(item, index) => (
                                                <Card className="spare-card" bodyStyle={{ padding: 10 }} key={index}>
                                                    <Row align="middle">
                                                        <Col span={4}>
                                                            <div className="spare-index">{index + 1}</div>
                                                        </Col>
                                                        <Col span={20}>
                                                            <div className="spare-code">
                                                                {t("amc.service.spare_code")}: <b>{item?.sparePart?.code}</b>
                                                            </div>
                                                            <div className="spare-name">{item?.sparePart?.sparePartsName}</div>
                                                        </Col>
                                                    </Row>
                                                </Card>
                                            )}
                                            locale={{ emptyText: t("common.no_data") }}
                                        />
                                    </Collapse.Panel>
                                </Collapse>

                            </Card>

                            {/* Services Section */}
                            <div className="section-divider mt-3">
                                <Divider orientation="left">
                                    {t("amc.view.service_section")}
                                </Divider>
                            </div>

                            <div className="services-list">
                                {amcServices.map((amcService, _idx) => (
                                    <ViewAmcService
                                        key={_idx}
                                        assetModels={assetModels}
                                        serviceIndex={_idx}
                                        amcService={amcService}
                                        amcServices={amcServices}
                                        setAmcServices={setAmcServices}
                                    />
                                ))}
                            </div>

                            {/* Total Summary */}
                            <Card className="total-card mt-2" bodyStyle={{ padding: 12 }}>
                                <div className="card-title">{t("amc.service.total_header")}</div>
                                <List
                                    dataSource={amcServices}
                                    renderItem={(item, index) => (
                                        <div className="total-row" key={index}>
                                            <div className="total-row-left">
                                                <span className="total-index">{index + 1}</span>
                                                <span className="total-name">{item?.service?.serviceName}</span>
                                            </div>
                                            <span className="total-price">
                                                {priceFormatter(calTotalPriceService(item))}
                                            </span>
                                        </div>
                                    )}
                                />
                                <Divider style={{ margin: "12px 0" }} />
                                <div className="grand-total">
                                    <span className="grand-total-label">{t("amc.service.total")}</span>
                                    <span className="grand-total-value">{priceFormatter(calTotalPrice())}</span>
                                </div>
                            </Card>
                        </>
                    )}
                </Form>
            </div>
        </div>
    );
}