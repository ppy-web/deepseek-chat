import MarkdownIt from "markdown-it";
import hljs from "highlight.js";

const markdown = MarkdownIt({
  html: true, // 允许在 Markdown 中使用原始 HTML 标签
  linkify: true, // 自动将 URL 转换为链接
  typographer: true, // 启用智能引号和连字符
  breaks: true, // 启用自动换行
  xhtmlOut: true, // 使用 XHTML 模式
  langPrefix: "language-", // 添加语言前缀
});

markdown.set({
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return (
          '<pre class="hljs"><code>' +
          hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
          "</code></pre>"
        );
      } catch (__) {}
    }
    return (
      '<pre class="hljs"><code>' +
      markdown.utils.escapeHtml(str) +
      "</code></pre>"
    );
  },
});

export function useMarkdown() {
  return {
    markdown,
  };
}
