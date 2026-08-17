import axios from "axios";
import type {
  KalodataCreatorRankRequest,
  KalodataCreatorRankResponse,
} from "./kalodata.types";

// ─── Kalodata config ──────────────────────────────────────────────────────────
const KALODATA_API_KEY = "147433db-aeda-4201-9095-700d62e8b4ae";

// Trong dev: dùng Vite proxy /kalodata-api/* → https://www.kalodata.com/*
// Trong prod: gọi thẳng Kalodata (cần backend proxy thật)
const KALODATA_BASE_URL =
  import.meta.env.DEV
    ? "/kalodata-api"
    : "https://www.kalodata.com";

const kalodataClient = axios.create({
  baseURL: KALODATA_BASE_URL,
  timeout: 15000,
  headers: {
    "secret-key": KALODATA_API_KEY,
    "content-type": "application/json;charset=UTF-8",
  },
});

// ─── Kalodata Service ─────────────────────────────────────────────────────────
export const kalodataService = {
  /**
   * Lấy danh sách Creator xếp hạng theo doanh số
   * POST https://www.kalodata.com/openapi/v1/tiktok/creator/rank
   * Header: secret-key: <API_KEY>
   * Body: { region, language, currency, date_range }
   */
  getCreatorRanking: async (
    params: KalodataCreatorRankRequest
  ): Promise<KalodataCreatorRankResponse> => {
    const { data } = await kalodataClient.post<KalodataCreatorRankResponse>(
      "/openapi/v1/tiktok/creator/rank",
      params
    );
    return data;
  },
};
