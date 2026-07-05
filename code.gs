const CONFIG_SHEET_NAME = "Config";

function doPost(e) {
  const token = PropertiesService.getScriptProperties().getProperty("LCSTATS_TOKEN");
  if (token && e.parameter.token !== token) {
    throw new Error("Invalid token");
  }

  const receivedAt = new Date().toISOString();
  const json = e.postData.contents;
  const payload = JSON.parse(json);

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const configSheet = ss.getSheetByName(CONFIG_SHEET_NAME);
  if (!configSheet) throw new Error(`Sheet not found: ${CONFIG_SHEET_NAME}`);

  const runSheetName = configSheet.getRange("B1").getValue(); // Run Sheet
  const runSheet = ss.getSheetByName(runSheetName);
  if (!runSheet) throw new Error(`Sheet not found: ${runSheetName}`);

  const sequenceNumber = runSheet.getLastRow(); // Day number
  const dailyCollectedScrap = payload.PerformanceInfo?.CollectedTotal ?? 0;
  const dailyTotalScrap = payload.PerformanceInfo?.TotalAvailableValue ?? 0;

  runSheet.appendRow([
    sequenceNumber, // Day
    dailyCollectedScrap, // Collected
    dailyTotalScrap, // Total
    receivedAt, // Received At
    json, // Json
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
