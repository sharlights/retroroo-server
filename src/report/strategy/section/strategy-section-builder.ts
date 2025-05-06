import { Section, SectionBuilder } from '../../sections';
import * as fs from 'fs';
import Handlebars from 'handlebars';
import * as path from 'path';
/**
 * Generate governance section.
 */
export class StrategySectionBuilder implements SectionBuilder {
  generate(userId: string): Section {
    const templatePath = path.join(__dirname, 'strategy.hbs');
    const templateSource = fs.readFileSync(templatePath, 'utf8');
    const template = Handlebars.compile(templateSource);

    const renderedTemplate = template({
      sectionTitle: 'Strategy',
      company: 'Sharlights',
      owner: 'Scott',
    });

    return {
      name: 'strategy',
      bodyHtml: renderedTemplate,
      cssFilePath: path.join(__dirname, 'strategy.css'),
    } as Section;
  }
}
