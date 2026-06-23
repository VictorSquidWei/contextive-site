/**
 * Contextive — durable signup capture (Google Apps Script web app).
 *
 * Receives the POST that /api/subscribe sends ({ email, ts, source }) and appends
 * a row to the bound Google Sheet. Free; uses only your Google account.
 *
 * Setup: see SUBSCRIBE_SETUP.md. After deploying as a Web app, paste its /exec URL
 * into the Vercel env var SUBSCRIBE_WEBHOOK_URL and redeploy the site.
 */
function doPost(e) {
  try {
    var body = {};
    try { body = JSON.parse((e && e.postData && e.postData.contents) || '{}'); } catch (_) {}

    var email = String(body.email || '').trim().toLowerCase();
    var ts = String(body.ts || new Date().toISOString());
    var source = String(body.source || '');

    if (!email) {
      return ContentService.createTextOutput(JSON.stringify({ ok: false, error: 'no email' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('subscribers') || ss.insertSheet('subscribers');
    if (sheet.getLastRow() === 0) sheet.appendRow(['timestamp', 'email', 'source']);
    sheet.appendRow([ts, email, source]);

    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
