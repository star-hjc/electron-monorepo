use std::env;
use std::path::Path;
// unsafe extern "C" {
//     unsafe fn add(a: i32, b: i32) -> i32;
//     unsafe fn subtract(a: i32, b: i32) -> i32;
// }
fn main() {
    load_env();
    println!(
        "Hello, world!  VITE_PORT:{},ENV:{}",
        env::var("VITE_PORT").unwrap_or_default(),
        env::var("ENV").unwrap_or_default()
    );
    let out_dir = env::var("OUT_DIR").unwrap();
    let target_dir = Path::new(&out_dir).ancestors().nth(3).unwrap();
    // let (num, sub) = unsafe { (add(3333, 5555), subtract(10000, 1)) };
    println!("Hello, world!  VITE_PORT:{}", env::var("VITE_PORT").unwrap_or_default());
    println!("12331 target_dir:{}", target_dir.display());
    loop {}
}

#[cfg(debug_assertions)]
fn load_env() {
    println!("cargo:warning=ENV {:?}", std::env::var("ENV"));
    let env = std::env::var("ENV").unwrap_or_else(|err| {
        println!("cargo:warning=ENV not set, defaulting to .env. err:{:?}", err);
        "development".to_string()
    });
    let env_name = format!(".env.{}", env);
    // load the .env file
    for item in dotenv::dotenv_iter().expect("Failed to load .env file") {
        let (key, value) = item.unwrap_or_else(|err| panic!("{:?}", err));
        unsafe { env::set_var(key, value) };
    }
    // load the .env.<ENV> file
    for item in dotenv::from_filename_iter(&env_name).expect(&format!("Failed to load {} file", env_name)) {
        let (key, value) = item.unwrap_or_else(|err| panic!("{:?}", err));
        unsafe { env::set_var(key, value) };
    }
}
