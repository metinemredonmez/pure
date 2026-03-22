'use client';

import { useState } from 'react';
import { Button, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { FileDownloadOutlined, TableChartOutlined, DescriptionOutlined } from '@mui/icons-material';

interface Column {
  key: string;
  label: string;
}

interface ExportButtonProps {
  data: any[];
  columns: Column[];
  filename?: string;
}

function escapeCSV(val: unknown): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export default function ExportButton({ data, columns, filename = 'export' }: ExportButtonProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const exportCSV = () => {
    const header = columns.map(c => escapeCSV(c.label)).join(',');
    const rows = data.map(row =>
      columns.map(c => {
        const keys = c.key.split('.');
        let val: unknown = row;
        for (const k of keys) { val = (val as Record<string, unknown>)?.[k]; }
        return escapeCSV(val);
      }).join(',')
    );
    const csv = [header, ...rows].join('\n');
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, `${filename}.csv`);
    setAnchorEl(null);
  };

  const exportJSON = () => {
    const filtered = data.map(row => {
      const obj: Record<string, unknown> = {};
      columns.forEach(c => {
        const keys = c.key.split('.');
        let val: unknown = row;
        for (const k of keys) { val = (val as Record<string, unknown>)?.[k]; }
        obj[c.label] = val;
      });
      return obj;
    });
    const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: 'application/json' });
    downloadBlob(blob, `${filename}.json`);
    setAnchorEl(null);
  };

  const downloadBlob = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Button
        size="small"
        variant="outlined"
        startIcon={<FileDownloadOutlined />}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        disabled={data.length === 0}
        sx={{ borderColor: 'rgba(255,255,255,0.15)', color: 'text.secondary', fontSize: 12 }}
      >
        Dışa Aktar
      </Button>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={exportCSV}>
          <ListItemIcon><TableChartOutlined fontSize="small" /></ListItemIcon>
          <ListItemText>CSV</ListItemText>
        </MenuItem>
        <MenuItem onClick={exportJSON}>
          <ListItemIcon><DescriptionOutlined fontSize="small" /></ListItemIcon>
          <ListItemText>JSON</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
