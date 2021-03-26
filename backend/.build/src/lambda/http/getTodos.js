import 'source-map-support/register';
export const handler = async (event) => {
    // TODO: Get all TODO items for a current user
    return {
        statusCode: 200,
        body: JSON.stringify(event)
    };
};
//# sourceMappingURL=getTodos.js.map