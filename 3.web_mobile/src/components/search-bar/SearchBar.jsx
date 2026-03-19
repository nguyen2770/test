import React, { useState } from 'react';
import { Form, Row, Col, Input, Button, Select, Space } from 'antd';
import { DownOutlined, UpOutlined, SearchOutlined, PlusSquareOutlined, RedoOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
const { Option } = Select;

const AdvancedSearchForm = () => {
    const [expand, setExpand] = useState(false);
    const [form] = Form.useForm();
    const { t } = useTranslation();

    const getFields = () => {
        const count = expand ? 6 : 3;
        const children = [];

        for (let i = 0; i < count; i++) {
            children.push(
                <Col span={8} key={i}>
                    <Form.Item
                        name={`field-${i + 1}`}
                        label={`${t("searchBar.field_label_prefix")} ${i + 1}`}
                        rules={[
                            {
                                required: true,
                                message: t("validation.input_required"),
                            },
                        ]}
                    >
                        <Input placeholder={t("searchBar.placeholder")} />
                    </Form.Item>
                </Col>,
            );
        }

        return children;
    };

    const onFinish = (values) => {
        console.log('Received values of form: ', values);
    };

    return (
        <div style={{ marginBottom: "24px" }}>
            <Form
                form={form}
                name="advanced_search"
                className="ant-advanced-search-form"
                onFinish={onFinish}
            >
                <Row gutter={24}>{getFields()}</Row>
                <Row>
                    <Col span={12} style={{ textAlign: 'left', }}>
                        <Space size="middle">
                            <Button type="primary" icon={<SearchOutlined />} htmlType="submit">
                                {t("common.search")}
                            </Button>
                            <Button icon={<RedoOutlined />} onClick={() => { form.resetFields(); }}>
                                {t("common.refresh")}
                            </Button>
                            <a style={{ fontSize: 12, }} onClick={() => { setExpand(!expand); }}>
                                {expand ? <UpOutlined /> : <DownOutlined />} {t("searchBar.advanced_search")}
                            </a>
                        </Space>
                    </Col>
                    <Col span={12} style={{ textAlign: 'right', }}>
                        <Button type="primary" icon={<PlusSquareOutlined />}>
                            {t("common.create_new")}
                        </Button>
                    </Col>
                </Row>
            </Form >
        </div>
    );
};

export default () => (
    <div>
        <AdvancedSearchForm />
    </div>
);