import React, { createContext, useContext, useReducer, useEffect, useState, useCallback, useRef } from 'react';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';
import type {
  MetrikaData, Lancamento, Custo, Cliente, Produto,
  Pessoa, Lead, Demanda, Meta
} from '../data/mockData';
import { defaultData } from '../data/mockData';

const ADMIN_EMAIL = 'arthur.haag2511@gmail.com';
const FIRESTORE_DOC = doc(db, 'metrika', 'data');

type Action =
  | { type: 'LOAD'; payload: MetrikaData }
  | { type: 'ADD_LANCAMENTO'; payload: Lancamento }
  | { type: 'DELETE_LANCAMENTO'; payload: string }
  | { type: 'ADD_CUSTO'; payload: Custo }
  | { type: 'DELETE_CUSTO'; payload: string }
  | { type: 'ADD_CLIENTE'; payload: Cliente }
  | { type: 'UPDATE_CLIENTE'; payload: Cliente }
  | { type: 'DELETE_CLIENTE'; payload: string }
  | { type: 'ADD_PRODUTO'; payload: Produto }
  | { type: 'UPDATE_PRODUTO'; payload: Produto }
  | { type: 'DELETE_PRODUTO'; payload: string }
  | { type: 'ADD_PESSOA'; payload: Pessoa }
  | { type: 'UPDATE_PESSOA'; payload: Pessoa }
  | { type: 'DELETE_PESSOA'; payload: string }
  | { type: 'ADD_LEAD'; payload: Lead }
  | { type: 'UPDATE_LEAD'; payload: Lead }
  | { type: 'DELETE_LEAD'; payload: string }
  | { type: 'ADD_DEMANDA'; payload: Demanda }
  | { type: 'UPDATE_DEMANDA'; payload: Demanda }
  | { type: 'DELETE_DEMANDA'; payload: string }
  | { type: 'SET_METAS'; payload: Meta[] }
  | { type: 'SET_META_FATURAMENTO'; payload: number }
  | { type: 'SET_META_NOVOS_CLIENTES'; payload: number };

function reducer(state: MetrikaData, action: Action): MetrikaData {
  switch (action.type) {
    case 'LOAD': return action.payload;
    case 'ADD_LANCAMENTO': return { ...state, lancamentos: [...state.lancamentos, action.payload] };
    case 'DELETE_LANCAMENTO': return { ...state, lancamentos: state.lancamentos.filter(l => l.id !== action.payload) };
    case 'ADD_CUSTO': return { ...state, custos: [...state.custos, action.payload] };
    case 'DELETE_CUSTO': return { ...state, custos: state.custos.filter(c => c.id !== action.payload) };
    case 'ADD_CLIENTE': return { ...state, clientes: [...state.clientes, action.payload] };
    case 'UPDATE_CLIENTE': return { ...state, clientes: state.clientes.map(c => c.id === action.payload.id ? action.payload : c) };
    case 'DELETE_CLIENTE': return { ...state, clientes: state.clientes.filter(c => c.id !== action.payload) };
    case 'ADD_PRODUTO': return { ...state, produtos: [...state.produtos, action.payload] };
    case 'UPDATE_PRODUTO': return { ...state, produtos: state.produtos.map(p => p.id === action.payload.id ? action.payload : p) };
    case 'DELETE_PRODUTO': return { ...state, produtos: state.produtos.filter(p => p.id !== action.payload) };
    case 'ADD_PESSOA': return { ...state, pessoas: [...state.pessoas, action.payload] };
    case 'UPDATE_PESSOA': return { ...state, pessoas: state.pessoas.map(p => p.id === action.payload.id ? action.payload : p) };
    case 'DELETE_PESSOA': return { ...state, pessoas: state.pessoas.filter(p => p.id !== action.payload) };
    case 'ADD_LEAD': return { ...state, leads: [...state.leads, action.payload] };
    case 'UPDATE_LEAD': return { ...state, leads: state.leads.map(l => l.id === action.payload.id ? action.payload : l) };
    case 'DELETE_LEAD': return { ...state, leads: state.leads.filter(l => l.id !== action.payload) };
    case 'ADD_DEMANDA': return { ...state, demandas: [...state.demandas, action.payload] };
    case 'UPDATE_DEMANDA': return { ...state, demandas: state.demandas.map(d => d.id === action.payload.id ? action.payload : d) };
    case 'DELETE_DEMANDA': return { ...state, demandas: state.demandas.filter(d => d.id !== action.payload) };
    case 'SET_METAS': return { ...state, metas: action.payload };
    case 'SET_META_FATURAMENTO': return { ...state, metaFaturamento: action.payload };
    case 'SET_META_NOVOS_CLIENTES': return { ...state, metaNovosClientes: action.payload };
    default: return state;
  }
}

interface DataContextType {
  data: MetrikaData;
  dispatch: React.Dispatch<Action>;
  isAdmin: boolean;
  loaded: boolean;
  migrateFromLocalStorage: () => Promise<boolean>;
  forceWrite: () => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [data, dispatchRaw] = useReducer(reducer, defaultData);
  const [loaded, setLoaded] = useState(false);

  // pendingWrite: true when the user made local changes not yet confirmed by Firestore.
  // While true, we block LOAD from Firestore so the snapshot from our own write
  // doesn't overwrite still-pending in-memory state (e.g. bulk lead imports).
  const pendingWrite = useRef(false);
  const writeInProgress = useRef(false);
  // dataRef always holds latest data so forceWrite can access it without stale closure
  const dataRef = useRef(data);
  useEffect(() => { dataRef.current = data; }, [data]);

  const isAdmin = user?.email === ADMIN_EMAIL;

  // Load from Firestore and listen for real-time updates.
  // Only applies LOAD when there are no pending local writes to avoid overwriting
  // in-flight data (e.g. during bulk imports or rapid edits).
  useEffect(() => {
    const unsub = onSnapshot(FIRESTORE_DOC, async (snap) => {
      if (snap.exists()) {
        if (!pendingWrite.current) {
          dispatchRaw({ type: 'LOAD', payload: snap.data() as MetrikaData });
        }
      } else if (isAdmin) {
        await setDoc(FIRESTORE_DOC, defaultData);
      }
      setLoaded(true);
    });
    return unsub;
  }, [isAdmin]);

  // Write to Firestore after user-triggered state changes (admin only, debounced).
  // Only runs when pendingWrite is true — i.e. the user (not Firestore) changed the data.
  useEffect(() => {
    if (!loaded || !isAdmin || !pendingWrite.current) return;
    const timer = setTimeout(async () => {
      if (!pendingWrite.current || writeInProgress.current) return;
      writeInProgress.current = true;
      try {
        await setDoc(FIRESTORE_DOC, data);
        // Successful write: clear the flag so the next onSnapshot can LOAD freely
        pendingWrite.current = false;
      } catch (err) {
        console.error('Firestore write failed:', err);
        // keep pendingWrite = true so it retries on next data change
      } finally {
        writeInProgress.current = false;
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [data, loaded, isAdmin]);

  // safeDispatch: blocks writes for non-admins, marks pending write for admins
  const safeDispatch = useCallback((action: Action) => {
    if (action.type !== 'LOAD' && !isAdmin) return;
    if (action.type !== 'LOAD') {
      pendingWrite.current = true;
    }
    dispatchRaw(action);
  }, [isAdmin]);

  // Force an immediate Firestore write with current data (used after bulk imports)
  const forceWrite = useCallback(async () => {
    if (!isAdmin) return;
    writeInProgress.current = true;
    try {
      await setDoc(FIRESTORE_DOC, dataRef.current);
      pendingWrite.current = false;
    } finally {
      writeInProgress.current = false;
    }
  }, [isAdmin]);

  // One-time migration from localStorage to Firestore
  const migrateFromLocalStorage = useCallback(async (): Promise<boolean> => {
    if (!isAdmin) return false;
    const stored = localStorage.getItem('metrika_data_v2');
    if (!stored) return false;
    try {
      const parsed = JSON.parse(stored) as MetrikaData;
      await setDoc(FIRESTORE_DOC, parsed);
      pendingWrite.current = false;
      dispatchRaw({ type: 'LOAD', payload: parsed });
      return true;
    } catch {
      return false;
    }
  }, [isAdmin]);

  return (
    <DataContext.Provider value={{ data, dispatch: safeDispatch, isAdmin, loaded, migrateFromLocalStorage, forceWrite }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
