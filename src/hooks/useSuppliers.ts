import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Supplier, SupplierFormData } from '../types/supplier';
import { INITIAL_SUPPLIERS } from '../data/initialSuppliers';
import { cleanPhoneNumber } from '../utils/whatsapp';

const LOCAL_STORAGE_KEY = 'munsi_suppliers_local_v1';

export function useSuppliers(currentUser: User | null, isAuthLoading: boolean) {
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse local storage suppliers:', e);
    }
    return INITIAL_SUPPLIERS;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [syncStatus, setSyncStatus] = useState<'cloud' | 'local' | 'syncing'>('local');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync to localStorage whenever suppliers change in local mode
  useEffect(() => {
    if (!currentUser) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(suppliers));
      } catch (e) {
        console.error('LocalStorage write failed:', e);
      }
    }
  }, [suppliers, currentUser]);

  // Firestore real-time listener when authenticated
  useEffect(() => {
    if (isAuthLoading) return;

    if (!currentUser) {
      // Offline / Guest mode: use local storage
      setSyncStatus('local');
      setIsLoading(false);
      return;
    }

    setSyncStatus('syncing');
    setIsLoading(true);

    const suppliersCol = collection(db, 'suppliers');
    const q = query(suppliersCol, where('ownerId', '==', currentUser.uid));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: Supplier[] = [];
        snapshot.forEach((docSnap) => {
          items.push({
            id: docSnap.id,
            ...(docSnap.data() as Omit<Supplier, 'id'>),
          });
        });

        // Sort by updatedAt descending
        items.sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );

        setSuppliers(items);
        setSyncStatus('cloud');
        setIsLoading(false);
        setErrorMessage(null);
      },
      (error) => {
        setErrorMessage('Failed to sync with cloud database. Falling back to local copy.');
        setSyncStatus('local');
        setIsLoading(false);
        try {
          handleFirestoreError(error, OperationType.LIST, 'suppliers');
        } catch {
          // Handled for UI logging
        }
      }
    );

    return () => unsubscribe();
  }, [currentUser, isAuthLoading]);

  // Add Supplier
  const addSupplier = useCallback(
    async (formData: SupplierFormData): Promise<Supplier> => {
      const newId = `supp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const now = new Date().toISOString();
      const cleanPhone = cleanPhoneNumber(formData.phone);

      const newSupplier: Supplier = {
        id: newId,
        ownerId: currentUser ? currentUser.uid : 'local-user',
        name: formData.name.trim(),
        companyName: formData.companyName?.trim() || '',
        phone: formData.phone.trim(),
        cleanPhone,
        facebookUrl: formData.facebookUrl?.trim() || '',
        location: formData.location?.trim() || '',
        categories: formData.categories.length > 0 ? formData.categories : ['Other'],
        pricingCatalog: formData.pricingCatalog?.trim() || '',
        rating: Math.max(1, Math.min(5, Number(formData.rating) || 5)),
        notes: formData.notes?.trim() || '',
        tags: formData.tags || [],
        createdAt: now,
        updatedAt: now,
      };

      if (currentUser) {
        try {
          const docRef = doc(db, 'suppliers', newId);
          await setDoc(docRef, {
            ownerId: newSupplier.ownerId,
            name: newSupplier.name,
            companyName: newSupplier.companyName,
            phone: newSupplier.phone,
            cleanPhone: newSupplier.cleanPhone,
            facebookUrl: newSupplier.facebookUrl,
            location: newSupplier.location,
            categories: newSupplier.categories,
            pricingCatalog: newSupplier.pricingCatalog,
            rating: newSupplier.rating,
            notes: newSupplier.notes,
            tags: newSupplier.tags,
            createdAt: newSupplier.createdAt,
            updatedAt: newSupplier.updatedAt,
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, `suppliers/${newId}`);
        }
      } else {
        setSuppliers((prev) => [newSupplier, ...prev]);
      }

      return newSupplier;
    },
    [currentUser]
  );

  // Update Supplier
  const updateSupplier = useCallback(
    async (id: string, formData: Partial<SupplierFormData>): Promise<void> => {
      const now = new Date().toISOString();
      const cleanPhone = formData.phone ? cleanPhoneNumber(formData.phone) : undefined;

      if (currentUser) {
        try {
          const docRef = doc(db, 'suppliers', id);
          const updatePayload: Record<string, unknown> = {
            updatedAt: now,
          };
          if (formData.name !== undefined) updatePayload.name = formData.name.trim();
          if (formData.companyName !== undefined) updatePayload.companyName = formData.companyName.trim();
          if (formData.phone !== undefined) {
            updatePayload.phone = formData.phone.trim();
            updatePayload.cleanPhone = cleanPhone;
          }
          if (formData.facebookUrl !== undefined) updatePayload.facebookUrl = formData.facebookUrl.trim();
          if (formData.location !== undefined) updatePayload.location = formData.location.trim();
          if (formData.categories !== undefined) updatePayload.categories = formData.categories;
          if (formData.pricingCatalog !== undefined) updatePayload.pricingCatalog = formData.pricingCatalog.trim();
          if (formData.rating !== undefined) updatePayload.rating = Number(formData.rating);
          if (formData.notes !== undefined) updatePayload.notes = formData.notes.trim();
          if (formData.tags !== undefined) updatePayload.tags = formData.tags;

          await updateDoc(docRef, updatePayload);
        } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, `suppliers/${id}`);
        }
      } else {
        setSuppliers((prev) =>
          prev.map((s) => {
            if (s.id !== id) return s;
            return {
              ...s,
              ...formData,
              cleanPhone: cleanPhone || s.cleanPhone,
              updatedAt: now,
            };
          })
        );
      }
    },
    [currentUser]
  );

  // Delete Supplier
  const deleteSupplier = useCallback(
    async (id: string): Promise<void> => {
      if (currentUser) {
        try {
          const docRef = doc(db, 'suppliers', id);
          await deleteDoc(docRef);
        } catch (error) {
          handleFirestoreError(error, OperationType.DELETE, `suppliers/${id}`);
        }
      } else {
        setSuppliers((prev) => prev.filter((s) => s.id !== id));
      }
    },
    [currentUser]
  );

  // Sync / Migrate local suppliers into Cloud
  const migrateLocalToCloud = useCallback(async () => {
    if (!currentUser) return;
    try {
      setSyncStatus('syncing');
      const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
      const itemsToSync: Supplier[] = localData ? JSON.parse(localData) : suppliers;

      for (const item of itemsToSync) {
        const newId = `supp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const docRef = doc(db, 'suppliers', newId);
        await setDoc(docRef, {
          ...item,
          id: newId,
          ownerId: currentUser.uid,
          updatedAt: new Date().toISOString(),
        });
      }
      setSyncStatus('cloud');
    } catch (e) {
      console.error('Migration to Cloud failed:', e);
    }
  }, [currentUser, suppliers]);

  // Reset to Demo data
  const resetToDemo = useCallback(() => {
    if (!currentUser) {
      setSuppliers(INITIAL_SUPPLIERS);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_SUPPLIERS));
    }
  }, [currentUser]);

  return {
    suppliers,
    isLoading,
    syncStatus,
    errorMessage,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    migrateLocalToCloud,
    resetToDemo,
  };
}
