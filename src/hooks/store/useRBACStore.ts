import { create } from "zustand";
import { persist } from "zustand/middleware";

export type RoleType = "ADMIN" | "SALES" | "PM" | "KOC";

export type AccessRequest = {
  id: string;
  kocId: string | number;
  kocName: string;
  pmName: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  requestedAt: string;
  approvedAt?: string;
};

export type RBACState = {
  // Test role override or active logged-in role
  activeRole: RoleType;
  // List of PM access requests for KOC contact details
  accessRequests: AccessRequest[];
  // Actions
  setActiveRole: (role: RoleType) => void;
  requestKocAccess: (kocId: string | number, kocName: string, pmName: string) => void;
  approveKocAccess: (requestId: string) => void;
  rejectKocAccess: (requestId: string) => void;
  isKocAccessApproved: (kocId: string | number) => boolean;
  hasPendingRequest: (kocId: string | number) => boolean;
};

export const useRBACStore = create<RBACState>()(
  persist(
    (set, get) => ({
      activeRole: "ADMIN", // Mặc định Quản trị chung (Sao Mai & Hằng)
      accessRequests: [
        {
          id: "req-1",
          kocId: 1,
          kocName: "Linh Barbie",
          pmName: "PM Vận Hành",
          status: "APPROVED",
          requestedAt: new Date().toISOString(),
        },
      ],

      setActiveRole: (role) => set({ activeRole: role }),

      requestKocAccess: (kocId, kocName, pmName) => {
        const existing = get().accessRequests.find(
          (r) => String(r.kocId) === String(kocId) && r.status === "PENDING"
        );
        if (existing) return;

        const newReq: AccessRequest = {
          id: `req-${Date.now()}`,
          kocId,
          kocName,
          pmName,
          status: "PENDING",
          requestedAt: new Date().toISOString(),
        };

        set((state) => ({
          accessRequests: [newReq, ...state.accessRequests],
        }));
      },

      approveKocAccess: (requestId) => {
        set((state) => ({
          accessRequests: state.accessRequests.map((r) =>
            r.id === requestId
              ? { ...r, status: "APPROVED", approvedAt: new Date().toISOString() }
              : r
          ),
        }));
      },

      rejectKocAccess: (requestId) => {
        set((state) => ({
          accessRequests: state.accessRequests.map((r) =>
            r.id === requestId ? { ...r, status: "REJECTED" } : r
          ),
        }));
      },

      isKocAccessApproved: (kocId) => {
        return get().accessRequests.some(
          (r) => String(r.kocId) === String(kocId) && r.status === "APPROVED"
        );
      },

      hasPendingRequest: (kocId) => {
        return get().accessRequests.some(
          (r) => String(r.kocId) === String(kocId) && r.status === "PENDING"
        );
      },
    }),
    {
      name: "rbac-storage",
    }
  )
);
