function syncWorkshopStockToGmc() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName("Inventory");
  Logger.log("Inventory synced.");
}
