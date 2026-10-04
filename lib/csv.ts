/**
 * Minimal RFC-4180-ish CSV parser: handles quoted fields (including embedded
 * commas, newlines and escaped `""`), which the old `line.split(",")`
 * parsing in this codebase did not. Good enough for Google Sheets'
 * "publish to web" CSV export — not a full CSV spec implementation.
 */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  const pushField = () => {
    row.push(field);
    field = "";
  };
  const pushRow = () => {
    pushField();
    rows.push(row);
    row = [];
  };

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      pushField();
    } else if (char === "\r") {
      // ignore; \n (or \r\n) below ends the row
    } else if (char === "\n") {
      pushRow();
    } else {
      field += char;
    }
  }

  // Trailing field/row without a final newline.
  if (field.length > 0 || row.length > 0) {
    pushRow();
  }

  return rows.filter((r) => r.some((cell) => cell.trim().length > 0));
}

/**
 * Parses a CSV with a header row into an array of objects keyed by header
 * name, trimming every cell.
 */
export function parseCsvRecords(text: string): Record<string, string>[] {
  const rows = parseCsv(text);
  if (rows.length < 2) return [];
  const [header, ...body] = rows;
  const keys = header.map((h) => h.trim());
  return body.map((cells) => {
    const record: Record<string, string> = {};
    keys.forEach((key, idx) => {
      record[key] = (cells[idx] ?? "").trim();
    });
    return record;
  });
}

// --- CSV writer (admin exports) ---

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Builds a CSV string from a header row and data rows, prefixed with a BOM
 * so Excel opens UTF-8 files (Hungarian accented characters) correctly.
 */
export function toCsv(headers: string[], rows: unknown[][]): string {
  const lines = [headers, ...rows].map((row) => row.map(csvEscape).join(","));
  return "﻿" + lines.join("\r\n") + "\r\n";
}
