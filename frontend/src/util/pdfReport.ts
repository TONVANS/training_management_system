import { TrainingReportResponse, ReportInfo } from "@/types/report";
import { format } from "date-fns";

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("lo-LA").format(value);
};

// ==========================================
// ອັບເດດ: ເພີ່ມເງື່ອນໄຂສຳລັບປະຈຳປີ (YEARLY)
// ==========================================
const getReportTitle = (info: ReportInfo) => {
  if (info.period_type === "MONTHLY")
    return `ເດືອນ ${info.period_value} / ${info.year}`;
  if (info.period_type === "QUARTERLY")
    return `ໄຕມາດ ${info.period_value} / ${info.year}`;
  if (info.period_type === "HALF_YEARLY")
    return `6 ເດືອນ${info.period_value === 1 ? "ຕົ້ນ" : "ທ້າຍ"}ປີ / ${info.year}`;
  if (info.period_type === "YEARLY") return `ປີ ${info.year}`; // ສຳລັບລາຍງານປະຈຳປີ
  return `${info.year}`;
};

export const generateTrainingReportHTML = (
  report: TrainingReportResponse,
): string => {
  const currentDate = format(new Date(), "dd/MM/yyyy");
  const reportTitle = getReportTitle(report.report_info);

  // 📌 ດຶງ Origin URL ເພື່ອໃຫ້ຮູບພາບສະແດງຜົນໄດ້ຕອນເປີດໃນ Print Window ຫຼື Blob
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const logoUrl = `${baseUrl}/images/logo/logo.png`;

  // ຕັດຖັນງົບປະມານອອກ ເພື່ອໃຫ້ກົງກັບ Layout ໃນ PDF (ລວມ 12 ຖັນ)
  const dataRows = report.data
    .map(
      (row) => `
        <tr>
            <td class="col-no">${row.no}</td>
            <td class="col-title">${row.course_title}</td>
            <td class="col-num">${row.attendees.technical || "-"}</td>
            <td class="col-num">${row.attendees.administrative || "-"}</td>
            <td class="col-date">${format(new Date(row.duration.start_date), "dd/MM/yyyy")}</td>
            <td class="col-date">${format(new Date(row.duration.end_date), "dd/MM/yyyy")}</td>
            <td class="col-num">${row.duration.total_days}</td>
            <td class="col-num">${row.location.is_domestic ? "✓" : ""}</td>
            <td class="col-num">${row.location.is_international ? "✓" : ""}</td>
            <td class="col-inst">${row.institution || "-"}</td>
            <td class="col-num">${row.format}</td>
            <td class="col-num">${formatCurrency(row.budget)}</td>
            <td class="col-remark"></td>
        </tr>
    `,
    )
    .join("");

  const summaryRow = `
        <tr class="summary-row">
            <td colspan="2" style="text-align:right;padding-right:10px;">
                ລວມທັງໝົດ (${report.summary.total_courses} ຫຼັກສູດ):
            </td>
            <td class="col-num">${report.summary.total_technical}</td>
            <td class="col-num">${report.summary.total_administrative}</td>
            <td colspan="2" class="bg-gray"></td>
            <td class="col-num">${report.summary.total_days}</td>
            <td class="col-num">${report.summary.total_domestic}</td>
            <td class="col-num">${report.summary.total_international}</td>
            <td class="bg-gray"></td>
            <td class="col-num" style="font-size:9px;">(ON:${report.summary.total_online} IN:${report.summary.total_onsite})</td>
            <td class="col-num">${formatCurrency(report.summary.total_budget)}</td>
            <td class="bg-gray"></td>
            
        </tr>
  `;

  // ກວດສອບປະເພດລາຍງານ ເພື່ອສະແດງຈຳນວນລາຍເຊັນໃຫ້ກົງກັບເອກະສານ
  const signaturesHTML =
    report.report_info.period_type === "MONTHLY"
      ? `
        <div class="signature-box">
            <div><strong>ຫົວໜ້າພະແນກວາງແຜນ ແລະ ພັດທະນາບຸກຄະລາກອນ</strong></div>
            <div class="signature-line"></div>
        </div>
        <div class="signature-box">
            <div><strong>ຜູ້ສັງລວມ</strong></div>
            <div class="signature-line"></div>
        </div>
      `
      : `
        <div class="signature-box">
            <div><strong>ຫົວໜ້າຝ່າຍບຸກຄະລາກອນ</strong></div>
            <div class="signature-line"></div>
        </div>
        <div class="signature-box">
            <div><strong>ຫົວໜ້າພະແນກວາງແຜນ ແລະ ພັດທະນາບຸກຄະລາກອນ</strong></div>
            <div class="signature-line"></div>
        </div>
        <div class="signature-box">
            <div><strong>ຜູ້ສັງລວມ</strong></div>
            <div class="signature-line"></div>
        </div>
      `;

  return `
        <!DOCTYPE html>
        <html lang="lo">
        <head>
            <meta charset="UTF-8">
            <title>Training Report</title>

            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }

                body {
                    font-family: 'Phetsarath OT', 'Saysettha OT', sans-serif;
                    background: #fff;
                    color: #000;
                    font-size: 11px;
                    line-height: 1.6;
                    padding: 20px;
                }
                .container { width: 100%; margin: 0 auto; }

                .text-center { text-align: center; }
                .text-right  { text-align: right; }
                .font-bold   { font-weight: 700; }
                .text-blue   { color: #1e40af; }
                .bg-gray     { background: #f3f4f6; }

                .header-nation {
                    text-align: center;
                    font-weight: 700;
                    font-size: 14px;
                    margin-bottom: 24px;
                    line-height: 1.8;
                }

                /* 📌 ປັບປຸງ Header ໃຫ້ແບ່ງເປັນ 3 ສ່ວນ: ຊ້າຍ, ກາງ(Logo), ຂວາ */
                .header-info {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    font-size: 12px;
                    margin-bottom: 16px;
                    line-height: 1.8;
                }
                .header-left { flex: 1; text-align: left; }
                .header-center { flex: 1; text-align: center; }
                .header-right { flex: 1; text-align: right; }

                .logo-img {
                    width: 70px;
                    height: auto;
                    object-fit: contain;
                }

                .report-title {
                    text-align: center;
                    font-weight: 700;
                    font-size: 16px;
                    margin: 20px 0 16px;
                    text-transform: uppercase;
                    line-height: 1.8;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    table-layout: fixed;
                    margin-bottom: 32px;
                }
                th, td {
                    border: 1px solid #000;
                    padding: 8px 4px 6px;
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                    line-height: 1.6;
                }
                th {
                    background: #f3f4f6;
                    text-align: center;
                    font-weight: 700;
                    vertical-align: middle;
                    font-size: 10.5px;
                }
                td {
                    vertical-align: middle;
                    font-size: 10.5px;
                }

                /* ຄວາມກວ້າງທັງໝົດ 100% ສຳລັບ 12 ຖັນ */
                .col-no     { width: 4%;  text-align: center; }
                .col-title  { width: 22%; text-align: left; padding-left: 5px; }
                .col-num    { width: 6%;  text-align: center; }
                .col-date   { width: 12%;  text-align: center; }
                .col-inst   { width: 10%; }
                .col-remark { width: 8%;  }

                .summary-row td {
                    font-weight: 700;
                    background: #f9fafb;
                    border-top: 2px solid #000;
                    vertical-align: middle;
                    padding-top: 10px;
                    padding-bottom: 8px;
                }

                .signatures {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 50px;
                    padding: 0 40px;
                    font-size: 12px;
                    line-height: 1.8;
                }
                .signature-box  { text-align: center; width: 200px; }
                .signature-line { margin-top: 80px; border-bottom: 1px dotted #000; }

                @media print {
                    @page { size: A4 landscape; margin: 10mm; }
                    body { padding: 0; }
                    th, td {
                        font-family: 'Phetsarath OT', 'Saysettha OT', sans-serif !important;
                        line-height: 1.6 !important;
                    }
                    tr    { page-break-inside: avoid; }
                    thead { display: table-header-group; }
                }
            </style>
        </head>
        <body>
            <div class="container" id="pdf-content">
                <div class="header-nation">
                    ສາທາລະນະລັດ ປະຊາທິປະໄຕ ປະຊາຊົນລາວ<br>
                    ສັນຕິພາບ ເອກະລາດ ປະຊາທິປະໄຕ ເອກະພາບ ວັດທະນະຖາວອນ
                </div>

                <!-- 📌 ສະແດງ Logo ຢູ່ເຄິ່ງກາງ -->
                <div class="header-info">
                    <div class="header-left">
                        ລັດວິສາຫະກິດໄຟຟ້າລາວ<br>
                        ຝ່າຍບຸກຄະລາກອນ<br>
                        ພະແນກວາງແຜນ ແລະ ພັດທະນາບຸກຄະລາກອນ
                    </div>
                    <div class="header-center">
                        <img src="${logoUrl}" alt="EDL Logo" class="logo-img" onerror="this.style.display='none'" />
                    </div>
                    <div class="header-right">
                        ເລກທີ............/ຟຟລ.ຝບກ.ພວພ<br>
                        ນະຄອນຫຼວງວຽງຈັນ, ວັນທີ ${currentDate}
                    </div>
                </div>

                <div class="report-title">ສັງລວມ ຝຶກອົບຮົມ ປະຈຳ ${reportTitle}</div>

                <table>
                    <thead>
                        <tr>
                            <th rowspan="2" class="col-no">ລ/ດ</th>
                            <th rowspan="2" class="col-title">ຫົວຂໍ້ຝຶກອົບຮົມ</th>
                            <th colspan="2">ຈຳນວນຜູ້ເຂົ້າຝຶກ</th>
                            <th colspan="2">ໄລຍະເວລາ</th>
                            <th rowspan="2" class="col-num">ຈຳນວນ<br>ມື້</th>
                            <th colspan="2">ສະຖານທີ່ຝຶກ</th>
                            <th rowspan="2" class="col-inst">ຊື່ສະຖາບັນ/ອົງກອນ</th>
                            <th rowspan="2" class="col-num">ຮູບແບບ<br>ການຝຶກ</th>
                            <th rowspan="2" class="col-budget">ງົບປະມານ<br>(ກີບ)</th>
                            <th rowspan="2" class="col-remark">ໝາຍເຫດ</th>
                        </tr>
                        <tr>
                            <th class="col-num">ເຕັກນິກ</th>
                            <th class="col-num">ບໍລິຫານ</th>
                            <th class="col-date">ມື້ເລີ່ມ</th>
                            <th class="col-date">ມື້ສິ້ນສຸດ</th>
                            <th class="col-num">ພາຍໃນ</th>
                            <th class="col-num">ຕ່າງ<br>ປະເທດ</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${
                          report.data.length > 0
                            ? dataRows
                            : `<tr><td colspan="12" class="text-center" style="padding:30px;">ບໍ່ມີຂໍ້ມູນການຝຶກອົບຮົມ</td></tr>`
                        }
                        ${report.data.length > 0 ? summaryRow : ""}
                    </tbody>
                </table>

                <div class="signatures">
                    ${signaturesHTML}
                </div>
            </div>
        </body>
        </html>
  `;
};

// ==========================================================
// 1. Preview — ເປີດ Tab ໃໝ່ (ເຕັມໜ້າຈໍ)
// ==========================================================
export const generatePreviewHtmlUrl = (
  report: TrainingReportResponse,
): string => {
  const html = generateTrainingReportHTML(report);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  return URL.createObjectURL(blob);
};

// ==========================================================
// 2. ດາວໂຫຼດ PDF ຜ່ານ Sandbox Iframe
// ==========================================================
export const downloadReportPDF = (report: TrainingReportResponse): void => {
  const html = generateTrainingReportHTML(report);

  // ເປີດໜ້າຈໍ (Tab) ໃໝ່
  const printWindow = window.open("", "_blank");

  if (!printWindow) {
    alert("ກະລຸນາອະນຸຍາດ (Allow) ໃຫ້ Pop-ups ເຮັດວຽກໃນ Browser ຂອງທ່ານ");
    return;
  }

  // ຂຽນ HTML ລົງໄປໃນໜ້າຈໍໃໝ່
  printWindow.document.open();
  printWindow.document.write(`
    ${html}
    <script>
      // ເມື່ອໂຫຼດໜ້າສຳເລັດ
      window.onload = function() {
        // ລໍຖ້າຈັກໜ້ອຍໜຶ່ງ (0.5 ວິນາທີ) ເພື່ອໃຫ້ Browser ຈັດການ Font ເຮັດໃຫ້ສົມບູນ
        setTimeout(function() {
          // ເອີ້ນຄຳສັ່ງ Print ຂອງ Browser (ຄືກັບການກົດ Ctrl+P)
          window.print();
        }, 500);

        // ເມື່ອຜູ້ໃຊ້ກົດ "Save" ເປັນ PDF ຫຼື ກົດ "Cancel" ແລ້ວ ໃຫ້ປິດ Tab ນີ້ອັດຕະໂນມັດ
        window.onafterprint = function() {
          window.close();
        };
      };
    </script>
  `);
  printWindow.document.close();
};
