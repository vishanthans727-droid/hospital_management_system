import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString: string | Date | undefined): string {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return String(dateString);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(dateString: string | Date | undefined): string {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return String(dateString);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function calculateAge(dobString: string): number {
  const dob = new Date(dobString);
  const diffMs = Date.now() - dob.getTime();
  const ageDt = new Date(diffMs);
  return Math.abs(ageDt.getUTCFullYear() - 1970);
}

export function generateCustomId(prefix: string): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${year}-${randomNum}`;
}

export function exportToCsv(filename: string, rows: Record<string, any>[]) {
  if (!rows || !rows.length) return;
  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(','),
    ...rows.map(row =>
      headers
        .map(fieldName => {
          let val = row[fieldName];
          if (val === null || val === undefined) val = '';
          if (typeof val === 'object') val = JSON.stringify(val);
          val = String(val).replace(/"/g, '""');
          return `"${val}"`;
        })
        .join(',')
    )
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function printSection(elementId: string) {
  const content = document.getElementById(elementId);
  if (!content) {
    window.print();
    return;
  }
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    window.print();
    return;
  }
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>MediCare Healthcare System - Document Print</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @page { margin: 15mm; }
          body { font-family: system-ui, -apple-system, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          @media print {
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body class="bg-white p-6 text-slate-800">
        ${content.outerHTML}
        <script>
          window.onload = function() {
            window.focus();
            setTimeout(function() {
              window.print();
              window.close();
            }, 300);
          }
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
