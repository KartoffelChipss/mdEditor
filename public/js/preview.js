previewContent.addEventListener('click', function (event) {
    let target = event.target;

    // Find the closest link
    while (target && target.tagName !== 'A') {
        target = target.parentElement;
    }

    if (target && target.tagName === 'A') {
        const url = target.getAttribute('href');

        if (url.startsWith('#')) {
            event.preventDefault();
            const id = url.substring(1).replaceAll("-", ""); // Remove the # and replace all - with empty string
            console.log("Scrolling to: ", id);
            const element = document.getElementById(id);
            if (element) element.scrollIntoView({ behavior: 'smooth' });
        } else if (url.startsWith('http') || url.startsWith('https')) {
            event.preventDefault();
            window.api.invoke("openLink", url);
        } else {
            event.preventDefault();
            window.api.invoke("openLinkInFinder", {
                url: url,
                path: mdFile.path,
            });
        }
    }
});