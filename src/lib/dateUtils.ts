// Helper to parse date string for sorting (DD/MM/YYYY or DD-MM-YYYY)
export const parseDateForSort = (dateStr: string): number => {
  const slashParts = dateStr.split('/');
  if (slashParts.length === 3) {
    const day = parseInt(slashParts[0], 10);
    const month = parseInt(slashParts[1], 10);
    const year = parseInt(slashParts[2], 10);
    const fullYear = year < 100 ? 2000 + year : year;
    return fullYear * 10000 + month * 100 + day;
  }
  const dashParts = dateStr.split('-');
  if (dashParts.length === 3 && dashParts[0].length <= 2) {
    const day = parseInt(dashParts[0], 10);
    const month = parseInt(dashParts[1], 10);
    const year = parseInt(dashParts[2], 10);
    const fullYear = year < 100 ? 2000 + year : year;
    return fullYear * 10000 + month * 100 + day;
  }
  return 0;
};

// Format date to DD/MM/YY
export const formatDateBR = (dateStr: string): string => {
  const slashParts = dateStr.split('/');
  if (slashParts.length === 3) {
    const day = slashParts[0].padStart(2, '0');
    const month = slashParts[1].padStart(2, '0');
    const year = slashParts[2].length === 4 ? slashParts[2].slice(-2) : slashParts[2];
    return `${day}/${month}/${year}`;
  }
  const dashParts = dateStr.split('-');
  if (dashParts.length === 3 && dashParts[0].length <= 2) {
    const day = dashParts[0].padStart(2, '0');
    const month = dashParts[1].padStart(2, '0');
    const year = dashParts[2].length === 4 ? dashParts[2].slice(-2) : dashParts[2];
    return `${day}/${month}/${year}`;
  }
  return dateStr;
};
