import { Card, Row, Col } from "antd";

const CardList = ({ columns, data }) => {
  return (
    <>
      {data.map((item, idx) => (
        <Card
          key={item._id || idx}
          style={{
            marginBottom: 12,
            borderRadius: 12,
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
          }}
        >
          {columns.map((col) => (
            <Row key={col.key} style={{ marginBottom: 4 }}>
              <Col span={12}>
                <b>{col.title}:</b>
              </Col>
              <Col span={12} style={{ textAlign: "right" }}>
                {col.render
                  ? col.render(item[col.dataIndex], item)
                  : item[col.dataIndex] ?? "-"}
              </Col>
            </Row>
          ))}
        </Card>
      ))}
    </>
  );
};

export default CardList;
