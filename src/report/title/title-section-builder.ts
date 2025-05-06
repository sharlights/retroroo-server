import { Section, SectionBuilder } from '../sections';
import * as fs from 'fs';
import Handlebars from 'handlebars';
import * as path from 'path';
/**
 * Generate title section.
 */
export class TitleSectionBuilder implements SectionBuilder {
  generate(userId: string): Section {
    const templatePath = path.join(__dirname, 'title.hbs');
    const templateSource = fs.readFileSync(templatePath, 'utf8');
    const template = Handlebars.compile(templateSource);
    const renderedTemplate = template({
      title: 'Climate Report',
      company: 'Sharlights',
      user: userId,
    });

    return {
      name: 'title',
      bodyHtml: renderedTemplate,
      cssFilePath: path.join(__dirname, 'title.css'),
    } as Section;
  }
}
