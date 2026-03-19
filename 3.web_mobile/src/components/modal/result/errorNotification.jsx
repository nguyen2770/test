import { notification } from 'antd';
import { WarningOutlined } from "@ant-design/icons";
import React from 'react';
const ShowError = (placement, message, description) => {
  notification.info({
    icon:<WarningOutlined  style={{ color: 'orange' }}/>,
    message: message || 'Notification Title',
    description: description || 'This is the content of the notification. This is the content of the notification. This is the content of the notification.',
    placement,
  });
};

export default ShowError;
