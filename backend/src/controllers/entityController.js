const { default: mongoose } = require('mongoose');
const Entity = require('../models/Entity');
const PageElement = require('../models/PageElement');


exports.createEntity = async (req, res) => {
    try {
        const entityData = req.body;

        const entity = new Entity(entityData);
        await entity.save();
        res.status(201).json(entity);
    } catch (err) {
        console.error('❌ Error creating entity:', err);
        if (err.code === 11000) {
            res.status(400).json({ error: 'This page key already exists' });
        } else {
            res.status(400).json({ error: err.message });
        }
    }
};


exports.getAllEntities = async (req, res) => {
    try {
        let query = {};

        // if (req.user?.user_type === 'client') {
        //     query.user_id = req.user._id; // 👈 Only fetch their own
        // }

        const entities = await Entity.find(query).sort({ createdOn: -1 });
        res.json(entities);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


exports.getEntityById = async (req, res) => {
    try {
        const entity = await Entity.findById(req.params.id);
        if (!entity) return res.status(404).json({ error: 'Entity not found' });
        res.json(entity);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateEntity = async (req, res) => {
    try {
        if (!req.params.id) {
            return res.status(400).json({ error: 'ID parameter is required' });
        }

        const entity = await Entity.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!entity) {
            return res.status(404).json({ error: 'Entity not found' });
        }

        res.json(entity);
    } catch (err) {
        console.error('Update error:', err);
        res.status(400).json({
            error: err.message,
            details: err.errors
        });
    }
};


exports.deleteEntity = async (req, res) => {
    try {
        const entity = await Entity.findByIdAndDelete(req.params.id);

        if (!entity) {
            return res.status(404).json({ error: 'Entity not found' });
        }

        await PageElement.deleteMany({ page_id: entity._id.toString() });

        const collectionName = entity.title.trim().toLowerCase();

        const collections = await mongoose.connection.db.listCollections({ name: collectionName }).toArray();

        if (collections.length > 0) {
            await mongoose.connection.db.dropCollection(collectionName);
            console.log(`Collection ${collectionName} dropped successfully.`);
        } else {
            console.log(`Collection ${collectionName} does not exist.`);
        }

        res.json({ message: 'Entity, related PageElements, and matching PageData collection deleted successfully.' });

    } catch (err) {
        console.error('Error deleting entity:', err);
        res.status(500).json({ error: err.message });
    }
};
