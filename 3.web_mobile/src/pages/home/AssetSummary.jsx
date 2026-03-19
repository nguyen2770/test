import { AppstoreOutlined } from "@ant-design/icons";
import { Card, Col, Row } from "antd";
import * as _unitOfWork from "../../api";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
const { Meta } = Card;

const AssetSummary = () => {
    const [data, setData] = useState();
    const { t } = useTranslation();
    useEffect(() => {
        getAssetSummary();
    }, []);

    const getAssetSummary = async () => {
        const res = await _unitOfWork.assetMaintenance.getAssetSummary();
        if (res) {
            setData(res.data);
        }
    };

    return (
        <Row>
            <Col span={8} style={{ background: '#808080', textAlign: 'center', padding: 12 }}>
                <div style={{ fontSize: 18, fontWeight: 600, color: '#fff' }}>{data?.total ?? 0}</div>
                <div style={{ color: '#fff' }}>{t("assetSummary.total")}</div>
            </Col>
            <Col span={8} style={{ background: '#808080', textAlign: 'center', padding: 12, borderLeft: '1px solid #fff' }}>
                <div style={{ fontSize: 18, fontWeight: 600, color: '#fff' }}>{data?.breakdown ?? 0}</div>
                <div style={{ color: '#fff' }}>{t("assetSummary.breakdown")}</div>
            </Col>
            <Col span={8} style={{ background: '#808080', textAlign: 'center', padding: 12, borderLeft: '1px solid #fff' }}>
                <div style={{ fontSize: 18, fontWeight: 600, color: '#fff' }}>{data?.schedulePreventive ?? 0}</div>
                <div style={{ color: '#fff' }}>{t("assetSummary.maintaining")}</div>
            </Col>
        </Row>
    );
}

export default React.memo(AssetSummary);