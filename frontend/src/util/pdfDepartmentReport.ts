import { DepartmentTrainingReportResponse, ReportInfo } from "@/types/report";
import { format } from "date-fns";
import { formatCurrency } from "./pdfReport"; 

const getReportTitle = (info: ReportInfo) => {
    if (info.period_type === "MONTHLY") return `ເດືອນ ${info.period_value} / ${info.year}`;
    if (info.period_type === "QUARTERLY") return `ໄຕມາດ ${info.period_value} / ${info.year}`;
    if (info.period_type === "HALF_YEARLY") return `6 ເດືອນ${info.period_value === 1 ? "ຕົ້ນ" : "ທ້າຍ"}ປີ / ${info.year}`;
    if (info.period_type === "YEARLY") return `ປີ ${info.year}`;
    return `${info.year}`;
};

export const generateDepartmentReportHTML = (report: DepartmentTrainingReportResponse): string => {
    const currentDate = format(new Date(), "dd/MM/yyyy");
    const reportTitle = getReportTitle(report.report_info);
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const deptName = report.report_info.department.name;

    // 💡 Generate Table Bodies (1 Tbody per Course to prevent page-break issues with rowspan)
    const dataBodies = report.data.map((course) => {
        const attendeeCount = course.attendee_list && course.attendee_list.length > 0 ? course.attendee_list.length : 1;

        let bodyHtml = `<tbody class="course-group">`;

        if (!course.attendee_list || course.attendee_list.length === 0) {
            // Case: Course with no specific attendees listed
            bodyHtml += `
                <tr>
                    <td class="text-center font-bold">${course.no}</td>
                    <td class="text-center">-</td>
                    <td class="text-center">-</td>
                    <td class="text-center">-</td>
                    <td class="font-bold">${course.course_title}</td>
                    <td class="text-center">${course.attendees.technical.male || "-"}</td>
                    <td class="text-center">${course.attendees.technical.female || "-"}</td>
                    <td class="text-center font-bold">${course.attendees.technical.total || "-"}</td>
                    <td class="text-center">${course.attendees.administrative.male || "-"}</td>
                    <td class="text-center">${course.attendees.administrative.female || "-"}</td>
                    <td class="text-center font-bold">${course.attendees.administrative.total || "-"}</td>
                    <td class="text-center font-bold">${course.attendees.total.total || "-"}</td>
                    <td class="text-center">${format(new Date(course.duration.start_date), "dd/MM/yy")}</td>
                    <td class="text-center">${format(new Date(course.duration.end_date), "dd/MM/yy")}</td>
                    <td class="text-center">${course.duration.total_days}</td>
                    <td class="text-center">${course.location.is_domestic ? "✓" : ""}</td>
                    <td class="text-center">${course.location.is_international ? "✓" : ""}</td>
                    <td>${course.institution || "-"}</td>
                    <td class="text-center">${course.format}</td>
                    <td></td>
                </tr>
            `;
        } else {
            // Case: Course with attendees (Rowspan logic like Excel)
            course.attendee_list.forEach((emp, idx) => {
                bodyHtml += `<tr>`;
                
                if (idx === 0) {
                    const rs = `rowspan="${attendeeCount}"`;
                    // First row includes the course spanning downwards
                    bodyHtml += `<td ${rs} class="text-center font-bold">${course.no}</td>`;
                    bodyHtml += `<td class="text-center">${emp.employee_code}</td>`;
                    bodyHtml += `<td>${emp.full_name}</td>`;
                    bodyHtml += `<td>${emp.position}</td>`;
                    
                    bodyHtml += `
                        <td ${rs} class="font-bold">${course.course_title}</td>
                        <td ${rs} class="text-center">${course.attendees.technical.male || "-"}</td>
                        <td ${rs} class="text-center">${course.attendees.technical.female || "-"}</td>
                        <td ${rs} class="text-center font-bold">${course.attendees.technical.total || "-"}</td>
                        <td ${rs} class="text-center">${course.attendees.administrative.male || "-"}</td>
                        <td ${rs} class="text-center">${course.attendees.administrative.female || "-"}</td>
                        <td ${rs} class="text-center font-bold">${course.attendees.administrative.total || "-"}</td>
                        <td ${rs} class="text-center font-bold">${course.attendees.total.total || "-"}</td>
                        <td ${rs} class="text-center">${format(new Date(course.duration.start_date), "dd/MM/yy")}</td>
                        <td ${rs} class="text-center">${format(new Date(course.duration.end_date), "dd/MM/yy")}</td>
                        <td ${rs} class="text-center">${course.duration.total_days}</td>
                        <td ${rs} class="text-center">${course.location.is_domestic ? "✓" : ""}</td>
                        <td ${rs} class="text-center">${course.location.is_international ? "✓" : ""}</td>
                        <td ${rs}>${course.institution || "-"}</td>
                        <td ${rs} class="text-center">${course.format}</td>
                        <td ${rs}></td>
                    `;
                } else {
                    // Subsequent rows only print attendee data
                    bodyHtml += `<td class="text-center">${emp.employee_code}</td>`;
                    bodyHtml += `<td>${emp.full_name}</td>`;
                    bodyHtml += `<td>${emp.position}</td>`;
                }
                
                bodyHtml += `</tr>`;
            });
        }

        bodyHtml += `</tbody>`;
        return bodyHtml;
    }).join("");

    const summaryHtml = `
        <tbody class="summary-body">
            <tr class="summary-row">
                <td colspan="5" style="text-align:right;padding-right:8px; text-transform: uppercase;">
                    ລວມທັງໝົດ (${report.summary.total_courses} ຫຼັກສູດ):
                </td>
                <td class="text-center font-bold">${report.summary.total_technical_male}</td>
                <td class="text-center font-bold">${report.summary.total_technical_female}</td>
                <td class="text-center font-bold text-lg">${report.summary.total_technical}</td>
                <td class="text-center font-bold">${report.summary.total_administrative_male}</td>
                <td class="text-center font-bold">${report.summary.total_administrative_female}</td>
                <td class="text-center font-bold text-lg">${report.summary.total_administrative}</td>
                <td class="text-center font-bold text-lg">${report.summary.total_attendees}</td>
                <td colspan="2"></td>
                <td class="text-center font-bold">${report.summary.total_days}</td>
                <td class="text-center font-bold">${report.summary.total_domestic}</td>
                <td class="text-center font-bold">${report.summary.total_international}</td>
                <td></td>
                <td class="text-center font-bold" style="font-size:8px;">(ON:${report.summary.total_online} IN:${report.summary.total_onsite})</td>
                <td></td>
            </tr>
        </tbody>
    `;

    const signaturesHTML = report.report_info.period_type === "MONTHLY"
        ? `
        <div class="signature-box"><div class="sig-title">ຫົວໜ້າຝ່າຍ ${deptName}</div><div class="signature-line"></div></div>
        <div class="signature-box"><div class="sig-title">ຜູ້ສັງລວມ</div><div class="signature-line"></div></div>
        `
        : `
        <div class="signature-box"><div class="sig-title">ຄະນະອຳນວຍການ</div><div class="signature-line"></div></div>
        <div class="signature-box"><div class="sig-title">ຫົວໜ້າຝ່າຍ ${deptName}</div><div class="signature-line"></div></div>
        <div class="signature-box"><div class="sig-title">ຜູ້ສັງລວມ</div><div class="signature-line"></div></div>
        `;

    return `
        <!DOCTYPE html>
        <html lang="lo">
        <head>
            <meta charset="UTF-8">
            <title>Department Training Report</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                    font-family: 'Phetsarath OT', 'Saysettha OT', sans-serif;
                    background: #fff; color: #000; /* Pure Black and White */
                    font-size: 8.5px; /* Smaller font to fit extra columns */
                    line-height: 1.4; padding: 20px;
                }
                .container { width: 100%; margin: 0 auto; }
                
                /* Utils */
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .font-bold { font-weight: 700; }
                .text-lg { font-size: 9.5px; }

                /* Header */
                .header-nation {
                    text-align: center; font-weight: 700; color: #000;
                    font-size: 14px; margin-bottom: 20px; line-height: 1.6;
                }
                .header-info {
                    display: flex; justify-content: space-between; align-items: flex-start;
                    font-size: 11px; margin-bottom: 24px; line-height: 1.8; color: #000;
                }
                .header-left { flex: 1; text-align: left; }
                .header-center { flex: 1; text-align: center; }
                .header-right { flex: 1; text-align: right; }
                .header-logo { width: 70px; height: auto; object-fit: contain; filter: grayscale(100%); }

                /* Title */
                .report-title {
                    text-align: center; font-weight: 700; color: #000;
                    font-size: 15px; margin: 20px 0 16px; line-height: 1.8;
                }
                .report-subtitle { font-size: 12px; font-weight: normal; }

                /* Table Constraints */
                table {
                    width: 100%; border-collapse: collapse;
                    table-layout: fixed; margin-bottom: 28px;
                }
                th, td {
                    border: 1px solid #000;
                    padding: 4px 3px; word-wrap: break-word;
                    overflow-wrap: break-word; line-height: 1.3;
                    vertical-align: middle;
                }
                th {
                    text-align: center; font-weight: 700; 
                    font-size: 9px; background-color: #f0f0f0; /* Light gray for headers */
                    color: #000; padding: 6px 2px;
                }
                
                /* Prevent rows from breaking across pages */
                .course-group { page-break-inside: avoid; }

                /* Precise Column Widths based on UX */
                .col-no { width: 2.5%; }
                .col-code { width: 4.5%; }
                .col-name { width: 9%; }
                .col-pos { width: 8%; }
                .col-course { width: 13%; }
                .col-stat { width: 2.5%; }
                .col-date { width: 4.5%; }
                .col-days { width: 4%; }
                .col-loc { width: 2.5%; }
                .col-inst { width: 7%; }
                .col-format { width: 4%; }
                .col-budget { width: 5%; }
                .col-remark { width: 4.5%; }

                /* Summary Row */
                .summary-body { page-break-inside: avoid; }
                .summary-row td {
                    font-weight: 700; 
                    background-color: #e8e8e8;
                    border-top: 2px solid #000;
                    border-bottom: 2px solid #000;
                    padding-top: 8px; padding-bottom: 8px;
                }

                /* Signatures */
                .signatures {
                    display: flex; justify-content: space-between;
                    margin-top: 40px; padding: 0 30px;
                    font-size: 12px; line-height: 1.8; color: #000;
                    page-break-inside: avoid;
                }
                .signature-box  { text-align: center; width: 200px; }
                .sig-title { font-weight: bold; }
                .signature-line { margin-top: 60px; border-bottom: 1px dotted #000; }

                @media print {
                    @page { size: A4 landscape; margin: 10mm; }
                    body { padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
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
                    <img src="${baseUrl}/images/logo/logo.png" alt="Logo" class="header-logo" onerror="this.style.display='none'" />
                </div>
                <div class="header-right">
                    ເລກທີ............/ຟຟລ.ຝບກ.ພວພ<br>
                    ນະຄອນຫຼວງວຽງຈັນ, ວັນທີ ${currentDate}
                </div>
            </div>

            <div class="report-title">
                ສັງລວມການຝຶກອົບຮົມ ${deptName}<br/>
                <span class="report-subtitle">ປະຈຳ ${reportTitle}</span>
            </div>

            <table>
                <thead>
                    <tr>
                        <th rowspan="3" class="col-no">ລ/ດ</th>
                        <th rowspan="3" class="col-code">ລະຫັດ<br>ພະນັກງານ</th>
                        <th rowspan="3" class="col-name">ຊື່ ແລະ ນາມສະກຸນ</th>
                        <th rowspan="3" class="col-pos">ຕຳແໜ່ງ</th>
                        <th rowspan="3" class="col-course">ຫົວຂໍ້ຝຶກອົບຮົມ</th>
                        <th colspan="7">ຈຳນວນຜູ້ເຂົ້າຝຶກ</th>
                        <th colspan="2">ໄລຍະເວລາ</th>
                        <th rowspan="3" class="col-days">ຈຳນວນ<br>ມື້</th>
                        <th colspan="2">ສະຖານທີ່ຝຶກ</th>
                        <th rowspan="3" class="col-inst">ຊື່ສະຖາບັນ/<br>ອົງກອນ</th>
                        <th rowspan="3" class="col-format">ຮູບແບບ<br>ການຝຶກ</th>
                        <th rowspan="3" class="col-remark">ໝາຍເຫດ</th>
                    </tr>
                    <tr>
                        <th colspan="3">ເຕັກນິກ</th>
                        <th colspan="3">ບໍລິຫານ</th>
                        <th rowspan="2" class="col-stat">ລວມ</th>
                        <th rowspan="2" class="col-date">ມື້ເລີ່ມ</th>
                        <th rowspan="2" class="col-date">ມື້ສິ້ນສຸດ</th>
                        <th rowspan="2" class="col-loc">ພາຍໃນ</th>
                        <th rowspan="2" class="col-loc">ຕ່າງ<br>ປະເທດ</th>
                    </tr>
                    <tr>
                        <th class="col-stat">ຊາຍ</th>
                        <th class="col-stat">ຍິງ</th>
                        <th class="col-stat">ລວມ</th>
                        <th class="col-stat">ຊາຍ</th>
                        <th class="col-stat">ຍິງ</th>
                        <th class="col-stat">ລວມ</th>
                    </tr>
                </thead>
                ${report.data.length > 0 
                    ? dataBodies + summaryHtml 
                    : `<tbody><tr><td colspan="21" style="text-align:center; padding:40px; font-weight:bold;">ບໍ່ມີຂໍ້ມູນການຝຶກອົບຮົມໃນຊ່ວງເວລານີ້</td></tr></tbody>`
                }
            </table>

            <div class="signatures">${signaturesHTML}</div>
        </div>
        </body>
        </html>
    `;
};

export const downloadDepartmentReportPDF = (report: DepartmentTrainingReportResponse): void => {
    const html = generateDepartmentReportHTML(report);
    const printWindow = window.open("", "_blank");
    if (!printWindow) return alert("ກະລຸນາ Allow Pop-ups");
    printWindow.document.open();
    printWindow.document.write(`${html}<script>window.onload=function(){setTimeout(function(){window.print();},500);window.onafterprint=function(){window.close();};};</script>`);
    printWindow.document.close();
};