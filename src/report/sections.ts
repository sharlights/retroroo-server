export interface SectionBuilder {
  generate(userId: string): Section;
}

export interface Section {
  name: string;
  bodyHtml: string;
  cssFilePath: string;
}
