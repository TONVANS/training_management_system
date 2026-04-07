// src/util/pdfReport.ts
import { TrainingReportResponse, ReportInfo } from "@/types/report";
import { format } from "date-fns";

export const formatCurrency = (value: number): string =>
    new Intl.NumberFormat("lo-LA").format(value);

const getReportTitle = (info: ReportInfo) => {
    if (info.period_type === "MONTHLY") return `ເດືອນ ${info.period_value} / ${info.year}`;
    if (info.period_type === "QUARTERLY") return `ໄຕມາດ ${info.period_value} / ${info.year}`;
    if (info.period_type === "HALF_YEARLY") return `6 ເດືອນ${info.period_value === 1 ? "ຕົ້ນ" : "ທ້າຍ"}ປີ / ${info.year}`;
    if (info.period_type === "YEARLY") return `ປີ ${info.year}`;
    return `${info.year}`;
};

export const generateTrainingReportHTML = (report: TrainingReportResponse): string => {
    const currentDate = format(new Date(), "dd/MM/yyyy");
    const reportTitle = getReportTitle(report.report_info);

    // 💡 ເພີ່ມຕົວແປ baseUrl ເພື່ອດຶງເອົາ Domain ປັດຈຸບັນ (ເຊັ່ນ http://localhost:3000)
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

    // 💡 นำสีและคลาสที่ไม่จำเป็นออก เพื่อให้เป็นขาวดำล้วน
    const dataRows = report.data.map((row) => `
        <tr>
            <td class="col-no">${row.no}</td>
            <td class="col-title">${row.course_title}</td>
            <td class="col-num">${row.attendees.technical.male || "-"}</td>
            <td class="col-num">${row.attendees.technical.female || "-"}</td>
            <td class="col-num"><b>${row.attendees.technical.total || "-"}</b></td>
            <td class="col-num">${row.attendees.administrative.male || "-"}</td>
            <td class="col-num">${row.attendees.administrative.female || "-"}</td>
            <td class="col-num"><b>${row.attendees.administrative.total || "-"}</b></td>
            <td class="col-num"><b>${row.attendees.total.total || "-"}</b></td>
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
    `).join("");

    const summaryRow = `
        <tr class="summary-row">
            <td colspan="2" style="text-align:right;padding-right:8px;">
                ລວມທັງໝົດ (${report.summary.total_courses} ຫຼັກສູດ):
            </td>
            <td class="col-num">${report.summary.total_technical_male}</td>
            <td class="col-num">${report.summary.total_technical_female}</td>
            <td class="col-num">${report.summary.total_technical}</td>
            <td class="col-num">${report.summary.total_administrative_male}</td>
            <td class="col-num">${report.summary.total_administrative_female}</td>
            <td class="col-num">${report.summary.total_administrative}</td>
            <td class="col-num"><b>${report.summary.total_attendees}</b></td>
            <td colspan="2"></td>
            <td class="col-num">${report.summary.total_days}</td>
            <td class="col-num">${report.summary.total_domestic}</td>
            <td class="col-num">${report.summary.total_international}</td>
            <td></td>
            <td class="col-num" style="font-size:9px;">(ON:${report.summary.total_online} IN:${report.summary.total_onsite})</td>
            <td class="col-num"><b>${formatCurrency(report.summary.total_budget)}</b></td>
            <td></td>
        </tr>
    `;

    const signaturesHTML = report.report_info.period_type === "MONTHLY"
        ? `
        <div class="signature-box"><div><strong>ຫົວໜ້າພະແນກວາງແຜນ ແລະ ພັດທະນາບຸກຄະລາກອນ</strong></div><div class="signature-line"></div></div>
        <div class="signature-box"><div><strong>ຜູ້ສັງລວມ</strong></div><div class="signature-line"></div></div>
        `
        : `
        <div class="signature-box"><div><strong>ຫົວໜ້າຝ່າຍບຸກຄະລາກອນ</strong></div><div class="signature-line"></div></div>
        <div class="signature-box"><div><strong>ຫົວໜ້າພະແນກວາງແຜນ ແລະ ພັດທະນາບຸກຄະລາກອນ</strong></div><div class="signature-line"></div></div>
        <div class="signature-box"><div><strong>ຜູ້ສັງລວມ</strong></div><div class="signature-line"></div></div>
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
                    background: #fff; color: #000; /* 💡 ใช้ขาวดำล้วน */
                    font-size: 10px; line-height: 1.6; padding: 20px;
                }
                .container { width: 100%; margin: 0 auto; }
                .text-center { text-align: center; }

                .header-nation {
                    text-align: center; font-weight: 700;
                    font-size: 14px; margin-bottom: 20px; line-height: 1.6;
                }
                
                /* 💡 ปรับ Flex Layout สำหรับ Header แบบ 3 คอลัมน์ */
                .header-info {
                    display: flex; 
                    justify-content: space-between; 
                    align-items: flex-start;
                    font-size: 11px; 
                    margin-bottom: 24px; 
                    line-height: 1.8;
                }
                .header-left { flex: 1; text-align: left; }
                .header-center { flex: 1; text-align: center; }
                .header-right { flex: 1; text-align: right; }
                
                .header-logo {
                    width: 70px; /* 💡 ปรับขนาดโลโก้ตามความเหมาะสม */
                    height: auto;
                    object-fit: contain;
                }

                .report-title {
                    text-align: center; font-weight: 700;
                    font-size: 14px; margin: 20px 0 16px;
                    text-transform: uppercase; line-height: 1.8;
                }

                table {
                    width: 100%; border-collapse: collapse;
                    table-layout: fixed; margin-bottom: 28px;
                }
                th, td {
                    border: 1px solid #000; /* 💡 ใช้ขอบสีดำ */
                    padding: 5px 3px; word-wrap: break-word;
                    overflow-wrap: break-word; line-height: 1.5;
                }
                th {
                    text-align: center;
                    font-weight: 700; vertical-align: middle; font-size: 9.5px;
                }
                td { vertical-align: middle; font-size: 9.5px; }

                .col-no     { width: 3%;  text-align: center; }
                .col-title  { width: 16%; text-align: left; padding-left: 4px; }
                .col-num    { width: 4%;  text-align: center; }
                .col-date   { width: 12%;  text-align: center; }
                .col-inst   { width: 9%; }
                .col-remark { width: 4%; }

                /* 💡 เส้นสรุปรวมที่เป็นทางการ */
                .summary-row td {
                    font-weight: 700; 
                    border-top: 2px solid #000;
                    border-bottom: 2px solid #000;
                    vertical-align: middle;
                    padding-top: 8px; padding-bottom: 6px;
                }

                .signatures {
                    display: flex; justify-content: space-between;
                    margin-top: 40px; padding: 0 30px;
                    font-size: 11px; line-height: 1.8;
                }
                .signature-box  { text-align: center; width: 180px; }
                .signature-line { margin-top: 70px; border-bottom: 1px dotted #000; }

                @media print {
                    @page { size: A4 landscape; margin: 8mm; }
                    body { padding: 0; }
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
            
            <div class="header-info">
                <div class="header-left">
                    ລັດວິສາຫະກິດໄຟຟ້າລາວ<br>
                    ຝ່າຍບຸກຄະລາກອນ<br>
                    ພະແນກວາງແຜນ ແລະ ພັດທະນາບຸກຄະລາກອນ
                </div>
                <div class="header-center">
                    <img src="${baseUrl}/images/logo/logo.png" alt="Logo" class="header-logo" />
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
                        <th rowspan="3" class="col-no">ລ/ດ</th>
                        <th rowspan="3" class="col-title">ຫົວຂໍ້ຝຶກອົບຮົມ</th>
                        <th colspan="7">ຈຳນວນຜູ້ເຂົ້າຝຶກ</th>
                        <th colspan="2">ໄລຍະເວລາ</th>
                        <th rowspan="3" class="col-num">ຈຳນວນ<br>ມື້</th>
                        <th colspan="2">ສະຖານທີ່ຝຶກ</th>
                        <th rowspan="3" class="col-inst">ຊື່ສະຖາບັນ/<br>ອົງກອນ</th>
                        <th rowspan="3" class="col-num">ຮູບແບບ<br>ການຝຶກ</th>
                        <th rowspan="3" class="col-num">ງົບປະມານ<br>(ກີບ)</th>
                        <th rowspan="3" class="col-remark">ໝາຍເຫດ</th>
                    </tr>
                    <tr>
                        <th colspan="3">ເຕັກນິກ</th>
                        <th colspan="3">ບໍລິຫານ</th>
                        <th rowspan="2" class="col-num">ລວມ</th>
                        <th rowspan="2" class="col-date">ມື້ເລີ່ມ</th>
                        <th rowspan="2" class="col-date">ມື້ສິ້ນສຸດ</th>
                        <th rowspan="2" class="col-num">ພາຍໃນ</th>
                        <th rowspan="2" class="col-num">ຕ່າງປະເທດ</th>
                    </tr>
                    <tr>
                        <th class="col-num">ຊາຍ</th>
                        <th class="col-num">ຍິງ</th>
                        <th class="col-num">ລວມ</th>
                        <th class="col-num">ຊາຍ</th>
                        <th class="col-num">ຍິງ</th>
                        <th class="col-num">ລວມ</th>
                    </tr>
                </thead>
                <tbody>
                    ${report.data.length > 0
                        ? dataRows + summaryRow
                        : `<tr><td colspan="18" class="text-center" style="padding:24px;">ບໍ່ມີຂໍ້ມູນການຝຶກອົບຮົມ</td></tr>`
                    }
                </tbody>
            </table>

            <div class="signatures">${signaturesHTML}</div>
        </div>
        </body>
        </html>
    `;
};

export const generatePreviewHtmlUrl = (report: TrainingReportResponse): string => {
    const html = generateTrainingReportHTML(report);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    return URL.createObjectURL(blob);
};

export const downloadReportPDF = (report: TrainingReportResponse): void => {
    const html = generateTrainingReportHTML(report);
    const printWindow = window.open("", "_blank");

    if (!printWindow) {
        alert("ກະລຸນາອະນຸຍາດ (Allow) ໃຫ້ Pop-ups ເຮັດວຽກໃນ Browser ຂອງທ່ານ");
        return;
    }

    printWindow.document.open();
    printWindow.document.write(`
        ${html}
        <script>
            window.onload = function() {
                setTimeout(function() { window.print(); }, 500);
                window.onafterprint = function() { window.close(); };
            };
        </script>
    `);
    printWindow.document.close();
};