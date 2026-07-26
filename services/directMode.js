export function directMode(res, images) {

    if (!images || images.length === 0) {

        return res.status(404).json({

            success: false,

            error: "No images found"

        });

    }

    // Single image → redirect directly
    if (images.length === 1) {

        return res.redirect(images[0].url);

    }

    // Multiple images
    return res.status(200).json({

        success: true,

        mode: "direct",

        total: images.length,

        generatedAt: new Date().toISOString(),

        images: images.map((img, index) => ({

            id: index + 1,

            url: img.url,

            filename: img.file,

            size: img.size

        }))

    });

}