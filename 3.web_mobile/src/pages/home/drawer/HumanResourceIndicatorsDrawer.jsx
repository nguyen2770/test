import { ArrowLeftOutlined, FileUnknownOutlined, MenuOutlined } from "@ant-design/icons";
import { Col, Row, Card, Radio, Popover, Drawer } from "antd";
import { Tiny } from '@ant-design/plots';
import React, { useEffect, useState } from "react";
import * as _unitOfWork from "../../../api";
import { Column, Line } from '@ant-design/plots';
import { formatMillisToHHMM } from "../../../helper/date-helper";
import { useTranslation } from "react-i18next";

const HumanResourceIndicatorsDrawer = ({ open, onClose }) => {
    const [keyIndicatorsType, setKeyIndicatorsType] = useState('oneMonth');
    const [averageResponseTimeBreakdown, setAverageResponseTimeBreakdown] = useState(null);
    const [averageResolutionTimeBreakdown, setAverageResolutionTimeBreakdown] = useState(null);
    const { t } = useTranslation();

    const optionKeyIndecatorsType = [
        { label: t('humanResourceIndicators.range_one_month'), value: 'oneMonth' },
        { label: t('humanResourceIndicators.range_three_month'), value: 'threeMonth' },
        { label: t('humanResourceIndicators.range_six_month'), value: 'sixMonth' },
    ];

    useEffect(() => {
        fetchGetAverageResponseTimeBreakdown();
        fetchGetAverageResolutionTimeBreakdown();
    }, [keyIndicatorsType]);

    const fetchGetAverageResponseTimeBreakdown = async () => {
        let res = await _unitOfWork.report.getAverageResponseTimeBreakdown({ type: keyIndicatorsType });
        if (res && res.code === 1) {
            setAverageResponseTimeBreakdown(res?.data?.avgResponseTime);
        }
    };
    const fetchGetAverageResolutionTimeBreakdown = async () => {
        let res = await _unitOfWork.report.getAverageResolutionTimeBreakdown({ type: keyIndicatorsType });
        if (res && res.code === 1) {
            setAverageResolutionTimeBreakdown(res?.data?.avgResolutionTime);
        }
    };

    const formulaContent = (
        <div style={{ minWidth: 250 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>{t("humanResourceIndicators.formula_detail_title")}</div>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
                <span style={{ flex: 1 }}>{t("humanResourceIndicators.formula_response_total_alloc_time")}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
                <span style={{ flex: 1, borderBottom: "1px dashed #888", marginRight: 8 }}></span>
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
                <span style={{ flex: 1 }}>{t("humanResourceIndicators.formula_response_total_assigned_breakdowns")}</span>
            </div>
        </div>
    );
    const formulaContentResolution = (
        <div style={{ minWidth: 250 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>{t("humanResourceIndicators.formula_detail_title")}</div>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
                <span style={{ flex: 1 }}>{t("humanResourceIndicators.formula_resolution_total_time_complete")}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
                <span style={{ flex: 1, borderBottom: "1px dashed #888", marginRight: 8 }}></span>
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
                <span style={{ flex: 1 }}>{t("humanResourceIndicators.formula_resolution_total_closed_breakdown")}</span>
            </div>
        </div>
    );

    const configAverageResponseTimeBreakdown = {
        percent: 1,
        width: 200,
        height: 200,
        color: ['#E8EFF5', '#66AFF4'],
        annotations: [
            {
                type: 'text',
                style: {
                    text: `${formatMillisToHHMM(averageResponseTimeBreakdown)}\nHH:MM`,
                    x: '50%',
                    y: '50%',
                    textAlign: 'center',
                    fontSize: 16,
                    fontStyle: 'bold',
                },
            },
        ],
    };

    const configAverageResolutionTimeBreakdown = {
        percent: 1,
        width: 200,
        height: 200,
        color: ['#E8EFF5', '#66AFF4'],
        annotations: [
            {
                type: 'text',
                style: {
                    text: `${formatMillisToHHMM(averageResolutionTimeBreakdown)}\nHH:MM`,
                    x: '50%',
                    y: '50%',
                    textAlign: 'center',
                    fontSize: 16,
                    fontStyle: 'bold',
                },
            },
        ],
    };
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
                <span style={{ flex: 1 }}>{t("humanResourceIndicators.title")}</span>
            </div>
            <div className='p-3'>
                <Row gutter={[16, 16]} className="mb-2">
                    <Col >
                        <Radio.Group
                            block
                            options={optionKeyIndecatorsType}
                            value={keyIndicatorsType}
                            optionType="button"
                            buttonStyle="solid"
                            onChange={(e) => setKeyIndicatorsType(e.target.value)}
                        />
                    </Col>
                </Row>
                <Row gutter={[16, 16]}>
                    <Col span={24}>
                        <Card >
                            <Row>
                                <Col span={16}>
                                    {t("humanResourceIndicators.avg_response_time")}
                                </Col>
                                <Col span={8} style={{ textAlign: 'end' }}>
                                    <Popover
                                        placement="top"
                                        title={null}
                                        content={formulaContent}
                                        trigger="click"
                                    >
                                        <FileUnknownOutlined className="mr-2" style={{ cursor: "pointer" }} />
                                    </Popover>
                                </Col>
                            </Row>
                            <Row className="mt-3">
                                <Tiny.Ring className="tiny-ring" {...configAverageResponseTimeBreakdown} />
                            </Row>
                        </Card>
                    </Col>
                    <Col span={24}>
                        <Card >
                            <Row>
                                <Col span={16}>
                                    {t("humanResourceIndicators.avg_resolution_time")}
                                </Col>
                                <Col span={8} style={{ textAlign: 'end' }}>
                                    <Popover
                                        placement="top"
                                        title={null}
                                        content={formulaContentResolution}
                                        trigger="click"
                                    >
                                        <FileUnknownOutlined className="mr-2" style={{ cursor: "pointer" }} />
                                    </Popover>
                                </Col>
                            </Row>
                            <Row className="mt-3">
                                <Tiny.Ring className="tiny-ring" {...configAverageResolutionTimeBreakdown} />
                            </Row>
                        </Card>
                    </Col>
                </Row>
            </div>
        </Drawer >
    );
};

export default React.memo(HumanResourceIndicatorsDrawer);