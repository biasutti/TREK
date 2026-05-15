import { describe, expect, it, vi } from 'vitest'
import { handleRemoteEvent } from './remoteEventHandler'
import type { TripStoreState } from '../tripStore'

describe('remoteEventHandler assignment creation', () => {
  it('accepts duplicate place assignments when assignment ids differ', () => {
    const place = { id: 5, name: 'Museum' }
    const state = {
      assignments: {
        '1': [{ id: 10, day_id: 1, place_id: 5, place, order_index: 0 }],
      },
    } as unknown as TripStoreState
    const set = vi.fn((updater: (current: TripStoreState) => Partial<TripStoreState>) => Object.assign(state, updater(state))) as any
    const get = vi.fn(() => state)

    handleRemoteEvent(set, get, {
      type: 'assignment:created',
      assignment: { id: 11, day_id: 1, place_id: 5, place, order_index: 1 },
    } as any)

    expect(state.assignments['1'].map(a => a.id)).toEqual([10, 11])
  })

  it('replaces optimistic temp assignments for the same place', () => {
    const place = { id: 5, name: 'Museum' }
    const state = {
      assignments: {
        '1': [{ id: -1, day_id: 1, place_id: 5, place, order_index: 0 }],
      },
    } as unknown as TripStoreState
    const set = vi.fn((updater: (current: TripStoreState) => Partial<TripStoreState>) => Object.assign(state, updater(state))) as any
    const get = vi.fn(() => state)

    handleRemoteEvent(set, get, {
      type: 'assignment:created',
      assignment: { id: 11, day_id: 1, place_id: 5, place, order_index: 0 },
    } as any)

    expect(state.assignments['1'].map(a => a.id)).toEqual([11])
  })
})
