"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReflectMemory = void 0;
const n8n_workflow_1 = require("n8n-workflow");
class ReflectMemory {
    description = {
        displayName: "Reflect Memory",
        name: "reflectMemory",
        icon: "file:reflectMemory.svg",
        group: ["transform"],
        version: 1,
        subtitle: '={{$parameter["operation"]}}',
        description: "Read, write, browse, and search memories in Reflect Memory",
        defaults: {
            name: "Reflect Memory",
        },
        inputs: [n8n_workflow_1.NodeConnectionTypes.Main],
        outputs: [n8n_workflow_1.NodeConnectionTypes.Main],
        credentials: [
            {
                name: "reflectMemoryApi",
                required: true,
            },
        ],
        usableAsTool: true,
        properties: [
            {
                displayName: "Operation",
                name: "operation",
                type: "options",
                noDataExpression: true,
                options: [
                    {
                        name: "Browse",
                        value: "browse",
                        description: "Browse memory summaries (paginated)",
                        action: "Browse memory summaries",
                    },
                    {
                        name: "Get by ID",
                        value: "getById",
                        description: "Retrieve a memory by its UUID",
                        action: "Retrieve a memory by its UUID",
                    },
                    {
                        name: "Get by Tag",
                        value: "getByTag",
                        description: "Get memories filtered by tags",
                        action: "Get memories filtered by tags",
                    },
                    {
                        name: "Get Latest",
                        value: "getLatest",
                        description: "Get the most recent memory",
                        action: "Get the most recent memory",
                    },
                    {
                        name: "Write",
                        value: "write",
                        description: "Create a new memory",
                        action: "Create a new memory",
                    },
                ],
                default: "getLatest",
            },
            // --- Get Latest ---
            {
                displayName: "Tag",
                name: "tag",
                type: "string",
                default: "",
                description: "Optional tag to filter by",
                displayOptions: { show: { operation: ["getLatest"] } },
            },
            // --- Get by ID ---
            {
                displayName: "Memory ID",
                name: "memoryId",
                type: "string",
                default: "",
                required: true,
                description: "The UUID of the memory to retrieve",
                displayOptions: { show: { operation: ["getById"] } },
            },
            // --- Browse ---
            {
                displayName: "Limit",
                name: "limit",
                type: "number",
                default: 50,
                description: "Max number of results to return",
                typeOptions: { minValue: 1, maxValue: 200 },
                displayOptions: { show: { operation: ["browse"] } },
            },
            {
                displayName: "Offset",
                name: "offset",
                type: "number",
                default: 0,
                description: "Number of results to skip",
                typeOptions: { minValue: 0 },
                displayOptions: { show: { operation: ["browse"] } },
            },
            // --- Get by Tag ---
            {
                displayName: "Tags",
                name: "tags",
                type: "string",
                default: "",
                required: true,
                description: "Comma-separated list of tags to filter by",
                displayOptions: { show: { operation: ["getByTag"] } },
            },
            {
                displayName: "Limit",
                name: "tagLimit",
                type: "number",
                default: 20,
                description: "Max number of results to return",
                typeOptions: { minValue: 1, maxValue: 100 },
                displayOptions: { show: { operation: ["getByTag"] } },
            },
            {
                displayName: "Offset",
                name: "tagOffset",
                type: "number",
                default: 0,
                description: "Number of results to skip",
                typeOptions: { minValue: 0 },
                displayOptions: { show: { operation: ["getByTag"] } },
            },
            // --- Write ---
            {
                displayName: "Title",
                name: "title",
                type: "string",
                default: "",
                required: true,
                description: "Short title for the memory",
                displayOptions: { show: { operation: ["write"] } },
            },
            {
                displayName: "Content",
                name: "content",
                type: "string",
                default: "",
                required: true,
                typeOptions: { rows: 5 },
                description: "The memory content",
                displayOptions: { show: { operation: ["write"] } },
            },
            {
                displayName: "Tags",
                name: "writeTags",
                type: "string",
                default: "",
                description: "Comma-separated tags for categorization",
                displayOptions: { show: { operation: ["write"] } },
            },
            {
                displayName: "Allowed Vendors",
                name: "allowedVendors",
                type: "string",
                default: "*",
                description: 'Comma-separated vendor names that can see this memory, or "*" for all',
                displayOptions: { show: { operation: ["write"] } },
            },
        ],
    };
    async execute() {
        const items = this.getInputData();
        const returnData = [];
        const credentials = await this.getCredentials("reflectMemoryApi");
        const baseUrl = credentials.baseUrl.replace(/\/$/, "");
        for (let i = 0; i < items.length; i++) {
            const operation = this.getNodeParameter("operation", i);
            let responseData;
            try {
                switch (operation) {
                    case "getLatest": {
                        const tag = this.getNodeParameter("tag", i, "");
                        const qs = tag ? `?tag=${encodeURIComponent(tag)}` : "";
                        responseData = await this.helpers.httpRequestWithAuthentication.call(this, "reflectMemoryApi", {
                            method: "GET",
                            url: `${baseUrl}/agent/memories/latest${qs}`,
                            json: true,
                        });
                        break;
                    }
                    case "getById": {
                        const memoryId = this.getNodeParameter("memoryId", i);
                        responseData = await this.helpers.httpRequestWithAuthentication.call(this, "reflectMemoryApi", {
                            method: "GET",
                            url: `${baseUrl}/agent/memories/${memoryId}`,
                            json: true,
                        });
                        break;
                    }
                    case "browse": {
                        const limit = this.getNodeParameter("limit", i);
                        const offset = this.getNodeParameter("offset", i);
                        responseData = await this.helpers.httpRequestWithAuthentication.call(this, "reflectMemoryApi", {
                            method: "POST",
                            url: `${baseUrl}/agent/memories/browse`,
                            body: { limit, offset },
                            json: true,
                        });
                        break;
                    }
                    case "getByTag": {
                        const tagsStr = this.getNodeParameter("tags", i);
                        const tags = tagsStr.split(",").map((t) => t.trim()).filter(Boolean);
                        const limit = this.getNodeParameter("tagLimit", i);
                        const offset = this.getNodeParameter("tagOffset", i);
                        responseData = await this.helpers.httpRequestWithAuthentication.call(this, "reflectMemoryApi", {
                            method: "POST",
                            url: `${baseUrl}/agent/memories/by-tag`,
                            body: { tags, limit, offset },
                            json: true,
                        });
                        break;
                    }
                    case "write": {
                        const title = this.getNodeParameter("title", i);
                        const content = this.getNodeParameter("content", i);
                        const tagsStr = this.getNodeParameter("writeTags", i, "");
                        const tags = tagsStr
                            ? tagsStr.split(",").map((t) => t.trim()).filter(Boolean)
                            : [];
                        const vendorsStr = this.getNodeParameter("allowedVendors", i, "*");
                        const allowed_vendors = vendorsStr
                            .split(",")
                            .map((v) => v.trim())
                            .filter(Boolean);
                        responseData = await this.helpers.httpRequestWithAuthentication.call(this, "reflectMemoryApi", {
                            method: "POST",
                            url: `${baseUrl}/agent/memories`,
                            body: { title, content, tags, allowed_vendors },
                            json: true,
                        });
                        break;
                    }
                    default:
                        responseData = {};
                }
                if (Array.isArray(responseData)) {
                    returnData.push(...responseData.map((item) => ({ json: item })));
                }
                else {
                    returnData.push({ json: responseData ?? {} });
                }
            }
            catch (error) {
                if (this.continueOnFail()) {
                    returnData.push({
                        json: { error: error.message },
                        pairedItem: { item: i },
                    });
                    continue;
                }
                throw error;
            }
        }
        return [returnData];
    }
}
exports.ReflectMemory = ReflectMemory;
