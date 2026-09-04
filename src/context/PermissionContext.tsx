import {createContext, ReactNode, useContext, useEffect, useState} from 'react';
import {PermissionMap} from '../model/Permission';
import {authStore} from '../store/authStore';
import {permissionService} from '../services/permission.service';

interface PermissionContextType {
    permissions: PermissionMap | null;
    setPermissions: (permissions: PermissionMap | null) => void;
}


interface AuthProviderProps {
    children: ReactNode;
}
const PermissionContext = createContext<PermissionContextType | null>(null);



export function PermissionProvider({children}: AuthProviderProps) {
    const [permissions, setPermissions] = useState<PermissionMap | null>(null);
    const user = authStore(state => state.user);
    useEffect(() => {
        const fetchPermissions = async () => {
            if (user) {
                const data = await permissionService.getUserPermissions(user.id);
                console.log("Fetched permissions:", data);
                setPermissions(data);
            }
        };
        fetchPermissions();
    }, [user]);
    const value: PermissionContextType = {
        permissions,
        setPermissions
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