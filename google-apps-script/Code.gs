/*
  Google Apps Script for Stance Health form
  -----------------------------------------
  1. Create a Google Sheet.
  2. Open Extensions -> Apps Script.
  3. Paste this code.
  4. Change SHEET_NAME if required.
  5. Deploy -> New deployment -> Web app.
  6. Execute as: Me
  7. Who has access: Anyone
  8. Copy the /exec URL into script.js.
*/

const SHEET_NAME = "Appointments";

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({
      ok: true,
      message: "Stance Health form endpoint is running."
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME)
      || SpreadsheetApp.getActiveSpreadsheet().insertSheet(SHEET_NAME);

    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp",
        "Phone",
        "First Name",
        "Last Name",
        "Email",
        "Gender",
        "Date of Birth",
        "Bio / Notes"
      ]);
    }

    const data = JSON.parse(e.postData.contents || "{}");

    sheet.appendRow([
      new Date(),
      data.phone || "",
      data.firstName || "",
      data.lastName || "",
      data.email || "",
      data.gender || "",
      data.dob || "",
      data.notes || ""
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        ok: false,
        error: String(error)
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
