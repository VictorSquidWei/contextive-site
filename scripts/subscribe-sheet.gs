/**
 * Contextive — durable signup capture (Google Apps Script web app). Version 2.
 *
 * /api/subscribe sends two kinds of POST:
 *   1. A new sign-up (first name + email, with the ad tags): appended as a new row.
 *   2. { update: true, signup_id, ... }: the optional second step. It fills in the details
 *      on the row with that signup_id. Rows are only ever found by this random id, never by
 *      email, so nobody can change someone else's sign-up.
 *
 * Columns (version 2 adds everything after "source"; older rows simply leave them blank):
 *   timestamp · email · source · first_name · last_name · postal_code · city · state ·
 *   word_request · utm_source · utm_medium · utm_campaign · utm_content · signup_id
 *
 * Setup: see SUBSCRIBE_SETUP.md. To UPDATE an existing deployment without changing its
 * URL: Deploy → Manage deployments → pencil (Edit) → Version: New version → Deploy.
 * ("New deployment" would make a new URL, and the site would keep posting to the old one.)
 */
var HEADERS = [
  'timestamp', 'email', 'source', 'first_name', 'last_name', 'postal_code', 'city', 'state',
  'word_request', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'signup_id'
];
var COL = {};
HEADERS.forEach(function (h, i) { COL[h] = i + 1; });

/**
 * A typed value stored exactly as typed. The leading apostrophe makes Sheets keep it as
 * text: it never runs a formula (=, +, -, @), never turns "9/11" or "Jan 6" into a date,
 * "50%" into a number, or 02139 into 2139. The apostrophe itself is not shown in the cell.
 */
function cell(v) {
  var s = String(v == null ? '' : v).trim().slice(0, 254);
  return s ? "'" + s : '';
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function subscribersSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('subscribers') || ss.insertSheet('subscribers');
  // First run writes the header; a version-1 sheet (3 headers) gets the new ones added.
  if (sheet.getLastRow() === 0 || sheet.getRange(1, HEADERS.length).getValue() === '') {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  }
  return sheet;
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    var body = {};
    try { body = JSON.parse((e && e.postData && e.postData.contents) || '{}'); } catch (_) {}
    lock.waitLock(10000);
    var sheet = subscribersSheet();

    // ── Step 2: fill in the optional details on an existing row ──
    if (body.update) {
      var id = String(body.signup_id || '');
      if (!/^[a-zA-Z0-9-]{10,40}$/.test(id)) return reply({ ok: false, error: 'bad id' });
      var last = sheet.getLastRow();
      var first = Math.max(2, last - 499); // recent rows only: step 2 follows step 1 within minutes
      if (last < 2) return reply({ ok: false, error: 'not found' });
      var ids = sheet.getRange(first, COL.signup_id, last - first + 1, 1).getValues();
      for (var i = ids.length - 1; i >= 0; i--) {
        if (String(ids[i][0]).replace(/^'/, '') === id) { // Sheets drops the text marker on read; strip it anyway
          var row = first + i;
          var fill = { last_name: body.last_name, postal_code: body.postal, city: body.city, state: body.state, word_request: body.word_request };
          Object.keys(fill).forEach(function (k) {
            if (fill[k]) sheet.getRange(row, COL[k]).setValue(cell(fill[k]));
          });
          return reply({ ok: true });
        }
      }
      return reply({ ok: false, error: 'not found' });
    }

    // ── Step 1: a new sign-up ──
    var email = String(body.email || '').trim().toLowerCase();
    if (!email) return reply({ ok: false, error: 'no email' });
    sheet.appendRow([
      String(body.ts || new Date().toISOString()), // the one machine value: left as Sheets reads it
      cell(email),
      cell(body.source),
      cell(body.first_name),
      cell(body.last_name),
      cell(body.postal),
      cell(body.city),
      cell(body.state),
      cell(body.word_request),
      cell(body.utm_source),
      cell(body.utm_medium),
      cell(body.utm_campaign),
      cell(body.utm_content),
      cell(body.signup_id)
    ]);
    return reply({ ok: true });
  } catch (err) {
    return reply({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}
