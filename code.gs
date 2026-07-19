const CONFIG_SHEET_NAME = "Config";

function doPost(e) {
  const token = PropertiesService.getScriptProperties().getProperty("LCSTATS_TOKEN");
  if (!token) {
    throw new Error("LCSTATS_TOKEN is not configured");
  }

  if (e?.parameter?.token !== token) {
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

  const moonName = payload.MoonInfo?.Name ?? "";
  const dailyCollectedScrap = payload.PerformanceInfo?.CollectedTotal ?? 0;
  const dailyTotalScrap = payload.PerformanceInfo?.TotalAvailableValue ?? 0;
  const missedItems = payload.MissedItems ?? [];
  const valueSold = payload.QuotaInfo?.ValueSold ?? 0;
  const newQuota = payload.QuotaInfo?.NewQuota ?? 0;
  const giftExtra = payload.PerformanceInfo?.ExtraFromOldGift ?? 0;

  const lastRow = runSheet.getLastRow();
  const dayNumber = lastRow; // Day number
  const previousQuotaNumber = lastRow > 1
    ? Number(runSheet.getRange(lastRow, 1).getValue()) || 1
    : 1;
  const quotaNumber = lastRow > 1 && newQuota > 0
    ? previousQuotaNumber + 1
    : previousQuotaNumber;

  const lostScraps = missedItems.filter((item) => item.CollectedOnPreviousDay);
  const lostScrapValue = lostScraps.reduce((acc, num) => acc + num, 0);

  runSheet.appendRow([
    quotaNumber, // Quota Number
    dayNumber, // Day
    moonName, // Moon
    dailyCollectedScrap, // Collected
    dailyTotalScrap, // Total
    giftExtra, // Gift Extra
    lostScrapValue, // Lost
    valueSold, // Sold
    newQuota, // New Quota
    receivedAt, // Received At
    json, // Json
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
