import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Drawer } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import * as _unitOfWork from "../../api";
import useAuth from "../../contexts/authContext";
import { staticPath } from '../../router/RouteConfig';
import { PAGINATION } from '../../utils/constant';
import CardItemAssetMaintenance from './CardItemAssetMaintenance';
import { useTranslation } from 'react-i18next';

const SearchAssetMaintenance = ({ open, onClose }) => {
    const [page, setPage] = useState(1);
    const navigate = useNavigate();
    const [totalRecord, setTotalRecord] = useState(0);
    const [assetMaintenance, setAssetMaintenances] = useState([]);
    const [searchText, setSearchText] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const contentRef = useRef(null);
    const { t } = useTranslation();

    useEffect(() => {
        if (open) {
            const delayDebounce = setTimeout(() => {
                setPage(1);
                getListAssetMaintenances();
            }, 1000);
            return () => clearTimeout(delayDebounce);
        }
    }, [searchText, open]);

    useEffect(() => {
        if (open) {
            getListAssetMaintenances(page, page > 1);
        }
    }, [page]);

    const loadMoreData = () => {
        if (!isLoading) {
            setPage(prev => prev + 1);
        }
    };

    useEffect(() => {
        const div = contentRef.current;
        if (!div) return;

        const handleScroll = () => {
            const bottom = div.scrollHeight - div.scrollTop <= div.clientHeight + 100;
            if (bottom && assetMaintenance?.length < totalRecord) {
                loadMoreData();
            }
        };

        div.addEventListener("scroll", handleScroll);
        return () => div.removeEventListener("scroll", handleScroll);
    }, [assetMaintenance, totalRecord, open]);

    const getListAssetMaintenances = async (currentPage = 1, isLoadMore = false) => {
        if (isLoading) return;
        setIsLoading(true);
        const payload = {
            page: currentPage,
            limit: PAGINATION.limit,
        };
        if (searchText) payload.searchValue = searchText;

        const res = await _unitOfWork.assetMaintenance.getListAssetMaintenances(
            payload
        );
        if (res?.results?.results) {
            setTotalRecord(res?.data?.totalResults);
            if (isLoadMore) {
                setAssetMaintenances(prev => [...prev, ...res.results?.results]);
            } else {
                setAssetMaintenances(res.results?.results);
            }
        }
        setIsLoading(false);
    };

    const resetState = () => {
        setPage(1);
        setTotalRecord(0);
        setAssetMaintenances([]);
        setSearchText(null);
        setIsLoading(false);
    };

    const onCancelSearch = () => {
        onClose();
        resetState();
    };
    return (
        <Drawer
            placement="right"
            closable={false}
            open={open}
            className='drawer-custom'
            width="100%"
            bodyStyle={{ padding: 0 }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    height: 56,
                    background: '#ffffff',
                    color: "rgb(143, 141, 141)",
                    padding: '0 16px',
                    fontWeight: 600,
                    fontSize: 20,
                    boxSizing: 'border-box',
                }}
            >
                <LeftOutlined
                    style={{ fontSize: 22, marginRight: 16, cursor: 'pointer' }}
                    onClick={onCancelSearch}
                />
                <Input
                    placeholder={t("assetMaintenance.search.placeholder")}
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    allowClear
                />
            </div>
            <div
                ref={contentRef}
                className="ticket-list p-1"
                style={{
                    maxHeight: 'calc(100vh - 56px)',
                    overflowY: 'auto',
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

        </Drawer>
    );
};

export default SearchAssetMaintenance;