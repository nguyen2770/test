import { post, get, patch, deleteRequest } from './restApi';

export const getAssetDepreciationReport = (payload) => {
    return get('reportAssetDepreciation/get-report', { ...payload });
}
export const getDetailAssetDepreciationReport = (payload) => {
    return get('reportAssetDepreciation/get-detail-report', { ...payload });
}
