export const credential = {
  "/credential": {
    post: {
      security: {
        cookieAuth: [],
      },
      tags: ["credential"],
      description: "STORE",
      operationId: "store",
      parameters: [],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                credential: {
                  type: "string",
                  example: "",
                },
                config: {
                  type: "object",
                  properties: {
                    type: {
                      type: "string",
                      example: "credential",
                    },
                    policy: {
                      type: "object",
                      properties: {
                        type: {
                          type: "string",
                          example: "Native",
                        },
                        id: {
                          type: "string",
                          example: ""
                        },
                        script: {
                          type: "string",
                          example: "",
                        },
                        ttl: {
                          type: "number",
                          example: 0,
                        }
                      }
                    },
                    asset: {
                      type: "string",
                      example: "",
                    }
                  },
                },
              },
            },
          },
        },
        required: true,
        description: "Keccak256 credential hash...",
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
                    properties: {
                      type: {
                        type: "string",
                        example: "document",
                      },
                      policy: {
                        type: "object",
                        properties: {
                          type: {
                            type: "string",
                            example: "Native",
                          },
                          id: {
                            type: "string",
                            example: ""
                          },
                          script: {
                            type: "string",
                            example: "",
                          },
                          ttl: {
                            type: "number",
                            example: 0,
                          }
                        }
                      },
                      asset: {
                        type: "string",
                        example: "",
                      }
                    },
                  },
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

    delete: {
      security: {
        cookieAuth: [],
      },
      tags: ["credential"],
      description: "REVOKE",
      operationId: "revoke",
      parameters: [],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                config: {
                  type: "object",
                  properties: {
                    type: {
                      type: "string",
                      example: "credential",
                    },
                    policy: {
                      type: "object",
                      properties: {
                        type: {
                          type: "string",
                          example: "Native",
                        },
                        id: {
                          type: "string",
                          example: ""
                        },
                        script: {
                          type: "string",
                          example: "",
                        },
                        ttl: {
                          type: "number",
                          example: 0,
                        }
                      }
                    },
                    asset: {
                      type: "string",
                      example: "",
                    }
                  },
                },
              },
            },
          },
        },
        required: true,
        description: "Config...",
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