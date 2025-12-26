const PageElement = require('../models/PageElement');


exports.createElement = async (req, res) => {
    try {
        if (!req.body.type) {
            return res.status(400).json({ error: 'Field type is required' });
        }
        if (!req.body.name) {
            return res.status(400).json({ error: 'Name is required' });
        }

        const element = await PageElement.create(req.body);
        res.status(201).json(element);
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                error: 'Validation Error',
                details: messages
            });
        }

        res.status(500).json({
            error: 'Server Error',
            details: error.message
        });
    }
};

exports.getAllElements = async (req, res) => {
    try {
        const filter = {};
        if (req.query.page_id) {
            filter.page_id = req.query.page_id;
        }

        const pageElements = await PageElement.find(filter).sort({ priority: 1 });
        res.json(pageElements);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getElementsByPage = async (req, res) => {
    try {
        const elements = await PageElement.find({
            page_id: req.params.pageId
        }).sort({ priority: 1 });

        if (!elements.length) {
            return res.status(404).json({
                error: 'No elements found for this page'
            });
        }

        res.json(elements);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getElementById = async (req, res) => {
    try {
        const element = await PageElement.findById(req.params.id);
        if (!element) {
            return res.status(404).json({ error: 'Element not found' });
        }
        res.json(element);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateElement = async (req, res) => {
    try {
        const element = await PageElement.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!element) {
            return res.status(404).json({ error: 'Element not found' });
        }

        res.json(element);
    } catch (err) {
        res.status(400).json({
            error: err.message,
            details: err.errors
        });
    }
};


exports.deleteElement = async (req, res) => {
    try {
        const element = await PageElement.findByIdAndDelete(req.params.id);
        if (!element) {
            return res.status(404).json({ error: 'Element not found' });
        }

        res.json({ message: 'Element deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};