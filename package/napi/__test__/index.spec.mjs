import test from 'ava'

import native from '../index.mjs'

test('sum from native', (t) => {
  t.is(native.sum(1, 2), 3)
})
test('mean from native', (t) => {
  t.is(native.mean([1,2,3]), 6)
})

