export const fetch = {
  "/fetch/nft": {
    post: {
      security: {
        cookieAuth: [],
      },
      tags: ["fetch"],
      description: "FETCH_NFT",
      operationId: "fetch-nft",
      parameters: [],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                asset: {
                  type: "string",
                  example: "",
                },
                policyId: {
                  type: "string",
                  example: "",
                },
              },
            },
          },
        },
        required: true,
        description: "Asset has higher priority than policy id...",
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
                    type: "object",
                    example: {},
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