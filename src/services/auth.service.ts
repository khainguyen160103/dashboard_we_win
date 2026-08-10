import { api as axiosClient } from "../api/request";
import { URL } from '../api/url'
import { Response } from "../model/Response";
import type { User, loginRequest, loginResponse } from "../model/User";
export const authService = {
    login: async (params: loginRequest): Promise<Response<loginResponse>> => {
        const { data } = await axiosClient.post<Response<loginResponse>>(
            URL.AUTH.LOGIN,
            {
                email: params.email,
                password: params.password,
            },
            { withCredentials: true },
        );
        console.log("data: ", data)
        return data;
    },

    logout: async (): Promise<void> => {
        await axiosClient.post(URL.AUTH.LOGOUT, {}, { withCredentials: true });
    },

    refresh: async (): Promise<Response<User>> => {
        const { data } = await axiosClient.post<Response<User>>(URL.AUTH.REFRESH, {}, { withCredentials: true });
        return data;
    },

    getMe: async (): Promise<Response<User>> => {
        const { data } = await axiosClient.get<Response<User>>(URL.AUTH.ME, { withCredentials: true });
        return data;
    },
};