import React from 'react';
import { Row, Col, Form, Select, Button, Input, DatePicker, Drawer } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { assetType, FORMAT_DATE } from '../../../utils/constant';
import { filterOption } from '../../../helper/search-select-helper';
import { priorityType, schedulePreventiveStatus } from '../../../utils/schedulePreventive.constant';
import { useTranslation } from 'react-i18next';

const CardFilterSparePartRequestBreakdown = ({ open, onClose, onSearch, onReFeshFilter }) => {
    const { t } = useTranslation();
    const [filterForm] = Form.useForm();

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
                <Form className="search-form" form={filterForm} layout="vertical">
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
                        <span style={{ flex: 1 }}>{t("preventiveSchedule.filter.title")}</span>
                    </div>

                    <div style={{ padding: 16, background: '#fff' }}>
                        <Row>
                            <Col span={24}>
                                <Form.Item label={t("spare_part.part_number")} name="code">
                                    <Input placeholder={t("spare_part.enter_the_parts_request_code")} />
                                </Form.Item>
                            </Col>
                             <Col span={24}>
                                <Form.Item label={t("spare_part.incident_code")} name="breakdownCode">
                                    <Input placeholder={t("spare_part.enter_the_incident_code")} />
                                </Form.Item>
                            </Col>
                            {/* <Col span={24}>
                                <Form.Item label={t("preventiveSchedule.list.search.preventive_name")} name="preventiveName">
                                    <Input placeholder={t("preventiveSchedule.filter.placeholders.preventive_name")} />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item label={t("preventiveSchedule.list.search.serial")} name="serial">
                                    <Input placeholder={t("preventiveSchedule.filter.placeholders.serial")} />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item label={t("preventiveSchedule.list.search.model")} name="assetModelName">
                                    <Input placeholder={t("preventiveSchedule.filter.placeholders.model")} />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    label={t("preventiveSchedule.list.search.status")}
                                    name="schedulePreventiveStatus"
                                >
                                    <Select
                                        showSearch
                                        allowClear
                                        placeholder={t("preventiveSchedule.filter.placeholders.status")}
                                        options={(schedulePreventiveStatus.Options || []).map((item) => ({
                                            value: item.value,
                                            label: t(item.label),
                                        }))}
                                        filterOption={filterOption}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    label={t("preventiveSchedule.list.search.asset_style")}
                                    name="assetStyle"
                                >
                                    <Select
                                        allowClear
                                        placeholder={t("preventiveSchedule.filter.placeholders.asset_style")}
                                        options={(assetType.Options || []).map((item) => ({
                                            key: item.value,
                                            value: item.value,
                                            label: t(item.label),
                                        }))}
                                    />
                                </Form.Item>
                            </Col> */}
                            {/* <Col span={24}>
                                <Form.Item name="startDate" label={t("preventiveSchedule.list.search.start_date_from")}>
                                    <DatePicker
                                        placeholder={t("preventiveSchedule.filter.placeholders.start_date")}
                                        format={FORMAT_DATE}
                                        style={{ width: "100%" }}
                                        allowClear
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item name="endDate" label={t("preventiveSchedule.list.search.end_date_to")}>
                                    <DatePicker
                                        placeholder={t("preventiveSchedule.filter.placeholders.end_date")}
                                        format={FORMAT_DATE}
                                        style={{ width: "100%" }}
                                        allowClear
                                    />
                                </Form.Item>
                            </Col> */}
                            {/* <Col span={24}>
                                <Form.Item
                                    label={t("preventiveSchedule.list.search.priority")}
                                    name="importance"
                                >
                                    <Select
                                        showSearch
                                        allowClear
                                        placeholder={t("preventiveSchedule.filter.placeholders.priority")}
                                        options={(priorityType.Option || []).map((item) => ({
                                            value: item.value,
                                            label: t(item.label),
                                        }))}
                                        filterOption={filterOption}
                                    />
                                </Form.Item>
                            </Col> */}
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
                            bottom: 0
                        }}
                    >
                        <Button
                            block
                            onClick={handleReset}
                            style={{ background: '#34c38f', color: '#fff', flex: 1, height: 40, fontWeight: 500, fontSize: 16 }}
                        >
                            {t("preventiveSchedule.filter.buttons.clear")}
                        </Button>
                        <Button
                            block
                            onClick={handleSubmit}
                            style={{ background: '#34c38f', color: '#fff', flex: 1, height: 40, fontWeight: 500, fontSize: 16 }}
                        >
                            {t("preventiveSchedule.filter.buttons.apply")}
                        </Button>
                    </div>
                </Form>
            </Drawer>
        </div>
    );
};

export default CardFilterSparePartRequestBreakdown;