import { appwriteAccount, appwriteDatabases, appwrite_config } from "./client";
import { Account, Client ,ID, type Models } from "appwrite";

// User roles enum
export enum UserRole {
    STUDENT = "student",
    WORKER = "worker",
    ADMIN = "admin"
}

// Types for authentication
export interface LoginData {
    email: string;
    password: string;
    role: UserRole;
}

export interface LoginResponse {
    success: boolean;
    user?: Models.User<Models.Preferences>;
    session?: Models.Session;
    userProfile?: any;
    error?: string;
}

/**
 * Login function that authenticates user by email, password, and role
 * @param data - Login credentials including email, password, and role
 * @returns LoginResponse with user, session, and profile data or error
 */

export const login = async (data: LoginData): Promise<LoginResponse> => {
    try {
        const { email, password, role } = data;

        // Step 1: Create email/password session
        const session = await appwriteAccount.createEmailPasswordSession({
            email: email,
            password: password
        });

        // Step 2: Get current user from Appwrite
        const user = await appwriteAccount.get();

        // Step 3: Verify user exists in the appropriate collection based on role
        let userProfile = null;
        let collectionId = "";

        switch (role) {
            case UserRole.STUDENT:
                collectionId = appwrite_config.studentsCollectionId;
                break;
            case UserRole.WORKER:
                collectionId = appwrite_config.workersCollectionId;
                break;
            case UserRole.ADMIN:
                // Admin might not have a specific collection, use preferences or custom logic
                collectionId = appwrite_config.workersCollectionId; // or a separate admin collection
                break;
            default:
                throw new Error("Invalid role specified");
        }

        // Step 4: Fetch user profile from the database using email
        try {
            const response = await appwriteDatabases.listDocuments(
                appwrite_config.databaseId,
                collectionId,
                // Query to find user by email
                [
                    // You may need to adjust this query based on your schema
                    // This assumes you have an 'email' attribute in your collections
                ]
            );

            // Find matching user by email
            userProfile = response.documents.find(
                (doc: any) => doc.email?.toLowerCase() === email.toLowerCase()
            );

            if (!userProfile) {
                // User authenticated but not found in the specified role collection
                await appwriteAccount.deleteSession("current");
                return {
                    success: false,
                    error: `No ${role} account found with this email`,
                };
            }
        } catch (dbError: any) {
            console.error("Database query error:", dbError);
            await appwriteAccount.deleteSession("current");
            return {
                success: false,
                error: "Failed to verify user role",
            };
        }

        // Step 5: Store role in user preferences for future reference
        await appwriteAccount.updatePrefs({ role });

        return {
            success: true,
            user,
            session,
            userProfile,
        };
    } catch (error: any) {
        console.error("Login error:", error);
        
        // Handle specific error messages
        let errorMessage = "Failed to login";
        if (error.code === 401) {
            errorMessage = "Invalid email or password";
        } else if (error.message) {
            errorMessage = error.message;
        }

        return {
            success: false,
            error: errorMessage,
        };
    }
};

/**
 * Sign out the current user
 * @returns Success status or error
 */
export const logout = async (): Promise<{ success: boolean; error?: string }> => {
    try {
        await appwriteAccount.deleteSession("current");
        return { success: true };
    } catch (error: any) {
        console.error("Logout error:", error);
        return {
            success: false,
            error: error.message || "Failed to logout",
        };
    }
};

/**
 * Get the currently logged-in user with their role
 * @returns Current user with profile or null if not authenticated
 */
export const getCurrentUser = async (): Promise<{
    user: Models.User<Models.Preferences> | null;
    role: UserRole | null;
    profile: any | null;
}> => {
    try {
        const user = await appwriteAccount.get();
        const role = (user.prefs.role as UserRole) || null;
        
        let profile = null;
        if (role) {
            let collectionId = "";
            switch (role) {
                case UserRole.STUDENT:
                    collectionId = appwrite_config.studentsCollectionId;
                    break;
                case UserRole.WORKER:
                    collectionId = appwrite_config.workersCollectionId;
                    break;
                case UserRole.ADMIN:
                    collectionId = appwrite_config.workersCollectionId;
                    break;
            }

            if (collectionId) {
                const response = await appwriteDatabases.listDocuments(
                    appwrite_config.databaseId,
                    collectionId
                );
                profile = response.documents.find(
                    (doc: any) => doc.email?.toLowerCase() === user.email.toLowerCase()
                );
            }
        }

        return { user, role, profile };
    } catch (error) {
        return { user: null, role: null, profile: null };
    }
};

/**
 * Check if user is authenticated
 * @returns Boolean indicating authentication status
 */
export const isAuthenticated = async (): Promise<boolean> => {
    try {
        await appwriteAccount.get();
        return true;
    } catch (error) {
        return false;
    }
};

