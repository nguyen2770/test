import { post, get, patch, deleteRequest } from "./restApi";
import { base_api } from "./config";

export const susbscription = (payload) => {
    return post(`notification/susbscription`, { ...payload });
};
export const getMyNotifications = (payload) => {
    return get(`notification/get-my-notifications`, { ...payload });
};
export const readNotification = (payload) => {
    return patch(`notification/read`, { ...payload });
};
export const getTotalNotYetViewed = () => {
    return get(`notification/total-not-yet-viewed`, {});
}