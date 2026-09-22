import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import {authStore} from '../store/authStore';
import {permissionService} from '../services/permission.service';
import { localStorageUtils } from '../utils/localStorageUtils';
import { keyStore } from '../enums/keyStore';
interface PermissionContextType {
    loading: boolean;
    error: string
}


interface AuthProviderProps {
    children: ReactNode;
}
const PermissionContext = createContext<PermissionContextType>(null as unknown as PermissionContextType);



export function PermissionProvider({children}: AuthProviderProps) {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const user = authStore(state => state.user);
    useEffect(() => {
        const fetchPermissions = async () => {
            if (user) {
                setLoading(true);
                setError('');
                try {
                    const data = await permissionService.getUserPermissions(user.id);
                    console.log("Fetched permissions:", data);
                    localStorageUtils.setItem(keyStore.PERMISSIONS, data)
                    // setPermissions(data);
                } catch (err) {
                    setError('Failed to fetch permissions');
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchPermissions();
    }, [user]);
    const value: PermissionContextType = {
        loading,
        error
    };
    return (
        <PermissionContext.Provider value={value}>
            {children}
        </PermissionContext.Provider>
    );
}

export const usePermission = () : PermissionContextType => {
    const context = useContext(PermissionContext);
    if (context === null) {
        throw new Error('usePermission must be used within a PermissionProvider');
    }
    return context;
}