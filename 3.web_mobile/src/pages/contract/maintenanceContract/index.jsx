import { useEffect, useState, useRef } from "react";
import {
    RedoOutlined,
    SearchOutlined,
    ArrowLeftOutlined,
} from "@ant-design/icons";
import {
    Button,
    Space,
    Form,
    Card,
    Row,
    Col,
    Input,
    Drawer,
} from "antd";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useAuth from "../../../contexts/authContext";
import { staticPath } from "../../../router/RouteConfig";
import * as _unitOfWork from "../../../api";
import { PAGINATION } from "../../../utils/constant";
import { parseDate } from "../../../helper/date-helper";

export default function MaintenanceContract() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [amcs, setAmcs] = useState([]);
    const [totalRecord, setTotalRecord] = useState(0);
    const [page, setPage] = useState(1);
    const [searchForm] = Form.useForm();
    const { permissions } = useAuth();
    const contentRef = useRef(null);
    const [sortOrder, setSortOrder] = useState(-1);
    const [sortField, setSortField] = useState("createdAt");
    const [openFilter, setOpenFilter] = useState(false);

    useEffect(() => {
        fetchServicePackages(1);
    }, [sortField, sortOrder]);

    useEffect(() => {
        if (page > 1) {
            fetchServicePackages();
        }
    }, [page]);


    useEffect(() => {
        const div = contentRef.current;
        if (!div) return;
        const handleScroll = () => {
            const bottom = div.scrollHeight - div.scrollTop <= div.clientHeight + 100;
            if (bottom && amcs?.length < totalRecord) {
                loadMoreData();
            }
        };
        div.addEventListener("scroll", handleScroll);
        return () => div.removeEventListener("scroll", handleScroll);
    }, [amcs, totalRecord]);

    const loadMoreData = () => {
        const nextPage = page + 1;
        const totalLoaded = (nextPage - 1) * PAGINATION.limit;
        if (totalLoaded >= totalRecord) return;
        setPage(nextPage);
    };

    const fetchServicePackages = async (_page) => {
        let payload = {
            page: _page || page,
            limit: PAGINATION.limit,
            sortBy: sortField,
            sortOrder: sortOrder,
            ...searchForm.getFieldsValue(),
        };
        let res = await _unitOfWork.amc.getAmcs(payload);
        if (res && res.code === 1) {
            if (payload.page > 1) {
                setAmcs([...amcs, ...res.amcs]);
            } else {
                setAmcs(res.amcs);
            }
            setTotalRecord(res.data.totalResults);
        }
    };

    const resetSearch = () => {
        searchForm.resetFields();
        setPage(1);
        fetchServicePackages(1);
        setOpenFilter(false);
    };

    const onSearch = () => {
        setPage(1);
        fetchServicePackages(1);
        setOpenFilter(false);
    };

    const onDetail = (value) => {
        navigate(staticPath.viewMaintenanceContract + "/" + value._id);
    };



    return (
        <div style={{ background: '#f8f8f8', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Sticky Header */}
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
                    <span>{t("menu.contract.maintenance")}</span>
                </div>


            </div>

            <div
                ref={contentRef}
                style={{
                    background: "#f5f5f5",
                    maxHeight: "calc(100vh - 180px)",
                    overflowY: "auto",
                    padding: "8px",
                }}
            >
                {amcs.map((item, idx) => (
                    <Card
                        key={item._id || item.id || idx}
                        className="mb-2"
                        bodyStyle={{ padding: 12 }}
                        onClick={() => onDetail(item)}
                    >
                        <Row align="middle">
                            <Col span={20}>
                                <div className="amc-contract-no">
                                    <b>{t("amc.manager.table.contract_no")}: </b>
                                    {item?.amcNo}
                                </div>
                                <div className="amc-customer">
                                    <b>{t("amc.manager.table.customer")}: </b>
                                    {item?.customer?.customerName}
                                </div>
                                <div className="amc-date">
                                    <b>{t("amc.manager.table.contract_period")}: </b>
                                    {parseDate(item?.requestDate)}
                                </div>
                            </Col>
                        </Row>


                    </Card>
                ))}

                {amcs.length === 0 && (
                    <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
                        {t("common.no_data") || "Không có dữ liệu"}
                    </div>
                )}
            </div>


            <Drawer
                title={t("amc.manager.filter.title") || "Tìm kiếm"}
                placement="right"
                onClose={() => setOpenFilter(false)}
                open={openFilter}
                width={300}
            >
                <Form
                    className="search-form"
                    form={searchForm}
                    layout="vertical"
                    onFinish={onSearch}
                >
                    <Form.Item
                        label={t("orderPurchase.form.fields.contract_number")}
                        name="amcNo"
                    >
                        <Input placeholder={t("amc.form.contract_no_placeholder")} />
                    </Form.Item>

                    <Space style={{ width: "100%", justifyContent: "space-between" }}>
                        <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                            {t("preventive.buttons.search")}
                        </Button>
                        <Button className="bt-green" onClick={resetSearch} icon={<RedoOutlined />}>
                            {t("preventive.buttons.reset")}
                        </Button>
                    </Space>
                </Form>
            </Drawer>
        </div>
    );
}