import React, { useEffect, useState } from 'react';
import { ArrowLeftOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { staticPath } from '../../router/RouteConfig';
import AssetModelInventory from './assetModelIventory';
import SparePartInventory from './sparePartInventory';
import { Input } from 'antd';

export default function Inventory() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('sparePart');
    const [searchValue, setSearchValue] = useState('');
    const [showInput, setShowInput] = useState(false);
    const [tempValue, setTempValue] = useState('');


    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setTempValue('');
        setSearchValue('');
    };

    const renderTabContent = () => {
        if (activeTab === 'assetModel') return <AssetModelInventory searchValue={searchValue} />;
        if (activeTab === 'sparePart') return <SparePartInventory searchValue={searchValue} />;
    };

    return (
        <div style={{ background: '#f8f8f8', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Sticky Header */}
            <div
                style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 100,
                    background: '#23457b',
                    height: 56,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 16px',
                    fontWeight: 600,
                    fontSize: 20,
                    color: '#fff',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <ArrowLeftOutlined
                        style={{ fontSize: 22, marginRight: 16, cursor: 'pointer' }}
                        onClick={() => navigate(-1)}
                    />
                    <span>Tồn kho</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {showInput ? (
                        <Input
                            value={tempValue}
                            placeholder="Nhập tên hoặc mã vật tư"
                            autoFocus
                            style={{
                                width: 200,
                                marginRight: 8,
                                background: '#fff',
                                color: '#23457b',
                                fontWeight: 400,
                                fontSize: 16,
                                borderRadius: 4,
                            }}
                            onChange={e => setTempValue(e.target.value)}
                            onPressEnter={() => {
                                setSearchValue(tempValue);
                                setShowInput(false);
                            }}
                            onBlur={() => setShowInput(false)}
                        />
                    ) : (
                        <SearchOutlined
                            style={{ fontSize: 20, cursor: 'pointer' }}
                            onClick={() => setShowInput(true)}
                            onMouseEnter={() => setShowInput(true)}
                        />
                    )}
                </div>
            </div>

            {/* Sticky TabBar */}
            <div
                style={{
                    position: 'sticky',
                    top: 56,
                    zIndex: 99,
                    display: 'flex',
                    background: '#23457b',
                    color: '#fff',
                    textAlign: 'center',
                }}
            >
                <div
                    onClick={() => handleTabChange('sparePart')}
                    style={{
                        flex: 1,
                        padding: '12px 0',
                        cursor: 'pointer',
                        background: activeTab === 'sparePart' ? '#1d3a66' : '#23457b',
                        fontWeight: activeTab === 'sparePart' ? 'bold' : 'normal',
                        borderBottom: activeTab === 'sparePart' ? '2px solid rgb(255, 81, 0)' : '2px solid transparent',
                    }}
                >
                    Phụ tùng
                </div>
                <div
                    onClick={() => handleTabChange('assetModel')}
                    style={{
                        flex: 1,
                        padding: '12px 0',
                        cursor: 'pointer',
                        background: activeTab === 'assetModel' ? '#1d3a66' : '#23457b',
                        fontWeight: activeTab === 'assetModel' ? 'bold' : 'normal',
                        borderBottom: activeTab === 'assetModel' ? '2px solid rgb(255, 81, 0)' : '2px solid transparent',
                    }}
                >
                    Tài sản
                </div>
            </div>

            {/* Tab content */}
            <div style={{ padding: 16 }}>
                {renderTabContent()}
            </div>
        </div>
    );
}
