import React, { useEffect, useRef, useState } from 'react';
import { Row, Col, message, Form, Select, Button, Input, DatePicker, Divider, Drawer } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import * as _unitOfWork from "../../api";
import { assetType, priorityLevelStatus } from '../../utils/constant';
import { dropdownRender, filterOption } from '../../helper/search-select-helper';
import { useTranslation } from 'react-i18next';

const CardFilter = ({ open, onClose, onSearch, onReFeshFilter }) => {
    const [filterForm] = Form.useForm();
    const [customers, setCustomers] = useState([]);
    const [manufacturers, setManufacturers] = useState([]);
    const [categorys, setCategorys] = useState([]);
    const [assets, setAssets] = useState([]);
    const [assetMaintenances, setAssetMaintenances] = useState([]);
    const [assetModels, setAssetModels] = useState([]);
    const { t } = useTranslation();

    useEffect(() => {
        fetchGetAllCustomer();
        fetchGetAllManfacturers();
        fetchGetAllCategory();
        fetchGetAllAsset();
        // fetchGetAllAssetMaintenance();
        fetchGetAllAssetModel();
    }, [])

    const fetchGetAllCategory = async () => {
        let res = await _unitOfWork.category.getAllCategory();
        if (res && res.code === 1) {
            setCategorys(res.data);
        }
    }
    const fetchGetAllAssetModel = async () => {
        let res = await _unitOfWork.assetModel.getAllAssetModel();
        if (res && res.code === 1) {
            setAssetModels(res.data);
        }
    }
    const fetchGetAllAssetMaintenance = async () => {
        let res = await _unitOfWork.assetMaintenance.getAllAssetMaintenance();
        if (res && res.code === 1) {
            setAssetMaintenances(res.data);
        }
    }
    const fetchGetAllAsset = async () => {
        let res = await _unitOfWork.asset.getAllAsset();
        if (res && res.code === 1) {
            setAssets(res.data);
        }
    }
    const fetchGetAllCustomer = async () => {
        let res = await _unitOfWork.customer.getAllCustomer();
        if (res && res.code === 1) {
            setCustomers(res.data);
        }
    }

    const fetchGetAllManfacturers = async () => {
        let res = await _unitOfWork.manufacturer.getAllManufacturer();
        if (res && res.code === 1) {
            setManufacturers(res.data);
        }
    };

    const handleSubmit = () => {
        const values = filterForm.getFieldsValue();
        onSearch(values); // Gửi về cha
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
                            fontSize: 20,
                            boxSizing: 'border-box',
                        }}
                    >
                        <ArrowLeftOutlined
                            style={{ fontSize: 22, marginRight: 16, cursor: 'pointer' }}
                            onClick={onClose}
                        />
                        <span style={{ flex: 1 }}>{t("assetMaintenance.filter.title")}</span>
                    </div>

                    {/* Chọn ngày */}
                    <div style={{ padding: 16, background: '#fff' }}>
                        <Row >
                            <Col span={24}>
                                <Form.Item
                                    id=""
                                    labelAlign="left"
                                    label={t("assetMaintenance.filter.asset_styles")}
                                    name="assetStyles"
                                >
                                    <Select
                                        size='large'
                                        showSearch
                                        allowClear
                                        placeholder={t("assetMaintenance.filter.asset_styles_placeholder")}
                                        options={(assetType.Options || []).map((item) => ({
                                            key: item.value,
                                            value: item.value,
                                            label: t(item.label),
                                        }))}
                                        mode="tags"
                                        filterOption={filterOption}
                                        dropdownStyle={dropdownRender}
                                    ></Select>

                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    label="Customer Name / Contact Number"
                                    name="customers"
                                    labelAlign="left"
                                >
                                    <Select
                                        size='large'
                                        placeholder="Select Customer Name / Contact Number"
                                        showSearch
                                        allowClear
                                        options={(customers || []).map((item) => ({
                                            value: item.customerName,
                                            label:
                                                item.customerName +
                                                (item.contactNumber
                                                    ? ` - ( ${item.contactNumber} )`
                                                    : ""),
                                        }))}
                                        mode="tags"
                                        filterOption={filterOption}
                                        dropdownStyle={dropdownRender}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    id=""
                                    labelAlign="left"
                                    label={t("assetMaintenance.filter.manufacturers")}
                                    name="manufacturers"
                                >
                                    <Select
                                        size='large'
                                        allowClear
                                        placeholder={t("assetMaintenance.filter.manufacturers_placeholder")}
                                        showSearch
                                        options={manufacturers?.map((item) => ({
                                            value: item.manufacturerName,
                                            label: item.manufacturerName,
                                        }))}
                                        mode="tags"
                                        filterOption={filterOption}
                                    ></Select>
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    id=""
                                    labelAlign="left"
                                    label={t("assetMaintenance.filter.categories")}
                                    name="categorys"
                                >
                                    <Select
                                        size='large'
                                        allowClear
                                        placeholder={t("assetMaintenance.filter.categories_placeholder")}
                                        showSearch
                                        options={categorys?.map((item) => ({
                                            value: item.categoryName,
                                            label: item.categoryName,
                                        }))}
                                        mode="tags"
                                        filterOption={filterOption}
                                    ></Select>
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    id=""
                                    labelAlign="left"
                                    label={t("assetMaintenance.filter.assets")}
                                    name="assets"
                                >
                                    <Select
                                        size='large'
                                        allowClear
                                        placeholder={t("assetMaintenance.filter.assets_placeholder")}
                                        showSearch
                                        options={assets?.map((item) => ({
                                            value: item.id,
                                            label: item.assetName,
                                        }))}
                                        mode="tags"
                                        filterOption={filterOption}
                                    ></Select>
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    id=""
                                    labelAlign="left"
                                    label="Model"
                                    name="assetModels"
                                >
                                    <Select
                                        size='large'
                                        allowClear
                                        placeholder={t("assetMaintenance.filter.model_placeholder")}
                                        showSearch
                                        options={assetModels?.map((item) => ({
                                            value: item.id,
                                            label: item.assetModelName,
                                        }))}
                                        mode="tags"
                                        filterOption={filterOption}
                                    ></Select>
                                </Form.Item>
                            </Col>
                        </Row>
                    </div>
                </Form>
                <div
                    style={{
                        position: 'fixed',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: '#fff',
                        padding: '12px 16px',
                        boxShadow: '0 -2px 8px rgba(0,0,0,0.08)',
                        zIndex: 1000,
                    }}
                >
                    <Row gutter={12}>
                        <Col span={12}>
                            <Button
                                block
                                size="large"
                                style={{
                                    backgroundColor: '#34C38F',
                                    color: '#fff',
                                    border: 'none',
                                }}
                                onClick={handleReset}
                            >
                                Xoá
                            </Button>
                        </Col>

                        <Col span={12}>
                            <Button
                                block
                                size="large"
                                style={{
                                    backgroundColor: '#34C38F',
                                    color: '#fff',
                                    border: 'none',
                                }}
                                onClick={handleSubmit}
                            >
                                Nộp
                            </Button>
                        </Col>
                    </Row>
                </div>

            </Drawer>
        </div>

    );
};

export default CardFilter;