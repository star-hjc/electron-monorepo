use dotenv::dotenv;
use std::env;

fn main() {
    dotenv().ok();
    println!("Hello, world!  VITE_PORT:{}", env::var("VITE_PORT").unwrap_or_default());
}
