const SHEET_NAME = 'Orders';
const TOTALS_SHEET = 'Totals';
const COACH_EMAIL = 'coachegolf1@gmail.com';

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    ensureHeaders_(sheet);

    const rows = body.items.map(it => [
      body.timestamp, body.firstName, body.lastName, body.team || '',
      body.email, body.phone, it.key, it.label, it.size, it.qty,
    ]);
    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);

    sendEmail_(body, rows);
    ensureTotalsSheet_(ss);
    return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) })).setMimeType(ContentService.MimeType.JSON);
  }
}

function ensureHeaders_(sheet) {
  const headers = ['Timestamp','Player First','Player Last','Team/Age','POC Email','POC Phone','Item Key','Item Label','Size','Quantity'];
  if (sheet.getLastRow() === 0) sheet.appendRow(headers);
}

function sendEmail_(body, rows) {
  const subject = `Uniform Order: ${body.lastName}, ${body.firstName}`;
  const lines = rows.map(r => `• ${r[7]} — ${r[8]} x${r[9]}`).join('\n');
  const msg = `Player: ${body.firstName} ${body.lastName}\nTeam: ${body.team || ''}\nEmail: ${body.email}\nPhone: ${body.phone}\n\nItems:\n${lines}`;
  MailApp.sendEmail(COACH_EMAIL, subject, msg);
}

function ensureTotalsSheet_(ss) {
  const totalsName = TOTALS_SHEET;
  let totals = ss.getSheetByName(totalsName);
  if (!totals) totals = ss.insertSheet(totalsName);
  const formula = `=QUERY(${SHEET_NAME}!A:J,"select H, I, sum(J) where J > 0 group by H, I label sum(J) 'Total Qty', H 'Item', I 'Size'",1)`;
  totals.getRange('A1').setValue(formula);
  totals.autoResizeColumns(1, 3);
}
