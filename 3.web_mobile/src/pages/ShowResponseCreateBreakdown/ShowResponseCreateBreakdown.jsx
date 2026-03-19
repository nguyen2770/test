import React from 'react';
import './ShowResponseCreateBreakdown.scss'
import { useTranslation } from 'react-i18next';
const ShowResponseCreateBreakdown = () => {
    const { t } = useTranslation();
    return (
        <div className='ShowResponseCreateBreakdown-container'>
            {t("breakdown.common.messages_success")}
        </div>
    );
};

export default ShowResponseCreateBreakdown;