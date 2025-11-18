import { appwriteAccount, appwriteDatabases, appwrite_config } from "./client";
import { type Models, Query } from "appwrite";

// User roles enum (matching WORKERS.role in schema)
export enum UserRole {
    CASHIER = "cashier",
    WAITSTAFF = "waitstaff",
    ADMIN = "admin"
}

// Worker profile interface (matching WORKERS table schema)
export interface WorkerProfile {
    $id: string;
    name: string;
    role: UserRole;
    branch_id?: string;
    created_at: string;
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
    workerProfile?: WorkerProfile;
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

        // Step 1: Create email/password session with Appwrite Auth
        const session = await appwriteAccount.createEmailPasswordSession({
            email: email,
            password: password
        });

        // Step 2: Get current authenticated user
        const user = await appwriteAccount.get();

        // Step 3: Query WORKERS collection to get worker profile and verify role
        try {
            // @ts-ignore - using deprecated API until SDK is updated
            const response = await appwriteDatabases.listDocuments(
                appwrite_config.databaseId,
                appwrite_config.workersCollectionId,
                [
                    Query.equal('$id', user.$id) // Match worker by Appwrite user ID
                ]
            );

            // Check if worker exists
            if (response.documents.length === 0) {
                await appwriteAccount.deleteSession({ sessionId: "current" });
                return {
                    success: false,
                    error: "Worker profile not found. Please contact administrator.",
                };
            }

            const workerProfile = response.documents[0] as unknown as WorkerProfile;

            // Step 4: Verify the role matches what user selected
            if (workerProfile.role !== role) {
                await appwriteAccount.deleteSession({ sessionId: "current" });
                return {
                    success: false,
                    error: `Access denied. Your account role is '${workerProfile.role}', not '${role}'.`,
                };
            }

            // Step 5: Store worker info in user preferences for quick access
            await appwriteAccount.updatePrefs({
                prefs: {
                    role: workerProfile.role,
                    workerId: workerProfile.$id,
                    workerName: workerProfile.name,
                    branchId: workerProfile.branch_id || null
                }
            });

            return {
                success: true,
                user,
                session,
                workerProfile,
            };
        } catch (dbError: any) {
            console.error("Database query error:", dbError);
            await appwriteAccount.deleteSession({ sessionId: "current" });
            return {
                success: false,
                error: "Failed to verify worker profile. Please try again.",
            };
        }
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
        await appwriteAccount.deleteSession({ sessionId: "current" });
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
 * Get the currently logged-in worker with their profile
 * @returns Current user with worker profile or null if not authenticated
 */
export const getCurrentUser = async (): Promise<{
    user: Models.User<Models.Preferences> | null;
    role: UserRole | null;
    workerProfile: WorkerProfile | null;
}> => {
    try {
        const user = await appwriteAccount.get();
        const role = (user.prefs.role as UserRole) || null;
        const workerId = user.prefs.workerId as string;
        
        let workerProfile = null;
        
        if (workerId) {
            try {
                // Fetch fresh worker profile from database
                const response = await appwriteDatabases.getDocument(
                    {
                        databaseId: appwrite_config.databaseId,
                        collectionId: appwrite_config.workersCollectionId,
                        documentId: workerId
                    }
                );
                workerProfile = response as unknown as WorkerProfile;
            } catch (error) {
                console.error("Failed to fetch worker profile:", error);
            }
        }

        return { user, role, workerProfile };
    } catch (error) {
        return { user: null, role: null, workerProfile: null };
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

