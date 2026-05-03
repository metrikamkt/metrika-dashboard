import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type {
  MetrikaData, Lancamento, Custo, Cliente, Produto,
  Pessoa, Lead, Demanda, Meta
} from '../data/mockData';
import { defaultData } from '../data/mockData';

const STORAGE_KEY = 'metrika_data_v2';

type Action =
  | { type: 'LOAD'; payload: MetrikaData }
  // Lancamentos
  | { type: 'ADD_LANCAMENTO'; payload: Lancamento }
  | { type: 'DELETE_LANCAMENTO'; payload: string }
  // Custos
  | { type: 'ADD_CUSTO'; payload: Custo }
  | { type: 'DELETE_CUSTO'; payload: string }
  // Clientes
  | { type: 'ADD_CLIENTE'; payload: Cliente }
  | { type: 'UPDATE_CLIENTE'; payload: Cliente }
  | { type: 'DELETE_CLIENTE'; payload: string }
  // Produtos
  | { type: 'ADD_PRODUTO'; payload: Produto }
  | { type: 'UPDATE_PRODUTO'; payload: Produto }
  | { type: 'DELETE_PRODUTO'; payload: string }
  // Pessoas
  | { type: 'ADD_PESSOA'; payload: Pessoa }
  | { type: 'UPDATE_PESSOA'; payload: Pessoa }
  | { type: 'DELETE_PESSOA'; payload: string }
  // Leads / CRM
  | { type: 'ADD_LEAD'; payload: Lead }
  | { type: 'UPDATE_LEAD'; payload: Lead }
  | { type: 'DELETE_LEAD'; payload: string }
  // Demandas
  | { type: 'ADD_DEMANDA'; payload: Demanda }
  | { type: 'UPDATE_DEMANDA'; payload: Demanda }
  | { type: 'DELETE_DEMANDA'; payload: string }
  // Metas
  | { type: 'SET_METAS'; payload: Meta[] }
  | { type: 'SET_META_FATURAMENTO'; payload: number }
  | { type: 'SET_META_NOVOS_CLIENTES'; payload: number };

function reducer(state: MetrikaData, action: Action): MetrikaData {
  switch (action.type) {
    case 'LOAD': return action.payload;

    case 'ADD_LANCAMENTO':
      return { ...state, lancamentos: [...state.lancamentos, action.payload] };
    case 'DELETE_LANCAMENTO':
      return { ...state, lancamentos: state.lancamentos.filter(l => l.id !== action.payload) };

    case 'ADD_CUSTO':
      return { ...state, custos: [...state.custos, action.payload] };
    case 'DELETE_CUSTO':
      return { ...state, custos: state.custos.filter(c => c.id !== action.payload) };

    case 'ADD_CLIENTE':
      return { ...state, clientes: [...state.clientes, action.payload] };
    case 'UPDATE_CLIENTE':
      return { ...state, clientes: state.clientes.map(c => c.id === action.payload.id ? action.payload : c) };
    case 'DELETE_CLIENTE':
      return { ...state, clientes: state.clientes.filter(c => c.id !== action.payload) };

    case 'ADD_PRODUTO':
      return { ...state, produtos: [...state.produtos, action.payload] };
    case 'UPDATE_PRODUTO':
      return { ...state, produtos: state.produtos.map(p => p.id === action.payload.id ? action.payload : p) };
    case 'DELETE_PRODUTO':
      return { ...state, produtos: state.produtos.filter(p => p.id !== action.payload) };

    case 'ADD_PESSOA':
      return { ...state, pessoas: [...state.pessoas, action.payload] };
    case 'UPDATE_PESSOA':
      return { ...state, pessoas: state.pessoas.map(p => p.id === action.payload.id ? action.payload : p) };
    case 'DELETE_PESSOA':
      return { ...state, pessoas: state.pessoas.filter(p => p.id !== action.payload) };

    case 'ADD_LEAD':
      return { ...state, leads: [...state.leads, action.payload] };
    case 'UPDATE_LEAD':
      return { ...state, leads: state.leads.map(l => l.id === action.payload.id ? action.payload : l) };
    case 'DELETE_LEAD':
      return { ...state, leads: state.leads.filter(l => l.id !== action.payload) };

    case 'ADD_DEMANDA':
      return { ...state, demandas: [...state.demandas, action.payload] };
    case 'UPDATE_DEMANDA':
      return { ...state, demandas: state.demandas.map(d => d.id === action.payload.id ? action.payload : d) };
    case 'DELETE_DEMANDA':
      return { ...state, demandas: state.demandas.filter(d => d.id !== action.payload) };

    case 'SET_METAS':
      return { ...state, metas: action.payload };
    case 'SET_META_FATURAMENTO':
      return { ...state, metaFaturamento: action.payload };
    case 'SET_META_NOVOS_CLIENTES':
      return { ...state, metaNovosClientes: action.payload };

    default: return state;
  }
}

interface DataContextType {
  data: MetrikaData;
  dispatch: React.Dispatch<Action>;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, dispatch] = useReducer(reducer, defaultData);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        dispatch({ type: 'LOAD', payload: JSON.parse(stored) });
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  return <DataContext.Provider value={{ data, dispatch }}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
