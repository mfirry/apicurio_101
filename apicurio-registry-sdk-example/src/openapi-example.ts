import { RegistryClientFactory } from "@apicurio/apicurio-registry-sdk";
import { CreateArtifact, CreateVersion } from "@apicurio/apicurio-registry-sdk";

// Sample OpenAPI 3.0 specification - Version 1.0.0
const OPENAPI_SPEC_V1 = `{
    "openapi": "3.0.0",
    "info": {
        "title": "Pet Store API",
        "description": "A simple pet store API example",
        "version": "1.0.0"
    },
    "servers": [
        {
            "url": "https://api.petstore.example.com/v1"
        }
    ],
    "paths": {
        "/pets": {
            "get": {
                "summary": "List all pets",
                "operationId": "listPets",
                "tags": ["pets"],
                "parameters": [
                    {
                        "name": "limit",
                        "in": "query",
                        "description": "How many items to return at one time (max 100)",
                        "required": false,
                        "schema": {
                            "type": "integer",
                            "format": "int32"
                        }
                    }
                ],
                "responses": {
                    "200": {
                        "description": "A paged array of pets",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/Pets"
                                }
                            }
                        }
                    }
                }
            },
            "post": {
                "summary": "Create a pet",
                "operationId": "createPet",
                "tags": ["pets"],
                "requestBody": {
                    "required": true,
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/Pet"
                            }
                        }
                    }
                },
                "responses": {
                    "201": {
                        "description": "Pet created"
                    }
                }
            }
        }
    },
    "components": {
        "schemas": {
            "Pet": {
                "type": "object",
                "required": ["id", "name"],
                "properties": {
                    "id": {
                        "type": "integer",
                        "format": "int64"
                    },
                    "name": {
                        "type": "string"
                    },
                    "tag": {
                        "type": "string"
                    }
                }
            },
            "Pets": {
                "type": "array",
                "items": {
                    "$ref": "#/components/schemas/Pet"
                }
            }
        }
    }
}`;

// Sample OpenAPI 3.0 specification - Version 2.0.0 (with additional endpoints)
const OPENAPI_SPEC_V2 = `{
    "openapi": "3.0.0",
    "info": {
        "title": "Pet Store API",
        "description": "A simple pet store API example with extended functionality",
        "version": "2.0.0"
    },
    "servers": [
        {
            "url": "https://api.petstore.example.com/v2"
        }
    ],
    "paths": {
        "/pets": {
            "get": {
                "summary": "List all pets",
                "operationId": "listPets",
                "tags": ["pets"],
                "parameters": [
                    {
                        "name": "limit",
                        "in": "query",
                        "description": "How many items to return at one time (max 100)",
                        "required": false,
                        "schema": {
                            "type": "integer",
                            "format": "int32"
                        }
                    },
                    {
                        "name": "tag",
                        "in": "query",
                        "description": "Filter by tag",
                        "required": false,
                        "schema": {
                            "type": "string"
                        }
                    }
                ],
                "responses": {
                    "200": {
                        "description": "A paged array of pets",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/Pets"
                                }
                            }
                        }
                    }
                }
            },
            "post": {
                "summary": "Create a pet",
                "operationId": "createPet",
                "tags": ["pets"],
                "requestBody": {
                    "required": true,
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/Pet"
                            }
                        }
                    }
                },
                "responses": {
                    "201": {
                        "description": "Pet created"
                    }
                }
            }
        },
        "/pets/{petId}": {
            "get": {
                "summary": "Info for a specific pet",
                "operationId": "getPetById",
                "tags": ["pets"],
                "parameters": [
                    {
                        "name": "petId",
                        "in": "path",
                        "required": true,
                        "description": "The id of the pet to retrieve",
                        "schema": {
                            "type": "integer",
                            "format": "int64"
                        }
                    }
                ],
                "responses": {
                    "200": {
                        "description": "Expected response to a valid request",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/Pet"
                                }
                            }
                        }
                    },
                    "404": {
                        "description": "Pet not found"
                    }
                }
            },
            "delete": {
                "summary": "Delete a specific pet",
                "operationId": "deletePet",
                "tags": ["pets"],
                "parameters": [
                    {
                        "name": "petId",
                        "in": "path",
                        "required": true,
                        "description": "The id of the pet to delete",
                        "schema": {
                            "type": "integer",
                            "format": "int64"
                        }
                    }
                ],
                "responses": {
                    "204": {
                        "description": "Pet deleted"
                    },
                    "404": {
                        "description": "Pet not found"
                    }
                }
            }
        }
    },
    "components": {
        "schemas": {
            "Pet": {
                "type": "object",
                "required": ["id", "name"],
                "properties": {
                    "id": {
                        "type": "integer",
                        "format": "int64"
                    },
                    "name": {
                        "type": "string"
                    },
                    "tag": {
                        "type": "string"
                    },
                    "status": {
                        "type": "string",
                        "enum": ["available", "pending", "sold"]
                    }
                }
            },
            "Pets": {
                "type": "array",
                "items": {
                    "$ref": "#/components/schemas/Pet"
                }
            }
        }
    }
}`;

async function main() {
    const registryUrl = process.env.REGISTRY_URL || "http://localhost:8080/apis/registry/v3/";
    const groupId = process.env.GROUP_ID || "petstore-apis";
    const artifactId = process.env.ARTIFACT_ID || "petstore-api-spec";

    console.log("=== Apicurio Registry SDK - OpenAPI Example ===\n");
    console.log(`Registry: ${registryUrl}`);
    console.log(`Group ID: ${groupId}`);
    console.log(`Artifact ID: ${artifactId}\n`);

    try {
        const client = RegistryClientFactory.createRegistryClient(registryUrl);

        // Step 1: Create an OpenAPI artifact with initial specification
        console.log(" Creating OpenAPI artifact with v1.0.0 specification...");
        const createArtifact: CreateArtifact = {
            artifactId: artifactId,
            artifactType: "OPENAPI",
            name: "Pet Store API",
            description: "OpenAPI specification for the Pet Store REST API",
            firstVersion: {
                version: "1.0.0",
                content: {
                    content: OPENAPI_SPEC_V1,
                    contentType: "application/json"
                }
            }
        };

        const createResponse = await client.groups.byGroupId(groupId).artifacts.post(createArtifact);
        console.log(`. Created artifact: ${createResponse?.artifact?.artifactId}`);
        console.log(`. Type: ${createResponse?.artifact?.artifactType}`);
        console.log(`. Initial version: ${createResponse?.version?.version}`);

        // Step 2: Get artifact metadata
        console.log("\n Fetching OpenAPI artifact metadata...");
        const metadata = await client.groups.byGroupId(groupId).artifacts.byArtifactId(artifactId).get();

        if (metadata) {
            console.log(`. Artifact ID: ${metadata.artifactId}`);
            console.log(`. Group ID: ${metadata.groupId}`);
            console.log(`. Type: ${metadata.artifactType}`);
            console.log(`. Name: ${metadata.name}`);
            console.log(`. Description: ${metadata.description}`);
            console.log(`. Created On: ${metadata.createdOn}`);
        }

        // Step 3: Retrieve the OpenAPI specification content
        console.log("\n Retrieving v1.0.0 OpenAPI specification...");
        const v1Content = await client.groups.byGroupId(groupId)
            .artifacts.byArtifactId(artifactId)
            .versions.byVersionExpression("1.0.0")
            .content.get();

        const v1Spec = JSON.parse(v1Content as string);
        console.log(`. API Title: ${v1Spec.info.title}`);
        console.log(`. API Version: ${v1Spec.info.version}`);
        console.log(`. Endpoints: ${Object.keys(v1Spec.paths).join(", ")}`);
        console.log(`. Operations:`);
        for (const [path, methods] of Object.entries(v1Spec.paths)) {
            const operations = Object.keys(methods as object).filter(m => m !== 'parameters');
            console.log(`   ${path}: ${operations.join(", ").toUpperCase()}`);
        }

        // Step 4: Create version 2.0.0 with additional endpoints
        console.log("\n Creating v2.0.0 with additional endpoints...");
        const createVersion: CreateVersion = {
            version: "2.0.0",
            content: {
                content: OPENAPI_SPEC_V2,
                contentType: "application/json"
            }
        };

        const versionResponse = await client.groups.byGroupId(groupId)
            .artifacts.byArtifactId(artifactId)
            .versions.post(createVersion);
        console.log(`. Created version: ${versionResponse?.version}`);

        // Step 5: Compare versions
        console.log("\n Retrieving v2.0.0 OpenAPI specification...");
        const v2Content = await client.groups.byGroupId(groupId)
            .artifacts.byArtifactId(artifactId)
            .versions.byVersionExpression("2.0.0")
            .content.get();

        const v2Spec = JSON.parse(v2Content as string);
        console.log(`. API Title: ${v2Spec.info.title}`);
        console.log(`. API Version: ${v2Spec.info.version}`);
        console.log(`. Endpoints: ${Object.keys(v2Spec.paths).join(", ")}`);
        console.log(`. Operations:`);
        for (const [path, methods] of Object.entries(v2Spec.paths)) {
            const operations = Object.keys(methods as object).filter(m => m !== 'parameters');
            console.log(`   ${path}: ${operations.join(", ").toUpperCase()}`);
        }

        // Step 6: Show version comparison
        console.log("\n Version Comparison:");
        const v1Endpoints = Object.keys(v1Spec.paths);
        const v2Endpoints = Object.keys(v2Spec.paths);
        const newEndpoints = v2Endpoints.filter(e => !v1Endpoints.includes(e));

        console.log(`. v1.0.0 had ${v1Endpoints.length} endpoint(s)`);
        console.log(`. v2.0.0 has ${v2Endpoints.length} endpoint(s)`);
        if (newEndpoints.length > 0) {
            console.log(`. New endpoints in v2.0.0: ${newEndpoints.join(", ")}`);
        }

        // Step 7: List all versions
        console.log("\n📚 All versions of this OpenAPI specification:");
        const versionsResponse = await client.groups.byGroupId(groupId)
            .artifacts.byArtifactId(artifactId)
            .versions.get();

        if (versionsResponse?.versions) {
            versionsResponse.versions.forEach((version, index) => {
                console.log(`  ${index + 1}. Version ${version.version} (${version.state})`);
                console.log(`     Created: ${version.createdOn}`);
            });
        }

        console.log("\n Example completed successfully!");
        console.log("\n Tips:");
        console.log("   - You can use these OpenAPI specs to generate client SDKs");
        console.log("   - View the specifications in the Apicurio Registry UI");
        console.log("   - Use version references in your API gateway or documentation");

    } catch (error) {
        console.error("\n Error:", error);
        process.exit(1);
    }
}

// Run the example
main();
