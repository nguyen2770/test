import { ArrowLeftOutlined } from "@ant-design/icons";
import { Col, Drawer, Row } from "antd";
import { useEffect } from "react";
import { useTranslation } from "react-i18next"
import CardList2 from "../../../components/Card/CardList2";
import { reportView } from "../../../utils/constant";

const CardTotalAssetDepreciationReport = ({ open, onClose, data, viewOption, formatNumber, valueFilter }) => {
    const { t } = useTranslation();

    const columns = viewOption === reportView.summary
        ? [
            { title: t("report.assetDepreciation.columns.origin_value"), key: "originValue", render: (_, i) => formatNumber(i.originValue) || "-" },
            { title: t("report.assetDepreciation.columns.depreciable_value"), key: "depreciableValue", render: (_, i) => formatNumber(i.depreciableValue) || "-" },
            { title: t("report.assetDepreciation.columns.accumulated_value"), key: "accumulatedValue", render: (_, i) => formatNumber(i.accumulatedValue) || "-" },
        ] : [
            { title: t("report.assetDepreciation.columns_detail.origin_value"), key: "originValue", render: (_, i) => formatNumber(i.originValue) || "-" },
            {
                title: t("report.assetDepreciation.columns_detail.monthly_depreciation_value"), key: "depreciationMonths",
                children: [
                    { title: t("report.assetDepreciation.columns_detail.month_1"), key: "depreciationMonths", render: (_, i) => formatNumber(i.month_1) || "-" },
                    { title: t("report.assetDepreciation.columns_detail.month_2"), key: "depreciationMonths", render: (_, i) => formatNumber(i.month_2) || "-" },
                    { title: t("report.assetDepreciation.columns_detail.month_3"), key: "depreciationMonths", render: (_, i) => formatNumber(i.month_3) || "-" },
                    { title: t("report.assetDepreciation.columns_detail.month_4"), key: "depreciationMonths", render: (_, i) => formatNumber(i.month_4) || "-" },
                    { title: t("report.assetDepreciation.columns_detail.month_5"), key: "depreciationMonths", render: (_, i) => formatNumber(i.month_5) || "-" },
                    { title: t("report.assetDepreciation.columns_detail.month_6"), key: "depreciationMonths", render: (_, i) => formatNumber(i.month_6) || "-" },
                    { title: t("report.assetDepreciation.columns_detail.month_7"), key: "depreciationMonths", render: (_, i) => formatNumber(i.month_7) || "-" },
                    { title: t("report.assetDepreciation.columns_detail.month_8"), key: "depreciationMonths", render: (_, i) => formatNumber(i.month_8) || "-" },
                    { title: t("report.assetDepreciation.columns_detail.month_9"), key: "depreciationMonths", render: (_, i) => formatNumber(i.month_9) || "-" },
                    { title: t("report.assetDepreciation.columns_detail.month_10"), key: "depreciationMonths", render: (_, i) => formatNumber(i.month_10) || "-" },
                    { title: t("report.assetDepreciation.columns_detail.month_11"), key: "depreciationMonths", render: (_, i) => formatNumber(i.month_11) || "-" },
                    { title: t("report.assetDepreciation.columns_detail.month_12"), key: "depreciationMonths", render: (_, i) => formatNumber(i.month_12) || "-" },
                ]
            },
            { title: t("report.assetDepreciation.columns_detail.total"), key: "depreciationMonths", render: (_, i) => formatNumber(i.total) },
        ];

    return (
        <div style={{ background: '#f8f8f8' }}>
            <Drawer
                placement="right"
                closable={false}
                open={open}
                width="100%"
                bodyStyle={{ padding: 0 }}
            >
                <Row>
                    <Col
                        span={24}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            height: 56,
                            background: '#23457b',
                            color: '#fff',
                            padding: '0 16px',
                            fontWeight: 600,
                            fontSize: 20
                        }}
                    >
                        <ArrowLeftOutlined
                            style={{ fontSize: 22, marginRight: 16, cursor: 'pointer' }}
                            onClick={onClose}
                        />
                        <span style={{ flex: 1 }}>{t("report.assetDepreciation.label.total")}</span>
                    </Col>
                </Row>
                <Col
                    span={24}
                    className="px-3 pt-2"
                >
                    <span
                        style={{
                            fontSize: 18,
                            fontWeight: "bold"
                        }}
                    >
                        {data[0]?.text}
                    </span>
                    {valueFilter?.assetName ? (
                        <p>
                            {t("report.assetDepreciation.label.filter_asset_name")} '{valueFilter?.assetName}'
                        </p>
                    ) : (<></>)}
                    {valueFilter?.serial ? (
                        <p>
                            {t("report.assetDepreciation.label.filter_serial")} '{valueFilter?.serial}'
                        </p>
                    ) : (<></>)}
                    {valueFilter?.reportCutoffDate && viewOption === reportView.summary ? (
                        <p>
                            {t("report.assetDepreciation.label.filter_date")} '{valueFilter?.reportCutoffDate.format('DD/MM/YYYY')}'
                        </p>
                    ) : (<></>)}
                    {valueFilter?.reportCutoffYear && viewOption === reportView.details ? (
                        <p>
                            {t("report.assetDepreciation.label.filter_year")} '{valueFilter?.reportCutoffYear.format('YYYY')}'
                        </p>
                    ) : (
                        <></>
                    )}
                </Col>
                <Col
                    span={24}
                    className="p-2"
                >
                    <CardList2
                        columns={columns}
                        data={data}
                    />
                </Col>
            </Drawer>
        </div>
    );
}

export default CardTotalAssetDepreciationReport;