const BranchProfile = require('../models/BranchProfile');

async function insertDefaultBranch() {
    const existing = await BranchProfile.findOne({ branch_name: 'Branch 1' });
    if (!existing) {
        await BranchProfile.create({
            branch_name: 'Branch 1',
            code: 'BR001',
            vp_name: 'Default VP',
            vp_title: 'VP Title',
            vp_contact: '0000000000',
            vp_email: 'vp@branch.com',
            street_address: 'Default Address',
            city: 'Default City',
            state: 'Default State',
            country: 'Default Country',
            created_by: '64xxx'
        });
        console.log('✅ Default Branch 1 created.');
    } else {
        console.log('ℹ️ Default Branch 1');
    }
}
module.exports = insertDefaultBranch;
