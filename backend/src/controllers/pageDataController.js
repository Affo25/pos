const mongoose = require('mongoose');
const { createDynamicModel } = require('../models/PageData');

exports.createPageData = async (req, res) => {
    try {
        const { data_key, ...fieldValues } = req.body;

        if (!data_key) {
            return res.status(400).json({
                success: false,
                error: 'data_key is required',
            });
        }

        const modelName = data_key.trim().toLowerCase();

        // ✅ Check if collection (model) already exists
        const collections = await mongoose.connection.db.listCollections({ name: modelName }).toArray();
        if (collections.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Data key already exists',
            });
        }

        // ✅ Create new dynamic model
        const PageDataModel = createDynamicModel(modelName);

        const newData = new PageDataModel({
            ...fieldValues,
            data_key
        });

        const savedData = await newData.save();

        return res.status(201).json({
            success: true,
            data: savedData,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};
exports.getPageData = async (req, res) => {
    try {
        const { data_key } = req.query;

        if (!data_key) {
            return res.status(400).json({
                success: false,
                error: 'data_key is required'
            });
        }

        const modelName = data_key.trim().toLowerCase();
        let Model;
        try {
            Model = mongoose.model(modelName);
        } catch {
            Model = mongoose.model(modelName, new mongoose.Schema({}, { strict: false }));
        }

        const data = await Model.find({});

        return res.status(200).json({
            success: true,
            data
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};


exports.updatePageData = async (req, res) => {
    try {
        const { id } = req.params;
        const { data_key, ...updateFields } = req.body;

        if (!data_key) {
            return res.status(400).json({
                success: false,
                error: 'data_key is required'
            });
        }

        const modelName = data_key.trim().toLowerCase();
        let Model;
        try {
            Model = mongoose.model(modelName);
        } catch (err) {
            Model = mongoose.model(modelName, new mongoose.Schema({}, { strict: false }));
        }

        updateFields.updatedAt = new Date();

        const updatedDoc = await Model.findByIdAndUpdate(id, updateFields, {
            new: true,
            runValidators: true,
        });

        if (!updatedDoc) {
            return res.status(404).json({
                success: false,
                error: 'Data not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Data updated successfully',
            data: updatedDoc
        });

    } catch (error) {
        console.error('Update error:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};


exports.deletePageData = async (req, res) => {
    try {
        const { id } = req.params;
        const { data_key } = req.body;

        if (!data_key) {
            return res.status(400).json({
                success: false,
                error: 'data_key is required'
            });
        }

        const modelName = data_key.trim().toLowerCase();
        let Model;
        try {
            Model = mongoose.model(modelName);
        } catch {
            Model = mongoose.model(modelName, new mongoose.Schema({}, { strict: false }));
        }

        const deleted = await Model.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                error: 'Data not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Data deleted successfully',
            data: deleted
        });

    } catch (error) {
        console.error('Error deleting data:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
