'use client'

import * as XLSX from 'xlsx-js-style'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export default function ExportButtons({ data, period }: { data: any[], period: string }) {
  const exportExcel = () => {
    // 1. Calculate Summary Stats
    const total = data.length
    const approved = data.filter(d => d.Status_Validasi === 'disetujui').length
    const rejected = data.filter(d => d.Status_Validasi === 'ditolak').length
    const completed = data.filter(d => d.Status_Progres === 'selesai').length
    const pending = total - approved - rejected // Assuming others are pending

    // 2. Prepare Data Rows
    const tableData = data.map(item => [
      item.ID,
      item.Tanggal,
      item.Judul,
      item.Pelapor,
      item.Kategori,
      item.Status_Validasi.toUpperCase(),
      item.Status_Progres.replace(/_/g, ' ').toUpperCase(),
      item.Lokasi
    ])

    // 3. Create Workbook
    const wb = XLSX.utils.book_new()
    
    // Define Styles
    const titleStyle = {
      font: { bold: true, sz: 16, color: { rgb: "2C3E50" } },
      alignment: { horizontal: "center" }
    }
    const subTitleStyle = {
      font: { italic: true, sz: 11, color: { rgb: "7F8C8D" } },
      alignment: { horizontal: "center" }
    }
    
    // Border style definition (black, thin, all sides)
    const allBorder = {
      top: { style: "thin", color: { rgb: "000000" } },
      bottom: { style: "thin", color: { rgb: "000000" } },
      left: { style: "thin", color: { rgb: "000000" } },
      right: { style: "thin", color: { rgb: "000000" } }
    }

    const headerStyle = {
      fill: { fgColor: { rgb: "2980B9" } },
      font: { bold: true, color: { rgb: "FFFFFF" } },
      alignment: { horizontal: "center", vertical: "center" },
      border: allBorder
    }
    
    const cellStyle = {
      alignment: { vertical: "center" },
      border: allBorder
    }
    
    const summaryHeaderStyle = {
      font: { bold: true, color: { rgb: "2C3E50" } },
      fill: { fgColor: { rgb: "ECF0F1" } },
      border: allBorder
    }
    
    const summaryCellStyle = {
      border: allBorder
    }

    // 4. Build Worksheet Data with Styles
    const wsData = [
      [{ v: "LAPORAN EKSEKUTIF ASPIRASI", s: titleStyle }],
      [{ v: `Periode: ${period}`, s: subTitleStyle }],
      [{ v: `Dicetak pada: ${new Date().toLocaleDateString('id-ID')}`, s: subTitleStyle }],
      [],
      [{ v: "RINGKASAN STATISTIK", s: summaryHeaderStyle }, { v: "", s: summaryHeaderStyle }],
      [{ v: "Total Laporan", s: summaryCellStyle }, { v: total, s: summaryCellStyle }],
      [{ v: "Disetujui", s: summaryCellStyle }, { v: approved, s: summaryCellStyle }],
      [{ v: "Ditolak", s: summaryCellStyle }, { v: rejected, s: summaryCellStyle }],
      [{ v: "Selesai Dikerjakan", s: summaryCellStyle }, { v: completed, s: summaryCellStyle }],
      [{ v: "Menunggu Validasi", s: summaryCellStyle }, { v: pending, s: summaryCellStyle }],
      [],
      [
        { v: "ID", s: headerStyle },
        { v: "Tanggal", s: headerStyle },
        { v: "Judul Aspirasi", s: headerStyle },
        { v: "Pelapor", s: headerStyle },
        { v: "Kategori", s: headerStyle },
        { v: "Status Validasi", s: headerStyle },
        { v: "Status Pengerjaan", s: headerStyle },
        { v: "Lokasi", s: headerStyle }
      ]
    ]

    // Add Data Rows with Styles
    tableData.forEach(row => {
      const styledRow = row.map(cell => ({ v: cell, s: cellStyle }))
      wsData.push(styledRow)
    })

    // 5. Create Sheet
    const ws = XLSX.utils.aoa_to_sheet([])

    // 6. Merge Cells for Title
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }, // Title
      { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } }, // Period
      { s: { r: 2, c: 0 }, e: { r: 2, c: 7 } }, // Date
      { s: { r: 4, c: 0 }, e: { r: 4, c: 1 } }, // Stats Header
    ]

    // 7. Set Column Widths
    ws['!cols'] = [
      { wch: 10 }, // ID
      { wch: 15 }, // Tanggal
      { wch: 40 }, // Judul
      { wch: 25 }, // Pelapor
      { wch: 15 }, // Kategori
      { wch: 20 }, // Validasi
      { wch: 25 }, // Progres
      { wch: 25 }  // Lokasi
    ]

    // Add data to sheet manually to preserve styles (aoa_to_sheet strips styles in standard xlsx)
    // Using xlsx-js-style allows passing objects with 's' property
    XLSX.utils.sheet_add_aoa(ws, wsData, { origin: "A1" })

    XLSX.utils.book_append_sheet(wb, ws, "Laporan Eksekutif")
    XLSX.writeFile(wb, `Laporan_Eksekutif_Aspirasi_${period.replace(/\s/g, '_')}.xlsx`)
  }

  const exportPDF = () => {
    const doc = new jsPDF()
    
    // Header
    doc.setFontSize(18)
    doc.setTextColor(41, 128, 185) // Blue color
    doc.text("Laporan Eksekutif Aspirasi", 14, 20)
    
    doc.setFontSize(11)
    doc.setTextColor(100)
    doc.text(`Periode: ${period}`, 14, 28)
    doc.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID')}`, 14, 34)

    // Stats Summary
    const total = data.length
    const approved = data.filter(d => d.Status_Validasi === 'disetujui').length
    const completed = data.filter(d => d.Status_Progres === 'selesai').length
    
    doc.setFontSize(10)
    doc.text(`Total Laporan: ${total} | Disetujui: ${approved} | Selesai: ${completed}`, 14, 42)

    // Table
    // @ts-ignore
    autoTable(doc, {
        head: [['ID', 'Tanggal', 'Judul', 'Pelapor', 'Kategori', 'Status', 'Progres']],
        body: data.map(item => [
            item.ID,
            item.Tanggal,
            item.Judul,
            item.Pelapor,
            item.Kategori,
            item.Status_Validasi,
            item.Status_Progres.replace(/_/g, ' ')
        ]),
        startY: 50,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 8, cellPadding: 3 },
        columnStyles: {
            0: { cellWidth: 10 }, // ID
            1: { cellWidth: 20 }, // Tanggal
            2: { cellWidth: 40 }, // Judul
            6: { cellWidth: 25 }  // Progres
        }
    })

    // Footer
    const pageCount = (doc.internal as any).getNumberOfPages()
    for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(150)
        doc.text(`Halaman ${i} dari ${pageCount}`, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10, { align: 'right' })
    }

    doc.save(`Laporan_Eksekutif_${period.replace(/\s/g, '_')}.pdf`)
  }

  return (
    <div className="flex space-x-2">
      <button 
        onClick={exportExcel}
        className="flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all shadow-lg shadow-emerald-500/20 text-sm font-medium"
      >
        <span className="mr-2">📊</span> Excel
      </button>
      <button 
        onClick={exportPDF}
        className="flex items-center px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-all shadow-lg shadow-rose-500/20 text-sm font-medium"
      >
        <span className="mr-2">📄</span> PDF
      </button>
    </div>
  )
}
