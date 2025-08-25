import ShikiHighlighter, { Language } from "react-shiki";

interface Props {
  code: string;
  language: Language;
}

function CSharpCodeBlock({ code, language }: Props) {
  return (
    <ShikiHighlighter language={language} theme="github-dark">
      {code.trim()}
    </ShikiHighlighter>
  );
}
