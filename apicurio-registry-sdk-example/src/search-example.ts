import { RegistryClientFactory } from "@apicurio/apicurio-registry-sdk";
import { SortOrder } from "@apicurio/apicurio-registry-sdk";

async function main() {
    const registryUrl = process.env.REGISTRY_URL || "http://localhost:8080/apis/registry/v3/";

    console.log("=== Apicurio Registry SDK - Search Example ===\n");
    console.log(`Registry: ${registryUrl}\n`);

    try {
        const client = RegistryClientFactory.createRegistryClient(registryUrl);

        console.log(". Searching for all artifacts...");
        const allArtifacts = await client.search.artifacts.get();

        if (allArtifacts?.artifacts) {
            console.log(`. Found ${allArtifacts.count} artifact(s)`);

            if (allArtifacts.artifacts.length > 0) {
                console.log("\nArtifacts:");
                allArtifacts.artifacts.forEach((artifact, index) => {
                    console.log(`  ${index + 1}. ${artifact.groupId}/${artifact.artifactId}`);
                    console.log(`     Type: ${artifact.artifactType}`);
                    if (artifact.name) {
                        console.log(`     Name: ${artifact.name}`);
                    }
                    if (artifact.description) {
                        console.log(`     Description: ${artifact.description}`);
                    }
                    console.log(`     Modified: ${artifact.modifiedOn}`);
                    console.log("");
                });
            }
        }

        console.log("\n. Searching for artifacts with name containing 'user'...");
        const userArtifacts = await client.search.artifacts.get({
            queryParameters: {
                name: "user",
                order: SortOrder.Asc,
                orderby: "name"
            }
        });

        if (userArtifacts?.artifacts) {
            console.log(`. Found ${userArtifacts.count} matching artifact(s)`);

            userArtifacts.artifacts.forEach((artifact, index) => {
                console.log(`  ${index + 1}. ${artifact.groupId}/${artifact.artifactId}`);
                console.log(`     Name: ${artifact.name}`);
            });
        }

        console.log("\n. Searching with pagination (limit: 5)...");
        const paginatedResults = await client.search.artifacts.get({
            queryParameters: {
                limit: 5,
                offset: 0,
                order: SortOrder.Desc,
                orderby: "createdOn"
            }
        });

        if (paginatedResults?.artifacts) {
            console.log(`. Showing ${paginatedResults.artifacts.length} of ${paginatedResults.count} total artifact(s)`);

            paginatedResults.artifacts.forEach((artifact, index) => {
                console.log(`  ${index + 1}. ${artifact.groupId}/${artifact.artifactId}`);
                console.log(`     Created: ${artifact.createdOn}`);
            });
        }

        // Example 4: Search by artifact type
        console.log("\n. Searching for AVRO artifacts...");
        const avroArtifacts = await client.search.artifacts.get({
            queryParameters: {
                artifactType: "AVRO"
            }
        });

        if (avroArtifacts?.artifacts) {
            console.log(`. Found ${avroArtifacts.count} AVRO artifact(s)`);
        }

        // Example 5: Search by group
        const groupId = process.env.GROUP_ID || "example-group";
        console.log(`\n. Searching for artifacts in group '${groupId}'...`);
        const groupArtifacts = await client.search.artifacts.get({
            queryParameters: {
                groupId: groupId
            }
        });

        if (groupArtifacts?.artifacts) {
            console.log(`. Found ${groupArtifacts.count} artifact(s) in this group`);

            groupArtifacts.artifacts.forEach((artifact, index) => {
                console.log(`  ${index + 1}. ${artifact.artifactId} (${artifact.artifactType})`);
            });
        }

        console.log("\n Example completed successfully!");

    } catch (error) {
        console.error("\n Error:", error);
        process.exit(1);
    }
}

main();
