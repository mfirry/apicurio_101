import { RegistryClientFactory } from "@apicurio/apicurio-registry-sdk";

async function main() {
    const registryUrl = process.env.REGISTRY_URL || "http://localhost:8080/apis/registry/v3/";

    console.log("=== Apicurio Registry SDK - Basic Example ===\n");
    console.log(`Connecting to: ${registryUrl}`);

    try {
        // Create the registry client
        const client = RegistryClientFactory.createRegistryClient(registryUrl);

        // Get system information
        console.log("\n Fetching system information...");
        const systemInfo = await client.system.info.get();

        if (systemInfo) {
            console.log(`. Name: ${systemInfo.name}`);
            console.log(`. Description: ${systemInfo.description}`);
            console.log(`. Version: ${systemInfo.version}`);
            console.log(`. Built On: ${systemInfo.builtOn}`);
        }

        console.log("\n Fetching groups...");
        const groupsResponse = await client.groups.get();

        if (groupsResponse?.groups) {
            console.log(`. Found ${groupsResponse.groups.length} group(s)`);

            if (groupsResponse.groups.length > 0) {
                console.log("\nGroups:");
                groupsResponse.groups.forEach((group, index) => {
                    console.log(`  ${index + 1}. ${group.groupId}`);
                    if (group.description) {
                        console.log(`     Description: ${group.description}`);
                    }
                });
            } else {
                console.log("  (No groups found)");
            }
        }

        console.log("\n Example completed successfully!");

    } catch (error) {
        console.error("\n Error:", error);
        process.exit(1);
    }
}

main();
