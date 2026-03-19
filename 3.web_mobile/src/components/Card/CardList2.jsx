import { Card, Row, Col, Divider } from "antd";

const renderColumnItem = (col, item, formatNumber) => {
    let value;
    if (Array.isArray(col.dataIndex)) {
        let current = item;
        col.dataIndex.forEach(key => {
            current = current ? current[key] : undefined;
        });
        value = current;
    } else {
        value = item[col.dataIndex];
    }

    const renderedValue = col.render
        ? col.render(value, item)
        : value ?? "-";

    return (
        <Row key={col.key || col.dataIndex} style={{ marginBottom: 4 }}>
            <Col span={12}>
                <b>{col.title}:</b>
            </Col>
            <Col span={12} style={{ textAlign: "right" }}>
                {renderedValue}
            </Col>
        </Row>
    );
};

const CardList = ({ columns, data, formatNumber }) => { // Thêm formatNumber nếu cần
    return (
        <>
            {data.map((item, idx) => (
                <Card
                    key={item._id || idx}
                    style={{
                        marginBottom: 12,
                        borderRadius: 12,
                        boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
                    }}
                >
                    {columns.map((col) => {
                        if (col.children) {
                            return (
                                <div key={col.key || col.title}>
                                    <Divider orientation="left" style={{ marginTop: 8 }}>
                                        <b>{col.title}</b>
                                    </Divider>
                                    <Row>
                                        {col.children.map((childCol) => (
                                            <Col key={childCol.key || childCol.dataIndex} span={24}>
                                                {renderColumnItem(childCol, item, formatNumber)}
                                            </Col>
                                        ))}
                                    </Row>
                                </div>
                            );
                        } else {
                            return renderColumnItem(col, item, formatNumber);
                        }
                    })}
                </Card>
            ))}
        </>
    );
};

export default CardList;