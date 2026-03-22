'use client';

import { TableCell, TableSortLabel, TableCellProps } from '@mui/material';

interface SortableHeaderProps extends TableCellProps {
  label: string;
  field: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
}

export default function SortableHeader({ label, field, sortBy, sortOrder, onSort, ...props }: SortableHeaderProps) {
  return (
    <TableCell {...props} sx={{ fontWeight: 600, cursor: 'pointer', userSelect: 'none', ...props.sx }}>
      <TableSortLabel
        active={sortBy === field}
        direction={sortBy === field ? sortOrder : 'asc'}
        onClick={() => onSort(field)}
        sx={{ '&.MuiTableSortLabel-root': { color: 'text.secondary' }, '&.Mui-active': { color: 'text.primary' } }}
      >
        {label}
      </TableSortLabel>
    </TableCell>
  );
}
