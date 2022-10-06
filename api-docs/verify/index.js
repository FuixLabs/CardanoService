export const verify = {
  "/verify/signature": {
    post: {
      security: {
        cookieAuth: [],
      },
      tags: ["verify"],
      description: "VERIFY_SIGNATURE",
      operationId: "verify-signature",
      parameters: [],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                address: {
                  type: "string",
                  example: "",
                },
                payload: {
                  type: "string",
                  example: "",
                },
                signature: {
                  type: "string",
                  example: "",
                },
                key: {
                  type: "string",
                  example: "",
                },
              },
            },
          },
        },
        required: true,
        description: "Only hex-address is allowed to verify signature...",
      },
      responses: {
        200: {
          description: "Response...",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  code: {
                    type: "number",
                    example: 0,
                  },
                  message: {
                    type: "string",
                    example: "SUCCESS",
                  },
                  data: {
                    type: "boolean",
                    example: true,
                  }
                }
              }
            }
          }
        },
        400: {
          $ref: "#/components/responses/UnauthorizedError",
        }
      },
    },
  },
}