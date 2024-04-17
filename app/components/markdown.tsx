import Markdoc, { RenderableTreeNodes } from "@markdoc/markdoc";
import * as React from "react";

export function Markdown({ content }: { content: RenderableTreeNodes }) {
  return (
    <>
      {Markdoc.renderers.react(content, React)}
    </>
  );
}
