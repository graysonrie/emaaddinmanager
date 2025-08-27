import ShikiHighlighter, { Language } from "react-shiki";

interface Props {
  code: string;
  language: Language;
}

export default function CodeBlock({ code, language }: Props) {
  return (
    <ShikiHighlighter language={language} theme="dark-plus">
      {code.trim()}
    </ShikiHighlighter>
  );
}
