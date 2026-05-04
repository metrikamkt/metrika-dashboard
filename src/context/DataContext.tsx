import React, { createContext, useContext, useReducer, useEffect, useState, useCallback } from 'react';
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
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [data, dispatch] = useReducer(reducer, defaultData);
  const [loaded, setLoaded] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const isAdmin = user?.email === ADMIN_EMAIL;

  // Load from Firestore and listen for real-time updates
  useEffect(() => {
    const unsub = onSnapshot(FIRESTORE_DOC, async (snap) => {
      if (snap.exists()) {
        dispatch({ type: 'LOAD', payload: snap.data() as MetrikaData });
      } else if (isAdmin) {
        await setDoc(FIRESTORE_DOC, defaultData);
      }
      setLoaded(true);
    });
    return unsub;
  }, [isAdmin]);

  // Write to Firestore after state changes (admin only, debounced)
  useEffect(() => {
    if (!loaded || !isAdmin || syncing) return;
    const timer = setTimeout(async () => {
      setSyncing(true);
      try {
        await setDoc(FIRESTORE_DOC, data);
      } finally {
        setSyncing(false);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [data, loaded, isAdmin]);

  // Block writes for non-admins
  const safeDispatch = useCallback((action: Action) => {
    if (action.type !== 'LOAD' && !isAdmin) return;
    dispatch(action);
  }, [isAdmin]);

  // One-time migration from localStorage to Firestore
  const migrateFromLocalStorage = useCallback(async (): Promise<boolean> => {
    if (!isAdmin) return false;
    const stored = localStorage.getItem('metrika_data_v2');
    if (!stored) return false;
    try {
      const parsed = JSON.parse(stored) as MetrikaData;
      await setDoc(FIRESTORE_DOC, parsed);
      dispatch({ type: 'LOAD', payload: parsed });
      return true;
    } catch {
      return false;
    }
  }, [isAdmin]);

  return (
    <DataContext.Provider value={{ data, dispatch: safeDispatch, isAdmin, loaded, migrateFromLocalStorage }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
