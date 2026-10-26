import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  writeBatch,
} from 'firebase/firestore';
import { db, auth } from './firebase';
import {
  User,
  Role,
  Task,
  Client,
  Project,
  AttendanceRecord,
  HourlyVerification,
  ActivityLogItem,
  ContentPost,
  Ticket,
  AdCampaign,
  ProfileChangeRequest,
  ChatMessage,
  ChatChannel,
} from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('[Firestore Error]:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Complete Collection references
export const collections = {
  users: collection(db, 'users'),
  roles: collection(db, 'roles'),
  tasks: collection(db, 'tasks'),
  clients: collection(db, 'clients'),
  projects: collection(db, 'projects'),
  attendance: collection(db, 'attendance'),
  hourlyVerifications: collection(db, 'hourlyVerifications'),
  activityLogs: collection(db, 'activityLogs'),
  contentPosts: collection(db, 'contentPosts'),
  tickets: collection(db, 'tickets'),
  campaigns: collection(db, 'campaigns'),
  profileRequests: collection(db, 'profileRequests'),
  chatMessages: collection(db, 'chatMessages'),
  chatChannels: collection(db, 'chatChannels'),
};

// Generic Firestore Realtime Listener
export function subscribeToCollection<T>(
  collectionName: keyof typeof collections,
  onUpdate: (data: T[]) => void,
  onError?: (error: Error) => void
) {
  const q = query(collections[collectionName]);
  return onSnapshot(
    q,
    (snapshot) => {
      const items: T[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as T);
      });
      onUpdate(items);
    },
    (err) => {
      console.warn(`[Firestore] Subscription error for ${collectionName}:`, err);
      if (onError) onError(err);
    }
  );
}

// User Profile Operations
export async function getFirestoreUser(userId: string): Promise<User | null> {
  const path = `users/${userId}`;
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() } as User;
    }
    return null;
  } catch (err) {
    console.error('[Firestore] Error getting user:', err);
    return null;
  }
}

export async function setFirestoreUser(user: User): Promise<void> {
  const path = `users/${user.id}`;
  try {
    const userRef = doc(db, 'users', user.id);
    await setDoc(userRef, { ...user, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// Generic Document Operations
export async function saveDocument<T extends { id: string }>(
  collectionName: keyof typeof collections,
  item: T
): Promise<void> {
  const path = `${collectionName}/${item.id}`;
  try {
    const docRef = doc(db, collectionName, item.id);
    await setDoc(docRef, { ...item, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function updateDocument(
  collectionName: keyof typeof collections,
  id: string,
  updates: Record<string, any>
): Promise<void> {
  const path = `${collectionName}/${id}`;
  try {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, { ...updates, updatedAt: new Date().toISOString() });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deleteDocument(
  collectionName: keyof typeof collections,
  id: string
): Promise<void> {
  const path = `${collectionName}/${id}`;
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// Seed System Structural Roles (Only runs if Firestore roles collection is empty)
export async function checkAndSeedSystemRoles(initialRoles: Role[]): Promise<void> {
  try {
    const rolesSnapshot = await getDocs(collections.roles);
    if (rolesSnapshot.empty) {
      console.log('[Firestore] Seeding system role definitions into Firestore...');
      const batch = writeBatch(db);
      for (const role of initialRoles) {
        const ref = doc(db, 'roles', role.id);
        batch.set(ref, role);
      }
      await batch.commit();
      console.log('[Firestore] System roles seeded successfully.');
    }
  } catch (err) {
    console.warn('[Firestore] Error verifying/seeding system roles:', err);
  }
}

export async function checkAndSeedFirestore(rolesList: Role[], _usersList?: User[]): Promise<void> {
  await checkAndSeedSystemRoles(rolesList);
}
