import { RegistryClientFactory } from "@apicurio/apicurio-registry-sdk";
import { CreateArtifact, CreateVersion } from "@apicurio/apicurio-registry-sdk";

// Sample Avro schema for demonstration
const AVRO_SCHEMA_V1 = `{
    "type": "record",
    "name": "User",
    "namespace": "com.example",
    "fields": [
        {
            "name": "id",
            "type": "string"
        },
        {
            "name": "username",
            "type": "string"
        }
    ]
}`;

const AVRO_SCHEMA_V2 = `{
    "type": "record",
    "name": "User",
    "namespace": "com.example",
    "fields": [
        {
            "name": "id",
            "type": "string"
        },
        {
            "name": "username",
            "type": "string"
        },
        {
            "name": "email",
            "type": ["null", "string"],
            "default": null
        }
    ]
}`;

async function main() {
    const registryUrl = process.env.REGISTRY_URL || "http://localhost:8080/apis/registry/v3/";
    const groupId = process.env.GROUP_ID || "example-group";
    const artifactId = process.env.ARTIFACT_ID || "example-user-schema";

    console.log("=== Apicurio Registry SDK - Artifacts Example ===\n");
    console.log(`Registry: ${registryUrl}`);
    console.log(`Group ID: ${groupId}`);
    console.log(`Artifact ID: ${artifactId}\n`);

    try {
        const client = RegistryClientFactory.createRegistryClient(registryUrl);

        // Step 1: Create an artifact with initial version
        console.log(". Creating artifact with initial schema...");
        const createArtifact: CreateArtifact = {
            artifactId: artifactId,
            artifactType: "AVRO",
            name: "User Schema",
            description: "Example user schema for demonstration",
            firstVersion: {
                version: "1.0.0",
                content: {
                    content: AVRO_SCHEMA_V1,
                    contentType: "application/json"
                }
            }
        };

        const createResponse = await client.groups.byGroupId(groupId).artifacts.post(createArtifact);
        console.log(`. Created artifact: ${createResponse?.artifact?.artifactId}`);
        console.log(`. Version: ${createResponse?.version?.version}`);

        console.log("\n. Fetching artifact metadata...");
        const metadata = await client.groups.byGroupId(groupId).artifacts.byArtifactId(artifactId).get();

        if (metadata) {
            console.log(`. Artifact ID: ${metadata.artifactId}`);
            console.log(`. Group ID: ${metadata.groupId}`);
            console.log(`. Type: ${metadata.artifactType}`);
            console.log(`. Name: ${metadata.name}`);
            console.log(`. Description: ${metadata.description}`);
            console.log(`. Created On: ${metadata.createdOn}`);
            console.log(`. Modified On: ${metadata.modifiedOn}`);
        }

        console.log("\n. Creating new version (v2) with additional field...");
        const createVersion: CreateVersion = {
            version: "2.0.0",
            content: {
                content: AVRO_SCHEMA_V2,
                contentType: "application/json"
            }
        };

        const versionResponse = await client.groups.byGroupId(groupId).artifacts.byArtifactId(artifactId).versions.post(createVersion);
        console.log(`. Created version: ${versionResponse?.version}`);

        console.log("\n Listing all versions...");
        const versionsResponse = await client.groups.byGroupId(groupId).artifacts.byArtifactId(artifactId).versions.get();

        if (versionsResponse?.versions) {
            console.log(`. Found ${versionsResponse.versions.length} version(s):`);
            versionsResponse.versions.forEach((version) => {
                console.log(`  - Version ${version.version} (${version.state})`);
                console.log(`    Created: ${version.createdOn}`);
            });
        }

        console.log("\n Retrieving version 1.0.0 content...");
        const v1Content = await client.groups.byGroupId(groupId)
            .artifacts.byArtifactId(artifactId)
            .versions.byVersionExpression("1.0.0")
            .content.get();

        console.log(". Version 1.0.0 schema:");
        console.log(v1Content);

        console.log("\n Retrieving version 2.0.0 content...");
        const v2Content = await client.groups.byGroupId(groupId)
            .artifacts.byArtifactId(artifactId)
            .versions.byVersionExpression("2.0.0")
            .content.get();

        console.log(". Version 2.0.0 schema:");
        console.log(v2Content);

        console.log("\n Example completed successfully!");
        console.log("\n Tip: You can now view this artifact in the Apicurio Registry UI");

    } catch (error) {
        console.error("\n Error:", error);
        process.exit(1);
    }
}

// Run
main();
