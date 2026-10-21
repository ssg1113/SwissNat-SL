import { describe, it, expect } from 'vitest';
import * as XLSX from 'xlsx';
import { buildNatWorkbook, generateNatXlsBlob, generateNatXlsxBlob } from './natBuilder';
import type { NatRecord } from './types';

describe('natBuilder download generation', () => {
  const sampleRecords: NatRecord[] = [
    {
      id: '1',
      ID_No: '1',
      LastName: 'Dewsithu',
      FirstName: 'Ruwanpura Jesitha',
      Sex: '',
      Fed: 'SRI',
      Clubnumber: '',
      ClubName: 'Holy Cross College Kalutara',
      Birthday: '20171001',
      Rtg_Nat: '',
      Fide_No: '',
      Rtg_Int: '',
      Title: '',
      K: '',
      Category: 'Under 09 Open',
      rawName: 'Ruwanpura Jesitha Dewsithu',
      rawSchool: 'Holy Cross College Kalutara',
      flags: [],
    },
  ];

  it('builds workbook without errors', () => {
    const wb = buildNatWorkbook(sampleRecords);
    expect(wb).toBeDefined();
    expect(wb.SheetNames).toContain('Nat');
    expect(wb.SheetNames).toContain('Help');
  });

  it('generates .xlsx blob without errors', () => {
    const blob = generateNatXlsxBlob(sampleRecords);
    expect(blob).toBeDefined();
    expect(blob.size).toBeGreaterThan(0);
  });

  it('generates .xls (biff8) blob without errors', () => {
    const wb = buildNatWorkbook(sampleRecords);
    const wbout = XLSX.write(wb, { bookType: 'biff8', type: 'array' });
    console.log('wbout constructor:', wbout?.constructor?.name, 'length/byteLength:', (wbout as any)?.byteLength || (wbout as any)?.length);
    const blob = generateNatXlsBlob(sampleRecords);
    expect(blob).toBeDefined();
    expect(blob.size).toBeGreaterThan(0);
    console.log('Sample blob size:', blob.size);
  });

  it('tests with 259 records and checks blob size and integrity', () => {
    const largeRecords: NatRecord[] = [];
    for (let i = 1; i <= 259; i++) {
      largeRecords.push({
        ...sampleRecords[0],
        id: String(i),
        ID_No: String(i),
        LastName: `Player ${i}`,
        FirstName: `First ${i}`,
      });
    }
    const blobXls = generateNatXlsBlob(largeRecords);
    expect(blobXls.size).toBeGreaterThan(0);
    console.log('259 records .xls size:', blobXls.size);
    const blobXlsx = generateNatXlsxBlob(largeRecords);
    expect(blobXlsx.size).toBeGreaterThan(0);
  });
});
