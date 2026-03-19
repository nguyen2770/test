import { Card, Row, Col, Avatar, Typography } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { PAGINATION } from '../../utils/constant';
import * as _unitOfWork from "../../api";
const { Text } = Typography;

export default function SparePartInventory({searchValue}) {
    const [totalRecord, setTotalRecord] = useState(0);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [spareParts, setSpareParts] = useState([]);
    const contentRef = useRef(null);

    useEffect(() => {
        fetchGetListSparePart();
    }, [searchValue]);

    console.log(searchValue)

    useEffect(() => {
        const div = contentRef.current;
        if (!div) return;

        const handleScroll = () => {
            const bottom = div.scrollHeight - div.scrollTop <= div.clientHeight + 1;
            if (bottom && spareParts?.length < totalRecord) {
                loadMoreData(); // nếu chạm đáy => tải thêm
            }
        };

        div.addEventListener("scroll", handleScroll);
        return () => div.removeEventListener("scroll", handleScroll);
    }, [spareParts, totalRecord]);

    useEffect(() => {

        fetchGetListSparePart(page, page > 1); // gọi API

    }, [page]);


    const loadMoreData = () => {
        if (!isLoading) {
            setPage(prev => prev + 1);
        }
    };



    const fetchGetListSparePart = async (currentPage = 1, isLoadMore = false) => {
        if (isLoading) return;
        setIsLoading(true);

        let payload = {
            page: currentPage,
            limit: PAGINATION.limit,
            searchValue
        };

        const res = await _unitOfWork.inventory.getSpareParts(payload);

        if (res && res.results && res.results?.results) {
            setTotalRecord(res.results.totalResults);

            const rawParts = res.results.results;

            // Gọi getImage cho từng sparePart
            const partsWithImage = await Promise.all(
                rawParts.map(async (part) => {
                    const imageUrl = await _unitOfWork.resource.getImage(part.resourceId);
                    return {
                        ...part,
                        imageUrl,
                    };
                })
            );

            if (isLoadMore) {
                setSpareParts(prev => [...prev, ...partsWithImage]);
            } else {
                setSpareParts(partsWithImage);
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
            {spareParts.length > 0 && spareParts.map(item => (

                <Card
                    bordered
                    bodyStyle={{ padding: "10px 15px" }}
                    className='mb-1'
                >
                    <Row align="middle" gutter={24}>
                        <Col span={6}>
                            <Avatar
                                size={60}
                                src={item.imageUrl || "https://via.placeholder.com/100"}
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
                                <Text strong>{`${item.code} - ${item.sparePartsName}`}</Text>
                                <Text >{`Danh mục: ${item.spareCategoryId?.spareCategoryName}`}</Text>
                                <Text >{`Danh mục phụ: ${item.spareSubCategoryId?.spareSubCategoryName}`}</Text>
                                {/* <Text >{`Hãng sản xuất: ${item.manufacturer?.manufacturerName}`}</Text> */}

                                <Text >{`Số lượng: ${item.qty}`}</Text>

                            </div>
                        </Col>
                    </Row>
                </Card>
            ))}
        </div>
    );
}