import React, { useEffect, useState, useRef } from "react";
import { Form, Checkbox, Card, Collapse, List, Row, Col, Divider } from "antd";
import { ArrowLeftOutlined, FileTextOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import * as _unitOfWork from "../../../api";
import { parseDate } from "../../../helper/date-helper";
import { priceFormatter } from "../../../helper/price-helper";
import AttachmentModel from "../../../components/modal/Attachment/AttachmentModelMobie";
import "./index.scss";

export default function ViewRepairContractMobile() {
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const params = useParams();
    const contentRef = useRef(null);

    const [contract, setContract] = useState(null);
    const [serviceContractor, setServiceContractor] = useState(null);
    const [customer, setCustomer] = useState(null);
    const [fileList, setFileList] = useState([]);
    const [spareParts, setSpareParts] = useState([]);

    const isCalloutRestirction = Form.useWatch("isCalloutRestirction", form);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (isCalloutRestirction) {
            form.setFieldsValue({ numberOfRepairs: undefined });
        }
    }, [isCalloutRestirction, form]);

    const fetchData = async () => {
        const res = await _unitOfWork.repairContract.getRepairContractById(params?.id);
        if (res && res.code === 1) {
            const rc = res.repairContractWithRes;
            setContract(rc);
            setServiceContractor(rc?.serviceContractor);
            setCustomer(rc?.customer);
            setSpareParts(rc?.repairContractSpareParts || []);
            form.setFieldsValue(rc);

            const resources = rc?.listResource?.map((d) => d?.resource) || [];
            const mapped = resources.map((doc) => ({
                ...doc,
                id: doc?.id,
                name: doc?.fileName + doc?.extension,
                src: _unitOfWork.resource.getImage(doc?.id),
                supportDocumentId: doc?.id,
            }));
            setFileList(mapped);
        }
    };

    return (
        <div className="view-repair-container">
            {/* Header */}
            <div
                style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 100,
                    background: "#23457b",
                    height: 56,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0 16px",
                    fontWeight: 600,
                    fontSize: 20,
                    color: "#fff",
                }}
            >
                <div style={{ display: "flex", alignItems: "center" }}>
                    <ArrowLeftOutlined
                        style={{ fontSize: 22, marginRight: 16, cursor: "pointer" }}
                        onClick={() => navigate(-1)}
                    />
                    <span>{t("repair_contract.title_repair_contract_details")}</span>

                </div>
            </div>

            {/* Content */}
            <div
                ref={contentRef}
                className="content-view-repair"
                style={{
                    maxHeight: "calc(100vh - 56px)",
                    overflowY: "auto",
                    padding: "12px",
                    background: "#f5f5f5",
                }}
            >
                <Form form={form} layout="vertical">
                    <Card className="info-card" bodyStyle={{ padding: 12 }}>
                        <div className="card-title">{t("amc.form.contract_info")}</div>

                        <Row gutter={[8, 8]} className="checkbox-row">
                            <Col span={12}>
                                <Form.Item name="isCalloutRestirction" valuePropName="checked" noStyle>
                                    <Checkbox className="custom-checkbox">
                                        <span className="checkbox-label">{t("amc.form.callout_unlimited")}</span>
                                    </Checkbox>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="isSparepartCharge" valuePropName="checked" noStyle>
                                    <Checkbox className="custom-checkbox">
                                        <span className="checkbox-label">{t("amc.form.no_spare_charge")}</span>
                                    </Checkbox>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Divider style={{ margin: "12px 0" }} />

                        <div className="info-list">
                            <div className="info-row">
                                <span className="info-label">{t("amc.form.contract_no")}</span>
                                <span className="info-value">{contract?.contractNo}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">{t("calibration_contract.contract_name")}</span>
                                <span className="info-value">{contract?.contractName}</span>
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
                                <span className="info-label">{t("amc.form.date_signed")}</span>
                                <span className="info-value">{parseDate(contract?.signedDate)}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">{t("calibration_contract.effective_date")}</span>
                                <span className="info-value">{parseDate(contract?.effectiveDate)}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">{t("calibration_contract.expiration_date")}</span>
                                <span className="info-value">{parseDate(contract?.expirationDate)}</span>
                            </div>
                            {!isCalloutRestirction && (
                                <div className="info-row">
                                    <span className="info-label">{t("repair_contract.number_of_repairs")}</span>
                                    <span className="info-value">{contract?.numberOfRepairs}</span>
                                </div>
                            )}
                            <div className="info-row">
                                <span className="info-label">{t("calibration_contract.total_cost")}</span>
                                <span className="info-value">{priceFormatter(contract?.totalCost)}</span>
                            </div>
                        </div>
                    </Card>

                    {fileList.length > 0 && (
                        <Card className="info-card mt-2" bodyStyle={{ padding: 12 }}>
                            <div className="card-title">
                                <FileTextOutlined /> {t("amc.form.attachments")}
                            </div>
                            <AttachmentModel
                                value={fileList}
                                onChange={setFileList}
                                notSize
                                notDelete
                                noCreate
                            />
                        </Card>
                    )}

                    <Card className="info-card mt-2" bodyStyle={{ padding: 12 }}>
                        <Collapse defaultActiveKey={["1"]} className="spare-collapse">
                            <Collapse.Panel header={t("amc.service.spare_title")} key="1">
                                <List
                                    dataSource={spareParts}
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
                </Form>
            </div>
        </div>
    );
}