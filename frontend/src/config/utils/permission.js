export const hasPermission = (loginUser, componentName, action) => {
    if (!loginUser || !loginUser.permissions) return false;

    const permission = loginUser.permissions.find(
        (perm) => perm.component === componentName
    );

    if (!permission) return false;

    return permission[action] === true;
};

export const getComponentPermissions = (loginUser, componentName) => {
    const found = loginUser?.permissions?.find(
        (p) => p?.component?.toLowerCase() === componentName?.toLowerCase()
    );

    return {
        canAdd: found?.add === true,
        canEdit: found?.edit === true,
        canDelete: found?.delete === true,
    };
};