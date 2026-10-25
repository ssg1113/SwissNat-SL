import { describe, it, expect } from 'vitest';
import { getClubNumberForCategory, autoDetectColumns, sanitizePlayerRow } from './sanitizer';

describe('getClubNumberForCategory with event types', () => {
  const cases: [string, string][] = [
    ['Under 06 Boys - Blitz Event Only', '611'],
    ['Under 06 Boys - Rapid Event Only', '612'],
    ['Under 06 Boys - Both Events', '613'],
    ['Under 06 Boys', '61'],
    ['Under 20 Boys - Blitz Event Only', '2011'],
    ['Under 20 Boys - Rapid Event Only', '2012'],
    ['Under 20 Boys - Both Events', '2013'],
    ['Under 20 Boys', '201'],
    ['Under 06 Girls - Blitz Event Only', '621'],
    ['Under 06 Girls - Rapid Event Only', '622'],
    ['Under 06 Girls - Both Events', '623'],
    ['Under 06 Girls', '62'],
    ['Under 20 Girls - Blitz Event Only', '2021'],
    ['Under 20 Girls - Rapid Event Only', '2022'],
    ['Under 20 Girls - Both Events', '2023'],
    ['Under 20 Girls', '202'],
  ];

  it.each(cases)('%s -> %s', (category, expected) => {
    expect(getClubNumberForCategory(category)).toBe(expected);
  });

  it('treats "Blitz & Rapid" as both events', () => {
    expect(getClubNumberForCategory('Under 10 Boys - Blitz & Rapid')).toBe('1013');
  });
});

describe('separate Playing Event column', () => {
  const headers = ['Name For Certificate', 'Age Category\nවයස් කාණ්ඩය', 'Gender', 'Playing Event\nක්‍රීඩා කරන ඉසව්ව'];
  const mapping = autoDetectColumns(headers);

  it('detects the event column apart from the age category', () => {
    expect(mapping.category).toBe(headers[1]);
    expect(mapping.event).toBe(headers[3]);
  });

  it.each([
    ['Rapid Event Only', '1012'],
    ['Blitz Event Only', '1011'],
    ['Both Rapid & Blitz Events', '1013'],
  ])('Under 10 Open + %s -> %s', (event, expected) => {
    const row = { [headers[0]]: 'K G Banuja', [headers[1]]: 'Under 10 Open (2016 & 2017)', [headers[2]]: 'Male', [headers[3]]: event };
    const record = sanitizePlayerRow(row, 0, mapping);
    expect(record.Clubnumber).toBe(expected);
    expect(record.Category).toBe(`Under 10 Open (2016 & 2017) - ${event}`);
  });
});
