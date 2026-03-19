import { Card, Row, Col, Avatar, Typography } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { PAGINATION } from '../../utils/constant';
import * as _unitOfWork from "../../api";
const { Text } = Typography;

export default function AssetModelInventory({searchValue}) {
    const [totalRecord, setTotalRecord] = useState(0);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [assetModels, setAssetModels] = useState([]);
    const contentRef = useRef(null);

    console.log(searchValue)
    useEffect(() => {
        fetchGetListAssetModel();
    }, [searchValue]);

    useEffect(() => {
        const div = contentRef.current;
        if (!div) return;

        const handleScroll = () => {
            const bottom = div.scrollHeight - div.scrollTop <= div.clientHeight + 1;
            if (bottom && assetModels?.length < totalRecord) {
                loadMoreData(); // nếu chạm đáy => tải thêm
            }
        };

        div.addEventListener("scroll", handleScroll);
        return () => div.removeEventListener("scroll", handleScroll);
    }, [assetModels, totalRecord]);

    useEffect(() => {

        fetchGetListAssetModel(page, page > 1); // gọi API

    }, [page]);


    const loadMoreData = () => {
        if (!isLoading) {
            setPage(prev => prev + 1);
        }
    };



    const fetchGetListAssetModel = async (currentPage = 1, isLoadMore = false) => {
        if (isLoading) return;
        setIsLoading(true);
        let payload = {
            page: currentPage,
            limit: PAGINATION.limit,
            searchValue,
        };
        const res = await _unitOfWork.inventory.getAssetModels(payload);
        if (res && res.results && res.results?.results) {
            setTotalRecord(res.results.totalResults);

            if (isLoadMore) {
                setAssetModels(prev => [...prev, ...res.results?.results]);
            } else {
                setAssetModels(res.results?.results);
            }
        }
        setIsLoading(false);

    };

    return (
        <div
            ref={contentRef}
            className="ticket-list p-1"
            style={{
                maxHeight: 'calc(100vh - 56px)',
                overflowY: 'auto',
            }}
        >
            {assetModels.length > 0 && assetModels.map(item => (

                <Card
                    bordered
                    bodyStyle={{ padding: "10px 15px" }}
                    className='mb-1'
                >
                    <Row align="middle" gutter={24}>
                        <Col span={6}>
                            <Avatar
                                size={60}
                                src="https://via.placeholder.com/100"
                            />
                        </Col>
                        <Col span={18} >
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                }}
                            >
                                <Text strong>{`${item.asset?.assetName} - ${item.assetModelName}`}</Text>
                                <Text >{`Danh mục: ${item.category?.categoryName}`}</Text>
                                <Text >{`Danh mục phụ: ${item.subCategory?.subCategoryName}`}</Text>
                                <Text >{`Hãng sản xuất: ${item.manufacturer?.manufacturerName}`}</Text>
                                <Text >{`Loại: ${item.assetTypeCategory?.name}`}</Text>
                                <Text >{`Số lượng: ${item.qty}`}</Text>

                            </div>
                        </Col>
                    </Row>
                </Card>
            ))}
        </div>
    );
}
