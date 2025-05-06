import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { TitleSectionBuilder } from './title/title-section-builder';
import { ReportController } from './report.controller';
import { GovernanceSectionBuilder } from './governance/section/governance-section-builder';
import { MetricsSectionBuilder } from './metrics/section/metrics-section-builder';
import { StrategySectionBuilder } from './strategy/section/strategy-section-builder';
import { RiskSectionBuilder } from './risk/section/risk-section-builder';

@Module({
  providers: [
    ReportService,
    TitleSectionBuilder,
    GovernanceSectionBuilder,
    StrategySectionBuilder,
    RiskSectionBuilder,
    MetricsSectionBuilder,
  ],
  controllers: [ReportController],
})
export class ReportModule {}
