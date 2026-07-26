export function validateUrls(urls) {

    const valid = [];

    if (!Array.isArray(urls))
        return valid;

    for (let url of urls) {

        if (!url)
            continue;

        url = url.trim();

        if (!url)
            continue;

        try {

            const parsed = new URL(url);

            if (
                parsed.protocol === "http:" ||
                parsed.protocol === "https:"
            ) {

                valid.push(parsed.href);

            }

        } catch {

            console.log("Invalid URL:", url);

        }

    }

    // Remove duplicate URLs
    return [...new Set(valid)];

}