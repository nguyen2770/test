import { Carousel } from 'antd';
import React, { useState } from 'react';
import { Form, Row, Col, Input, Button, Select, Space } from 'antd';
import { DownOutlined, UpOutlined, CloseOutlined, PlusSquareOutlined, RedoOutlined } from '@ant-design/icons';
import Promotion1 from '../../assets/images/promotion/promotion1.png'
import Promotion2 from '../../assets/images/promotion/promotion2.png'
import './index.scss'
import AOS from 'aos';
import 'aos/dist/aos.css'
const { Option } = Select;

const PromotionComponent = ({ setShowPromotion }) => {
    AOS.init({
        duration: 2000,
    });
    const onChange = (urlLink) => {
        window.open(urlLink);
    };
    return (
        <div className='promotion-container' data-aos="flip-left" >
            <div className='text-right mb-1'> <Button className='bt-green' onClick={() => setShowPromotion(false)} shape="circle" icon={<CloseOutlined style={{ color: 'white !important' }} />} /></div>
            < Carousel autoplay >
                <div>
                    <img onClick={() => onChange("https://pnpsolution.tech/product/22c8f537-986d-465a-8e4c-87acc9be3c16")} className='img-promotion' src={Promotion1} />
                </div>
                <div>
                    <img onClick={() => onChange("https://pnpsolution.tech/shop")} className='img-promotion' src={Promotion2} />
                </div>
            </Carousel >
        </div >
    );
};
const contentStyle = {
    margin: 0,
    height: '160px',
    color: '#fff',
    lineHeight: '160px',
    textAlign: 'center',
    background: '#364d79',
};
export default PromotionComponent;