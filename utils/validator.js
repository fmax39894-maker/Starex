export function validateUrls(urls) {

    const valid = [];

    for (const url of urls) {

        try {

            const u = new URL(url);

            if (
                u.protocol === "http:" ||
                u.protocol === "https:"
            ) {
                valid.push(u.href);
            }

        } catch {

            console.log("Invalid URL:", url);

        }

    }

    return valid;

}