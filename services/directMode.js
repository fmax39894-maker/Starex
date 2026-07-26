export function directMode(res, images) {

    if (!images || images.length === 0) {

        return res.status(404).json({

            success: false,

            error: "No images found"

        });

    }

    // One image → redirect directly
    if (images.length === 1) {

        return res.redirect(images[0].url);

    }

    // Multiple images → return direct links
    return res.json({

        success: true,

        mode: "direct",

        total: images.length,

        images: images.map(img => img.url)

    });

}