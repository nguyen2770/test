import { post, get, patch, deleteRequest } from './restApi';
import { base_api } from './config';

export const getListAssetModelSolutions = (payload) => {
    return get(`asset-model-solution/get-list`, { ...payload });
}
export const getAllAssetModelSolution = (payload) => {
    return get(`asset-model-solution/get-all`, { ...payload });
}

