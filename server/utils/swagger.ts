/**
 * Swagger is an open-source documentation specification for rest-api.
 * This is to built this documentation. The 'swagger-jsdoc' library takes .yaml files in the project
 * and creates a json documentation available at: /api-docs
 */
import swaggerJSDoc from 'swagger-jsdoc';

const url: string = `${process.env.HOST_URL || 'http://localhost:5000'}/api`;

const apiOptions: swaggerJSDoc.Options = {
    apis: ['./dist/server/utils/*.yaml', './dist/server/controllers/*.yaml', './dist/server/entities/*.yaml'],
    swaggerDefinition: {
        info: {
            description: 'This is the Par Le Monde backend api:\nYou will find here all the docs for the backend API.',
            title: 'Par Le Monde Backend API',
            version: '1.0.0',
        },
        openapi: '3.0.0',
        servers: [
            {
                description: '',
                url,
            },
        ],
    },
};

const apiSpecs = swaggerJSDoc(apiOptions);
export { apiSpecs };
