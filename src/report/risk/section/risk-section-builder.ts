import { Section, SectionBuilder } from '../../sections';
import * as fs from 'fs';
import Handlebars from 'handlebars';
import * as path from 'path';
/**
 * Generate governance section.
 */
export class RiskSectionBuilder implements SectionBuilder {
  generate(userId: string): Section {
    const templatePath = path.join(__dirname, 'risk.hbs');
    const templateSource = fs.readFileSync(templatePath, 'utf8');
    const template = Handlebars.compile(templateSource);

    const renderedTemplate = template({
      sectionTitle: 'Risk Management',
      company: 'Sharlights',
      owner: 'Scott',
    });

    return {
      name: 'risk',
      bodyHtml: renderedTemplate,
      cssFilePath: path.join(__dirname, 'risk.css'),
    } as Section;
  }
}
