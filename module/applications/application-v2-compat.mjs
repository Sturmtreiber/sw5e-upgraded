const api = foundry?.applications?.api ?? {};
const legacy = foundry?.applications ?? {};

const globalApplication = globalThis.Application;
const globalFormApplication = globalThis.FormApplication;
const globalDocumentSheet = globalThis.DocumentSheet;

export const ApplicationV2 =
  api.ApplicationV2 ??
  api.Application ??
  legacy.ApplicationV2 ??
  legacy.Application ??
  globalApplication;

export const FormApplicationV2 =
  api.FormApplicationV2 ??
  api.FormApplication ??
  legacy.FormApplicationV2 ??
  legacy.FormApplication ??
  globalFormApplication ??
  ApplicationV2;

export const DocumentSheetV2 =
  api.DocumentSheetV2 ??
  api.DocumentSheet ??
  legacy.DocumentSheetV2 ??
  legacy.DocumentSheet ??
  globalDocumentSheet;
