import { post, postWithoutAuth } from './restApi';
import { base_api } from './config';

export const login = (payload) => {
    return post(`auth/login`, { ...payload });
}
export const changePassword = (payload) => {
    return post(`auth/change-password`, { ...payload });
}
export const logoutMobile = (payload) => {
    return post(`auth/logout-mobile`, { ...payload });
}
