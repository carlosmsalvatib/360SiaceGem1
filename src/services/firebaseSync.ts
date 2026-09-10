import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  Unsubscribe
} from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from '../lib/firebase';
import {
  ConfigCMS,
  Proyecto,
  ServicioEspecializado,
  Profesional,
  Usuario
} from '../types';
import {
  INITIAL_CONFIG_CMS,
  INITIAL_PROJECTS,
  INITIAL_SERVICIOS,
  INITIAL_PROFESIONALES,
  INITIAL_USERS
} from '../data/initialData';

// Firestore collection names
export const COLLECTIONS = {
  CONFIG: 'config',
  PROYECTOS: 'proyectos',
  SERVICIOS: 'servicios',
  PROFESIONALES: 'profesionales',
  USUARIOS: 'usuarios',
  LEADS: 'leads'
} as const;

const CONFIG_DOC_ID = 'general';

/**
 * Auto-seeds Firestore with initial defaults if database collections are empty.
 */
export async function seedFirestoreIfEmpty(): Promise<void> {
  try {
    const configDocRef = doc(db, COLLECTIONS.CONFIG, CONFIG_DOC_ID);
    const configSnap = await getDoc(configDocRef);

    if (!configSnap.exists()) {
      console.log('Seeding initial 360 SIACE dataset into Firebase Firestore...');
      const batch = writeBatch(db);

      // Seed Config
      batch.set(configDocRef, INITIAL_CONFIG_CMS);

      // Seed Proyectos
      for (const proyecto of INITIAL_PROJECTS) {
        const pRef = doc(db, COLLECTIONS.PROYECTOS, String(proyecto.id));
        batch.set(pRef, proyecto);
      }

      // Seed Servicios
      for (const servicio of INITIAL_SERVICIOS) {
        const sRef = doc(db, COLLECTIONS.SERVICIOS, String(servicio.id));
        batch.set(sRef, servicio);
      }

      // Seed Profesionales
      for (const profesional of INITIAL_PROFESIONALES) {
        const profRef = doc(db, COLLECTIONS.PROFESIONALES, String(profesional.id));
        batch.set(profRef, profesional);
      }

      // Seed Usuarios
      for (const usuario of INITIAL_USERS) {
        const uRef = doc(db, COLLECTIONS.USUARIOS, String(usuario.id));
        batch.set(uRef, usuario);
      }

      await batch.commit();
      console.log('Firebase Firestore successfully seeded with complete 360 SIACE data.');
    }
  } catch (error) {
    console.error('Error verifying/seeding Firestore:', error);
  }
}

/**
 * Subscribes to real-time updates for ConfigCMS
 */
export function subscribeToConfig(onUpdate: (config: ConfigCMS) => void): Unsubscribe {
  const configDocRef = doc(db, COLLECTIONS.CONFIG, CONFIG_DOC_ID);
  return onSnapshot(
    configDocRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as ConfigCMS);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, `${COLLECTIONS.CONFIG}/${CONFIG_DOC_ID}`);
    }
  );
}

/**
 * Subscribes to real-time updates for Proyectos collection
 */
export function subscribeToProyectos(onUpdate: (proyectos: Proyecto[]) => void): Unsubscribe {
  const colRef = collection(db, COLLECTIONS.PROYECTOS);
  return onSnapshot(
    colRef,
    (snapshot) => {
      if (!snapshot.empty) {
        const items: Proyecto[] = [];
        snapshot.forEach((d) => items.push(d.data() as Proyecto));
        items.sort((a, b) => a.id - b.id);
        onUpdate(items);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, COLLECTIONS.PROYECTOS);
    }
  );
}

/**
 * Subscribes to real-time updates for Servicios collection
 */
export function subscribeToServicios(onUpdate: (servicios: ServicioEspecializado[]) => void): Unsubscribe {
  const colRef = collection(db, COLLECTIONS.SERVICIOS);
  return onSnapshot(
    colRef,
    (snapshot) => {
      if (!snapshot.empty) {
        const items: ServicioEspecializado[] = [];
        snapshot.forEach((d) => items.push(d.data() as ServicioEspecializado));
        items.sort((a, b) => a.numero - b.numero);
        onUpdate(items);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, COLLECTIONS.SERVICIOS);
    }
  );
}

/**
 * Subscribes to real-time updates for Profesionales collection
 */
export function subscribeToProfesionales(onUpdate: (profesionales: Profesional[]) => void): Unsubscribe {
  const colRef = collection(db, COLLECTIONS.PROFESIONALES);
  return onSnapshot(
    colRef,
    (snapshot) => {
      if (!snapshot.empty) {
        const items: Profesional[] = [];
        snapshot.forEach((d) => items.push(d.data() as Profesional));
        items.sort((a, b) => a.orden_visual - b.orden_visual);
        onUpdate(items);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, COLLECTIONS.PROFESIONALES);
    }
  );
}

/**
 * Subscribes to real-time updates for Usuarios collection
 */
export function subscribeToUsuarios(onUpdate: (usuarios: Usuario[]) => void): Unsubscribe {
  const colRef = collection(db, COLLECTIONS.USUARIOS);
  return onSnapshot(
    colRef,
    (snapshot) => {
      if (!snapshot.empty) {
        const items: Usuario[] = [];
        snapshot.forEach((d) => items.push(d.data() as Usuario));
        items.sort((a, b) => a.id - b.id);
        onUpdate(items);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, COLLECTIONS.USUARIOS);
    }
  );
}

// -------------------------------------------------------------
// Mutation Handlers (Writes to Firestore)
// -------------------------------------------------------------

export async function saveConfigToFirestore(config: ConfigCMS): Promise<void> {
  const configDocRef = doc(db, COLLECTIONS.CONFIG, CONFIG_DOC_ID);
  try {
    await setDoc(configDocRef, config, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTIONS.CONFIG}/${CONFIG_DOC_ID}`);
  }
}

export async function saveProyectosToFirestore(proyectos: Proyecto[]): Promise<void> {
  try {
    const colRef = collection(db, COLLECTIONS.PROYECTOS);
    const existingSnap = await getDocs(colRef);
    const batch = writeBatch(db);
    
    const activeIds = new Set(proyectos.map(p => String(p.id)));
    existingSnap.forEach((docSnap) => {
      if (!activeIds.has(docSnap.id)) {
        batch.delete(docSnap.ref);
      }
    });

    for (const p of proyectos) {
      const pRef = doc(db, COLLECTIONS.PROYECTOS, String(p.id));
      batch.set(pRef, p);
    }
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, COLLECTIONS.PROYECTOS);
  }
}

export async function saveSingleProyectoToFirestore(proyecto: Proyecto): Promise<void> {
  const pRef = doc(db, COLLECTIONS.PROYECTOS, String(proyecto.id));
  try {
    await setDoc(pRef, proyecto, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTIONS.PROYECTOS}/${proyecto.id}`);
  }
}

export async function deleteProyectoFromFirestore(proyectoId: number): Promise<void> {
  const pRef = doc(db, COLLECTIONS.PROYECTOS, String(proyectoId));
  try {
    await deleteDoc(pRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTIONS.PROYECTOS}/${proyectoId}`);
  }
}

export async function saveServiciosToFirestore(servicios: ServicioEspecializado[]): Promise<void> {
  try {
    const colRef = collection(db, COLLECTIONS.SERVICIOS);
    const existingSnap = await getDocs(colRef);
    const batch = writeBatch(db);

    const activeIds = new Set(servicios.map(s => String(s.id)));
    existingSnap.forEach((docSnap) => {
      if (!activeIds.has(docSnap.id)) {
        batch.delete(docSnap.ref);
      }
    });

    for (const s of servicios) {
      const sRef = doc(db, COLLECTIONS.SERVICIOS, String(s.id));
      batch.set(sRef, s);
    }
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, COLLECTIONS.SERVICIOS);
  }
}

export async function saveProfesionalesToFirestore(profesionales: Profesional[]): Promise<void> {
  try {
    const colRef = collection(db, COLLECTIONS.PROFESIONALES);
    const existingSnap = await getDocs(colRef);
    const batch = writeBatch(db);

    const activeIds = new Set(profesionales.map(p => String(p.id)));
    existingSnap.forEach((docSnap) => {
      if (!activeIds.has(docSnap.id)) {
        batch.delete(docSnap.ref);
      }
    });

    for (const p of profesionales) {
      const pRef = doc(db, COLLECTIONS.PROFESIONALES, String(p.id));
      batch.set(pRef, p);
    }
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, COLLECTIONS.PROFESIONALES);
  }
}

export async function saveSingleProfesionalToFirestore(profesional: Profesional): Promise<void> {
  const pRef = doc(db, COLLECTIONS.PROFESIONALES, String(profesional.id));
  try {
    await setDoc(pRef, profesional, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTIONS.PROFESIONALES}/${profesional.id}`);
  }
}

export async function deleteProfesionalFromFirestore(profesionalId: number): Promise<void> {
  const pRef = doc(db, COLLECTIONS.PROFESIONALES, String(profesionalId));
  try {
    await deleteDoc(pRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTIONS.PROFESIONALES}/${profesionalId}`);
  }
}

export async function saveUsuariosToFirestore(usuarios: Usuario[]): Promise<void> {
  try {
    const colRef = collection(db, COLLECTIONS.USUARIOS);
    const existingSnap = await getDocs(colRef);
    const batch = writeBatch(db);

    const activeIds = new Set(usuarios.map(u => String(u.id)));
    existingSnap.forEach((docSnap) => {
      if (!activeIds.has(docSnap.id)) {
        batch.delete(docSnap.ref);
      }
    });

    for (const u of usuarios) {
      const uRef = doc(db, COLLECTIONS.USUARIOS, String(u.id));
      batch.set(uRef, u);
    }
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, COLLECTIONS.USUARIOS);
  }
}

export async function saveLeadToFirestore(leadData: {
  nombre: string;
  email: string;
  telefono?: string;
  organizacion?: string;
  servicio_interes?: string;
  mensaje: string;
}): Promise<void> {
  const leadId = `lead_${Date.now()}`;
  const leadRef = doc(db, COLLECTIONS.LEADS, leadId);
  try {
    await setDoc(leadRef, {
      ...leadData,
      id: leadId,
      fecha: new Date().toISOString(),
      estado: 'NUEVO'
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${COLLECTIONS.LEADS}/${leadId}`);
  }
}
