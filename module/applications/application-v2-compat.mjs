const api = foundry?.applications?.api ?? {};
const sheets = foundry?.applications?.sheets ?? {};
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
  legacy.FormApplication ??
  sheets.FormApplication ??
  api.FormApplication ??
  api.FormApplicationV2 ??
  legacy.FormApplicationV2 ??
  globalFormApplication ??
  ApplicationV2;

export const DocumentSheetV2 =
  legacy.DocumentSheet ??
  sheets.DocumentSheet ??
  api.DocumentSheet ??
  api.DocumentSheetV2 ??
  legacy.DocumentSheetV2 ??
  globalDocumentSheet;
