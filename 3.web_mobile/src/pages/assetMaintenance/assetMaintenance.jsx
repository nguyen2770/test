import { useNavigate } from "react-router-dom";
import CardItemAssetMaintenance from "./CardItemAssetMaintenance";
import { ArrowLeftOutlined, CheckOutlined, CloseOutlined, FilterOutlined, SearchOutlined } from "@ant-design/icons";
import { Col, Row } from "antd";
import { useEffect, useRef, useState } from "react";
import CardFilter from "./CardFilter";
import * as _unitOfWork from "../../api";
import { PAGINATION } from "../../utils/constant";
import SearchAssetMaintenance from "./searchAssetMaintenance";
import { useTranslation } from "react-i18next";

const AssetMaintenance = () => {
    const navigate = useNavigate();
    const [sortOrder, setSortOrder] = useState(-1);
    const [sortField, setSortField] = useState("createdAt");
    const [open, setOpen] = useState(false);
    const [openSearch, setOpenSeach] = useState(false);
    const [valueFilter, setValueFilter] = useState(null);
    const [totalRecord, setTotalRecord] = useState(0);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [assetMaintenance, setAssetMaintenances] = useState([])
    const contentRef = useRef(null);
    const { t } = useTranslation();

    useEffect(() => {
        const div = contentRef.current;
        if (!div) return;

        const handleScroll = () => {
            const isBottom = div.scrollTop + div.clientHeight >= div.scrollHeight - 10;
            if (isBottom && assetMaintenance.length < totalRecord && !isLoading) {
                loadMoreData();
            }
        };

        div.addEventListener("scroll", handleScroll);
        return () => div.removeEventListener("scroll", handleScroll);
    }, [assetMaintenance, totalRecord]);


    useEffect(() => {

        getListAssetMaintenances(page, page > 1); 

    }, [page, valueFilter]);


    const onSearchFilter = (_valueFilter) => {
        setValueFilter(_valueFilter);
    }

    const getListAssetMaintenances = async (currentPage = 1, isLoadMore = false) => {
        if (isLoading) return;
        setIsLoading(true);
        let payload = {
            page: currentPage,
            limit: PAGINATION.limit,
            ...valueFilter,
        };
        const res = await _unitOfWork.assetMaintenance.getListAssetMaintenanceMobile(
            payload
        );
        if (res && res.results && res.results?.results) {
            setTotalRecord(res.results.totalResults);
            if (isLoadMore) {
                setAssetMaintenances(prev => [...prev, ...res.results?.results]);
            } else {
                setAssetMaintenances(res.results?.results);
            }
        }
        setIsLoading(false);
    }

    const loadMoreData = () => {
        if (!isLoading) {
            setPage(prev => prev + 1);
        }
    };

    const onRefeshFilter = () => {
        setOpen(false);
        setValueFilter([]);
    }
    return (
        <div style={{ height: '100vh' }} >
            <Row
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
                <Col span={16}>
                    <ArrowLeftOutlined
                        style={{ fontSize: 22, marginRight: 16, cursor: 'pointer' }}
                        onClick={() => navigate(-1)}
                    />
                    <span style={{ flex: 1, fontSize: 20 }}>{t("assetMaintenance.list.title")}</span>
                </Col>
                <Col
                    span={8}
                    style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        gap: 12,
                        color: "#ffffff",
                    }}
                >
                    <div style={{ position: "relative" }}>
                        <FilterOutlined
                            onClick={() => setOpen(true)}
                            style={{ fontSize: 22, marginRight: 12, cursor: "pointer" }}
                        />
                        {valueFilter ? (
                            <CheckOutlined style={{
                                position: 'absolute',
                                top: -5,
                                right: 0,
                                fontSize: 12,
                                color: "green",
                            }} />
                        ) : (
                            <CloseOutlined style={{
                                position: 'absolute',
                                top: -5,
                                right: 0,
                                fontSize: 12,
                                color: "red",
                            }} />
                        )}
                    </div>
                    <SearchOutlined
                        onClick={() => setOpenSeach(true)}
                        style={{ fontSize: 22, cursor: "pointer", paddingRight: "7px" }}
                    />
                </Col>
            </Row>

            <div
                ref={contentRef}
                style={{
                    overflowY: 'auto',
                    height: 'calc(100vh - 56px)',
                    padding: '0 5px',
                }}
            >
                {assetMaintenance && assetMaintenance.length > 0 ? (
                    assetMaintenance.map(item => (
                        <CardItemAssetMaintenance key={item.id} data={item} />
                    ))
                ) : (
                    <p style={{ textAlign: "center", marginTop: 30, color: "#999" }}>
                        {t("common.no_data")}
                    </p>
                )}
            </div>

            <SearchAssetMaintenance open={openSearch} onClose={() => setOpenSeach(false)} />
            <CardFilter onSearch={onSearchFilter} open={open} onClose={() => setOpen(false)} onReFeshFilter={onRefeshFilter} />
        </div>
    );
}

export default AssetMaintenance;