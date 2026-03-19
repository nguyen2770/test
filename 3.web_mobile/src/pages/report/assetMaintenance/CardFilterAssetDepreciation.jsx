import React, { useEffect } from 'react';
import { Row, Col, Form, Select, Button, DatePicker, Divider, Drawer, Input } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { FORMAT_DATE, reportView } from '../../../utils/constant';
import dayjs from 'dayjs';
import { useTranslation } from "react-i18next";

const CardFilterAssetDepreciation = ({ open, onClose, onSearch, onReFeshFilter, valueFilter, viewOption }) => {
    const { t } = useTranslation();
    const [filterForm] = Form.useForm();

    useEffect(() => {
        filterForm.setFieldsValue({
            reportCutoffDate: valueFilter.reportCutoffDate ? dayjs(valueFilter.reportCutoffDate) : null,
        });
    }, [valueFilter, filterForm]);

    const handleSubmit = () => {
        const values = filterForm.getFieldsValue();
        onSearch(values);
        onClose();
    };
    const handleReset = () => {
        filterForm.resetFields();
        onReFeshFilter();
    };
    return (
        <div style={{ background: '#f8f8f8' }}>
            <Drawer
                placement="right"
                closable={false}
                open={open}
                width="100%"
                bodyStyle={{ padding: 0 }}
            >
                <Form
                    className="search-form"
                    form={filterForm}
                    layout="vertical"
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
                            fontSize: 20
                        }}
                    >
                        <ArrowLeftOutlined
                            style={{ fontSize: 22, marginRight: 16, cursor: 'pointer' }}
                            onClick={onClose}
                        />
                        <span style={{ flex: 1 }}>{t("report.filter.title")}</span>
                    </div>

                    <div style={{ padding: 16, background: '#fff' }}>
                        <Row gutter={32}>
                            <Col span={24}>
                                <Form.Item
                                    label={t("preventive.common.asset")}
                                    name="assetName"
                                >
                                    <Input
                                        placeholder={t("assetMaintenance.form.placeholders.asset_name")}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    label={t("preventive.pdf.serial")}
                                    name="serial"
                                >
                                    <Input
                                        placeholder={t("dashboard.inspection_calibration_due_date.enter_serial")}
                                    />
                                </Form.Item>
                            </Col>
                            {viewOption === reportView.summary ? (
                                <Col span={24}>
                                    <Form.Item
                                        label={t("report.assetDepreciation.label.report_closing_date")}
                                        name="reportCutoffDate"
                                    >
                                        <DatePicker
                                            format={FORMAT_DATE}
                                            placeholder={t(
                                                "report.assetDepreciation.label.placeholder_date"
                                            )}
                                            style={{ width: "100%" }}
                                        />
                                    </Form.Item>
                                </Col>
                            ) : (
                                <Col span={24}>
                                    <Form.Item
                                        label={t("report.assetDepreciation.label.report_closing_year")}
                                        name="reportCutoffYear"
                                    >
                                        <DatePicker
                                            picker="year"
                                            placeholder={t("report.assetDepreciation.label.placeholder_year")}
                                            style={{ width: "100%" }}
                                        />
                                    </Form.Item>
                                </Col>
                            )}
                        </Row>

                    </div>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: 16,
                            gap: 12,
                            background: '#fff',
                            position: 'sticky',
                            bottom: 0,
                        }}
                    >
                        <Button
                            block
                            onClick={handleReset}
                            style={{ background: '#34c38f', color: '#fff', flex: 1, height: 40, fontWeight: 500, fontSize: 16 }}
                        >
                            {t("report.common.buttons.reset")}
                        </Button>
                        <Button
                            block
                            onClick={handleSubmit}
                            style={{ background: '#34c38f', color: '#fff', flex: 1, height: 40, fontWeight: 500, fontSize: 16 }}
                        >
                            {t("report.common.buttons.apply")}
                        </Button>
                    </div>
                </Form>
            </Drawer>
        </div>
    );
};

export default CardFilterAssetDepreciation;