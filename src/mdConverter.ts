import showdown from 'showdown';

showdown.extension("linkToButton", function () {
    return [{
        type: 'lang',
        regex: /(?<!\!)\[([^\]]+)\]\((https?:\/\/[^\)]+)\)(?!\!\[)/g,
        replace: function (match: any, text: string, url: string) {
            return `<button type="button" class="link" onclick="window.api.invoke('openlink', '${url}')">${text}</button>`;
        }
    }];
});

export default new showdown.Converter({
    // extensions: ['linkToButton'],
    tables: true,
    strikethrough: true,
    underline: true,
    tasklists: true,
});