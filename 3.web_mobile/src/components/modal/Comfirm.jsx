import React from "react";
import { ExclamationCircleFilled } from "@ant-design/icons";
import { Button, Modal, Space } from "antd";
import i18next from "i18next";
const { confirm } = Modal;

const Confirm = (content, callback) => {
  confirm({
    title: i18next.t("modal.confirm.title"),
    icon: <ExclamationCircleFilled />,
    content: content,
    okText: i18next.t("modal.confirm.ok"),
    cancelText: i18next.t("modal.confirm.cancel"),
    onOk() {
      callback();
    },
    onCancel() {},
  });
};
export default Confirm;
