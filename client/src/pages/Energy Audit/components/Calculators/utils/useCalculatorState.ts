/**
 * useCalculatorState - React hook for calculator state persistence
 * 
 * This hook provides state persistence for calculator components with:
 * - Automatic saving to localStorage with debounce
 * - Draft recovery on page refresh
 * - State export and import
 */

import { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';
import { CalculatorType, saveCalculatorState, loadCalculatorState, hasDraftState, clearDraftState } from './calculatorStateStorage';

interface UseCalculatorStateOptions<T> {
  /** The calculator type (used for storage key) */
  calculatorType: CalculatorType;
  /** Initial state value */
  initialState: T;
  /** Debounce delay for auto-save in milliseconds */
  debounceDelay?: number;
  /** Whether to load state from localStorage on initial mount */
  loadOnMount?: boolean;
  /** Whether to check for draft state on initial mount */
  checkDraft?: boolean;
}

interface UseCalculatorStateResult<T> {
  /** The current state */
  state: T;
  /** Function to update the state */
  setState: React.Dispatch<React.SetStateAction<T>>;
  /** Whether a draft state exists */
  hasDraft: boolean;
  /** Function to recover draft state */
  recoverDraft: () => void;
  /** Function to discard draft state */
  discardDraft: () => void;
  /** Function to save state with a name */
  saveState: (name?: string) => void;
  /** Function to clear state */
  clearState: () => void;
  /** Whether the initial load check has completed */
  isInitialLoadComplete: boolean;
  /** Function to trigger a recovery dialog */
  shouldShowRecoveryDialog: boolean;
}

/**
 * React hook for managing calculator state with persistence
 * 
 * @param options Configuration options
 * @returns State management object
 */
export function useCalculatorState<T>(
  options: UseCalculatorStateOptions<T>
): UseCalculatorStateResult<T> {
  const {
    calculatorType,
    initialState,
    debounceDelay = 2000,
    loadOnMount = true,
    checkDraft = true
  } = options;

  // State
  const [state, setState] = useState<T>(initialState);
  const [hasDraft, setHasDraft] = useState<boolean>(false);
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState<boolean>(false);
  const [shouldShowRecoveryDialog, setShouldShowRecoveryDialog] = useState<boolean>(false);

  // Check for draft state on mount
  useEffect(() => {
    if (checkDraft) {
      const draftExists = hasDraftState(calculatorType);
      setHasDraft(draftExists);
      
      if (draftExists && !isInitialLoadComplete) {
        setShouldShowRecoveryDialog(true);
      }
      
      setIsInitialLoadComplete(true);
    }
  }, [checkDraft, calculatorType, isInitialLoadComplete]);

  // Load saved state on mount if requested
  useEffect(() => {
    if (loadOnMount && !shouldShowRecoveryDialog) {
      const savedState = loadCalculatorState<T>(calculatorType, false);
      if (savedState) {
        setState(savedState);
      }
      setIsInitialLoadComplete(true);
    }
  }, [loadOnMount, calculatorType, shouldShowRecoveryDialog]);

  // Create debounced auto-save function
  const debouncedSave = useCallback(
    debounce((stateToSave: T) => {
      saveCalculatorState(calculatorType, stateToSave, true);
    }, debounceDelay),
    [calculatorType, debounceDelay]
  );

  // Auto-save state when it changes
  useEffect(() => {
    if (isInitialLoadComplete) {
      debouncedSave(state);
    }
    return () => {
      debouncedSave.cancel();
    };
  }, [state, debouncedSave, isInitialLoadComplete]);

  // Function to recover draft state
  const recoverDraft = useCallback(() => {
    const draftState = loadCalculatorState<T>(calculatorType, true);
    if (draftState) {
      setState(draftState);
      setShouldShowRecoveryDialog(false);
    }
  }, [calculatorType]);

  // Function to discard draft state
  const discardDraft = useCallback(() => {
    clearDraftState(calculatorType);
    setHasDraft(false);
    setShouldShowRecoveryDialog(false);
  }, [calculatorType]);

  // Function to save state with a name
  const saveState = useCallback((name?: string) => {
    saveCalculatorState(calculatorType, state, false);
    if (name) {
      // If using a separate named storage system
      // Implement according to your app's storage pattern
    }
    // Clear draft state as we now have a deliberate save
    clearDraftState(calculatorType);
    setHasDraft(false);
  }, [calculatorType, state]);

  // Function to clear state
  const clearState = useCallback(() => {
    setState(initialState);
    clearDraftState(calculatorType);
    setHasDraft(false);
  }, [calculatorType, initialState]);

  return {
    state,
    setState,
    hasDraft,
    recoverDraft,
    discardDraft,
    saveState,
    clearState,
    isInitialLoadComplete,
    shouldShowRecoveryDialog
  };
}

export default useCalculatorState; 