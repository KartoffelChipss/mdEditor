import showdown from 'showdown';
import hljs from 'highlight.js';

const converter = new showdown.Converter({
    tables: true,
    strikethrough: true,
    underline: true,
    tasklists: true,
    ghCodeBlocks: true,
});

converter.setOption('ghCompatibleHeaderId', true);
converter.setOption('parseImgDimensions', true);
converter.setOption('simplifiedAutoLink', true);
converter.setOption('excludeTrailingPunctuationFromURLs', true);
converter.setOption('literalMidWordUnderscores', true);
converter.setOption('tasklists', true);

converter.setFlavor('github');

const originalConverter = converter.makeHtml;
converter.makeHtml = function (text) {
    const html = originalConverter.call(converter, text);
    return html.replace(/<pre><code class="(.+?)">([\s\S]+?)<\/code><\/pre>/g, (match, lang, code) => {
        lang = lang.split(' ')[0]; // Ensure only the language is extracted
        const validLang = hljs.getLanguage(lang) ? lang : 'plaintext'; // Default to plaintext if language is not found
        const highlighted = hljs.highlight(code, { language: validLang }).value;
        return `<pre><code class="hljs ${validLang}">${highlighted}</code></pre>`;
    });
};

export default converter;