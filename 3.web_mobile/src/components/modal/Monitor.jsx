import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  ArrowLeftOutlined,
  SolutionOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { staticPath } from '../../router/RouteConfig';
import { Button, Card, Col, Divider, Row, Select, Spin, Form } from 'antd';
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import * as _unitOfWork from "../../api";
import { useTranslation } from 'react-i18next';

// Cấu hình lại icon Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const defaultCenter = { lat: 21.028511, lng: 105.804817 };

function PanToLocation({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (map && lat && lng) {
      map.setView([lat, lng], 15);
    }
  }, [lat, lng, map]);
  return null;
}

export default function Monitor() {
  const navigate = useNavigate();
  const params = useParams();
  const [form] = Form.useForm();
  const [locationName, setLocationName] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(defaultCenter);
  const debounceRef = useRef(null);
  const [breakdown, setBreakdown] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    fetchGetBreakdownById();
  }, []);

  const fetchGetBreakdownById = async () => {
    const res = await _unitOfWork.breakdown.getBreakdownById({ id: params.id });
    if (res?.breakdown) {
      setBreakdown(res.breakdown);
    }
  };

  useEffect(() => {
    if (!locationName) {
      setSearchResults([]);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      handleSearch(locationName);
    }, 800);

    return () => clearTimeout(debounceRef.current);
  }, [locationName]);

  const handleSearch = async (value) => {
    setSearching(true);
    const api = `https://nominatim.openstreetmap.org/search?format=geojson&limit=5&q=${encodeURIComponent(value)}`;
    const res = await fetch(api);
    const data = await res.json();
    setSearchResults(data.features || []);
    setSearching(false);
  };

  const handleSelectSuggestion = (item) => {
    const [lng, lat] = item.geometry.coordinates;
    setSelectedLocation({ lat, lng });
    setLocationName(item.properties.display_name);
  };

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', background: '#fff' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          height: 70,
          background: '#23457b',
          color: '#fff',
          padding: '0 16px',
          fontWeight: 600,
          fontSize: 18,
        }}
      >
        <ArrowLeftOutlined
          style={{ fontSize: 22, marginRight: 16, cursor: 'pointer' }}
          onClick={() => navigate(-1)}
        />
        <span style={{ flex: 1 }}>{t("monitor.title", { defaultValue: "Theo dõi khách hàng" })}</span>
        <SolutionOutlined
          style={{ fontSize: 24, cursor: 'pointer' }}
          onClick={() => navigate(staticPath.infoUser)}
        />
      </div>

      {/* Nội dung */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label={t("preventiveSchedule.fields.country", { defaultValue: "Quốc gia" })}>
                <strong>{breakdown?.assetMaintenance?.country?.name}</strong>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label={t("preventiveSchedule.fields.state", { defaultValue: "Tỉnh / Thành phố" })}>
                <strong>{breakdown?.assetMaintenance?.state?.name}</strong>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label={t("preventiveSchedule.fields.city", { defaultValue: "Quận / Huyện" })}>
                <strong>{breakdown?.assetMaintenance?.city?.name}</strong>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label={t("preventiveSchedule.fields.building", { defaultValue: "Tòa" })}>
                <strong>{breakdown?.assetMaintenance?.building?.BuildingName}</strong>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label={t("preventiveSchedule.fields.floor", { defaultValue: "Tầng" })}>
                <strong>{breakdown?.assetMaintenance?.floor?.FloorName}</strong>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label={t("preventiveSchedule.fields.department", { defaultValue: "Phòng ban" })}>
                <strong>{breakdown?.assetMaintenance?.department?.DepartmentName}</strong>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label={t("monitor.address_note", { defaultValue: "Ghi chú địa chỉ" })}>
                <strong>{breakdown?.assetMaintenance?.addressNote}</strong>
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          {/* Select gợi ý vị trí */}
          <Row style={{ marginBottom: 12 }}>
            <Select
              showSearch
              value={locationName}
              placeholder={t("preventiveSchedule.fields.search_location_placeholder", { defaultValue: "Nhập địa chỉ hoặc tên vị trí" })}
              onSearch={(value) => setLocationName(value)}
              onChange={(value, option) => handleSelectSuggestion(option.item)}
              filterOption={false}
              notFoundContent={searching ? <Spin size="small" /> : null}
              style={{ width: '100%' }}
            >
              {searchResults.map((item) => (
                <Select.Option
                  key={item.properties.place_id}
                  value={item.properties.display_name}
                  item={item}
                >
                  {item.properties.display_name}
                </Select.Option>
              ))}
            </Select>
          </Row>

          {/* Bản đồ */}
          <div style={{ width: '100%', height: '400px', borderRadius: 8, overflow: 'hidden' }}>
            <MapContainer
              center={selectedLocation}
              zoom={15}
              scrollWheelZoom={true}
              style={{ width: '100%', height: '100%' }}
            >
              <TileLayer
                url="https://mt1.google.com/vt/lyrs=r&x={x}&y={y}&z={z}"
                attribution="© Google Maps"
              />
              <PanToLocation lat={selectedLocation.lat} lng={selectedLocation.lng} />
              <Marker position={selectedLocation} />
            </MapContainer>
          </div>
        </Form>
      </div>
    </div>
  );
}