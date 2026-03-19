import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner, Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

const QrCodeScan = ({ onCallback }) => {
    const [dataQrcode, setDataQrcode] = useState(null)
    useEffect(() => {
        // const scanner = new Html5QrcodeScanner('reader', {
        //     qrbox: {
        //         height: 250,
        //         width: 250
        //     },
        //     fps: 5
        // })
        // scanner.render(success, error);
        // function success(result) {
        //     scanner.clear();
        //     setData(result)
        // }
        // function error(err) {

        // }
        const html5QrCode = new Html5Qrcode(
            "reader", { formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE] });
        const qrCodeSuccessCallback = (decodedText, decodedResult) => {
            /* handle success */
            setDataQrcode(decodedText);
        };
        const config = { fps: 5, qrbox: { width: 250, height: 250 } };

        // If you want to prefer front camera
        html5QrCode.start({ facingMode: "environment" }, config, qrCodeSuccessCallback)
    }, [])
    useEffect(() => {
        if (dataQrcode) {
            onCallback(dataQrcode)
        }
    }, [dataQrcode])
    return (
        <>
            <div id="reader"></div>
            {/* <p>{data}</p> */}
        </>
    );
};
export default QrCodeScan;