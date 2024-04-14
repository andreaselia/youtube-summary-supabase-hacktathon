import Markdoc, { RenderableTreeNodes } from "@markdoc/markdoc";
import * as React from "react";

type Props = {
  content: RenderableTreeNodes;
};

export function Markdown({ content }: Props) {
  return (
    <>
      {Markdoc.renderers.react(content, React)}
    </>
  );
}
