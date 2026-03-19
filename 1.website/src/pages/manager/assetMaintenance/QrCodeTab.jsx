import { Button, Row } from "antd";
import React, { useState } from "react";
import QrCodeCard from "../../../components/card/QrCodeCard/QrCodeCard";
import SettingQrCodeModal from "../../../components/modal/SettingQrCodeModal";
import { useTranslation } from "react-i18next";

export default function QrCodeTab({ assetMaintenance }) {
    const { t } = useTranslation();
    const [showSetting, setShowSetting] = useState(false);
    const printDiv = (divName) => {
        var win = window.open(
            "",
            "",
            "left=0,top=0,fullscreen=1,toolbar=0,scrollbars=0,status=0,titlebar=1"
        );

        var content = "<html>";
        content += `<head>
		<link rel="stylesheet" href='https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css'/>
		<style>
			@page { font-size: 23px;  margin: 5mm; }
			.col-form-label {
				padding-bottom: 0 !important;
				padding-top: 0 !important;
				font-weight: 700 !important;
			}
			span { font-weight: 500 !important; }
			body { font-weight: 500; padding: 20px; }
            .qr-code-card-container { width: 100%; border: 1px solid; text-align: center; }
            .qr-code-card-container .asset-maintenance-customer-name { border-bottom: 1px solid; font-weight: 600; font-size: 28px; }
            .qr-code-card-container .asset-maintenance-qrcode { padding: 8px; text-align: center; border-bottom: 1px solid; }
            .qr-code-card-container .asset-maintenance-qrcode svg { width: 90% !important; height: 90% !important; }
            .qr-code-card-container .asset-maintenance-asset-name { border-bottom: 1px solid; text-align: center; font-weight: 600; font-size: 28px; }
            .qr-code-card-container .asset-maintenance-asset-number { text-align: center; font-weight: 600; font-size: 28px; }
		</style>
		</head>`;
        content += '<body onload="window.print(); window.close();">';
        content += document.getElementById(divName).innerHTML;
        content += "</body>";
        content += "</html>";
        win.document.write(content);
        win.document.close();
    };
    return (
        <>
            <Row className="mb-2">
                <Button type="primary" onClick={() => printDiv("printableArea")}>
                    {t("assetMaintenance.actions.print_qrcode")}
                </Button>
                <Button className="bt-green ml-2" onClick={() => setShowSetting(true)}>
                    {t("assetMaintenance.actions.setting_qrcode")}
                </Button >
            </Row >
            <Row>
                <div id='printableArea'>
                    <QrCodeCard assetMaintenance={assetMaintenance} />
                </div>
            </Row>
            <SettingQrCodeModal open={showSetting} handleCancel={() => setShowSetting(false)} />
        </>
    );
}