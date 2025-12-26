const mongoose = require('mongoose');

const createDynamicModel = (modelName) => {
    const normalizedModelName = modelName.trim().toLowerCase();

    if (mongoose.modelNames().includes(normalizedModelName)) {
        mongoose.deleteModel(normalizedModelName);
    }

    const collectionName = normalizedModelName;

    const schema = new mongoose.Schema({}, {
        strict: false,
        timestamps: true,
        collection: collectionName
    })
    // schema.index({ page_id: 1, page_key: 1 }, { unique: true });

    return mongoose.model(normalizedModelName, schema);
};

module.exports = { createDynamicModel };
