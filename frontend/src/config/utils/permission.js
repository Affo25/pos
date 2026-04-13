export const hasPermission = (loginUser, componentName, action) => {
    if (!loginUser || !loginUser.permissions) return false;

    const permission = loginUser.permissions.find(
        (perm) => perm.component === componentName
    );

    if (!permission) return false;

    return permission[action] === true;
};

export const getComponentPermissions = (loginUser, componentName) => {
    if (!loginUser) {
        return { canAdd: false, canEdit: false, canDelete: false };
    }

    if (loginUser.user_type === 'superAdmin' || loginUser.user_type === 'admin') {
        return { canAdd: true, canEdit: true, canDelete: true };
    }

    const found = loginUser.permissions?.find(
        (p) => p?.component?.toLowerCase() === componentName?.toLowerCase()
    );

    if (found) {
        return {
            canAdd: found.add === true,
            canEdit: found.edit === true,
            canDelete: found.delete === true,
        };
    }

    /* No row for this component: new users often have an empty permissions array — default allow CRUD so action buttons work until admin sets granular rules */
    return {
        canAdd: true,
        canEdit: true,
        canDelete: true,
    };
};