import React from "react";
import {
    Row,
    Col,
    Collapse,
    Card,
    Typography,
    List,
} from "antd";
import { priceFormatter } from '../../../helper/price-helper'
import { useTranslation } from "react-i18next";
import "./index.scss";

const { Text } = Typography;

export default function ViewAmcService({ amcService, serviceIndex }) {
    const { t } = useTranslation();

    const calTotalPrice = () => {
        let _totalPrice = 0;
        if (!amcService.amcServiceTasks) return _totalPrice;
        amcService.amcServiceTasks.forEach(element => {
            _totalPrice += (element.totalPrice ?? 0) * (amcService.frequencyNumber ?? 0) * (amcService.noOfAsset ?? 0)
        });
        return _totalPrice;
    };

    const getTaskName = (record) => {
        var serviceTask = amcService.service.serviceTasks.find(s => s.id == record.serviceTask);
        if (serviceTask) {
            return serviceTask.taskName;
        }
        return "";
    };

    return (
        <Collapse
            className="mb-2 amc-service-collapse"
            defaultActiveKey={[serviceIndex]}
            collapsible="icon"
        >
            <Collapse.Panel
                key={serviceIndex}
                header={
                    <div className="service-header">
                        <div className="service-name">
                            <Text strong>
                                {t("amc.service.service_label", { name: amcService?.service?.serviceName })}
                            </Text>
                        </div>

                        <Row gutter={[8, 8]} className="service-info-grid">
                            <Col span={12}>
                                <div className="info-item">
                                    <span className="info-label">{t("amc.service.frequency")}</span>
                                    <span className="info-value">{amcService.frequencyNumber}</span>
                                </div>
                            </Col>
                            <Col span={12}>
                                <div className="info-item">
                                    <span className="info-label">{t("amc.service.asset_count")}</span>
                                    <span className="info-value">{amcService.noOfAsset}</span>
                                </div>
                            </Col>
                            <Col span={24}>
                                <div className="info-item">
                                    <span className="info-label">{t("amc.service.model")}</span>
                                    <span className="info-value">
                                        {amcService.assetModel?.assetModelName} - {amcService.assetModel?.asset?.assetName}
                                    </span>
                                </div>
                            </Col>
                            <Col span={24}>
                                <div className="info-item total-price">
                                    <span className="info-label">{t("amc.service.service_price")}</span>
                                    <span className="info-value price">
                                        {priceFormatter(calTotalPrice())}
                                    </span>
                                </div>
                            </Col>
                        </Row>
                    </div>
                }
            >
                <div className="service-tasks-list">
                    <List
                        dataSource={amcService.amcServiceTasks ?? []}
                        renderItem={(item, index) => (
                            <Card className="task-card" bodyStyle={{ padding: 12 }} key={index}>
                                <Row align="middle">
                                    <Col span={4}>
                                        <div className="task-index">{index + 1}</div>
                                    </Col>
                                    <Col span={20}>
                                        <div className="task-name">{getTaskName(item)}</div>
                                        <div className="task-price">
                                            {t("amc.service.price_quantity")}: <b>{priceFormatter(item.totalPrice)}</b>
                                        </div>
                                    </Col>
                                </Row>
                            </Card>
                        )}
                        locale={{ emptyText: t("common.no_data") }}
                    />
                </div>
            </Collapse.Panel>
        </Collapse>

    );
}