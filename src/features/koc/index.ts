// Barrel export for KOC feature
export { KOCFormModal } from "./KOCFormModal";
export { KOCTable, KOCSearchBar } from "./KOCTable";
export { ScheduledMsgModal } from "./ScheduledMsgModal";
export { SendMessageModal } from "./SendMessageModal";
export { TemplateManagerModal } from "./TemplateManagerModal";
export { KOCHistoryModal } from "./KOCHistoryModal";

export { initialMockKOCs } from "./koc.data";

export type {
  Platform,
  Gender,
  KOCRecord,
  KOCFormValues,
  Recipient,
  MessageChannel,
  ScheduledMessage,
  CreateTemplateFormValues,
} from "./types";

export {
  loadScheduledMessages,
  saveScheduledMessages,
  isSent,
} from "./types";
