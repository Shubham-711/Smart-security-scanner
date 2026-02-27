import { describe, it, expect, vi } from 'vitest'
import axios from 'axios'

// Mock axios BEFORE importing api.js
vi.mock('axios', () => {
    return {
        default: {
            create: vi.fn().mockReturnValue({
                post: vi.fn(),
                get: vi.fn()
            })
        }
    }
})

import { scanCode, getScanStatus, api } from '../services/api'

describe('API Service', () => {
    it('scanCode should post to /scan', async () => {
        const mockData = { scan_id: '12345', message: 'Scan started' }
        api.post.mockResolvedValueOnce({ data: mockData })

        const result = await scanCode('print("hello")', 'python')

        expect(api.post).toHaveBeenCalledWith('/scan', { code: 'print("hello")', language: 'python' })
        expect(result).toEqual(mockData)
    })

    it('getScanStatus should get from /scan/:id', async () => {
        const mockData = { id: '12345', status: 'completed' }
        api.get.mockResolvedValueOnce({ data: mockData })

        const result = await getScanStatus('12345')

        expect(api.get).toHaveBeenCalledWith('/scan/12345')
        expect(result).toEqual(mockData)
    })
})
