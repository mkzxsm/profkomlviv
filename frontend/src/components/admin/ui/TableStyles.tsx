import React from 'react';

interface TableContainerProps extends React.HTMLAttributes<HTMLDivElement> {}

export const TableContainer: React.FC<TableContainerProps> = ({ children, className, ...props }) => (
  <div 
    {...props}
    className={`overflow-x-auto rounded-xl border ${className || ''}`}
  >
    {children}
  </div>
);

interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {}

export const Table: React.FC<TableProps> = ({ children, className, ...props }) => (
  <table 
    {...props}
    className={`min-w-full divide-y divide-gray-200 ${className || ''}`}
  >
    {children}
  </table>
);

interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

export const TableHeader: React.FC<TableHeaderProps> = ({ children, className, ...props }) => (
  <thead 
    {...props}
    className={`bg-gray-50 ${className || ''}`}
  >
    {children}
  </thead>
);

interface TableThProps extends React.ThHTMLAttributes<HTMLTableCellElement> {}

export const TableTh: React.FC<TableThProps> = ({ children, className, ...props }) => (
  <th 
    {...props}
    className={`px-6 py-3 text-center text-xs font-medium text-gray-900 uppercase tracking-wider ${className || ''}`}
  >
    {children}
  </th>
);

interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

export const TableBody: React.FC<TableBodyProps> = ({ children, className, ...props }) => (
  <tbody 
    {...props}
    className={`bg-white divide-y divide-gray-200 ${className || ''}`}
  >
    {children}
  </tbody>
);

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {}

export const TableRow: React.FC<TableRowProps> = ({ children, className, ...props }) => (
  <tr 
    {...props}
    className={`hover:bg-gray-50 ${className || ''}`}
  >
    {children}
  </tr>
);

interface TableTdProps extends React.TdHTMLAttributes<HTMLTableCellElement> {}

export const TableTd: React.FC<TableTdProps> = ({ children, className, ...props }) => (
  <td 
    {...props}
    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${className || ''}`}
  >
    {children}
  </td>
);