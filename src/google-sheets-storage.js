/**
 * FORGE — Google Sheets Storage Module
 * ======================================
 * Reads and writes data to a Google Sheet acting as a lightweight backend.
 * Uses Google Apps Script Web App as the API bridge (no OAuth required for
 * the write path — configure sheet sharing as needed).
 *
 * Setup:
 *  1. Create a Google Sheet.
 *  2. Deploy a Google Apps Script Web App (doGet/doPost) linked to the sheet.
 *  3. Set VITE_SHEETS_ENDPOINT in your .env file.
 *
 * Usage:
 *   import { readSheet, appendRow, updateRow } from './google-sheets-storage';
 */

const ENDPOINT = import.meta.env.VITE_SHEETS_ENDPOINT || '';

if (!ENDPOINT) {
  console.warn('[FORGE] VITE_SHEETS_ENDPOINT is not set. Google Sheets sync disabled.');
}

/**
 * Generic request helper.
 * @param {'GET'|'POST'} method
 * @param {object} [body]
 */
async function request(method, body) {
  if (!ENDPOINT) throw new Error('FORGE: No Google Sheets endpoint configured.');

  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(ENDPOINT, options);
  if (!res.ok) throw new Error(`Sheets API error: ${res.status} ${res.statusText}`);
  return res.json();
}

/**
 * Read all rows from the sheet.
 * Returns an array of row objects keyed by header names.
 * @returns {Promise<object[]>}
 */
export async function readSheet() {
  const data = await request('GET');
  return data.rows ?? data;
}

/**
 * Append a new row to the sheet.
 * @param {object} rowData  Key-value pairs matching sheet column headers.
 * @returns {Promise<object>}
 */
export async function appendRow(rowData) {
  return request('POST', { action: 'append', row: rowData });
}

/**
 * Update an existing row by its unique ID field.
 * @param {string|number} id     Value of the ID column.
 * @param {object} updates       Partial key-value pairs to update.
 * @param {string} [idColumn]    Name of the ID column (default: 'id').
 * @returns {Promise<object>}
 */
export async function updateRow(id, updates, idColumn = 'id') {
  return request('POST', { action: 'update', idColumn, id, updates });
}

/**
 * Delete a row by its unique ID.
 * @param {string|number} id
 * @param {string} [idColumn]
 * @returns {Promise<object>}
 */
export async function deleteRow(id, idColumn = 'id') {
  return request('POST', { action: 'delete', idColumn, id });
}
