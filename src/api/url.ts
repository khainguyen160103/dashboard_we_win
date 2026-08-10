const baseUrl = import.meta.env.VITE_BASE_URL
export const URL = {
    AUTH : { 
        LOGIN : `${baseUrl}/auth/login`,
        LOGOUT : `${baseUrl}/auth/logout`,
        REFRESH : `${baseUrl}/auth/refresh`,
        ME : `${baseUrl}/auth/me`,
    },
    USER : `${baseUrl}/users`,
    ROLE : `${baseUrl}/roles`,
    PERMISSION :  `${baseUrl}/permissions`,
        
}
