import React from 'react';
import { Row, Col, Form, Select, Button, Input, DatePicker, Drawer } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const CardFilterSparePartRequestSchedulePreventive = ({ open, onClose, onSearch, onReFeshFilter }) => {
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
                                <Form.Item label={t("spare_part.part_number")} name="sparePartCode">
                                    <Input placeholder={t("spare_part.enter_the_parts_request_code")} />
                                </Form.Item>
                            </Col>
                             <Col span={24}>
                                <Form.Item label={t("spare_part.maintenance_code")} name="code">
                                    <Input placeholder={t("spare_part.enter_maintenance_code")} />
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

export default CardFilterSparePartRequestSchedulePreventive;