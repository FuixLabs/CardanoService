
export const components = {
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "access_token",
      }
    },
    responses: {
      UnauthorizedError: {
        description: "Access token is missing or invalid",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                code: {
                  type: "number",
                  example: 1,
                },
                message: {
                  type: "string",
                  example: "MISSING_ACCESS_TOKEN",
                },
              },
            },
          },
        },
      }
    },
    schemas: { },
  },
};