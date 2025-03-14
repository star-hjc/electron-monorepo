use std::env;

use std::path::Path;
// unsafe extern "C" {
//     unsafe fn add(a: i32, b: i32) -> i32;
//     unsafe fn subtract(a: i32, b: i32) -> i32;
// }
fn main() {
    println!("Hello, world!  VITE_PORT:{}", env!("VITE_PORT"));
    let out_dir = std::env::var("OUT_DIR").unwrap();
    let target_dir = Path::new(&out_dir).ancestors().nth(3).unwrap();
    // let (num, sub) = unsafe { (add(3333, 5555), subtract(10000, 1)) };
    println!("Hello, world!  VITE_PORT:{}", env!("VITE_PORT"));
    println!("12331 target_dir:{}", target_dir.display());
    loop {}
}
