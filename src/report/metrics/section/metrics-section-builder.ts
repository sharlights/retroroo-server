import { Section, SectionBuilder } from '../../sections';
import * as fs from 'fs';
import Handlebars from 'handlebars';
import * as path from 'path';
/**
 * Generate governance section.
 */
export class MetricsSectionBuilder implements SectionBuilder {
  generate(userId: string): Section {
    const templatePath = path.join(__dirname, 'metrics.hbs');
    const templateSource = fs.readFileSync(templatePath, 'utf8');
    const template = Handlebars.compile(templateSource);

    const renderedTemplate = template({
      sectionTitle: 'Metrics and Targets',
      company: 'Sharlights',
      owner: 'Scott',
    });

    return {
      name: 'metrics',
      bodyHtml: renderedTemplate,
      cssFilePath: path.join(__dirname, 'metrics.css'),
    } as Section;
  }
}
