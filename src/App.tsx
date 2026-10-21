import { useState } from 'react';
import { WebApp } from './web/WebApp';
import { MobileApp } from './mobile/MobileApp';
import { useDeviceMode } from './shared/hooks/useDeviceMode';
import type { NatRecord, RawPlayerRow, ColumnMapping, SplitMode } from './core/types';

export function App() {
  const [splitMode] = useState<SplitMode>('surname_first');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  // Tournament registration state
  const [rawRows, setRawRows] = useState<RawPlayerRow[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping | null>(null);
  const [records, setRecords] = useState<NatRecord[]>([]);

  // Adaptive device & viewport mode hook (Capacitor native or screen width < 768px)
  const { isMobile, viewOverride, setViewOverride } = useDeviceMode();

  const showNotification = (msg: string) => {
    setStatusNotification(msg);
    setTimeout(() => setStatusNotification(null), 4000);
  };

  const handleRecordsImported = (
    newRecords: NatRecord[],
    newRawRows: RawPlayerRow[],
    newMapping: ColumnMapping
  ) => {
    setRecords(newRecords);
    setRawRows(newRawRows);
    setMapping(newMapping);
    setSelectedCategory('all');
    showNotification(`Processed ${newRecords.length} players ready for Swiss-Manager!`);
  };

  const sharedProps = {
    records,
    onRecordsChange: setRecords,
    rawRows,
    mapping,
    onImport: handleRecordsImported,
    selectedCategory,
    onSelectCategory: setSelectedCategory,
    splitMode,
    statusNotification,
    onNotify: showNotification,
    isMobile,
    viewOverride,
    onViewChange: setViewOverride,
  };

  if (isMobile) {
    return <MobileApp {...sharedProps} />;
  }

  return <WebApp {...sharedProps} />;
}

export default App;
