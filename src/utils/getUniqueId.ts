import { useRef } from 'react';

let uniqueId = 0;
const getUniqueId = () => uniqueId++;

export function useComponentId() {
  const idRef = useRef(getUniqueId());
  return idRef.current;
}