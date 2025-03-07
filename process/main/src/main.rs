use std::env;

fn main() {
    println!("Hello, world!  VITE_PORT:{}", env!("VITE_PORT"));
    loop {}
}
