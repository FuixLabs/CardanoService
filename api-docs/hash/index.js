export const hash = {
  "/hash": {
    post: {
      security: {
        cookieAuth: [],
      },
      tags: ["hash"],
      description: "STORE",
      operationId: "store",
      parameters: [],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                hash: {
                  type: "string",
                  example: "11d456db211d68cc8a6eac5e293422dec669b54812e4975497d7099467335987",
                },
              },
            },
          },
        },
        required: true,
        description: "Keccak256 document hash...",
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
                            example: "03c25bba38be9ffc375394ac3dc690ae2ad78bed62cb0fffca39e614"
                          },
                          script: {
                            type: "string",
                            example: "8201828200581cb6a2c7c962ec2e9b8562a5aa9e693578d32d14591688a5ceb1af302d82051abfc12c96",
                          },
                          ttl: {
                            type: "number",
                            example: 3217108118,
                          }
                        }
                      },
                      asset: {
                        type: "string",
                        example: "03c25bba38be9ffc375394ac3dc690ae2ad78bed62cb0fffca39e61421c48f072b87b4c0cbf2d3b7be8750ca9bc37c14a46aa140fcbe401b570b98d1",
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

    put: {
      security: {
        cookieAuth: [],
      },
      tags: ["hash"],
      description: "UPDATE",
      operationId: "update",
      parameters: [],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                newHash: {
                  type: "string",
                  example: "11d456db211d68cc8a6eac5e293422dec669b54812e4975497d7099467335987",
                },
                config: {
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
                          example: "03c25bba38be9ffc375394ac3dc690ae2ad78bed62cb0fffca39e614"
                        },
                        script: {
                          type: "string",
                          example: "8201828200581cb6a2c7c962ec2e9b8562a5aa9e693578d32d14591688a5ceb1af302d82051abfc12c96",
                        },
                        ttl: {
                          type: "number",
                          example: 3217108118,
                        }
                      }
                    },
                    asset: {
                      type: "string",
                      example: "03c25bba38be9ffc375394ac3dc690ae2ad78bed62cb0fffca39e61421c48f072b87b4c0cbf2d3b7be8750ca9bc37c14a46aa140fcbe401b570b98d1",
                    }
                  },
                },
              },
            },
          },
        },
        required: true,
        description: "New keccak256 document hash and config...",
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
                            example: "03c25bba38be9ffc375394ac3dc690ae2ad78bed62cb0fffca39e614"
                          },
                          script: {
                            type: "string",
                            example: "8201828200581cb6a2c7c962ec2e9b8562a5aa9e693578d32d14591688a5ceb1af302d82051abfc12c96",
                          },
                          ttl: {
                            type: "number",
                            example: 3217108118,
                          }
                        }
                      },
                      asset: {
                        type: "string",
                        example: "03c25bba38be9ffc375394ac3dc690ae2ad78bed62cb0fffca39e61421c48f072b87b4c0cbf2d3b7be8750ca9bc37c14a46aa140fcbe401b570b98d1",
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
      tags: ["hash"],
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
                          example: "03c25bba38be9ffc375394ac3dc690ae2ad78bed62cb0fffca39e614"
                        },
                        script: {
                          type: "string",
                          example: "8201828200581cb6a2c7c962ec2e9b8562a5aa9e693578d32d14591688a5ceb1af302d82051abfc12c96",
                        },
                        ttl: {
                          type: "number",
                          example: 3217108118,
                        }
                      }
                    },
                    asset: {
                      type: "string",
                      example: "03c25bba38be9ffc375394ac3dc690ae2ad78bed62cb0fffca39e61421c48f072b87b4c0cbf2d3b7be8750ca9bc37c14a46aa140fcbe401b570b98d1",
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