const logger = require('../../config/logger');

class PdfGenerator {
  static async generatePrescription(prescription) {
    logger.info({ msg: '[PDF] Generating prescription PDF', prescriptionId: prescription.id });
    // Placeholder: integrate a real PDF library (puppeteer, pdfkit, etc.) for production
    return `/uploads/prescriptions/prescription-${prescription.id}.pdf`;
  }

  static async generateReport(report) {
    logger.info({ msg: '[PDF] Generating report PDF', reportId: report.id });
    return `/uploads/reports/report-${report.id}.pdf`;
  }
}

module.exports = PdfGenerator;
