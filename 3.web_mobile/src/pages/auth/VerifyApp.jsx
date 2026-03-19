import { useEffect, useState } from 'react'
import './VerifyApp.scss'
import { Spin } from 'antd';
import useQuery from '../../helper/useQuery';
import { STORAGE_KEY } from '../../utils/constant';
import * as _unitOfWork from '../../api';
import useAuth from '../../contexts/authContext';
function VerifyApp() {
    let query = useQuery();
    let { user, logout } = useAuth();
    useEffect(() => {
        var deviceToken = query.get("deviceToken");
        if (deviceToken) {
            localStorage.setItem(STORAGE_KEY.DEVICE_TOKEN, deviceToken);
            if (user) {
                verifyApp(deviceToken);
            } else {
                window.location.href = '/login'
            }
        } else {
            window.location.href = '/trang-chu'
        }
    }, [])
    const verifyApp = async (_deviceToken) => {
        let payload = {
            deviceToken: _deviceToken
        }
        let res = await _unitOfWork.user.verifyApp(payload);
        if (res && res.code === 1) {
            window.location.href = '/trang-chu'
        } else {
            logout()
        }
    }
    return (
        <div className="VerifyApp-page">
            <div className='spin-loading-verify'>
                <Spin tip="Đang tải dữ liệu" size="large">
                </Spin>
            </div>
        </div>
    )
}

export default VerifyApp