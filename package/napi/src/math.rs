#[napi]
/**求两个数的和 */
pub fn sum(a: i32, b: i32) -> i32 {
  a + b
}

#[napi]
/**请数组所有元素的和 */
pub fn mean(a: Vec<i32>) -> i32 {
  let mut sum = 0;
  for x in a {
    sum += x;
  }

  sum
}
