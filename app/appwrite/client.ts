export const appwrite_config = {
    projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID!,
    apiKey: import.meta.env.VITE_APPWRITE_API_KEY!,
    databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID!,
    apiEndpoint: import.meta.env.VITE_APPWRITE_API_ENDPOINT!,
    studentsCollectionId: import.meta.env.VITE_APPWRITE_STUDENTS_COLLECTION_ID!,
    workersCollectionId: import.meta.env.VITE_APPWRITE_WORKERS_COLLECTION_ID!,
    subscriptionsCollectionId: import.meta.env.VITE_APPWRITE_SUBSCRIPTIONS_COLLECTION_ID!,
    mealsLogsCollectionId: import.meta.env.VITE_APPWRITE_MEALS_LOGS_COLLECTION_ID!,
    branchesCollectionId: import.meta.env.VITE_APPWRITE_BRANCHES_COLLECTION_ID!,
};

import { Client, Databases, Account } from "appwrite";
const client = new Client();

client
    .setEndpoint(appwrite_config.apiEndpoint) // Your API Endpoint
    .setProject(appwrite_config.projectId); // Your project ID

export const appwriteClient = client;
export const appwriteDatabases = new Databases(client);
export const appwriteAccount = new Account(client);
