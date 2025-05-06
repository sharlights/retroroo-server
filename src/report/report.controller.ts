import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { ReportService } from './report.service';

@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get()
  async getReport(@Res() res: Response): Promise<void> {
    const pdfBuffer = await this.reportService.generatePdf({
      carbonAmount: 133.22,
      company: 'Sharlights',
      strategy: 'My strategy plan',
      title: 'Climate Report',
    });

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=climate-report.pdf',
      'Content-Length': pdfBuffer.length,
    });

    res.end(pdfBuffer);
  }
}
