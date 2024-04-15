import Markdoc, { RenderableTreeNodes } from "@markdoc/markdoc";

export const parseMarkdown = (markdown: string): RenderableTreeNodes => {
  const { parse, transform } = Markdoc;

  return transform(parse(markdown));
};
