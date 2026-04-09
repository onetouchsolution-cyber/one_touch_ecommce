
// Generate slug if not provided
const generateSlug = async (name, model) => {
    var slug = name;
    if (name) {
        let baseSlug = name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

        slug = baseSlug;
        let slugExists = await model.findOne({ slug });

        let counter = 1;
        while (slugExists) {
            slug = `${baseSlug}-${counter}`;
            slugExists = await model.findOne({ slug });
            counter++;
        }
    }
    return slug;
}

module.exports = generateSlug;
