import React, { useState } from 'react';
import { Button, List, Drawer } from 'antd';
import { ArrowLeftOutlined, PlusOutlined, CloseOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const attachmentOptions = [
    { label: 'Thêm hình ảnh', key: 'image' },
];

export default function AddAnAttachment() {
    const [showDrawer, setShowDrawer] = useState(false);
    const [file, setFile] = useState({ type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4' }); // demo
    const { t } = useTranslation();

    return (
        <div style={{ background: '#f8f8f8', minHeight: '100vh', position: 'relative' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                height: 56,
                background: '#223b5b',
                color: '#fff',
                padding: '0 16px',
                fontWeight: 600,
                fontSize: 20,
                boxSizing: 'border-box',
            }}>
                <ArrowLeftOutlined style={{ fontSize: 22, marginRight: 16, cursor: 'pointer' }} />
                <span style={{ flex: 1 }}>{t('attachment.add_attachment_title', { defaultValue: 'Thêm tập tin đính kèm' })}</span>
                <PlusOutlined style={{ fontSize: 24, cursor: 'pointer' }} onClick={() => setShowDrawer(true)} />
            </div>

            {/* File preview */}
            <div style={{ margin: 16, position: 'relative', background: '#fff', borderRadius: 10, minHeight: 200 }}>
                {file && file.type === 'video' && (
                    <video
                        src={file.url}
                        controls
                        style={{ width: '100%', borderRadius: 10, background: '#000' }}
                    />
                )}
                {/* Nút xóa */}
                <Button
                    type="text"
                    shape="circle"
                    icon={<CloseOutlined style={{ color: '#fff', fontSize: 22 }} />}
                    style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        background: '#ff6161',
                        zIndex: 2,
                    }}
                    onClick={() => setFile(null)}
                />
            </div>

            {/* Bottom sheet chọn loại file */}
            <Drawer
                open={showDrawer}
                onClose={() => setShowDrawer(false)}
                placement="bottom"
                height={360}
                closable={false}
                bodyStyle={{
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                    padding: 0,
                    background: '#fff'
                }}
                maskStyle={{ background: 'rgba(0,0,0,0.2)' }}
            >
                <div style={{ padding: '16px 0 0 0', borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
                    <div style={{ textAlign: 'center', fontWeight: 600, fontSize: 18, marginBottom: 12 }}>
                        {t('attachment.add_attachment_title', { defaultValue: 'Thêm tập tin đính kèm' })}
                    </div>
                    <List
                        dataSource={attachmentOptions}
                        renderItem={item => (
                            <List.Item
                                style={{ padding: '18px 24px', fontSize: 17, cursor: 'pointer' }}
                                onClick={() => {
                                    setShowDrawer(false);
                                    // Xử lý chọn loại file ở đây
                                }}
                            >
                                { item.label }
                            </List.Item>
                        )}
                    />
                </div>
            </Drawer>
        </div>
    );
}