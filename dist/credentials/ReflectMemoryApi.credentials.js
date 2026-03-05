"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReflectMemoryApi = void 0;
class ReflectMemoryApi {
    name = "reflectMemoryApi";
    displayName = "Reflect Memory API";
    documentationUrl = "https://reflectmemory.com/docs";
    icon = { light: "file:../nodes/ReflectMemory/reflectMemory.svg", dark: "file:../nodes/ReflectMemory/reflectMemory.svg" };
    properties = [
        {
            displayName: "API Key",
            name: "apiKey",
            type: "string",
            typeOptions: { password: true },
            default: "",
            required: true,
            description: "Your Reflect Memory agent API key (RM_AGENT_KEY_*)",
        },
        {
            displayName: "Base URL",
            name: "baseUrl",
            type: "string",
            default: "https://api.reflectmemory.com",
            description: "Base URL of your Reflect Memory instance",
        },
    ];
    authenticate = {
        type: "generic",
        properties: {
            headers: {
                Authorization: "=Bearer {{$credentials.apiKey}}",
            },
        },
    };
    test = {
        request: {
            baseURL: "={{$credentials.baseUrl}}",
            url: "/agent/memories/latest",
            method: "GET",
        },
    };
}
exports.ReflectMemoryApi = ReflectMemoryApi;
