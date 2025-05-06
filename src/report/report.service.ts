import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as fs from 'fs';
import { TitleSectionBuilder } from './title/title-section-builder';
import Handlebars from 'handlebars';
import * as path from 'path';
import { GovernanceSectionBuilder } from './governance/section/governance-section-builder';
import { MetricsSectionBuilder } from './metrics/section/metrics-section-builder';
import { RiskSectionBuilder } from './risk/section/risk-section-builder';
import { StrategySectionBuilder } from './strategy/section/strategy-section-builder';
import { Section } from './sections';

export interface Data {
  title: string;
  company: string;
  strategy: string;
  carbonAmount: number;
}

@Injectable()
export class ReportService {
  constructor(
    private readonly titleBuilder: TitleSectionBuilder,
    private readonly governanceBuilder: GovernanceSectionBuilder,
    private readonly strategyBuilder: StrategySectionBuilder,
    private readonly riskBuilder: RiskSectionBuilder,
    private readonly metricsBuilder: MetricsSectionBuilder,
  ) {}

  async generatePdf(data: Data): Promise<Buffer> {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Generate HTML content dynamically
    const htmlContent = this.generateHtmlContent();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    // Create PDF from the HTML content
    const pdfBuffer = await page.pdf({ format: 'A4' });

    await browser.close();
    return pdfBuffer;
  }

  private generateHtmlContent(): string {
    // Generate the title section
    const sections: Section[] = [];
    const titleSection = this.titleBuilder.generate('fakeUserid');
    sections.push(titleSection);
    const governanceSection = this.governanceBuilder.generate('fakeUserid');
    sections.push(governanceSection);
    const strategySection = this.strategyBuilder.generate('fakeUserid');
    sections.push(strategySection);
    const riskSection = this.riskBuilder.generate('fakeUserid');
    sections.push(riskSection);
    const metricsSection = this.metricsBuilder.generate('fakeUserid');
    sections.push(metricsSection);

    // Generate the base report
    const templatePath = path.join(__dirname, 'report.hbs');
    const templateSource = fs.readFileSync(templatePath, 'utf8');
    const template = Handlebars.compile(templateSource);

    const rootCssPath = path.join(__dirname, 'report.css');
    const rootCssContent = fs.readFileSync(rootCssPath, 'utf8');

    const sectionCss = sections
      .map((section, index) => {
        const css = fs.readFileSync(
          path.resolve(__dirname, section.cssFilePath),
          'utf8',
        );
        // Scope the CSS to a unique class based on section name or index
        return `/* Scoped styles for ${section.name} */
      .section-${index} {
        ${css.replace(/\n/g, '\n  ')}
      }`;
      })
      .join('\n');

    return template({
      rootCssContent: rootCssContent,
      sections: sections,
      sectionCss: sectionCss,
    });
  }
}
