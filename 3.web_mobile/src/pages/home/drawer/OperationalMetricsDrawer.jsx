import { ArrowLeftOutlined, FileUnknownOutlined, MenuOutlined } from "@ant-design/icons";
import { Col, Row, Card, Radio, Popover, Drawer, Tooltip } from "antd";
import { Tiny } from '@ant-design/plots';
import React, { useEffect, useState } from "react";
import { formatMillisToHHMM } from "../../../helper/date-helper";
import * as _unitOfWork from "../../../api";
import { Column, Line } from '@ant-design/plots';
import { useTranslation } from "react-i18next";

const OperationalMetricsDrawer = ({ open, onClose }) => {
    const [dateRangeType, setDateRangeType] = useState('oneMonth');
    const [operationalMetrics, setOperationalMetrics] = useState([]);
    const { t } = useTranslation();

    const optionDateType = [
        { label: t('operationalMetrics.range_one_month'), value: 'oneMonth' },
        { label: t('operationalMetrics.range_three_month'), value: 'threeMonth' },
        { label: t('operationalMetrics.range_six_month'), value: 'sixMonth' },
    ];

    useEffect(() => {
        if (dateRangeType) {
            fetchGetDataKPBIndicators();
        }
    }, [dateRangeType]);

    const fetchGetDataKPBIndicators = async () => {
        let res = await _unitOfWork.report.totalOperationalMetrics({
            type: dateRangeType
        });
        if (res && res.code === 1) {
            setOperationalMetrics(res.data);
        }
    };

    const formulaContentTotalDowntimeHrs = (
        <div style={{ minWidth: 250 }} className="p-2">
            <div style={{ fontWeight: 600, marginBottom: 8 }}>{t("operationalMetrics.formula_total_downtime_title")}</div>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
                <span style={{ fontWeight: '600' }}>{t("operationalMetrics.note_label")} </span>
                <span style={{ flex: 1, marginRight: 8 }}>{t("operationalMetrics.formula_total_downtime_note")}</span>
            </div>
        </div>
    );
    const formulaContentTotalMTBF = (
        <div style={{ minWidth: 250 }} className="p-2">
            <div style={{ fontWeight: 600, marginBottom: 8 }}>{t("operationalMetrics.formula_mtbf_title_prefix")}
                <span style={{ flex: 1 }}> {t("operationalMetrics.formula_mtbf_equation")}</span></div>
            <div style={{ display: "flex" }}>
                <span style={{ fontWeight: '600' }}>{t("operationalMetrics.note_label")} </span>
                <span style={{ flex: 1 }}>{t("operationalMetrics.formula_mtbf_note1")}</span>
            </div>
            <div style={{ display: "flex" }}>
                {t("operationalMetrics.formula_mtbf_note2")}
            </div>
        </div>
    );
    const formulaContentTotalMTTR = (
        <div style={{ minWidth: 250 }} className="p-2">
            <div style={{ fontWeight: 600, marginBottom: 8 }}>{t("operationalMetrics.formula_mttr_title")}</div>
            <div style={{ display: "flex" }}>
                <span style={{ fontWeight: '600' }}>{t("operationalMetrics.note_label")} </span>
                <span style={{ flex: 1 }}>{t("operationalMetrics.formula_mttr_note1")}</span>
            </div>
            <div style={{ display: "flex" }}>
                {t("operationalMetrics.formula_mttr_note2")}
            </div>
        </div>
    );
    const formulaContentTotalSpendTime = (
        <div style={{ minWidth: 250 }} className="p-2">
            <div style={{ fontWeight: 600, marginBottom: 8 }}>{t("operationalMetrics.formula_spend_time_title")}</div>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
                <span style={{ flex: 1 }}>{t("operationalMetrics.formula_spend_time_line1")}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
                <span style={{ flex: 1 }}>{t("operationalMetrics.formula_spend_time_line2")}</span>
            </div>
            <div style={{ display: "flex" }}>
                <span style={{ fontWeight: '600' }}>{t("operationalMetrics.note_label")} </span>
                <span style={{ flex: 1 }}>{t("operationalMetrics.formula_spend_time_note")}</span>
            </div>
        </div>
    );
    return (
        <Drawer
            placement="right"
            closable={false}
            open={open}
            width="100%"
            className='drawer-schedule-preventive-history'
            bodyStyle={{ padding: 0, background: "#f8f8f8", display: "flex", flexDirection: "column", height: "100vh" }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    height: 56,
                    background: '#23457b',
                    color: '#fff',
                    padding: '0 16px',
                    fontWeight: 600,
                    fontSize: 20,
                    boxSizing: 'border-box',
                    flexShrink: 0
                }}
            >
                <ArrowLeftOutlined
                    style={{ fontSize: 22, marginRight: 16, cursor: 'pointer' }}
                    onClick={onClose}
                />
                <span style={{ flex: 1 }}>{t("operationalMetrics.title")}</span>
            </div>
            <div className='p-3'>
                <Row className="">
                    <Radio.Group
                        block
                        options={optionDateType}
                        value={dateRangeType}
                        optionType="button"
                        buttonStyle="solid"
                        onChange={(e) => setDateRangeType(e.target.value)}
                    />
                </Row>
                <Row gutter={[16, 16]} className="mt-2">
                    <Col span={24}>
                        <Card
                            style={{
                                borderRadius: 8,
                                boxShadow: "0 2px 8px #f0f1f2",
                                minHeight: 120,
                            }}
                            bodyStyle={{ padding: 24, position: "relative" }}
                        >
                            <div className="p-3">
                                <div style={{ fontWeight: 600, color: "#444" }}>{t("operationalMetrics.total_downtime_hrs")}</div>
                                <div style={{ fontSize: 30, fontWeight: 700, color: "#374151", margin: "12px 0" }}>
                                    <Tooltip title='HH : MM'>
                                        {formatMillisToHHMM(operationalMetrics?.totalDowntimeHrs)}
                                    </Tooltip>
                                </div>
                            </div>
                            <div style={{ position: "absolute", top: 12, right: '40px', fontSize: 18, fontWeight: 'bold', padding: 2 }}>
                                <Popover
                                    placement="top"
                                    title={null}
                                    content={formulaContentTotalDowntimeHrs}
                                    trigger="click"
                                    className="mr-4"                        >
                                    <FileUnknownOutlined className="mr-2" style={{ cursor: "pointer" }} />
                                </Popover>
                            </div>
                            <div
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    right: 0,
                                    width: 60,
                                    height: 60,
                                    background: "#FFB84D",
                                    borderTopRightRadius: 8,
                                    borderBottomLeftRadius: 60,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <img src="/icon-sheet.png" alt="" style={{ width: 20, marginRight: 4 }} />
                                <span style={{ fontSize: 24, color: "#fff" }}>
                                    <i className="anticon anticon-clock-circle" />
                                </span>
                            </div>
                        </Card>
                    </Col>
                    <Col span={24}>
                        <Card
                            style={{
                                borderRadius: 8,
                                boxShadow: "0 2px 8px #f0f1f2",
                                minHeight: 120,
                            }}
                            bodyStyle={{ padding: 24, position: "relative" }}
                        >
                            <div className="p-3">
                                <div style={{ fontWeight: 600, color: "#444" }}>{t("operationalMetrics.total_mtbf")}</div>
                                <div style={{ fontSize: 32, fontWeight: 700, color: "#374151", margin: "12px 0" }}>{formatMillisToHHMM(operationalMetrics?.totalMTBFBreakdown)}</div>
                            </div>
                            <div style={{ position: "absolute", top: 12, right: '40px', fontSize: 18, fontWeight: 'bold', padding: 2 }}>
                                <Popover
                                    placement="top"
                                    title={null}
                                    content={formulaContentTotalMTBF}
                                    trigger="click"
                                    className="mr-4"                        >
                                    <FileUnknownOutlined className="mr-2" style={{ cursor: "pointer" }} />
                                </Popover>
                            </div>
                            <div
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    right: 0,
                                    width: 60,
                                    height: 60,
                                    background: "#FF5C5C",
                                    borderTopRightRadius: 8,
                                    borderBottomLeftRadius: 60,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <img src="/icon-sheet.png" alt="" style={{ width: 20, marginRight: 4 }} />
                                <span style={{ fontSize: 24, color: "#fff" }}>
                                    <i className="anticon anticon-clock-circle" />
                                </span>
                            </div>
                        </Card>
                    </Col>
                    <Col span={24}>
                        <Card
                            style={{
                                borderRadius: 8,
                                boxShadow: "0 2px 8px #f0f1f2",
                                minHeight: 120,
                            }}
                            bodyStyle={{ padding: 24, position: "relative" }}
                        >
                            <div className="p-3">
                                <div style={{ fontWeight: 600, color: "#444" }}>{t("operationalMetrics.total_mttr")}</div>
                                <div style={{ fontSize: 32, fontWeight: 700, color: "#374151", margin: "12px 0" }}>{formatMillisToHHMM(operationalMetrics?.totalMTTRBreakdown) || 0}</div>
                            </div>
                            <div style={{ position: "absolute", top: 12, right: '40px', fontSize: 18, fontWeight: 'bold', padding: 2 }}>
                                <Popover
                                    placement="top"
                                    title={null}
                                    content={formulaContentTotalMTTR}
                                    trigger="click"
                                    className="mr-4"                        >
                                    <FileUnknownOutlined className="mr-2" style={{ cursor: "pointer" }} />
                                </Popover>
                            </div>
                            <div
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    right: 0,
                                    width: 60,
                                    height: 60,
                                    background: "#3B82F6",
                                    borderTopRightRadius: 8,
                                    borderBottomLeftRadius: 60,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <span style={{ fontSize: 24, color: "#fff" }}>
                                    <i className="anticon anticon-clock-circle" />
                                </span>
                            </div>
                        </Card>
                    </Col>
                    <Col span={24}>
                        <Card
                            style={{
                                borderRadius: 8,
                                boxShadow: "0 2px 8px #f0f1f2",
                                minHeight: 120,
                            }}
                            bodyStyle={{ padding: 24, position: "relative" }}
                        >
                            <div className="p-3">
                                <div style={{ fontWeight: 600, color: "#444" }}>{t("operationalMetrics.total_spend_time")}</div>
                                <div style={{ fontSize: 32, fontWeight: 700, color: "#374151", margin: "12px 0" }}>{formatMillisToHHMM(operationalMetrics?.totalSpendTimeMs) || 0}</div>
                            </div>
                            <div style={{ position: "absolute", top: 12, right: 40, fontSize: 18, fontWeight: 'bold', padding: 2 }}>
                                <Popover
                                    placement="top"
                                    title={null}
                                    content={formulaContentTotalSpendTime}
                                    trigger="click"
                                    className="mr-4"                        >
                                    <FileUnknownOutlined className="mr-2" style={{ cursor: "pointer" }} />
                                </Popover>
                            </div>
                            <div
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    right: 0,
                                    width: 60,
                                    height: 60,
                                    background: "#7AC943",
                                    borderTopRightRadius: 8,
                                    borderBottomLeftRadius: 60,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <img src="/icon-sheet.png" alt="" style={{ width: 20, marginRight: 4 }} />
                                <span style={{ fontSize: 24, color: "#fff" }}>
                                    <i className="anticon anticon-clock-circle" />
                                </span>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </div>
        </Drawer >
    );
};

export default React.memo(OperationalMetricsDrawer);