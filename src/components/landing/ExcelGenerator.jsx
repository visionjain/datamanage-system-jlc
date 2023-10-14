import React from 'react';
import * as ExcelJS from 'exceljs';
import {BsFileEarmarkExcel} from 'react-icons/bs';


const ExcelGenerator = ({ tableItems }) => {
  const generateExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Table Data');

    // Define a style for the thin border
    const borderStyle = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    // Apply cell styles (font styles, etc.) to the header row
    const headerRow = [
      'S. NO.', 'Sales Date', 'Driver Name', 'Auto No.', 'KM', 'Lime (A)', 'Lime (A) Price',
      'Lime (W)', 'Lime (W) Price', 'Lime (B)', 'Lime (B) Price', 'Lime (OFF_W)', 'Lime (OFF_W) Price',
      'Jhiki (झिकीं)', 'Jhiki Price', 'Aaras (आरस)', 'Aaras Price', 'Site Address', 'Amount', 'Labour Charge',
      'Auto Charge', 'DR (बकाया)', 'CR (जमा)', 'Balance (शेष)',
    ];
    headerRow.forEach((header, colIndex) => {
      const cell = worksheet.getCell(`${String.fromCharCode(65 + colIndex)}1`);
      cell.value = header;
      cell.border = borderStyle; // Apply the thin border to header cells
    });

    // Add data rows and apply the same thin border
    tableItems.forEach((item, rowIndex) => {
      const rowData = [
        item.numberid, item.salesdate, item.drivername, item.autono, item.km, item.Limea, item.LimeaPrice,
        item.Limew, item.LimewPrice, item.Limeb, item.LimebPrice, item.Limeoffw, item.LimeoffwPrice,
        item.jhiki, item.jhikiPrice, item.rs, item.rsPrice, item.siteaddress, item.amount, item.labourcharge,
        item.autocharge, item.dr, item.cr, item.balance,
      ];

      rowData.forEach((data, colIndex) => {
        const cell = worksheet.getCell(`${String.fromCharCode(65 + colIndex)}${rowIndex + 2}`);
        cell.value = data;
        cell.border = borderStyle; // Apply the thin border to data cells
      });
    });

    // Set column widths (adjust as needed)
    worksheet.columns.forEach((column) => {
      column.width = 15;
    });

    // Generate and download the Excel file
    await workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'table-data.xlsx';
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  return (
    <div>
      <button  className="flex px-4 py-2 bg-green-400 border-2 border-black font-bold text-black hover-bg-gray-100 w-full text-left text-[13px] top-2" onClick={generateExcel}>Generate Excel <BsFileEarmarkExcel className='w-5 h-5 ml-2 mt-1'/></button>
    </div>
  );
};

export default ExcelGenerator;
