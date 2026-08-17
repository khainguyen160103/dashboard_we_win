import { useMutation } from "@tanstack/react-query";
import { authService } from "../../services/auth.service";

export const useRefreshTokenMutation = () =>
  useMutation({
    mutationFn: () => authService.refresh(),
  });
