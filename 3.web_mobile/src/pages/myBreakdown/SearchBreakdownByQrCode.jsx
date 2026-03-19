import React, { useState } from 'react'
import QrCodeScan from '../../components/qrCodeScan'
import useQuery from '../../helper/useQuery';
import { parseQuery } from '../../helper/queryString-helper';

function SearchBreakdownByQrCode(props) {
    const [assetMaintenanceId, setAssetMaintenanceId] = useState(null)
    const onCallback = (_qrCodeText) => {
        let query = parseQuery(_qrCodeText);
        // setAssetMaintenanceId(query);
        setAssetMaintenanceId(query['assetMaintenance'])
    }
    return (
        <div>
            <QrCodeScan onCallback={onCallback} />
            <p>{assetMaintenanceId}</p>
        </div>
    )
}

export default SearchBreakdownByQrCode