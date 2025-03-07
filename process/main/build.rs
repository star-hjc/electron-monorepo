use std::{collections::HashSet, env};

fn main() {
    let initial_vars: HashSet<String> = env::vars().map(|(key, _)| key).collect();
    dotenv::from_filename(format!(".env{}", env::args().nth(1).unwrap_or_default())).ok();
    for (key, value) in env::vars() {
        if !initial_vars.contains(&key) {
            println!("cargo:rustc-env={}={}", key, value);
        }
    }
}
