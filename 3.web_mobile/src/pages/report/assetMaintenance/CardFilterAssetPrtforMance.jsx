import React, { useEffect } from 'react';
import { Row, Col, Form, Select, Button, DatePicker, Divider, Drawer } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { FORMAT_DATE } from '../../../utils/constant';
import dayjs from 'dayjs';
import { useTranslation } from "react-i18next";

const CardFilterAssetPrtforMance = ({ open, onClose, onSearch, onReFeshFilter, valueFilter }) => {
    const { t } = useTranslation();
    const [filterForm] = Form.useForm();

    useEffect(() => {
        filterForm.setFieldsValue({
            startDate: valueFilter.startDate ? dayjs(valueFilter.startDate) : null,
            endDate: valueFilter.endDate ? dayjs(valueFilter.endDate) : null,
        });
    }, [valueFilter, filterForm]);

    const handleSubmit = () => {
        const values = filterForm.getFieldsValue();
        if (values.startDate) values.startDate = values.startDate.format("YYYY-MM-DD");
        if (values.endDate) values.endDate = values.endDate.format("YYYY-MM-DD");
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
                        <Row>
                            <Divider>{t("report.common.labels.select_date")}</Divider>
                            <Col span={24}>
                                <Form.Item
                                    label={t("report.common.labels.from_date")}
                                    name="startDate"
                                    labelAlign="left"
                                    rules={[{ required: true, message: t("report.common.validation.from_date_required", { defaultValue: "Vui lòng chọn ngày bắt đầu" }) }]}
                                >
                                    <DatePicker
                                        size='large'
                                        placeholder={t("report.common.placeholders.choose_from_date")}
                                        format={FORMAT_DATE}
                                        style={{ width: "100%" }}
                                        allowClear
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    label={t("report.common.labels.to_date")}
                                    name="endDate"
                                    labelAlign="left"
                                    rules={[{ required: true, message: t("report.common.validation.to_date_required", { defaultValue: "Vui lòng chọn ngày kết thúc" }) }]}
                                >
                                    <DatePicker style={{ width: '100%' }} placeholder={t("report.common.placeholders.choose_to_date")} format={FORMAT_DATE} size='large' />
                                </Form.Item>
                            </Col>
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

export default CardFilterAssetPrtforMance;