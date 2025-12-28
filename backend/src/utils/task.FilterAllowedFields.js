export const filterAllowedFields = (data, allowedFields) => {
    if (allowedFields.includes('*')) return data;

    return Object.fromEntries(
        Object.entries(data).filter(([key]) => allowedFields.includes(key))
    );
};
