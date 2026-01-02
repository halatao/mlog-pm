/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useMemo, useState } from 'react'

type ModalItem = { id: string; node: React.ReactNode }

type ModalContextValue = {
  showModal: (node: React.ReactNode) => string
  hideModal: (id?: string) => void
  clearAll: () => void
}

const ModalContext = createContext<ModalContextValue | null>(null)

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [modals, setModals] = useState<ModalItem[]>([])

  const showModal = (node: React.ReactNode) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    let nodeWithProps = node
    if (React.isValidElement(node)) {
      // inject `open: true` and a default onClose that removes this modal
      // use `unknown` for safer typing when cloning elements
      const el = node as React.ReactElement<unknown>
      const injectedProps = { open: true, onClose: () => setModals(prev => prev.filter(m => m.id !== id)) } as Partial<unknown> & React.Attributes
      nodeWithProps = React.cloneElement(el, injectedProps)
    }
    setModals(prev => [...prev, { id, node: nodeWithProps }])
    return id
  }

  const hideModal = (id?: string) => {
    if (!id) setModals(prev => prev.slice(0, -1))
    else setModals(prev => prev.filter(m => m.id !== id))
  }

  const clearAll = () => setModals([])

  const value = useMemo(() => ({ showModal, hideModal, clearAll }), [])

  return (
    <ModalContext.Provider value={value}>
      {children}
      {modals.map(m => (
        <React.Fragment key={m.id}>{m.node}</React.Fragment>
      ))}
    </ModalContext.Provider>
  )
}

export function useModal() {
  const ctx = useContext(ModalContext)
  if (!ctx) throw new Error('useModal must be used within ModalProvider')
  return ctx
}
